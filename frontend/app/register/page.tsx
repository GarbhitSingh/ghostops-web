"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const FIELDS = [
    { key: "username", label: "Username", type: "text",     placeholder: "ghostagent",      autocomplete: "username" },
    { key: "email",    label: "Email",    type: "email",    placeholder: "you@example.com", autocomplete: "email" },
    { key: "password", label: "Password", type: "password", placeholder: "Min. 8 characters", autocomplete: "new-password" },
    { key: "confirm",  label: "Confirm",  type: "password", placeholder: "Repeat password", autocomplete: "new-password" },
  ];

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
      {/* Background glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)",
          width: 700, height: 500,
          background: "radial-gradient(ellipse, rgba(66,133,244,0.09) 0%, transparent 65%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-5%", right: "15%",
          width: 350, height: 250,
          background: "radial-gradient(ellipse, rgba(52,168,83,0.04) 0%, transparent 60%)",
        }} />
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
        style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}
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
            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
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
            Join GhostOps
          </h1>
          <p style={{ marginTop: "var(--sp-2)", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
            Create your account and start automating
          </p>
        </div>

        {/* Card */}
        <div className="card-glass" style={{ padding: "var(--sp-8)", boxShadow: "var(--shadow-lg)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            {FIELDS.map((field) => (
              <div key={field.key}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "var(--sp-2)",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={update(field.key)}
                  className="input"
                  placeholder={field.placeholder}
                  autoComplete={field.autocomplete}
                  required
                />
              </div>
            ))}

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
              style={{ width: "100%", marginTop: "var(--sp-2)" }}
            >
              {loading ? (
                <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Creating account...</>
              ) : (
                "Create Account →"
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "var(--sp-6)", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--color-accent)", fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
