"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { proxyAPI, type UserProxy, type ProxyStats, type ProxyExamplesResponse } from "@/lib/api";

export default function ProxyManager() {
  const [proxies, setProxies] = useState<UserProxy[]>([]);
  const [stats, setStats] = useState<ProxyStats>({ total: 0, active: 0, dead: 0 });
  const [examples, setExamples] = useState<ProxyExamplesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add single proxy
  const [addUrl, setAddUrl] = useState("");
  const [addLabel, setAddLabel] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  // Bulk add
  const [bulkText, setBulkText] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<string>("");

  // UI state
  const [showExamples, setShowExamples] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [data, ex] = await Promise.all([proxyAPI.list(), proxyAPI.examples()]);
      setProxies(data.proxies);
      setStats(data.stats);
      setExamples(ex);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUrl.trim()) return;
    setAddError("");
    setAddSuccess("");
    setAddLoading(true);
    try {
      await proxyAPI.add(addUrl.trim(), addLabel.trim(), true);
      setAddSuccess("✅ Proxy added and verified!");
      setAddUrl("");
      setAddLabel("");
      await load();
    } catch (e: any) {
      setAddError(e.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;
    setBulkResult("");
    setBulkLoading(true);
    try {
      const res = await proxyAPI.bulkAdd(bulkText.trim(), false);
      setBulkResult(`✅ Added ${res.added} of ${res.submitted} proxies (${res.skipped} skipped as duplicates)`);
      setBulkText("");
      await load();
    } catch (e: any) {
      setBulkResult(`⚠️ ${e.message}`);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await proxyAPI.remove(id);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--sp-6)",
          flexWrap: "wrap",
          gap: "var(--sp-3)",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 600,
              letterSpacing: "-0.015em",
              color: "var(--color-text-secondary)",
              marginBottom: "var(--sp-1)",
            }}
          >
            My Proxies
          </h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
            Your own proxies are used first for account creation. Falls back to admin pool if empty.
          </p>
        </div>

        {/* Stats pills */}
        <div style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap" }}>
          {[
            { label: "Total", value: stats.total, color: "var(--color-text-secondary)" },
            { label: "Active", value: stats.active, color: "var(--color-success)" },
            { label: "Dead", value: stats.dead, color: "var(--color-error)" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                padding: "var(--sp-2) var(--sp-4)",
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-pill)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: s.color,
              }}
            >
              {s.value} {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Format examples banner ── */}
      <div
        style={{
          marginBottom: "var(--sp-6)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        <button
          onClick={() => setShowExamples((v) => !v)}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--sp-4) var(--sp-5)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-secondary)",
            fontSize: "var(--text-sm)",
            fontWeight: 500,
          }}
        >
          <span>📡 Proxy format &amp; provider examples</span>
          <span style={{ fontSize: "var(--text-xs)", opacity: 0.6 }}>
            {showExamples ? "▲ hide" : "▼ show"}
          </span>
        </button>

        <AnimatePresence>
          {showExamples && examples && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  padding: "0 var(--sp-5) var(--sp-5)",
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                <p
                  style={{
                    margin: "var(--sp-4) 0 var(--sp-3)",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <strong style={{ color: "var(--color-text-secondary)" }}>Format:</strong>{" "}
                  <code
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: "var(--color-surface-2)",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "var(--text-xs)",
                    }}
                  >
                    {examples.format}
                  </code>
                </p>
                <p
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-muted)",
                    marginBottom: "var(--sp-4)",
                  }}
                >
                  {examples.note}
                </p>

                {/* Provider table */}
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "var(--text-xs)",
                    }}
                  >
                    <thead>
                      <tr>
                        {["Provider", "Example proxy URL"].map((h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: "left",
                              padding: "var(--sp-2) var(--sp-3)",
                              color: "var(--color-text-muted)",
                              fontWeight: 600,
                              borderBottom: "1px solid var(--color-border)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {examples.providers.map((p) => (
                        <tr key={p.name}>
                          <td
                            style={{
                              padding: "var(--sp-2) var(--sp-3)",
                              color: "var(--color-text-secondary)",
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.url ? (
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "var(--color-accent)" }}
                              >
                                {p.name}
                              </a>
                            ) : (
                              p.name
                            )}
                          </td>
                          <td
                            style={{
                              padding: "var(--sp-2) var(--sp-3)",
                              fontFamily: "var(--font-mono)",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            <code>{p.format}</code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Add single proxy ── */}
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--sp-5)",
          marginBottom: "var(--sp-4)",
        }}
      >
        <h3
          style={{
            fontSize: "var(--text-base)",
            fontWeight: 600,
            marginBottom: "var(--sp-4)",
            color: "var(--color-text-secondary)",
          }}
        >
          Add Proxy
        </h3>
        <form
          onSubmit={handleAdd}
          style={{ display: "flex", gap: "var(--sp-3)", flexWrap: "wrap" }}
        >
          <input
            type="text"
            value={addUrl}
            onChange={(e) => setAddUrl(e.target.value)}
            className="input"
            placeholder="http://user:pass@host:port"
            required
            style={{ flex: "1 1 260px", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}
          />
          <input
            type="text"
            value={addLabel}
            onChange={(e) => setAddLabel(e.target.value)}
            className="input"
            placeholder="Label (optional)"
            style={{ flex: "0 1 160px", fontSize: "var(--text-sm)" }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={addLoading}
            style={{ whiteSpace: "nowrap" }}
          >
            {addLoading ? (
              <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Checking...</>
            ) : (
              "+ Add & Verify"
            )}
          </button>
        </form>

        {addError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: "var(--sp-3)",
              fontSize: "var(--text-sm)",
              color: "var(--color-error)",
            }}
          >
            ⚠️ {addError}
          </motion.p>
        )}
        {addSuccess && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: "var(--sp-3)",
              fontSize: "var(--text-sm)",
              color: "var(--color-success)",
            }}
          >
            {addSuccess}
          </motion.p>
        )}
      </div>

      {/* ── Bulk add toggle ── */}
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          marginBottom: "var(--sp-6)",
        }}
      >
        <button
          onClick={() => setShowBulk((v) => !v)}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--sp-4) var(--sp-5)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-secondary)",
            fontSize: "var(--text-sm)",
            fontWeight: 500,
          }}
        >
          <span>📋 Bulk import proxies (one per line)</span>
          <span style={{ fontSize: "var(--text-xs)", opacity: 0.6 }}>
            {showBulk ? "▲ collapse" : "▼ expand"}
          </span>
        </button>

        <AnimatePresence>
          {showBulk && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: "hidden" }}
            >
              <form
                onSubmit={handleBulk}
                style={{
                  padding: "0 var(--sp-5) var(--sp-5)",
                  borderTop: "1px solid var(--color-border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--sp-3)",
                }}
              >
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="input"
                  rows={6}
                  placeholder={
                    "http://user1:pass1@proxy.example.com:80\nhttp://user2:pass2@proxy.example.com:80\n..."
                  }
                  style={{
                    marginTop: "var(--sp-4)",
                    resize: "vertical",
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    lineHeight: 1.8,
                  }}
                />
                <div style={{ display: "flex", gap: "var(--sp-3)", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={bulkLoading}
                  >
                    {bulkLoading ? (
                      <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Importing...</>
                    ) : (
                      "Import All"
                    )}
                  </button>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                    Skips duplicates. No live-check on bulk import (use single-add for verified proxies).
                  </p>
                </div>
                {bulkResult && (
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      color: bulkResult.startsWith("✅")
                        ? "var(--color-success)"
                        : "var(--color-error)",
                    }}
                  >
                    {bulkResult}
                  </p>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Proxy list ── */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 56,
                background: "var(--color-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                opacity: 0.5,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      )}

      {error && (
        <p style={{ color: "var(--color-error)", fontSize: "var(--text-sm)" }}>⚠️ {error}</p>
      )}

      {!loading && proxies.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "var(--sp-16) var(--sp-8)",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: "var(--sp-3)" }}>🔌</div>
          <h3
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: 600,
              marginBottom: "var(--sp-2)",
            }}
          >
            No proxies yet
          </h3>
          <p style={{ fontSize: "var(--text-sm)", maxWidth: 380, margin: "0 auto" }}>
            Add your own proxies above, or the admin&#39;s shared pool will be used automatically.
          </p>
        </div>
      )}

      {!loading && proxies.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
          {proxies.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sp-3)",
                padding: "var(--sp-3) var(--sp-4)",
                background: "var(--color-surface)",
                border: `1px solid ${
                  p.status === "dead" ? "var(--color-error)" : "var(--color-border)"
                }`,
                borderRadius: "var(--radius-md)",
                opacity: p.status === "dead" ? 0.65 : 1,
              }}
            >
              {/* Status dot */}
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    p.status === "active" ? "var(--color-success)" : "var(--color-error)",
                  flexShrink: 0,
                }}
              />

              {/* URL */}
              <code
                style={{
                  flex: 1,
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-secondary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {p.proxy_url}
              </code>

              {/* Label */}
              {p.label && (
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-muted)",
                    background: "var(--color-surface-2)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-pill)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.label}
                </span>
              )}

              {/* Fails badge */}
              {p.fails > 0 && (
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-warning)",
                    background: "var(--color-warning-dim)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-pill)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.fails} fail{p.fails !== 1 ? "s" : ""}
                </span>
              )}

              {/* Status badge */}
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  color:
                    p.status === "active"
                      ? "var(--color-success)"
                      : "var(--color-error)",
                  background:
                    p.status === "active"
                      ? "var(--color-success-dim)"
                      : "var(--color-error-dim)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-pill)",
                  whiteSpace: "nowrap",
                }}
              >
                {p.status}
              </span>

              {/* Delete */}
              <button
                onClick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
                className="btn btn-ghost"
                style={{
                  padding: "4px 10px",
                  fontSize: "var(--text-xs)",
                  color: "var(--color-error)",
                  flexShrink: 0,
                }}
              >
                {deletingId === p.id ? "…" : "✕"}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
