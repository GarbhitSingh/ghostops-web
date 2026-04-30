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
        }}
      >
        <div className="page-container">
          <div style={{ fontSize: 48, marginBottom: "var(--sp-6)" }}>👻</div>
          <h2
            className="text-display"
            style={{ marginBottom: "var(--sp-4)", maxWidth: 540, margin: "0 auto var(--sp-4)" }}
          >
            Ready to go ghost?
          </h2>
          <p
            style={{
              fontSize: "var(--text-lg)",
              maxWidth: 460,
              margin: "0 auto var(--sp-10)",
            }}
          >
            Join GhostOps and automate Instagram account creation with stealth-grade infrastructure.
          </p>
          <div style={{ display: "flex", gap: "var(--sp-3)", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Create free account →
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
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
              }}
            >
              GhostOps
            </span>
          </div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            © {new Date().getFullYear()} GhostOps. Stealth IG automation.
          </p>
          <div style={{ display: "flex", gap: "var(--sp-4)" }}>
            {["#features", "#how-it-works", "/login", "/register"].map((href) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                }}
              >
                {href.replace("#", "").replace("/", "").replace("-", " ")}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
