// src/components/dashboard/StatsCard.tsx
import {
  FileText,
  Users,
  CheckSquare,
  Heart,
} from "lucide-react";

const ICONS: Record<string, any> = {
  FileText,
  Users,
  CheckSquare,
  Heart,
};

const COLOR_MAP: Record<string, string> = {
  org: "var(--color-org)",
  part: "var(--color-part)",
  jur: "var(--color-jur)",
  pub: "var(--color-pub)",
};

const BG_MAP: Record<string, string> = {
  org: "rgba(37,99,235,0.08)",
  part: "rgba(139,92,246,0.08)",
  jur: "rgba(249,115,22,0.08)",
  pub: "rgba(16,185,129,0.08)",
};

interface StatsCardProps {
    label: string;
    value: string | number;
    total: number | null;
    icon: string;
    color: string;
}

export default function StatsCard({ label, value, total, icon, color }: StatsCardProps) {
  const Icon = ICONS[icon] ?? FileText;
  const accentColor = COLOR_MAP[color] ?? "var(--color-org)";
  const bgColor = BG_MAP[color] ?? "rgba(37,99,235,0.08)";

  return (
    <article
      className="stats-card"
      style={{ "--accent": accentColor, "--accent-bg": bgColor } as React.CSSProperties}
    >
      <div className="stats-card__icon-wrap">
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <div className="stats-card__body">
        <span className="stats-card__label">{label}</span>
        <p className="stats-card__value">
          {value}
          {total !== null && (
            <span className="stats-card__total"> /{total}</span>
          )}
        </p>
      </div>
    </article>
  );
}
