// Stub: server function not available in Replit SPA build.

export type DomainFreshness = {
  domain: string;
  isBaseline: boolean;
  verdict: "fresh" | "stale" | "cacheable" | "unknown";
};

export type FreshnessReport = {
  checkedAt: string;
  domains: DomainFreshness[];
};

export const checkCacheFreshness = async (): Promise<FreshnessReport> => {
  return { checkedAt: new Date().toISOString(), domains: [] };
};
