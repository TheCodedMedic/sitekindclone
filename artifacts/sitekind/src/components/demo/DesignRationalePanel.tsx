import { useState } from "react";
import { ChevronDown, Palette, Type, Compass, Users, Quote, Sparkles, Target } from "lucide-react";
import type { DesignSchema } from "@/lib/demoApi";

/**
 * "Why we designed it this way" — surfaces the AI design-schema agent's
 * reasoning to the shop owner. Collapsed by default for customers (the draft
 * is the star, not our pipeline); admins get it open with the full internal
 * telemetry (Layout DNA, landscape, distinctness, diversity clashes).
 */
// The design-schema agent's deterministic fallback seeds this literal string —
// it's pipeline-speak and must never render to a shop owner.
const SEEDED_SIGNATURE_FALLBACK = /seeded heuristic motif/i;

export function DesignRationalePanel({ schema, adminDetail = false }: { schema: DesignSchema; adminDetail?: boolean }) {
  const [open, setOpen] = useState(adminDetail);
  const swatches: [string, string][] = [
    ["Background", schema.visual.palette.bg],
    ["Surface", schema.visual.palette.surface],
    ["Ink", schema.visual.palette.ink],
    ["Accent", schema.visual.palette.accent],
    ["Accent ink", schema.visual.palette.accentInk],
    ["Border", schema.visual.palette.border],
  ];
  return (
    <section className="glass-card p-6 sm:p-8" aria-label="Why we designed it this way">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">Why we designed it this way</h3>
          <p className="mt-1 text-sm text-ink-2">
            {schema.positioning.voice} voice · {schema.visual.mood} mood · {schema.positioning.pricePosition} tier
            {schema.visual.motif && schema.visual.motif !== "none" && ` · ${schema.visual.motif.replace(/-/g, " ")} motif`}
            {schema.positioning.competitors.length > 0 && ` · read ${schema.positioning.competitors.length} local competitor${schema.positioning.competitors.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <ChevronDown size={18} className={"shrink-0 transition-transform " + (open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {(schema.visual.motif && schema.visual.motif !== "none") || schema.visual.signatureMove ? (
            <Card icon={<Sparkles size={16} />} title="Signature move" full>
              {schema.visual.motif && schema.visual.motif !== "none" && (
                <p className="text-sm text-ink">
                  <span className="font-semibold capitalize">{schema.visual.motif.replace(/-/g, " ")}</span>
                  <span className="ml-2 text-xs text-ink-2">— the one visual gesture that will make this site memorable at first scroll.</span>
                </p>
              )}
              {schema.visual.signatureMove && !SEEDED_SIGNATURE_FALLBACK.test(schema.visual.signatureMove) && (
                <p className="mt-2 text-xs text-ink-2">{schema.visual.signatureMove}</p>
              )}
            </Card>
          ) : null}

          {adminDetail && schema.landscape && (
            <Card icon={<Target size={16} />} title="Landscape (what we designed against)" full>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-2">Dominant palette</div>
                  <div className="flex flex-wrap gap-1.5">
                    {schema.landscape.dominantPalette.length === 0 && <span className="text-xs text-ink-2">—</span>}
                    {schema.landscape.dominantPalette.map((hex) => (
                      <span key={hex} className="flex items-center gap-1 text-[11px] text-ink-2">
                        <span className="inline-block h-4 w-4 rounded border border-black/10" style={{ background: hex }} />
                        {hex}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-2">Dominant fonts / hero</div>
                  <div className="flex flex-wrap gap-1 text-[11px] text-ink-2">
                    {schema.landscape.dominantFonts.length === 0 && <span>fonts: —</span>}
                    {schema.landscape.dominantFonts.map((f) => (
                      <span key={f} className="rounded bg-[var(--color-surface-3,rgb(253,243,231))] px-1.5 py-0.5">{f}</span>
                    ))}
                    {schema.landscape.dominantHero && (
                      <span className="rounded bg-[var(--color-surface-3,rgb(253,243,231))] px-1.5 py-0.5">hero: {schema.landscape.dominantHero}</span>
                    )}
                  </div>
                </div>
                {schema.landscape.crowdedSectionTypes.length > 0 && (
                  <div className="sm:col-span-2">
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-2">Crowded sections</div>
                    <div className="flex flex-wrap gap-1 text-[11px] text-ink-2">
                      {schema.landscape.crowdedSectionTypes.map((s) => (
                        <span key={s} className="rounded bg-[var(--color-surface-3,rgb(253,243,231))] px-1.5 py-0.5">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {schema.landscape.whitespace && (
                  <p className="sm:col-span-2 text-xs text-ink-2">
                    <span className="font-semibold text-ink">Whitespace: </span>{schema.landscape.whitespace}
                  </p>
                )}
              </div>
              {typeof schema.distinctnessScore === "number" && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="rounded-full border border-[var(--card-border,rgba(0,0,0,0.08))] bg-[var(--color-surface-3,rgb(253,243,231))] px-2 py-0.5 text-ink-2">
                    <span className="font-semibold text-ink">Distinctness</span>: {schema.distinctnessScore.toFixed(2)}
                  </span>
                  <span className="text-ink-2">— how far this design sits from the local crowd (1.0 = maximally different).</span>
                </div>
              )}
              {schema.revision && (
                <div className="mt-3 border-t border-[var(--card-border,rgba(0,0,0,0.08))] pt-3">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-2">Revision pass</div>
                  {schema.revision.attempted ? (
                    <div className="space-y-1.5 text-xs text-ink-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-[var(--color-surface-3,rgb(253,243,231))] px-2 py-0.5">
                          Re-prompted:{" "}
                          <span className="font-semibold text-ink">
                            {typeof schema.revision.firstScore === "number" ? schema.revision.firstScore.toFixed(2) : "?"} →{" "}
                            {typeof schema.revision.finalScore === "number" ? schema.revision.finalScore.toFixed(2) : "?"}
                          </span>
                        </span>
                        {schema.revision.hardFails.length > 0 && (
                          <span className="rounded-full bg-[var(--color-surface-3,rgb(253,243,231))] px-2 py-0.5">
                            {schema.revision.hardFails.length} hard fail{schema.revision.hardFails.length === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                      {(schema.revision.hardFails.length > 0 || schema.revision.reasons.length > 0) && (
                        <ul className="ml-4 list-disc space-y-0.5">
                          {schema.revision.hardFails.map((r, i) => (
                            <li key={`h${i}`}><span className="font-semibold text-ink">Hard:</span> {r}</li>
                          ))}
                          {schema.revision.reasons.map((r, i) => (
                            <li key={`r${i}`}>{r}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-ink-2">Not needed — first pass cleared the distinctness gate.</div>
                  )}
                </div>
              )}
            </Card>
          )}

          {adminDetail && schema.visual.layoutDNA && (
            <Card icon={<Compass size={16} />} title="Layout DNA" full>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {(Object.entries(schema.visual.layoutDNA) as [string, string][]).map(([k, v]) => (
                  <span
                    key={k}
                    className="rounded-full border border-[var(--card-border,rgba(0,0,0,0.08))] bg-[var(--color-surface-3,rgb(253,243,231))] px-2 py-0.5 text-ink-2"
                    title={k}
                  >
                    <span className="font-semibold text-ink">{k}</span>: {v}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-2">Structural grid, rhythm, edge treatment, dividers and header alignment picked deliberately for this brand — this is why two same-vertical sites look structurally different, not just recolored.</p>
            </Card>
          )}

          {adminDetail && schema.telemetry && <DiversityTelemetryCard telemetry={schema.telemetry} />}




          <Card icon={<Users size={16} />} title="Who this speaks to">
            <p className="text-sm text-ink">{schema.positioning.audience}</p>
            {schema.positioning.localContext && (
              <p className="mt-1 text-xs text-ink-2">Local context: {schema.positioning.localContext}</p>
            )}
            {schema.positioning.differentiators.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-ink-2">
                {schema.positioning.differentiators.map((d, i) => (
                  <li key={i} className="flex gap-2"><span className="text-[var(--color-accent)]">•</span>{d}</li>
                ))}
              </ul>
            )}
          </Card>

          <Card icon={<Palette size={16} />} title="Palette">
            <div className="flex flex-wrap gap-2">
              {swatches.map(([label, hex]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="inline-block h-6 w-6 rounded border border-black/10" style={{ background: hex }} title={`${label} ${hex}`} />
                  {/* Raw hex strings are admin detail — owners just see the swatches. */}
                  {adminDetail && <span className="text-xs text-ink-2">{hex}</span>}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-2">{schema.visual.palette.rationale}</p>
          </Card>

          <Card icon={<Type size={16} />} title="Typography">
            <p className="text-sm text-ink">
              <span style={{ fontFamily: schema.visual.typography.display }} className="font-semibold">{schema.visual.typography.display}</span>
              {" + "}
              <span style={{ fontFamily: schema.visual.typography.body }}>{schema.visual.typography.body}</span>
            </p>
            <p className="mt-2 text-xs text-ink-2">{schema.visual.typography.rationale}</p>
          </Card>

          <Card icon={<Compass size={16} />} title="Homepage plan">
            <p className="text-sm text-ink">Hero: {schema.homepage.hero.variant} — {schema.homepage.hero.photoIntent || "signature photo"}</p>
            <p className="mt-2 text-xs text-ink-2">CTA: {schema.homepage.cta.primary.label} ({schema.homepage.cta.primary.action})</p>
            <p className="mt-2 text-xs text-ink-2">Section order:</p>
            <ol className="mt-1 flex flex-wrap gap-1 text-[11px] text-ink-2">
              {schema.homepage.sections.map((s, i) => (
                <li key={s} className="rounded bg-[var(--color-surface-3,rgb(253,243,231))] px-1.5 py-0.5">
                  {i + 1}. {s}
                </li>
              ))}
            </ol>
          </Card>

          {schema.positioning.competitors.length > 0 && (
            <Card icon={<Users size={16} />} title="Competitors we read" full>
              <ul className="space-y-2">
                {schema.positioning.competitors.map((c, i) => (
                  <li key={i} className="text-xs text-ink-2">
                    <span className="font-semibold text-ink">{c.name}</span>
                    {c.url && <span className="ml-2">{c.url}</span>}
                    {c.takeaway && <span className="ml-2">— {c.takeaway}</span>}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {schema.positioning.reviewThemes.length > 0 && (
            <Card icon={<Quote size={16} />} title="Voice from your reviews" full>
              <ul className="space-y-2">
                {schema.positioning.reviewThemes.map((t, i) => (
                  <li key={i} className="text-xs text-ink-2">
                    <span className="font-semibold text-ink">{t.theme}</span>: "{t.quote}"
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {adminDetail && schema.citations.length > 0 && (
            <Card icon={<Compass size={16} />} title="Citations" full>
              <ul className="space-y-1 text-[11px] font-mono text-ink-2">
                {schema.citations.map((c, i) => (
                  <li key={i}><span className="text-ink">{c.field}</span> — {c.source}{c.excerpt && ` — "${c.excerpt}"`}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}

function Card({ icon, title, children, full }: { icon: React.ReactNode; title: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={"rounded-2xl border border-[var(--card-border,rgba(0,0,0,0.08))] p-4 " + (full ? "sm:col-span-2" : "")}>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-2">
        {icon}<span>{title}</span>
      </div>
      {children}
    </div>
  );
}

// Phase 7 — landscape-vs-chosen snapshot. Renders below Layout DNA. Highlights
// axes where the chosen value matches a landscape dominant (red = crowded
// clash, green = clean differentiation).
function DiversityTelemetryCard({
  telemetry,
}: {
  telemetry: NonNullable<DesignSchema["telemetry"]>;
}) {
  const [open, setOpen] = useState(false);
  const { landscape: L, chosen: C, scores } = telemetry;

  const heroClash = !!L.dominantHero && C.hero === L.dominantHero;
  const motifClash = L.crowdedMotifs.includes(C.motif);
  const dnaClash = L.crowdedDNA.includes(C.dna);
  const fontClash = [C.fonts.display, C.fonts.body].some((f) =>
    L.dominantFonts.some((d) => d.toLowerCase() === f.toLowerCase()),
  );
  const paletteClash = L.dominantColors.some((h) => C.palette.includes(h.toLowerCase()));

  const clashCount = [heroClash, motifClash, dnaClash, fontClash, paletteClash].filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-[var(--card-border,rgba(0,0,0,0.08))] p-4 sm:col-span-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-2">
          <Target size={16} />
          <span>Diversity telemetry</span>
          <span className="ml-2 rounded-full bg-[var(--color-surface-3,rgb(253,243,231))] px-2 py-0.5 text-[10px] font-normal normal-case tracking-normal text-ink-2">
            {L.competitorCount} competitor{L.competitorCount === 1 ? "" : "s"} · {clashCount === 0 ? "clean" : `${clashCount} axis clash${clashCount === 1 ? "" : "es"}`}
            {scores.retried ? " · retried" : ""}
            {scores.lockoutPass ? " · lockout pass fired" : ""}
          </span>
        </div>
        <ChevronDown size={16} className={"shrink-0 transition-transform " + (open ? "rotate-180" : "")} />
      </button>
      {open && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-left text-ink-2">
                <th className="py-1 pr-3 font-semibold uppercase tracking-wide">Axis</th>
                <th className="py-1 pr-3 font-semibold uppercase tracking-wide">Landscape (crowded)</th>
                <th className="py-1 pr-3 font-semibold uppercase tracking-wide">Chosen</th>
              </tr>
            </thead>
            <tbody className="text-ink-2">
              <TeleRow label="Hero" left={L.dominantHero || "—"} right={C.hero} clash={heroClash} />
              <TeleRow label="Motif" left={L.crowdedMotifs.join(", ") || "—"} right={C.motif} clash={motifClash} />
              <TeleRow label="Layout DNA" left={L.crowdedDNA.join(", ") || "—"} right={C.dna || "—"} clash={dnaClash} />
              <TeleRow label="Fonts" left={L.dominantFonts.join(", ") || "—"} right={`${C.fonts.display} / ${C.fonts.body}`} clash={fontClash} />
              <TeleRow
                label="Palette"
                left={
                  <span className="flex flex-wrap gap-1">
                    {L.dominantColors.length === 0 && "—"}
                    {L.dominantColors.map((h) => (
                      <span key={h} className="inline-flex items-center gap-1">
                        <span className="inline-block h-3 w-3 rounded border border-black/10" style={{ background: h }} /> {h}
                      </span>
                    ))}
                  </span>
                }
                right={
                  <span className="flex flex-wrap gap-1">
                    {C.palette.map((h) => (
                      <span key={h} className="inline-flex items-center gap-1">
                        <span className="inline-block h-3 w-3 rounded border border-black/10" style={{ background: h }} /> {h}
                      </span>
                    ))}
                  </span>
                }
                clash={paletteClash}
              />
              <TeleRow
                label="Sections"
                left={L.crowdedSections.join(", ") || "—"}
                right={C.sections.join(" · ")}
                clash={false}
              />
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-ink-2">
            Snapshot from the run. Score {typeof scores.firstDistinctness === "number" ? scores.firstDistinctness.toFixed(2) : "?"}
            {" → "}
            {typeof scores.finalDistinctness === "number" ? scores.finalDistinctness.toFixed(2) : "?"}
            {typeof scores.thresholdUsed === "number" ? ` vs threshold ${scores.thresholdUsed.toFixed(2)}` : ""}
            {scores.density && scores.density !== "unknown" ? ` · ${scores.density} landscape` : ""}
            {" · "}hard fails {scores.firstHardFails}→{scores.finalHardFails}.
            {typeof scores.recentCombosChecked === "number" && scores.recentCombosChecked > 0 && (
              <>
                {" "}Checked against {scores.recentCombosChecked} recent same-vertical combo{scores.recentCombosChecked === 1 ? "" : "s"} —{" "}
                <span className={scores.combosClashed ? "text-red-600 font-semibold" : "text-emerald-700"}>
                  {scores.combosClashed ? "clashed" : "unique combo"}
                </span>.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function TeleRow({
  label, left, right, clash,
}: {
  label: string;
  left: React.ReactNode;
  right: React.ReactNode;
  clash: boolean;
}) {
  return (
    <tr className="border-t border-[var(--card-border,rgba(0,0,0,0.08))]">
      <td className="py-1.5 pr-3 align-top font-semibold text-ink">{label}</td>
      <td className="py-1.5 pr-3 align-top">{left}</td>
      <td className={"py-1.5 pr-3 align-top " + (clash ? "text-red-600 font-semibold" : "text-emerald-700")}>{right}</td>
    </tr>
  );
}

