import { features } from "@/lib/data/features";
import { industries } from "@/lib/data/industries";
import { posts } from "@/lib/data/posts";

/**
 * Baked at build time. Consumed by the /status page so it can display the
 * build stamp and the exact route inventory shipped in this deploy.
 */
export const buildInfo = {
  builtAt: new Date().toISOString(),
  nodeEnv: (import.meta.env.MODE ?? "unknown") as string,
  commit:
    (import.meta.env.VITE_COMMIT_SHA as string | undefined) ??
    null,
} as const;

export const staticRoutes = [
  "/",
  "/about",
  "/blog",
  "/contact",
  "/demo",
  "/features",
  "/industries",
  "/legal/ai-ethics",
  "/legal/privacy",
  "/legal/terms",
  "/login",
  "/partners",
  "/portal",
  "/portal/analytics",
  "/portal/billing",
  "/portal/content",
  "/portal/voice-agent",
  "/pricing",
  "/roi-calculator",
] as const;

export const dynamicRoutes = [
  ...industries.map((i) => `/industries/${i.slug}`),
  ...features.map((f) => `/features/${f.slug}`),
  ...posts.map((p) => `/blog/${p.slug}`),
];

export const allRoutes = [...staticRoutes, ...dynamicRoutes];
