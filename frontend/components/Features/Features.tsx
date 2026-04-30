"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const FEATURES = [
  {
    icon: "🛡",
    title: "Stealth Creation",
    description:
      "Chrome 110 TLS impersonation via curl_cffi. Dynamic jazoest parsing, RSA password encryption — the full Instagram handshake, invisibly.",
    badge: "Anti-detect",
    color: "rgba(66,133,244,",
  },
  {
    icon: "🔄",
    title: "Proxy Rotation Engine",
    description:
      "Bulk-inject proxies. Live validation against Instagram. Auto-retire dead nodes. Always picks the freshest connection for every request.",
    badge: "Smart routing",
    color: "rgba(52,168,83,",
  },
  {
    icon: "⚡",
    title: "Real-time Pipeline",
    description:
      "Server-Sent Events stream every step live — OTP verification, account creation, professional conversion, bio setup — as it happens.",
    badge: "SSE streaming",
    color: "rgba(251,188,4,",
  },
  {
    icon: "💼",
    title: "Professional Setup",
    description:
      "Auto-converts freshly created accounts to Instagram Business/Creator mode with randomised category assignment. 3-retry resilience.",
    badge: "Business account",
    color: "rgba(234,67,53,",
  },
  {
    icon: "✍️",
    title: "GhostOps Bio",
    description:
      "Picks from 15 GhostOps-branded bio templates. Sets display name. Runs after account creation without any additional user input.",
    badge: "Auto bio",
    color: "rgba(66,133,244,",
  },
  {
    icon: "📋",
    title: "Credential Dashboard",
    description:
      "Every created account saved to your personal dashboard. Copy username, password, or full session cookies with one click.",
    badge: "Persistent storage",
    color: "rgba(52,168,83,",
  },
];

function FeatureCard({ feature, index, inView }: { feature: typeof FEATURES[0]; index: number; inView: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      key={feature.title}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0, 0, 0.2, 1], delay: 0.08 + index * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "var(--color-surface-2)" : "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--sp-8)",
        border: hovered
          ? `1px solid ${feature.color}0.25)`
          : "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--sp-4)",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.25s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? `0 8px 32px ${feature.color}0.12)` : "none",
        cursor: "default",
      }}
    >
      {/* Background glow on hover */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "1px",
            background: `linear-gradient(90deg, transparent, ${feature.color}0.5), transparent)`,
          }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            fontSize: 26,
            padding: "var(--sp-3)",
            background: `${feature.color}0.1)`,
            borderRadius: "var(--radius-md)",
            lineHeight: 1,
            border: `1px solid ${feature.color}0.15)`,
          }}
        >
          {feature.icon}
        </div>
        <span className="badge badge-accent" style={{ fontSize: "10px" }}>{feature.badge}</span>
      </div>

      <div>
        <h3
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            marginBottom: "var(--sp-2)",
            letterSpacing: "-0.015em",
            fontVariationSettings: "'wdth' 100, 'wght' 600",
          }}
        >
          {feature.title}
        </h3>
        <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.65, color: "var(--color-text-secondary)" }}>
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

// ── Live stat counter ──────────────────────────────────────────────────
function LiveCounter({ target, label, suffix = "" }: { target: number; label: string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect2(inView, () => {
    if (!inView) return;
    let start = 0;
    const duration = 1200;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  });

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div className="stat-value" style={{ color: "var(--color-text-primary)" }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "var(--sp-1)", fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

// Simple effect helper to avoid react hooks warning
function useEffect2(dep: boolean, fn: () => void | (() => void)) {
  const { useEffect } = require("react");
  useEffect(() => {
    if (dep) return fn();
  }, [dep]); // eslint-disable-line
}

export default function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-60px" });

  return (
    <section id="features" className="section" ref={ref}>
      <div className="page-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
          style={{ marginBottom: "var(--sp-16)", maxWidth: 620 }}
        >
          <div className="text-label" style={{ marginBottom: "var(--sp-3)" }}>
            Capabilities
          </div>
          <h2 className="text-display" style={{ marginBottom: "var(--sp-5)" }}>
            Everything you need.
            <br />
            <span style={{ color: "var(--color-text-secondary)" }}>Nothing you don't.</span>
          </h2>
          <p style={{ fontSize: "var(--text-lg)", maxWidth: 520, color: "var(--color-text-secondary)" }}>
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
          className="features-grid"
        >
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} inView={inView} />
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 24 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            marginTop: "var(--sp-20)",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "var(--sp-6)",
            padding: "var(--sp-10)",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
          }}
          className="stats-grid"
        >
          {[
            { target: 110, label: "Chrome TLS Version", suffix: "" },
            { target: 15, label: "Bio Templates", suffix: "+" },
            { target: 5, label: "Concurrent Creates", suffix: "x" },
            { target: 99, label: "Uptime SLA", suffix: "%" },
          ].map((s) => (
            <LiveCounter key={s.label} target={s.target} label={s.label} suffix={s.suffix} />
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
