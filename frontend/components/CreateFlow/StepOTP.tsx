"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { igAPI, parseSSEStream, type PipelineStep, type PipelineDone } from "@/lib/api";

interface Props {
  sessionId: string;
  email: string;
  onPipelineStep: (step: PipelineStep) => void;
  onDone: (result: PipelineDone) => void;
  onError: (msg: string) => void;
}

export default function StepOTP({ sessionId, email, onPipelineStep, onDone, onError }: Props) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError("Enter the full OTP code");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // Use fetch + ReadableStream (NOT EventSource — doesn't support POST + credentials)
      const response = await igAPI.createStep2Raw(sessionId, otp);

      if (!response.ok || !response.body) {
        const errData = await response.json().catch(() => ({ detail: "Unknown error" }));
        onError(errData.detail ?? "Verification failed");
        setLoading(false);
        return;
      }

      // Parse SSE stream
      for await (const { event, data } of parseSSEStream(response)) {
        if (event === "step") {
          onPipelineStep(data as PipelineStep);
        } else if (event === "done") {
          onDone(data as PipelineDone);
          return;
        } else if (event === "error") {
          const errMsg = (data as any)?.msg ?? "Pipeline error";
          onError(errMsg);
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      onError(err.message ?? "Connection error");
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
        <div className="text-label" style={{ marginBottom: "var(--sp-3)" }}>Step 2 of 2</div>
        <h2
          style={{
            fontSize: "var(--text-3xl)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            marginBottom: "var(--sp-3)",
            fontVariationSettings: "'wdth' 100, 'wght' 700",
          }}
        >
          Enter Instagram OTP
        </h2>
        <p style={{ fontSize: "var(--text-base)", maxWidth: 420 }}>
          Check{" "}
          <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{email}</span>{" "}
          for a 6-digit code from Instagram. It expires in 10 minutes.
        </p>
      </div>

      <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)", maxWidth: 380 }}>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="input input-otp"
          placeholder="• • • • • •"
          maxLength={6}
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          style={{ fontSize: "var(--text-3xl)" }}
        />

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
          disabled={loading || otp.length < 4}
          style={{ alignSelf: "flex-start", minWidth: 200 }}
        >
          {loading ? (
            <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Verifying...</>
          ) : (
            <>Verify & Create Account →</>
          )}
        </button>
      </form>
    </motion.div>
  );
}
