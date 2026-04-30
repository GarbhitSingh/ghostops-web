"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

const STEPS = [
  {
    num: "01",
    icon: "📧",
    title: "Enter Email",
    description:
      "Provide any email address — temp mail supported. GhostOps initiates the Instagram handshake: fetches CSRF tokens, dynamically parses jazoest, and sends your OTP.",
    color: "rgba(66,133,244,",
  },
  {
    num: "02",
    icon: "🔐",
    title: "Enter OTP",
    description:
      "Check your inbox for the 6-digit code from Instagram. Paste it in — GhostOps verifies it, extracts the signup code, and fires the final account creation request.",
    color: "rgba(52,168,83,",
  },
  {
    num: "03",
    icon: "⚡",
    title: "Watch Pipeline Run",
    description:
      "Real-time SSE stream shows every step: account created → professional mode enabled → GhostOps bio applied. Watch it happen live in your browser.",
    color: "rgba(251,188,4,",
  },
  {
    num: "04",
    icon: "📋",
    title: "Get Credentials",
    description:
      "Username, password, and full session cookies displayed instantly. Copy individually or download the complete credential file as .txt.",
    color: "rgba(234,67,53,",
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="how-it-works"
      className="section"
      ref={ref}
      style={{
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle bg glow */}
      <div
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800, height: 400,
          background: "radial-gradient(ellipse, rgba(66,133,244,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="page-container" style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
          style={{ marginBottom: "var(--sp-20)", textAlign: "center" }}
        >
          <div className="text-label" style={{ marginBottom: "var(--sp-3)" }}>
            How it works
          </div>
          <h2 className="text-display" style={{ marginBottom: "var(--sp-5)" }}>
            Four steps to a
            <br />
            <span className="text-gradient">GhostOps account.</span>
          </h2>
          <p style={{ fontSize: "var(--text-lg)", color: "var(--color-text-secondary)", maxWidth: 480, margin: "0 auto" }}>
            The full pipeline takes under 60 seconds. No browser extensions, no app installs — just you and the API.
          </p>
        </motion.div>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "var(--sp-6)",
            position: "relative",
          }}
          className="steps-grid"
        >
          {/* Connector line */}
          <div
            style={{
              position: "absolute",
              top: 36,
              left: "calc(12.5% + 16px)",
              right: "calc(12.5% + 16px)",
              height: 1,
              background: "linear-gradient(90deg, transparent, var(--color-border-md) 20%, var(--color-border-md) 80%, transparent)",
            }}
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, ease: [0, 0, 0.2, 1], delay: 0.08 + i * 0.1 }}
              style={{ position: "relative", zIndex: 1 }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: `${step.color}0.08)`,
                  border: `1px solid ${step.color}0.25)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  marginBottom: "var(--sp-6)",
                  position: "relative",
                  boxShadow: `0 0 20px ${step.color}0.1)`,
                }}
              >
                {step.icon}
                {/* Step number badge */}
                <div
                  style={{
                    position: "absolute",
                    top: -8, right: -8,
                    width: 22, height: 22,
                    borderRadius: "50%",
                    background: "var(--color-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(66,133,244,0.4)",
                  }}
                >
                  {i + 1}
                </div>
              </div>

              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: `${step.color}0.7)`,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "var(--sp-2)",
                }}
              >
                {step.num}
              </div>

              <h3
                style={{
                  fontSize: "var(--text-xl)",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--sp-3)",
                  letterSpacing: "-0.015em",
                  fontVariationSettings: "'wdth' 100, 'wght' 600",
                }}
              >
                {step.title}
              </h3>
              <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.7, color: "var(--color-text-secondary)" }}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ textAlign: "center", marginTop: "var(--sp-20)" }}
        >
          <Link href="/register" className="btn btn-primary btn-lg">
            Get started — it's free →
          </Link>
          <p style={{ marginTop: "var(--sp-4)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            No credit card required. Instant access.
          </p>
        </motion.div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
