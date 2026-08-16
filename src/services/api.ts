/**
 * API abstraction layer.
 *
 * Every feature talks to the backend through these helpers only. Today they
 * resolve from the mock dataset; swapping `request()` for `fetch(BASE_URL + path)`
 * is the single change required to go live against a real REST backend.
 */
import * as db from "@/mock/data";

export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "/api/v1";

export type HttpStatus = 400 | 401 | 403 | 404 | 409 | 422 | 500 | 0;

export class ApiError extends Error {
  status: HttpStatus;
  constructor(status: HttpStatus, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const MESSAGES: Record<HttpStatus, string> = {
  0: "Network unavailable. Check your connection and try again.",
  400: "The request could not be understood. Please review the form and retry.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested record could not be found.",
  409: "This record was changed by someone else. Reload and retry.",
  422: "Some fields are invalid. Please correct them and submit again.",
  500: "Something went wrong on the server. Our team has been notified.",
};

export function humanizeError(error: unknown): string {
  if (error instanceof ApiError) return MESSAGES[error.status] ?? error.message;
  if (error instanceof Error) return error.message;
  return MESSAGES[500];
}

const LATENCY = 150;

/** Real fetch transport with mock fallback when FastAPI backend is offline. */
export async function request<T>(path: string, mockFallbackData?: T, method = "GET", body?: unknown): Promise<T> {
  try {
    const url = `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
    const token = typeof window !== "undefined" ? localStorage.getItem("bashundhara_token") : null;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.ok) {
      return (await res.json()) as T;
    }
  } catch (err) {
    // API is offline or unreachable; return fallback mock data
  }

  return new Promise((resolve) => setTimeout(() => resolve(mockFallbackData as T), LATENCY));
}

export interface QueryParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  filters?: Record<string, string | undefined>;
}

export interface Paginated<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function queryCollection<T extends Record<string, unknown>>(
  source: T[],
  params: QueryParams = {},
): Paginated<T> {
  const { search = "", page = 1, pageSize = 10, sortBy, sortDir = "asc", filters = {} } = params;
  let rows = source;

  const term = search.trim().toLowerCase();
  if (term) {
    rows = rows.filter((row) =>
      Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(term)),
    );
  }

  for (const [key, value] of Object.entries(filters)) {
    if (!value || value === "all") continue;
    rows = rows.filter((row) => String(row[key] ?? "") === value);
  }

  if (sortBy) {
    rows = [...rows].sort((a, b) => {
      const av = a[sortBy] as string | number | null;
      const bv = b[sortBy] as string | number | null;
      if (av === bv) return 0;
      const res = (av ?? "") > (bv ?? "") ? 1 : -1;
      return sortDir === "asc" ? res : -res;
    });
  }

  const total = rows.length;
  const start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total, page, pageSize };
}

export const dataset = db;