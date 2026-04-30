import Nav from "@/components/Nav/Nav";
import Hero from "@/components/Hero/Hero";
import Features from "@/components/Features/Features";
import HowItWorks from "@/components/HowItWorks/HowItWorks";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />

      {/* Footer CTA */}
      <section
        className="section"
        style={{
          background: "var(--color-bg)",
          textAlign: "center",
          borderTop: "1px solid var(--color-border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "0%", left: "50%",
            transform: "translateX(-50%)",
            width: 700, height: 400,
            background: "radial-gradient(ellipse, rgba(66,133,244,0.08) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div className="page-container" style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--sp-2)",
              padding: "var(--sp-2) var(--sp-4)",
              background: "rgba(66,133,244,0.08)",
              border: "1px solid rgba(66,133,244,0.2)",
              borderRadius: "var(--radius-pill)",
              fontSize: "var(--text-sm)",
              color: "var(--color-accent)",
              fontWeight: 600,
              marginBottom: "var(--sp-8)",
            }}
          >
            👻 GhostOps
          </div>
          <h2
            className="text-display"
            style={{ marginBottom: "var(--sp-5)", maxWidth: 580, margin: "0 auto var(--sp-5)" }}
          >
            Ready to go ghost?
          </h2>
          <p
            style={{
              fontSize: "var(--text-lg)",
              maxWidth: 480,
              margin: "0 auto var(--sp-10)",
              color: "var(--color-text-secondary)",
            }}
          >
            Join GhostOps and automate Instagram account creation with stealth-grade infrastructure.
          </p>
          <div style={{ display: "flex", gap: "var(--sp-3)", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Create free account →
            </Link>
            <Link href="/login" className="btn btn-outline btn-lg">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "var(--sp-8) 0",
          background: "var(--color-bg)",
        }}
      >
        <div
          className="page-container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--sp-4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
            <span style={{ fontSize: 18 }}>👻</span>
            <span
              style={{
                fontWeight: 700,
                color: "var(--color-text-secondary)",
                fontSize: "var(--text-sm)",
                fontVariationSettings: "'wdth' 100, 'wght' 700",
              }}
            >
              GhostOps
            </span>
          </div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            © {new Date().getFullYear()} GhostOps. Stealth IG automation.
          </p>
          <div style={{ display: "flex", gap: "var(--sp-5)" }}>
            {[
              { label: "Features", href: "#features" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Login", href: "/login" },
              { label: "Register", href: "/register" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                  transition: "color 0.15s ease",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
