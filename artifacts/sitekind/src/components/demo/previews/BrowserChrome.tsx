import { domainSlug } from "./types";

export function BrowserChrome({
  businessName,
  bg = "#f5f5f5",
  border = "rgba(0,0,0,0.08)",
  text = "rgba(0,0,0,0.55)",
}: {
  businessName: string;
  bg?: string;
  border?: string;
  text?: string;
}) {
  // Minimum viable frame (SOL round-5: the chrome was still noisy): a 22px
  // bar, 6px dots, 9px URL. A framing device, never content.
  return (
    <div
      className="flex items-center gap-1.5 border-b px-2.5"
      style={{ background: bg, borderColor: border, height: 22 }}
    >
      <span className="h-1.5 w-1.5 rounded-full opacity-70" style={{ background: "#ff5f57" }} />
      <span className="h-1.5 w-1.5 rounded-full opacity-70" style={{ background: "#febc2e" }} />
      <span className="h-1.5 w-1.5 rounded-full opacity-70" style={{ background: "#28c840" }} />
      <span
        className="ml-2 truncate text-[9px]"
        style={{ color: text, fontFamily: "'Fira Code', ui-monospace, monospace" }}
      >
        {domainSlug(businessName)}.com
      </span>
    </div>
  );
}
