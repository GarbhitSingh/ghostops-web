"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

// ── Typewriter Hook ────────────────────────────────────────────────────
function useTypewriter(words: string[], speed = 65, pause = 2200) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx % words.length];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplay(current.slice(0, display.length + 1));
        if (display.length + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), pause);
        }
      } else {
        setDisplay(current.slice(0, display.length - 1));
        if (display.length - 1 === 0) {
          setIsDeleting(false);
          setWordIdx((i) => (i + 1) % words.length);
        }
      }
    }, isDeleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [display, isDeleting, wordIdx, words, speed, pause]);

  return display;
}

// ── Particle Canvas ───────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Particle config matching antigravity.google scattered dots
    const PARTICLE_COUNT = 80;
    type Particle = {
      x: number; y: number;
      vx: number; vy: number;
      size: number; alpha: number;
      color: string;
    };

    const COLORS = [
      "rgba(66,133,244,",   // blue
      "rgba(234,67,53,",    // red
      "rgba(251,188,4,",    // yellow
      "rgba(52,168,83,",    // green
    ];

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 3 + 1.5,
      alpha: Math.random() * 0.5 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0.9,
      }}
    />
  );
}

// ── Tool Chip Row (like antigravity.google) ────────────────────────────
const TOOLS = [
  { icon: ">_", label: "Stealth CLI" },
  { icon: "→|", label: "Proxy Route" },
  { icon: "⊞", label: "Multi-Account" },
  { icon: "◈", label: "3D Fingerprint" },
  { icon: "</>", label: "API" },
  { icon: "⋇", label: "Graph Network" },
  { icon: "✦", label: "Auto Setup" },
  { icon: "⌘", label: "Command" },
  { icon: "⁞⁞⁞", label: "Pipeline" },
  { icon: "↑", label: "Deploy" },
  { icon: "⧉", label: "Session Clone" },
  { icon: "⇄", label: "Rotate" },
  { icon: "↩", label: "Restore" },
  { icon: "↺", label: "Retry" },
];

function ToolRow() {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--sp-3)",
        justifyContent: "center",
        flexWrap: "wrap",
        padding: "var(--sp-4) 0",
        marginBottom: "var(--sp-12)",
      }}
    >
      {TOOLS.map((t, i) => (
        <motion.div
          key={t.label}
          className="tool-chip"
          title={t.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i, duration: 0.4, ease: [0, 0, 0.2, 1] }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{
            fontFamily: hovered === i ? "var(--font-mono)" : "var(--font-sans)",
            fontSize: t.icon.length > 2 ? 11 : 16,
            fontWeight: 600,
            color: hovered === i ? "var(--color-accent)" : "var(--color-text-secondary)",
            letterSpacing: "-0.03em",
          }}
        >
          {t.icon}
        </motion.div>
      ))}
    </div>
  );
}

