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
  },
  {
    num: "02",
    icon: "🔐",
    title: "Enter OTP",
    description:
      "Check your inbox for the 6-digit code from Instagram. Paste it in — GhostOps verifies it, extracts the signup code, and fires the final account creation request.",
  },
  {
    num: "03",
    icon: "⚡",
    title: "Watch Pipeline Run",
    description:
      "Real-time SSE stream shows every step: account created → professional mode enabled → GhostOps bio applied. Watch it happen live.",
  },
  {
    num: "04",
    icon: "📋",
    title: "Get Credentials",
    description:
      "Username, password, and full session cookies displayed instantly. Copy individually or download the complete credential file as .txt.",
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="section" ref={ref}
      style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="page-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
          style={{ marginBottom: "var(--sp-16)", textAlign: "center" }}
        >
          <div className="text-label" style={{ marginBottom: "var(--sp-3)" }}>
            How it works
          </div>
          <h2 className="text-display">
            Four steps to a
            <br />
            <span style={{ color: "var(--color-accent)" }}>
              GhostOps account.
            </span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "var(--sp-4)",
            position: "relative",
          }}
        >
          {/* Connector line */}
          <div
            style={{
              position: "absolute",
              top: 40,
              left: "12.5%",
              right: "12.5%",
              height: 1,
              background: "var(--color-border)",
            }}
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                ease: [0, 0, 0.2, 1],
                delay: 0.1 + i * 0.1,
              }}
              style={{ position: "relative", zIndex: 1 }}
            >
              {/* Step number circle */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: "var(--sp-5)",
                  position: "relative",
                }}
              >
                {step.icon}
                <div
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "var(--color-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {i + 1}
                </div>
              </div>

              <h3
                style={{
                  fontSize: "var(--text-lg)",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--sp-3)",
                  letterSpacing: "-0.01em",
                }}
              >
                {step.title}
              </h3>
              <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.7 }}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1], delay: 0.6 }}
          style={{ textAlign: "center", marginTop: "var(--sp-16)" }}
        >
          <Link href="/register" className="btn btn-primary btn-lg">
            Get started — it's free →
          </Link>
        </motion.div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          div[style*="repeat(4, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          div[style*="repeat(4, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
