// Stub: server function not available in Replit SPA build.

export type DemoResearchConfig = {
  caps: Array<{
    name: string;
    effective: number;
    default: number;
    min: number;
    max: number;
    source: "default" | "env" | "clamped" | "unparsable";
    raw?: string;
  }>;
  redaction: Array<{
    name: string;
    enabled: boolean;
    source: "default" | "env" | "unparsable";
    raw?: string;
  }>;
};

export const getDemoResearchConfig = async (): Promise<DemoResearchConfig> => ({
  caps: [],
  redaction: [],
});
