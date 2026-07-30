import { useEffect, useMemo } from "react";
import type { BusinessProfile } from "@/lib/demoApi";
import { ComposedPreview } from "./ComposedPreview";
import { composeDesign } from "./design";
import { loadPreviewFonts, loadExtraFontFamilies } from "./loadPreviewFonts";

// Evidence-driven design composition: composeDesign() deterministically
// derives a DesignSpec (family, art-direction pack, hero variant, section
// order, layouts) from the profile's designBrief + evidence + a seed hashed
// from the business identity. Two same-vertical businesses no longer render
// structurally identical previews.
export function PreviewForVertical({ profile, logoUrl }: { profile: BusinessProfile; logoUrl?: string | null }) {
  const spec = useMemo(() => composeDesign(profile), [profile]);
  // Lazy-load the preview-only font families on first render of any preview.
  useEffect(() => {
    loadPreviewFonts();
    // If the design-schema agent picked custom Google Fonts, load them too.
    const t = profile.designSchema?.visual?.typography;
    if (t) loadExtraFontFamilies([t.display, t.body].filter(Boolean) as string[]);
    // Stage 2 — generative font pairings declare exact weight/italic specs.
    if (spec.fontLoad) loadExtraFontFamilies(spec.fontLoad);
  }, [profile.designSchema, spec]);
  return <ComposedPreview profile={profile} spec={spec} logoUrl={logoUrl} />;
}

