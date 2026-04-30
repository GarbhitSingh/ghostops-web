/**
 * GhostOps API Client
 * All fetch calls go through this module.
 * credentials: 'include' is required on every call for httpOnly cookie auth.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─────────────────────────────────────────────
// BASE FETCH
// ─────────────────────────────────────────────
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "APIError";
  }
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",   // MANDATORY — sends httpOnly access_token cookie
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      message = err.detail ?? JSON.stringify(err);
    } catch {}
    throw new APIError(response.status, message);
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface IGAccount {
  id: number;
  owner_id: number;
  ig_username: string;
  ig_password: string;
  cookies: string;
  pro_converted: boolean;
  bio_updated: boolean;
  created_at: string;
}

export interface PipelineStep {
  step: string;
  status: "running" | "done" | "error";
  msg: string;
}

export interface PipelineDone {
  account_id: number;
  username: string;
  password: string;
  cookies: string;
  pro_converted: boolean;
  bio_updated: boolean;
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export const authAPI = {
  register: (username: string, email: string, password: string) =>
    apiFetch<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email: string, password: string) =>
    apiFetch<User>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiFetch<void>("/auth/logout", { method: "POST" }),

  me: () => apiFetch<User>("/auth/me"),
};

// ─────────────────────────────────────────────
// INSTAGRAM
// ─────────────────────────────────────────────
export const igAPI = {
  createStep1: (email: string) =>
    apiFetch<{ session_id: string; email: string }>("/api/instagram/create", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  /**
   * Step 2 — returns a raw Response for SSE streaming.
   * Do NOT parse as JSON; read via ReadableStream.
   */
  createStep2Raw: (session_id: string, otp: string): Promise<Response> =>
    fetch(`${API_BASE}/api/instagram/verify`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id, otp }),
    }),

  getAccounts: () => apiFetch<IGAccount[]>("/api/instagram/accounts"),

  getAccount: (id: number) =>
    apiFetch<IGAccount>(`/api/instagram/accounts/${id}`),
};

// ─────────────────────────────────────────────
// SSE STREAM PARSER
// ─────────────────────────────────────────────
export async function* parseSSEStream(
  response: Response
): AsyncGenerator<{ event: string; data: unknown }> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const messages = buffer.split("\n\n");
    buffer = messages.pop() ?? "";

    for (const message of messages) {
      if (!message.trim()) continue;
      const lines = message.split("\n");
      const eventLine = lines.find((l) => l.startsWith("event:"));
      const dataLine = lines.find((l) => l.startsWith("data:"));

      if (!dataLine) continue;
      const event = eventLine?.slice(7).trim() ?? "message";
      try {
        const data = JSON.parse(dataLine.slice(6).trim());
        yield { event, data };
      } catch {}
    }
  }
}

export { APIError, API_BASE };
