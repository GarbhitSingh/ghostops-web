"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Nav from "@/components/Nav/Nav";
import StatsBar from "@/components/Dashboard/StatsBar";
import AccountCard from "@/components/Dashboard/AccountCard";
import ProxyManager from "@/components/Dashboard/ProxyManager";
import { igAPI, type IGAccount } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Tab = "accounts" | "proxies";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [accounts, setAccounts] = useState<IGAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("accounts");

  useEffect(() => {
    if (authLoading) return;
    igAPI
      .getAccounts()
      .then(setAccounts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [authLoading]);

  return (
    <>
      <Nav />
      <main
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          paddingTop: "calc(var(--nav-height) + var(--sp-16))",
          paddingBottom: "var(--sp-24)",
        }}
      >
        <div className="page-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "var(--sp-10)",
              flexWrap: "wrap",
              gap: "var(--sp-4)",
            }}
          >
            <div>
              <div className="text-label" style={{ marginBottom: "var(--sp-3)" }}>
                Welcome back
              </div>
              <h1
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.5rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  fontVariationSettings: "'wdth' 100, 'wght' 700",
                  marginBottom: "var(--sp-2)",
                }}
              >
                {user?.username ?? "Agent"}
              </h1>
              <p style={{ fontSize: "var(--text-base)" }}>
                Your GhostOps account dashboard
              </p>
            </div>

            <Link href="/create" className="btn btn-primary btn-lg">
              + Create Account
            </Link>
          </motion.div>

          {/* Stats */}
          {!loading && !error && <StatsBar accounts={accounts} />}

          {/* ── Tabs ── */}
          <div
            style={{
              display: "flex",
              gap: "var(--sp-1)",
              marginBottom: "var(--sp-8)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--sp-1)",
              width: "fit-content",
            }}
          >
            {(
              [
                { id: "accounts", label: "📋 Accounts" },
                { id: "proxies",  label: "🔌 My Proxies" },
              ] as { id: Tab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "var(--sp-2) var(--sp-5)",
                  borderRadius: "calc(var(--radius-lg) - 4px)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                  background:
                    activeTab === tab.id ? "var(--color-accent)" : "transparent",
                  color:
                    activeTab === tab.id
                      ? "#fff"
                      : "var(--color-text-secondary)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* ── Accounts tab ── */}
            {activeTab === "accounts" && (
              <div>
                <h2
                  style={{
                    fontSize: "var(--text-xl)",
                    fontWeight: 600,
                    marginBottom: "var(--sp-6)",
                    letterSpacing: "-0.015em",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Created Accounts
                </h2>

                {loading && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: "var(--sp-4)",
                    }}
                  >
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          height: 180,
                          background: "var(--color-surface)",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid var(--color-border)",
                          opacity: 0.6,
                          animation: "pulse 1.5s ease-in-out infinite",
                        }}
                      />
                    ))}
                  </div>
                )}

                {error && (
                  <div
                    style={{
                      padding: "var(--sp-6)",
                      background: "var(--color-error-dim)",
                      border: "1px solid var(--color-error)",
                      borderRadius: "var(--radius-lg)",
                      color: "var(--color-error)",
                    }}
                  >
                    ⚠️ {error}
                  </div>
                )}

                {!loading && !error && accounts.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "var(--sp-24) var(--sp-8)",
                      background: "var(--color-surface)",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div style={{ fontSize: 48, marginBottom: "var(--sp-4)" }}>👻</div>
                    <h3
                      style={{
                        fontSize: "var(--text-xl)",
                        fontWeight: 600,
                        marginBottom: "var(--sp-3)",
                      }}
                    >
                      No accounts yet
                    </h3>
                    <p style={{ marginBottom: "var(--sp-6)" }}>
                      Create your first Instagram account with GhostOps.
                    </p>
                    <Link href="/create" className="btn btn-primary btn-lg">
                      Create First Account
                    </Link>
                  </div>
                )}

                {!loading && !error && accounts.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: "var(--sp-4)",
                    }}
                  >
                    {accounts.map((account, i) => (
                      <AccountCard key={account.id} account={account} index={i} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Proxy tab ── */}
            {activeTab === "proxies" && <ProxyManager />}
          </motion.div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </>
  );
}
