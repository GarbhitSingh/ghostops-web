"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Nav from "@/components/Nav/Nav";
import StepEmail from "@/components/CreateFlow/StepEmail";
import StepOTP from "@/components/CreateFlow/StepOTP";
import PipelineProgress from "@/components/CreateFlow/PipelineProgress";
import ResultCard from "@/components/CreateFlow/ResultCard";
import { type PipelineStep, type PipelineDone } from "@/lib/api";

type Step = "email" | "otp" | "pipeline" | "result";

export default function CreatePage() {
  const [step, setStep] = useState<Step>("email");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [pipelineError, setPipelineError] = useState<string>("");
  const [result, setResult] = useState<PipelineDone | null>(null);

  const handleEmailSuccess = (sid: string, em: string) => {
    setSessionId(sid);
    setEmail(em);
    setStep("otp");
  };

  const handlePipelineStep = (s: PipelineStep) => {
    setStep("pipeline");
    setPipelineSteps((prev) => {
      // Update existing step or append
      const idx = prev.findIndex((p) => p.step === s.step);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = s;
        return next;
      }
      return [...prev, s];
    });
  };

  const handleDone = (r: PipelineDone) => {
    setResult(r);
    setStep("result");
  };

  const handleError = (msg: string) => {
    setPipelineError(msg);
  };

  const handleReset = () => {
    setStep("email");
    setSessionId(null);
    setEmail("");
    setPipelineSteps([]);
    setPipelineError("");
    setResult(null);
  };

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
        <div className="page-container" style={{ maxWidth: 900 }}>
          {/* Progress bar */}
          <div style={{ marginBottom: "var(--sp-12)" }}>
            <div
              style={{
                display: "flex",
                gap: "var(--sp-2)",
                alignItems: "center",
                marginBottom: "var(--sp-4)",
              }}
            >
              {(["email", "otp", "pipeline", "result"] as Step[]).map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background:
                        step === s
                          ? "var(--color-accent)"
                          : ["email", "otp", "pipeline", "result"].indexOf(step) > i
                          ? "var(--color-success)"
                          : "var(--color-surface-2)",
                      border: `2px solid ${
                        step === s
                          ? "var(--color-accent)"
                          : ["email", "otp", "pipeline", "result"].indexOf(step) > i
                          ? "var(--color-success)"
                          : "var(--color-border)"
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color:
                        step === s || ["email", "otp", "pipeline", "result"].indexOf(step) > i
                          ? "#fff"
                          : "var(--color-text-muted)",
                      transition: "all 0.3s ease",
                      flexShrink: 0,
                    }}
                  >
                    {["email", "otp", "pipeline", "result"].indexOf(step) > i ? "✓" : i + 1}
                  </div>
                  {i < 3 && (
                    <div
                      style={{
                        width: 32,
                        height: 2,
                        background:
                          ["email", "otp", "pipeline", "result"].indexOf(step) > i
                            ? "var(--color-success)"
                            : "var(--color-border)",
                        borderRadius: 2,
                        transition: "background 0.3s ease",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error banner */}
          {pipelineError && (
            <div
              style={{
                padding: "var(--sp-4) var(--sp-5)",
                background: "var(--color-error-dim)",
                border: "1px solid var(--color-error)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-error)",
                marginBottom: "var(--sp-8)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>⚠️ {pipelineError}</span>
              <button onClick={handleReset} className="btn btn-ghost" style={{ fontSize: "var(--text-sm)" }}>
                Try Again
              </button>
            </div>
          )}

          {/* Step content */}
          <AnimatePresence mode="wait">
            {step === "email" && (
              <StepEmail key="email" onSuccess={handleEmailSuccess} />
            )}
            {(step === "otp" || (step === "pipeline" && pipelineSteps.length === 0)) && sessionId && (
              <StepOTP
                key="otp"
                sessionId={sessionId}
                email={email}
                onPipelineStep={handlePipelineStep}
                onDone={handleDone}
                onError={handleError}
              />
            )}
            {step === "pipeline" && pipelineSteps.length > 0 && (
              <PipelineProgress key="pipeline" steps={pipelineSteps} />
            )}
            {step === "result" && result && (
              <ResultCard key="result" result={result} />
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
