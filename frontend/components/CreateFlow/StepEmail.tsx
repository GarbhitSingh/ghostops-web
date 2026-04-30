"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { igAPI } from "@/lib/api";

interface Props {
  onSuccess: (sessionId: string, email: string) => void;
}

export default function StepEmail({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await igAPI.createStep1(email);
      onSuccess(res.session_id, email);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Check proxies or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
    >
      <div style={{ marginBottom: "var(--sp-8)" }}>
        <div className="text-label" style={{ marginBottom: "var(--sp-3)" }}>Step 1 of 2</div>
        <h2
          style={{
            fontSize: "var(--text-3xl)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            marginBottom: "var(--sp-3)",
            fontVariationSettings: "'wdth' 100, 'wght' 700",
          }}
        >
          Enter target email
        </h2>
        <p style={{ fontSize: "var(--text-base)", maxWidth: 400 }}>
          We'll send a 6-digit OTP from Instagram to this address. Temp mail is supported.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)", maxWidth: 480 }}>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "var(--sp-2)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-secondary)",
              fontWeight: 500,
            }}
          >
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="target@tempmail.com"
            required
            autoFocus
            style={{ fontSize: "var(--text-lg)" }}
          />
          <p style={{ marginTop: "var(--sp-2)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            Temp mail services like Guerrilla Mail, 10MinuteMail are supported.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "var(--sp-3) var(--sp-4)",
              background: "var(--color-error-dim)",
              border: "1px solid var(--color-error)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-error)",
              fontSize: "var(--text-sm)",
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ alignSelf: "flex-start", minWidth: 180 }}
        >
          {loading ? (
            <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Initiating...</>
          ) : (
            <>Send OTP →</>
          )}
        </button>
      </form>
    </motion.div>
  );
}
