"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { type PipelineDone } from "@/lib/api";

interface Props {
  result: PipelineDone;
}

function CopyField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--sp-2)",
        }}
      >
        <span
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          {label}
        </span>
        <button
          onClick={copy}
          className="btn btn-ghost"
          style={{ padding: "2px 10px", fontSize: "var(--text-xs)", height: 24 }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <div
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--sp-3) var(--sp-4)",
          fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
          fontSize: mono ? "var(--text-sm)" : "var(--text-base)",
          color: "var(--color-text-primary)",
          wordBreak: "break-all",
          userSelect: "all",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function ResultCard({ result }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const handleDownload = () => {
    const lines = [
      "╔══════════════════════════════════════╗",
      "║        GhostOps — Account Creds      ║",
      "╚══════════════════════════════════════╝",
      "",
      `Username : ${result.username}`,
      `Password : ${result.password}`,
      "",
      `Pro Mode : ${result.pro_converted ? "✅ Enabled" : "❌ Failed"}`,
      `Bio      : ${result.bio_updated ? "✅ Applied" : "❌ Failed"}`,
      "",
      "── Session Cookies ─────────────────────",
      result.cookies,
      "",
      `Generated: ${new Date().toISOString()}`,
      "Powered by GhostOps · ghostops.io",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ghostops-${result.username}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* Success header */}
      <div style={{ marginBottom: "var(--sp-8)" }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--sp-2)",
            padding: "var(--sp-2) var(--sp-4)",
            background: "var(--color-success-dim)",
            border: "1px solid var(--color-success)",
            borderRadius: "var(--radius-pill)",
            color: "var(--color-success)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            marginBottom: "var(--sp-4)",
          }}
        >
          ✅ Account Created Successfully
        </motion.div>

        <h2
          style={{
            fontSize: "var(--text-4xl)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            marginBottom: "var(--sp-3)",
            fontVariationSettings: "'wdth' 100, 'wght' 700",
          }}
        >
          @{result.username}
        </h2>

        {/* Pipeline status badges */}
        <div style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap" }}>
          <span className="badge badge-success">✅ Account Created</span>
          <span className={`badge ${result.pro_converted ? "badge-success" : "badge-error"}`}>
            {result.pro_converted ? "✅ Professional" : "⚠️ Pro Failed"}
          </span>
          <span className={`badge ${result.bio_updated ? "badge-success" : "badge-error"}`}>
            {result.bio_updated ? "✅ Bio Updated" : "⚠️ Bio Failed"}
          </span>
        </div>
      </div>

      {/* Credentials card */}
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)", maxWidth: 580 }}>
        <CopyField label="Username" value={result.username} />

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--sp-2)",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              Password
            </span>
            <div style={{ display: "flex", gap: "var(--sp-2)" }}>
              <button
                onClick={() => setShowPassword((v) => !v)}
                className="btn btn-ghost"
                style={{ padding: "2px 10px", fontSize: "var(--text-xs)", height: 24 }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(result.password)}
                className="btn btn-ghost"
                style={{ padding: "2px 10px", fontSize: "var(--text-xs)", height: 24 }}
              >
                Copy
              </button>
            </div>
          </div>
          <div
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--sp-3) var(--sp-4)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-primary)",
              letterSpacing: showPassword ? "normal" : "0.3em",
            }}
          >
            {showPassword ? result.password : "•".repeat(result.password.length)}
          </div>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--sp-2)",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              Session Cookies
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(result.cookies)}
              className="btn btn-ghost"
              style={{ padding: "2px 10px", fontSize: "var(--text-xs)", height: 24 }}
            >
              Copy All
            </button>
          </div>
          <div className="code-block">{result.cookies}</div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "var(--sp-3)", paddingTop: "var(--sp-2)" }}>
          <button onClick={handleDownload} className="btn btn-primary" style={{ flex: 1 }}>
            ⬇ Download .txt
          </button>
          <Link href="/create" className="btn btn-secondary" style={{ flex: 1, textAlign: "center" }}>
            + Create Another
          </Link>
          <Link href="/dashboard" className="btn btn-ghost" style={{ flex: 1, textAlign: "center" }}>
            Dashboard
          </Link>
        </div>
      </div>

      {/* Warning */}
      <p
        style={{
          marginTop: "var(--sp-4)",
          fontSize: "var(--text-xs)",
          color: "var(--color-text-muted)",
          maxWidth: 580,
        }}
      >
        ⚠️ Save your credentials — they will not be shown again in plaintext. Stored securely in your dashboard.
      </p>
    </motion.div>
  );
}
