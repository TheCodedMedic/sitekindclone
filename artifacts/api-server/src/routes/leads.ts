import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { CreateLeadBody, CreateLeadResponse } from "@workspace/api-zod";
import { db, leadsTable } from "@workspace/db";
import { rateLimit } from "../middlewares/rateLimit";
import { requireTeamMember } from "../middlewares/requireTeamMember";

const router: IRouter = Router();

// Per-IP throttle: 5 lead submissions per minute is plenty for humans.
const leadsRateLimit = rateLimit({ windowMs: 60_000, max: 5 });

router.get("/leads", requireTeamMember, async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(leadsTable)
      .orderBy(desc(leadsTable.createdAt));

    res.json({
      leads: rows.map((row) => ({
        id: row.id,
        source: row.source,
        name: row.name,
        email: row.email,
        phone: row.phone,
        businessName: row.businessName,
        message: row.message,
        details: row.details,
        createdAt: row.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "failed to list leads");
    res.status(500).json({ message: "Failed to list leads" });
  }
});

router.post("/leads", leadsRateLimit, async (req, res) => {
  // Honeypot: the `website` field is hidden on the web form and never
  // filled by humans. Bots that fill it get a fake success — no stored lead.
  const honeypot = (req.body as Record<string, unknown> | null)?.["website"];
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    req.log.warn({ ip: req.ip }, "honeypot triggered — dropping bot lead");
    res.status(201).json({ id: 0, status: "received" });
    return;
  }

  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid lead payload" });
    return;
  }

  const { source, name, email, phone, businessName, message, details } =
    parsed.data;

  try {
    const [row] = await db
      .insert(leadsTable)
      .values({
        source,
        name,
        email,
        phone: phone ?? null,
        businessName: businessName ?? null,
        message: message ?? null,
        details: details ?? null,
      })
      .returning({ id: leadsTable.id });

    req.log.info({ leadId: row.id, source }, "lead stored");
    res.status(201).json(CreateLeadResponse.parse({ id: row.id, status: "received" }));
  } catch (err) {
    req.log.error({ err }, "failed to store lead");
    res.status(500).json({ message: "Failed to store lead" });
  }
});

export default router;
