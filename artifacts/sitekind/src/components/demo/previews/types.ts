import type { BusinessProfile } from "@/lib/demoApi";
import type { Evidence } from "./evidence";

export type TemplateProps = {
  profile: BusinessProfile;
  heroPhoto?: string;
  evidence: Evidence;
  logoUrl?: string | null;
  /** Real public photos for the simulated social-feed section. */
  socialPhotos?: string[];
};

export function domainSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
