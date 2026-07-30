// Stub: server functions not available in Replit SPA build.

export type DesignTelemetryRow = {
  id: string;
  trace_id: string;
  created_at: string;
  vertical: string;
  motif: string;
  palette_dna: string;
  distinctness_score: number | null;
  clash_rate: number | null;
  flags: string[];
  // Phase 9+ fields
  used_fallback: boolean;
  combos_clashed: boolean;
  retried: boolean;
  lockout_pass: boolean;
  chosen_motif: string | null;
  chosen_dna: string | null;
  final_distinctness: number | null;
  density: number | null;
  threshold_used: number | null;
};

export type AlertVerticalStat = {
  vertical: string;
  wouldAlert: boolean;
  rate7d: number;
  runs7d: number;
};

export type TuningState = {
  current_value: number | null;
  suggested_value: number | null;
  rationale: string | null;
};

export const listDesignTelemetry = async (
  _args: { data: { vertical: string; days: number; limit: number } }
): Promise<{ rows: DesignTelemetryRow[] }> => ({ rows: [] });

export const recordDesignTelemetry = async (_data: unknown): Promise<{ ok: boolean }> => ({ ok: true });

export const evaluateDesignAlerts = async (
  _args: { data: { dryRun: boolean } }
): Promise<{ stats: AlertVerticalStat[]; threshold: number; fired: string[] }> => ({
  stats: [],
  threshold: 0,
  fired: [],
});

export const recomputeDistinctnessBaseline = async (): Promise<TuningState> => ({
  current_value: null,
  suggested_value: null,
  rationale: null,
});

export const applyDistinctnessSuggestion = async (): Promise<TuningState> => ({
  current_value: null,
  suggested_value: null,
  rationale: null,
});

export const getDistinctnessTuningState = async (): Promise<TuningState> => ({
  current_value: null,
  suggested_value: null,
  rationale: null,
});

export const getExportTokenPreview = async (): Promise<{ preview: string | null; configured: boolean }> => ({
  preview: null,
  configured: false,
});
