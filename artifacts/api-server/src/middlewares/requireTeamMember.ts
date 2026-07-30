import type { NextFunction, Request, Response } from "express";

// Verifies the Supabase access token sent as `Authorization: Bearer <jwt>`
// and requires the user to be a team member (same `is_team_member` RPC the
// web admin gate uses). Fails closed when Supabase is not configured.
const SUPABASE_URL =
  process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
const SUPABASE_KEY =
  process.env["SUPABASE_PUBLISHABLE_KEY"] ??
  process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

export async function requireTeamMember(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    res.status(401).json({ message: "Missing bearer token" });
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    req.log.error("Supabase env vars missing; cannot authenticate request");
    res.status(401).json({ message: "Authentication is not configured" });
    return;
  }

  try {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!userRes.ok) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
    const user = (await userRes.json()) as { id?: string };
    if (!user.id) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    const rpcRes = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/is_team_member`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _user_id: user.id }),
      },
    );
    if (!rpcRes.ok) {
      req.log.warn(
        { status: rpcRes.status },
        "is_team_member RPC failed",
      );
      res.status(403).json({ message: "Not authorized" });
      return;
    }
    const isMember = (await rpcRes.json()) as unknown;
    if (isMember !== true) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    next();
  } catch (err) {
    req.log.error({ err }, "auth check failed");
    res.status(401).json({ message: "Authentication failed" });
  }
}
