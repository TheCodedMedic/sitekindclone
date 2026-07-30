// Stub: server function not available in Replit SPA build.

export type DomainHealth = {
  domain: string;
  isBaseline: boolean;
  http: { ok: true; status: number; ms: number; finalUrl: string } | { ok: false; error: string; ms: number };
  dns: { ok: true; a: string[]; pointsToLovable: boolean } | { ok: false; error: string };
  buildHash: string | null;
  hashMatchesBaseline: boolean | null;
  backendConnected: boolean | null;
};

export type DomainHealthReport = {
  runAt: string;
  baselineHash: string | null;
  domains: DomainHealth[];
};

export const runDomainHealth = async (): Promise<DomainHealthReport> => {
  return { runAt: new Date().toISOString(), baselineHash: null, domains: [] };
};
