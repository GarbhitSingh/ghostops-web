"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        padding: "12px var(--page-padding)",
        pointerEvents: "none",
      }}
    >
      <motion.nav
        layout
        style={{
          pointerEvents: "auto",
          width: scrolled ? "min(860px, 100%)" : "100%",
          maxWidth: "var(--page-max-width)",
          height: "var(--nav-height)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderRadius: scrolled ? "9999px" : "0",
          background: scrolled ? "var(--color-nav-bg-pill)" : "var(--color-nav-bg)",
          backdropFilter: scrolled ? "blur(var(--color-nav-blur))" : "none",
          WebkitBackdropFilter: scrolled ? "blur(var(--color-nav-blur))" : "none",
          border: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
          boxShadow: scrolled ? "var(--shadow-md)" : "none",
        }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>👻</span>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
              fontVariationSettings: "'wdth' 100, 'wght' 700",
            }}
          >
            GhostOps
          </span>
        </Link>

        {/* Center nav links */}
        <div
          style={{
            display: "flex",
            gap: "var(--sp-2)",
            alignItems: "center",
          }}
          className="hidden-mobile"
        >
          {[
            { label: "Features", href: "/#features" },
            { label: "How it works", href: "/#how-it-works" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="btn btn-ghost"
              style={{ fontSize: "var(--text-sm)" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right CTAs */}
        <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center" }}>
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-ghost" style={{ fontSize: "var(--text-sm)" }}>
                Dashboard
              </Link>
              <Link href="/create" className="btn btn-primary" style={{ fontSize: "var(--text-sm)" }}>
                + Create
              </Link>
              <button
                onClick={() => logout()}
                className="btn btn-ghost"
                style={{ fontSize: "var(--text-sm)" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost" style={{ fontSize: "var(--text-sm)" }}>
                Login
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ fontSize: "var(--text-sm)" }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </motion.nav>

      <style jsx>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
