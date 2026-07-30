import { ArrowUpRight } from "lucide-react";

export function PortalHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
        {title}
      </h1>
      {subtitle && <p className="mt-1.5 text-sm text-ink-2">{subtitle}</p>}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="glass-card p-5">
      <div className="text-xs text-ink-2">{label}</div>
      <div className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink">
        {value}
      </div>
      <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] dark:text-[#2dd4bf]">
        <ArrowUpRight size={13} /> {delta}
      </div>
    </div>
  );
}

// Simple, dependency-free SVG area chart.
export function AreaChart({
  data,
  height = 220,
}: {
  data: { m: string; v: number }[];
  height?: number;
}) {
  const w = 640;
  const pad = 28;
  const max = Math.max(...data.map((d) => d.v)) * 1.1;
  const min = 0;
  const stepX = (w - pad * 2) / (data.length - 1);
  const y = (v: number) =>
    height - pad - ((v - min) / (max - min)) * (height - pad * 2);
  const pts = data.map((d, i) => [pad + i * stepX, y(d.v)] as const);
  const line = pts.map(([x, yy]) => `${x},${yy}`).join(" ");
  const area = `${pad},${height - pad} ${line} ${pad + (data.length - 1) * stepX},${height - pad}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      className="w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Traffic trend chart"
    >
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#areaFill)" />
      <polyline
        points={line}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map(([x, yy], i) => (
        <g key={i}>
          <circle cx={x} cy={yy} r="3.5" fill="var(--color-accent)" />
          <text
            x={x}
            y={height - 8}
            textAnchor="middle"
            className="fill-[var(--ink-2)] font-[var(--font-code)]"
            fontSize="11"
          >
            {data[i].m}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Published: "bg-[rgb(15_118_110_/0.14)] text-[var(--color-accent)] dark:text-[#2dd4bf]",
    Paid: "bg-[rgb(15_118_110_/0.14)] text-[var(--color-accent)] dark:text-[#2dd4bf]",
    Scheduled: "bg-[rgb(194_65_12_/0.14)] text-[var(--color-primary)] dark:text-[#fdba74]",
    "In review": "bg-[rgb(245_158_11_/0.14)] text-[var(--color-warning)]",
    Draft: "bg-[var(--surface-2)] text-ink-2",
    Booked: "bg-[rgb(15_118_110_/0.14)] text-[var(--color-accent)] dark:text-[#2dd4bf]",
    "Quote sent": "bg-[rgb(194_65_12_/0.14)] text-[var(--color-primary)] dark:text-[#fdba74]",
    FAQ: "bg-[var(--surface-2)] text-ink-2",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        map[status] ?? "bg-[var(--surface-2)] text-ink-2"
      }`}
    >
      {status}
    </span>
  );
}
