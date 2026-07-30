// Dev-only design gallery: renders all 12 design-diversity fixtures stacked
// so the composed families/packs/heroes/section orders are visually
// verifiable in one screenshot. Unlinked from nav, noindex.
import { createFileRoute } from "@tanstack/react-router";

import { PreviewForVertical } from "@/components/demo/previews";
import { composeDesign } from "@/components/demo/previews/design";
import { DESIGN_FIXTURES } from "@/components/demo/previews/fixtures";

export const Route = createFileRoute("/demo-gallery")({
  head: () => ({
    meta: [
      { title: "Design gallery (dev) — sitekind" },
      { name: "description", content: "Internal QA gallery for demo preview design composition." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DesignGalleryPage,
});

// Narrow-pane QA: two fixtures rendered at the pane widths the /demo layout
// actually produces, exercising the container-query nav (links drop at
// <520cqw, phone shortens to an icon-only pill at <440cqw — never clips).
const NARROW_WIDTHS = [420, 560, 720] as const;
const NARROW_FIXTURES = [DESIGN_FIXTURES[0], DESIGN_FIXTURES[4]];

function DesignGalleryPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-28">
      <h1 className="text-2xl font-bold tracking-tight">Design composition gallery</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {DESIGN_FIXTURES.length} fixtures × deterministic composeDesign(). Internal QA only.
      </p>
      <div className="mt-10 space-y-16">
        {DESIGN_FIXTURES.map((profile) => {
          const spec = composeDesign(profile);
          return (
            <div key={profile.businessName}>
              <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
                <span className="text-sm font-semibold">{profile.businessName}</span>
                <span className="text-muted-foreground">{profile.vertical}</span>
                <span className="rounded bg-black/5 px-1.5 py-0.5 font-mono dark:bg-white/10">
                  {spec.family} · {spec.packId} · {spec.hero.variant} · {spec.serviceLayout}/{spec.reviewLayout}
                </span>
                <span className="rounded bg-black/5 px-1.5 py-0.5 font-mono dark:bg-white/10">
                  {spec.gridFamily} · {spec.type.heroSizeClass}@{spec.type.heroSize}px ·{" "}
                  eyebrow:{spec.type.eyebrowTreatment} · nav:{spec.chrome.nav} · footer:{spec.chrome.footer} ·{" "}
                  divider:{spec.layoutDNA.sectionDividers}
                </span>
                <span className="font-mono text-muted-foreground">{spec.sectionOrder.join(" › ")}</span>
              </div>
              <PreviewForVertical profile={profile} logoUrl={null} />
            </div>
          );
        })}
      </div>

      <h2 className="mt-20 text-xl font-bold tracking-tight">Narrow panes (container-query nav)</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Same fixtures at 420/560/720px pane widths — the nav must drop links, then shorten the
        phone to an icon-only pill. A phone number clipped mid-digit here is a bug.
      </p>
      <div className="mt-8 space-y-12">
        {NARROW_FIXTURES.map((profile) => {
          const spec = composeDesign(profile);
          return (
            <div key={`narrow-${profile.businessName}`} className="space-y-8">
              <div className="text-xs">
                <span className="text-sm font-semibold">{profile.businessName}</span>{" "}
                <span className="rounded bg-black/5 px-1.5 py-0.5 font-mono dark:bg-white/10">
                  nav:{spec.chrome.nav}
                </span>
              </div>
              {NARROW_WIDTHS.map((w) => (
                <div key={w} style={{ width: w, maxWidth: "100%" }}>
                  <div className="mb-1 font-mono text-xs text-muted-foreground">@ {w}px</div>
                  <PreviewForVertical profile={profile} logoUrl={null} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
