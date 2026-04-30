"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Variable font animation driven by scroll (condensed+bold → expanded+light)
  const fontWidth = useTransform(scrollYProgress, [0, 1], [100, 75]);
  const fontWeight = useTransform(scrollYProgress, [0, 1], [700, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const [fontVariation, setFontVariation] = useState("'wdth' 100, 'wght' 700");
  useEffect(() => {
    const unsubW = fontWidth.on("change", (w) => {
      const wt = fontWeight.get();
      setFontVariation(`'wdth' ${w.toFixed(0)}, 'wght' ${wt.toFixed(0)}`);
    });
    const unsubWt = fontWeight.on("change", (wt) => {
      const w = fontWidth.get();
      setFontVariation(`'wdth' ${w.toFixed(0)}, 'wght' ${wt.toFixed(0)}`);
    });
    return () => { unsubW(); unsubWt(); };
  }, [fontWidth, fontWeight]);

  return (
    <section
      ref={ref}
      className="hero-glow"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: "calc(var(--nav-height) + var(--sp-20))",
        paddingBottom: "var(--sp-24)",
      }}
    >
      {/* Ambient grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* Blue accent orb */}
      <div
        style={{
          position: "absolute",
          top: "10%", left: "50%",
          transform: "translateX(-50%)",
          width: 800, height: 500,
          background: "radial-gradient(ellipse, rgba(50,121,249,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div className="page-container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <motion.div style={{ opacity, y: translateY }}>

          {/* Eyebrow tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0, 0, 0.2, 1], delay: 0.1 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--sp-2)",
              padding: "var(--sp-2) var(--sp-4)",
              background: "var(--color-accent-dim)",
              border: "1px solid rgba(50,121,249,0.3)",
              borderRadius: "var(--radius-pill)",
              fontSize: "var(--text-sm)",
              color: "var(--color-accent)",
              fontWeight: 500,
              marginBottom: "var(--sp-8)",
            }}
          >
            <span style={{ fontSize: 14 }}>👻</span>
            GhostOps — Stealth IG Automation
          </motion.div>

          {/* Main headline — variable font scroll animation */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0, 0, 0.2, 1], delay: 0.15 }}
            style={{
              fontSize: "clamp(3.5rem, 10vw, 9.5rem)",
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
              fontVariationSettings: fontVariation,
              marginBottom: "var(--sp-6)",
              color: "var(--color-text-primary)",
              maxWidth: 1100,
              margin: "0 auto var(--sp-6)",
            }}
          >
            Create.{" "}
            <span style={{ color: "var(--color-accent)" }}>Automate.</span>
            <br />
            Dominate.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0, 0, 0.2, 1], delay: 0.25 }}
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: "var(--color-text-secondary)",
              maxWidth: 580,
              margin: "0 auto var(--sp-12)",
              lineHeight: 1.6,
            }}
          >
            The stealth infrastructure for Instagram account creation. Professional
            setup, GhostOps bio — in under a minute.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0, 0, 0.2, 1], delay: 0.35 }}
            style={{
              display: "flex",
              gap: "var(--sp-3)",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/register" className="btn btn-primary btn-lg">
              Start for free →
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">
              How it works
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={{
              marginTop: "var(--sp-12)",
              display: "flex",
              justifyContent: "center",
              gap: "var(--sp-8)",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "Chrome 110", label: "TLS Impersonation" },
              { value: "Auto-Rotate", label: "Proxy Engine" },
              { value: "Real-time", label: "Pipeline SSE" },
              { value: "2-Step", label: "Creation Flow" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "var(--text-lg)",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    fontVariationSettings: "'wdth' 100, 'wght' 700",
                    marginBottom: 2,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          position: "absolute",
          bottom: "var(--sp-8)",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--sp-2)",
          color: "var(--color-text-muted)",
          fontSize: "var(--text-xs)",
        }}
      >
        <div style={{ width: 1, height: 40, background: "var(--color-border)", borderRadius: 1 }} />
        Scroll
      </motion.div>
    </section>
  );
}
