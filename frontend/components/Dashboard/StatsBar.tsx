"use client";

import { type IGAccount } from "@/lib/api";

interface Props {
  accounts: IGAccount[];
}

export default function StatsBar({ accounts }: Props) {
  const total = accounts.length;
  const proCount = accounts.filter((a) => a.pro_converted).length;
  const bioCount = accounts.filter((a) => a.bio_updated).length;
  const successRate = total > 0 ? Math.round((proCount / total) * 100) : 0;

  const stats = [
    { label: "Accounts Created", value: total, color: "var(--color-text-primary)" },
    { label: "Professional", value: proCount, color: "var(--color-success)" },
    { label: "Bio Updated", value: bioCount, color: "var(--color-accent)" },
    { label: "Success Rate", value: `${successRate}%`, color: "var(--color-text-primary)" },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "var(--sp-3)",
        marginBottom: "var(--sp-10)",
      }}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--sp-5) var(--sp-6)",
          }}
        >
          <div
            style={{
              fontSize: "var(--text-3xl)",
              fontWeight: 700,
              color: stat.color,
              fontVariationSettings: "'wdth' 100, 'wght' 700",
              marginBottom: "var(--sp-1)",
              letterSpacing: "-0.02em",
            }}
          >
            {stat.value}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontWeight: 500 }}>
            {stat.label}
          </div>
        </div>
      ))}

      <style jsx>{`
        @media (max-width: 640px) {
          div { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