// ── Main Hero ─────────────────────────────────────────────────────────
const TYPEWRITER_WORDS = [
  "Create.",
  "Automate.",
  "Dominate.",
  "Scale.",
  "Ghost.",
];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const fontWidth = useTransform(scrollYProgress, [0, 1], [100, 75]);
  const fontWeight = useTransform(scrollYProgress, [0, 1], [700, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const [fontVariation, setFontVariation] = useState("'wdth' 100, 'wght' 700");
  useEffect(() => {
    const unsubW = fontWidth.on("change", (w) => {
      setFontVariation(`'wdth' ${w.toFixed(0)}, 'wght' ${fontWeight.get().toFixed(0)}`);
    });
    const unsubWt = fontWeight.on("change", (wt) => {
      setFontVariation(`'wdth' ${fontWidth.get().toFixed(0)}, 'wght' ${wt.toFixed(0)}`);
    });
    return () => { unsubW(); unsubWt(); };
  }, [fontWidth, fontWeight]);

  const typeText = useTypewriter(TYPEWRITER_WORDS, 70, 1800);

  return (
    <section
      ref={ref}
      className="hero-glow"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: "calc(var(--nav-height) + var(--sp-16))",
        paddingBottom: "var(--sp-24)",
      }}
    >
      {/* Particle field */}
      <ParticleField />

      {/* Ambient grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          pointerEvents: "none",
          maskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 20%, transparent 100%)",
        }}
      />

      {/* Main glow orb */}
      <div
        style={{
          position: "absolute",
          top: "5%", left: "50%",
          transform: "translateX(-50%)",
          width: 900, height: 600,
          background: "radial-gradient(ellipse, rgba(66,133,244,0.09) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div className="page-container" style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%" }}>
        <motion.div style={{ opacity, y: translateY }}>

          {/* Brand eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0, 0, 0.2, 1], delay: 0.1 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--sp-2)",
              padding: "var(--sp-2) var(--sp-4)",
              background: "rgba(66,133,244,0.08)",
              border: "1px solid rgba(66,133,244,0.25)",
              borderRadius: "var(--radius-pill)",
              fontSize: "var(--text-sm)",
              color: "var(--color-accent)",
              fontWeight: 600,
              marginBottom: "var(--sp-10)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="live-dot" />
            GhostOps — Next-gen stealth platform
          </motion.div>

          {/* Logo-style brand */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{ marginBottom: "var(--sp-4)" }}
          >
            <span
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              👻 GhostOps
            </span>
          </motion.div>

          {/* Main headline — variable font + scroll animation */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0, 0, 0.2, 1], delay: 0.2 }}
            style={{
              fontSize: "clamp(3.5rem, 10vw, 10rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              fontVariationSettings: fontVariation,
              marginBottom: "var(--sp-4)",
              color: "var(--color-text-primary)",
              maxWidth: 1100,
              margin: "0 auto var(--sp-4)",
            }}
          >
            Experience liftoff
            <br />
            <span className="text-gradient-blue">with the next-gen</span>
            <br />
            agent platform.
          </motion.h1>

          {/* Live typewriter subline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{
              fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
              color: "var(--color-text-secondary)",
              maxWidth: 640,
              margin: "0 auto var(--sp-6)",
              lineHeight: 1.5,
              minHeight: "2.5em",
            }}
          >
            GhostOps is our agentic Instagram automation platform,{" "}
            <br />
            allowing anyone to build in the{" "}
            <span
              style={{
                color: "var(--color-text-primary)",
                fontWeight: 600,
                fontVariationSettings: "'wdth' 100, 'wght' 600",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {typeText}
              <span className="cursor-blink" />
            </span>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              fontSize: "var(--text-base)",
              color: "var(--color-text-muted)",
              maxWidth: 480,
              margin: "0 auto var(--sp-10)",
              lineHeight: 1.6,
            }}
          >
            Chrome 110 TLS impersonation. Proxy rotation engine. Real-time SSE pipeline.
            Professional account setup — in under a minute.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              display: "flex",
              gap: "var(--sp-3)",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "var(--sp-16)",
            }}
          >
            <Link href="/register" className="btn btn-primary btn-lg">
              Download for Windows
            </Link>
            <a href="#features" className="btn btn-outline btn-lg">
              Explore use cases
            </a>
          </motion.div>

          {/* Tool row — Antigravity style */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
            <ToolRow />
          </motion.div>

          {/* Description text below tools — matches antigravity.google */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: "var(--color-text-secondary)",
              maxWidth: 560,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            GhostOps is our agentic development platform, allowing anyone to
            build in the agent-first era.{" "}
            <span
              style={{
                color: "var(--color-text-primary)",
                fontWeight: 500,
              }}
            >
              &nbsp;
            </span>
          </motion.p>

        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
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
          zIndex: 2,
        }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{ width: 1, height: 36, background: "linear-gradient(to bottom, var(--color-accent), transparent)", borderRadius: 1 }}
        />
        scroll
      </motion.div>
    </section>
  );
}
