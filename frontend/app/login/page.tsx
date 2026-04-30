"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        padding: "var(--sp-6)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Multi-color glow orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)",
          width: 700, height: 500,
          background: "radial-gradient(ellipse, rgba(66,133,244,0.09) 0%, transparent 65%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", left: "20%",
          width: 400, height: 300,
          background: "radial-gradient(ellipse, rgba(52,168,83,0.04) 0%, transparent 60%)",
        }} />
        <div style={{
          position: "absolute", top: "30%", right: "10%",
          width: 300, height: 200,
          background: "radial-gradient(ellipse, rgba(234,67,53,0.04) 0%, transparent 60%)",
        }} />
        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0, 0, 0.2, 1] }}
        style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "var(--sp-10)" }}>
          <Link href="/" style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-3)", textDecoration: "none" }}>
            <div
              style={{
                width: 56, height: 56,
                borderRadius: "var(--radius-lg)",
                background: "rgba(66,133,244,0.1)",
                border: "1px solid rgba(66,133,244,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28,
              }}
            >
              👻
            </div>
            <span
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              GhostOps
            </span>
          </Link>

          <h1
            style={{
              marginTop: "var(--sp-5)",
              fontSize: "var(--text-3xl)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              fontVariationSettings: "'wdth' 100, 'wght' 700",
              color: "var(--color-text-primary)",
            }}
          >
            Welcome back
          </h1>
          <p style={{ marginTop: "var(--sp-2)", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
            Sign in to your GhostOps account
          </p>
        </div>

        {/* Card */}
        <div
          className="card-glass"
          style={{ padding: "var(--sp-8)", boxShadow: "var(--shadow-lg)" }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "var(--sp-2)",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-secondary)",
                  fontWeight: 500,
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "var(--sp-2)",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-secondary)",
                  fontWeight: 500,
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: "var(--sp-3) var(--sp-4)",
                  background: "var(--color-error-dim)",
                  border: "1px solid rgba(248,113,113,0.3)",
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
              disabled={loading}
              style={{ width: "100%", marginTop: "var(--sp-1)" }}
            >
              {loading ? (
                <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Signing in...</>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "var(--sp-6)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-muted)",
          }}
        >
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "var(--color-accent)", fontWeight: 500 }}>
            Create one
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
