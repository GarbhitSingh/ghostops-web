"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { type IGAccount } from "@/lib/api";

interface Props {
  account: IGAccount;
  index: number;
}

export default function AccountCard({ account, index }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const formattedDate = new Date(account.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: index * 0.05 }}
      style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              fontVariationSettings: "'wdth' 100, 'wght' 700",
              marginBottom: "var(--sp-1)",
            }}
          >
            @{account.ig_username}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            {formattedDate}
          </div>
        </div>
        <div
          style={{
            fontSize: 24,
            lineHeight: 1,
            padding: "var(--sp-2)",
            background: "var(--color-surface-2)",
            borderRadius: "var(--radius-md)",
          }}
        >
          👻
        </div>
      </div>

      {/* Status badges */}
      <div style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap" }}>
        <span className={`badge ${account.pro_converted ? "badge-success" : "badge-error"}`}>
          {account.pro_converted ? "✓ Professional" : "✗ Standard"}
        </span>
        <span className={`badge ${account.bio_updated ? "badge-success" : "badge-error"}`}>
          {account.bio_updated ? "✓ Bio Set" : "✗ No Bio"}
        </span>
        <span className="badge badge-accent">GhostOps</span>
      </div>

      {/* Quick copy row */}
      <div
        style={{
          display: "flex",
          gap: "var(--sp-2)",
          borderTop: "1px solid var(--color-border)",
          paddingTop: "var(--sp-3)",
        }}
      >
        <button
          onClick={() => copy(account.ig_username)}
          className="btn btn-secondary"
          style={{ flex: 1, fontSize: "var(--text-xs)", padding: "6px 12px" }}
        >
          Copy Username
        </button>
        <button
          onClick={() => copy(account.ig_password)}
          className="btn btn-secondary"
          style={{ flex: 1, fontSize: "var(--text-xs)", padding: "6px 12px" }}
        >
          {copied ? "✓ Copied!" : "Copy Password"}
        </button>
        <button
          onClick={() => copy(account.cookies)}
          className="btn btn-ghost"
          style={{ flex: 1, fontSize: "var(--text-xs)", padding: "6px 12px" }}
        >
          Copy Cookies
        </button>
      </div>
    </motion.div>
  );
}
