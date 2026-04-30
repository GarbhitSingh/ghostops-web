"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const FEATURES = [
  {
    icon: "🛡",
    title: "Stealth Creation",
    description:
      "Chrome 110 TLS impersonation via curl_cffi. Dynamic jazoest parsing, RSA password encryption — the full Instagram handshake, invisibly.",
    badge: "Anti-detect",
  },
  {
    icon: "🔄",
    title: "Proxy Rotation Engine",
    description:
      "Bulk-inject proxies. Live validation against Instagram. Auto-retire dead nodes. Always picks the freshest connection for every request.",
    badge: "Smart routing",
  },
  {
    icon: "⚡",
    title: "Real-time Pipeline",
    description:
      "Server-Sent Events stream every step live — OTP verification, account creation, professional conversion, bio setup — as it happens.",
    badge: "SSE streaming",
  },
  {
    icon: "💼",
    title: "Professional Setup",
    description:
      "Auto-converts freshly created accounts to Instagram Business/Creator mode with randomised category assignment. 3-retry resilience.",
    badge: "Business account",
  },
  {
    icon: "✍️",
    title: "GhostOps Bio",
    description:
      "Picks from 15 GhostOps-branded bio templates. Sets display name. Runs after account creation without any additional user input.",
    badge: "Auto bio",
  },
  {
    icon: "📋",
    title: "Credential Dashboard",
    description:
      "Every created account saved to your personal dashboard. Copy username, password, or full session cookies with one click.",
    badge: "Persistent storage",
  },
];

export default function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="section" ref={ref}>
      <div className="page-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
          style={{ marginBottom: "var(--sp-16)", maxWidth: 560 }}
        >
          <div className="text-label" style={{ marginBottom: "var(--sp-3)" }}>
            Capabilities
          </div>
          <h2 className="text-display" style={{ marginBottom: "var(--sp-4)" }}>
            Everything you need.
            <br />
            <span style={{ color: "var(--color-text-secondary)" }}>Nothing you don't.</span>
          </h2>
          <p style={{ fontSize: "var(--text-lg)" }}>
            GhostOps handles the entire creation pipeline — from stealth session to
            Professional account — so you can focus on scale.
          </p>
        </motion.div>

        {/* Features grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--sp-4)",
          }}
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="card"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                ease: [0, 0, 0.2, 1],
                delay: 0.1 + i * 0.07,
              }}
              style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div
                  style={{
                    fontSize: 28,
                    padding: "var(--sp-3)",
                    background: "var(--color-surface-2)",
                    borderRadius: "var(--radius-md)",
                    lineHeight: 1,
                  }}
                >
                  {feature.icon}
                </div>
                <span className="badge badge-accent">{feature.badge}</span>
              </div>

              <div>
                <h3
                  style={{
                    fontSize: "var(--text-lg)",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: "var(--sp-2)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {feature.title}
                </h3>
                <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          div[style*="repeat(3, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          div[style*="repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
