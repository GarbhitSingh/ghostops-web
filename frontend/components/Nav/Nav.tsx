"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";

const NAV_LINKS = [
  { label: "Product", href: "/#features" },
  { label: "Use Cases", href: "/#how-it-works" },
  { label: "Pricing", href: "#" },
  { label: "Blog", href: "#" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 32);
      if (window.scrollY > 32) setMenuOpen(false);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 200,
          display: "flex",
          justifyContent: "center",
          padding: scrolled ? "10px var(--page-padding)" : "16px var(--page-padding)",
          transition: "padding 0.3s ease",
          pointerEvents: "none",
        }}
      >
        <motion.nav
          layout
          style={{
            pointerEvents: "auto",
            width: scrolled ? "min(900px, 100%)" : "100%",
            maxWidth: "var(--page-max-width)",
            height: "var(--nav-height)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            borderRadius: scrolled ? "var(--radius-pill)" : "0px",
            background: scrolled
              ? "rgba(15, 17, 23, 0.85)"
              : "rgba(15, 17, 23, 0.0)",
            backdropFilter: scrolled ? "blur(16px) saturate(1.5)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(16px) saturate(1.5)" : "none",
            border: scrolled ? "1px solid var(--color-border-md)" : "1px solid transparent",
            boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.5)" : "none",
          }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>👻</span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                fontSize: "var(--text-base)",
                color: "var(--color-text-primary)",
                letterSpacing: "-0.025em",
                fontVariationSettings: "'wdth' 100, 'wght' 700",
              }}
            >
              GhostOps
            </span>
          </Link>

          {/* Center nav */}
          <div
            style={{
              display: "flex",
              gap: "var(--sp-1)",
              alignItems: "center",
            }}
            className="nav-center"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="btn btn-ghost"
                style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right CTAs */}
          <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center" }}>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="btn btn-ghost"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  Dashboard
                </Link>
                <Link
                  href="/create"
                  className="btn btn-primary"
                  style={{ fontSize: "var(--text-sm)" }}
                >
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
                <Link
                  href="/login"
                  className="btn btn-ghost"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  Download ↓
                </Link>
              </>
            )}
          </div>
        </motion.nav>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .nav-center { display: none !important; }
        }
      `}</style>
    </>
  );
}
