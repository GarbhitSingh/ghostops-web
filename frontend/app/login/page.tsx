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
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "fixed",
          top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "600px", height: "400px",
          background: "radial-gradient(ellipse, rgba(50,121,249,0.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
        style={{ width: "100%", maxWidth: 400 }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "var(--sp-8)" }}>
          <div style={{ fontSize: 40, marginBottom: "var(--sp-3)" }}>👻</div>
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              fontVariationSettings: "'wdth' 100, 'wght' 700",
            }}
          >
            Welcome back
          </h1>
          <p style={{ marginTop: "var(--sp-2)", fontSize: "var(--text-sm)" }}>
            Sign in to your GhostOps account
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "var(--sp-8)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
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
                  border: "1px solid var(--color-error)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-error)",
                  fontSize: "var(--text-sm)",
                }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: "100%", marginTop: "var(--sp-2)" }}
            >
              {loading ? (
                <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Signing in...</>
              ) : (
                "Sign In"
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
          <Link href="/register" style={{ color: "var(--color-accent)" }}>
            Create one
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
