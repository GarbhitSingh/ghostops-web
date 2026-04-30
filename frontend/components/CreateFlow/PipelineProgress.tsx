"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type PipelineStep } from "@/lib/api";

const STEP_LABELS: Record<string, string> = {
  otp_verify:     "Verifying OTP",
  account_create: "Creating Account",
  pro_convert:    "Enabling Professional Mode",
  bio_update:     "Applying GhostOps Bio",
};

function StatusIcon({ status }: { status: PipelineStep["status"] }) {
  if (status === "running") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 }}>
        <span className="spinner" />
      </div>
    );
  }
  if (status === "done") {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        style={{
          width: 24, height: 24,
          borderRadius: "50%",
          background: "var(--color-success-dim)",
          border: "1px solid var(--color-success)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12,
        }}
      >
        ✓
      </motion.div>
    );
  }
  // error
  return (
    <div
      style={{
        width: 24, height: 24,
        borderRadius: "50%",
        background: "var(--color-error-dim)",
        border: "1px solid var(--color-error)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12,
        color: "var(--color-error)",
      }}
    >
      ✗
    </div>
  );
}

interface Props {
  steps: PipelineStep[];
}

export default function PipelineProgress({ steps }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
    >
      <div style={{ marginBottom: "var(--sp-8)" }}>
        <div className="text-label" style={{ marginBottom: "var(--sp-3)" }}>
          Processing
        </div>
        <h2
          style={{
            fontSize: "var(--text-3xl)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            marginBottom: "var(--sp-3)",
            fontVariationSettings: "'wdth' 100, 'wght' 700",
          }}
        >
          Running pipeline...
        </h2>
        <p style={{ fontSize: "var(--text-base)" }}>
          Sit tight while GhostOps sets up your account.
        </p>
      </div>

      <div style={{ maxWidth: 520 }}>
        <AnimatePresence initial={false}>
          {steps.map((step, i) => (
            <motion.div
              key={`${step.step}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], delay: 0.05 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sp-4)",
                padding: "var(--sp-4) var(--sp-5)",
                marginBottom: "var(--sp-2)",
                background: "var(--color-surface)",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${
                  step.status === "done"   ? "rgba(52,211,153,0.2)" :
                  step.status === "error"  ? "rgba(248,113,113,0.2)" :
                  "var(--color-border)"
                }`,
                transition: "border-color 0.2s ease",
              }}
            >
              {/* Status icon */}
              <div style={{ flexShrink: 0 }}>
                <StatusIcon status={step.status} />
              </div>

              {/* Labels */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: 500,
                    color: step.status === "error"
                      ? "var(--color-error)"
                      : step.status === "done"
                      ? "var(--color-success)"
                      : "var(--color-text-primary)",
                    marginBottom: 2,
                  }}
                >
                  {STEP_LABELS[step.step] ?? step.step}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                  {step.msg}
                </div>
              </div>

              {/* Step badge */}
              <div className={`badge badge-${step.status === "done" ? "success" : step.status === "error" ? "error" : "accent"}`}>
                {step.status === "running" ? "Running" : step.status === "done" ? "Done" : "Error"}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pending steps (unfilled) */}
        {steps.length < 4 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--sp-2)",
              opacity: 0.3,
            }}
          >
            {Array.from({ length: 4 - steps.length }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 60,
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
