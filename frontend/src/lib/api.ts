import type { CalculateResponse, GraphData } from "@/types/math";

// Local dev: set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local
// Render production: leave unset — Next.js rewrites /api/* → /_/backend/api/*
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API error");
  }
  return res.json();
}

export async function calculate(input: string, options?: {
  variable?: string;
  extra?: Record<string, unknown>;
}): Promise<CalculateResponse> {
  return apiFetch<CalculateResponse>("/api/calculate", {
    method: "POST",
    body: JSON.stringify({ input, variable: options?.variable || "x", extra: options?.extra || {} }),
  });
}

export async function generateGraph(params: {
  expression: string;
  graph_type?: string;
  x_range?: [number, number];
  y_range?: [number, number];
  points?: number;
  title?: string;
}): Promise<{ success: boolean; graph_json?: GraphData; error?: string }> {
  return apiFetch("/api/graph", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function parseInput(text: string): Promise<{
  success: boolean;
  operation?: string;
  expression?: string;
  variable?: string;
  extra?: Record<string, unknown>;
}> {
  return apiFetch("/api/parse", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function getConstants(): Promise<Record<string, Record<string, string>>> {
  return apiFetch("/api/constants");
}

export async function getFormulas(): Promise<Record<string, { formula: string; description: string; variables: string[] }>> {
  return apiFetch("/api/formulas");
}
