import {
  Globe,
  Phone,
  PenLine,
  MapPin,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  globe: Globe,
  phone: Phone,
  pen: PenLine,
  map: MapPin,
  sparkles: Sparkles,
  trending: TrendingUp,
};

export function FeatureIcon({
  name,
  className = "",
  size = 22,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  const Icon = map[name] ?? Globe;
  return (
    <span
      className={`grid place-items-center rounded-xl bg-gradient-to-br from-[rgb(194_65_12_/0.18)] to-[rgb(15_118_110_/0.14)] text-[var(--color-primary)] dark:text-[#fdba74] ${className}`}
    >
      <Icon size={size} strokeWidth={2} />
    </span>
  );
}
