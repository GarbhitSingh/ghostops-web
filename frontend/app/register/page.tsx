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
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
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
      <div
        style={{
          position: "fixed",
          top: 0, left: "50%", transform: "translateX(-50%)",
          width: "600px", height: "400px",
          background: "radial-gradient(ellipse, rgba(50,121,249,0.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
        style={{ width: "100%", maxWidth: 420 }}
      >
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
            Join GhostOps
          </h1>
          <p style={{ marginTop: "var(--sp-2)", fontSize: "var(--text-sm)" }}>
            Create your account and start automating
          </p>
        </div>

        <div className="card" style={{ padding: "var(--sp-8)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            {[
              { key: "username", label: "Username", type: "text", placeholder: "ghostagent", autocomplete: "username" },
              { key: "email",    label: "Email",    type: "email", placeholder: "you@example.com", autocomplete: "email" },
              { key: "password", label: "Password", type: "password", placeholder: "Min. 8 characters", autocomplete: "new-password" },
              { key: "confirm",  label: "Confirm Password", type: "password", placeholder: "Repeat password", autocomplete: "new-password" },
            ].map((field) => (
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
                <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Creating account...</>
              ) : (
                "Create Account"
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
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--color-accent)" }}>
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
