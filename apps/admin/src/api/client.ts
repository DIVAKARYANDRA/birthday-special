/**
 * Base API client — the ONLY layer permitted to make HTTP calls, per
 * docs/05-frontend-architecture.md, Section 1/8. Every domain-specific
 * API module (src/api/*.ts) wraps this, and every feature/page calls
 * those wrappers — never `fetch` directly.
 *
 * Attaches the admin access token (from authStore) to every request.
 * On a 401, attempts exactly one silent refresh (via the stored refresh
 * token) and retries the original request once — if that also fails,
 * clears the session so ProtectedRoute redirects to /login. This mirrors
 * the token-handling behavior documented in
 * docs/04-backend-architecture.md, Section 4 (rotation) from the
 * frontend's side.
 */
import { useAuthStore } from "@/stores/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: Record<string, unknown>;

  constructor(status: number, message: string, code?: string, details?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function parseErrorBody(response: Response): Promise<ApiError> {
  try {
    const body = await response.json();
    const err = body?.error;
    return new ApiError(response.status, err?.message ?? response.statusText, err?.code, err?.details);
  } catch {
    return new ApiError(response.status, response.statusText);
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function attemptRefresh(): Promise<string | null> {
  const { getStoredRefreshToken, setAccessToken, clearSession } = useAuthStore.getState();
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearSession();
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearSession();
    return null;
  }

  const data = await response.json();
  useAuthStore.getState().setSession(data.access_token, data.refresh_token);
  setAccessToken(data.access_token);
  return data.access_token as string;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * The single function every domain-specific API module calls.
 * `path` is relative to the API root, e.g. "/api/v1/admin/media".
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}, _isRetry = false): Promise<T> {
  const { accessToken } = useAuthStore.getState();
  const headers: Record<string, string> = {};

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    headers,
    body:
    options.body instanceof FormData
      ? options.body
      : options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
  });

  if (response.status === 401 && !_isRetry) {
    // Coalesce concurrent 401s into a single refresh attempt rather than
    // firing one refresh call per failed request.
    if (!refreshPromise) refreshPromise = attemptRefresh().finally(() => (refreshPromise = null));
    const newToken = await refreshPromise;
    if (newToken) {
      return apiRequest<T>(path, options, true);
    }
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw await parseErrorBody(response);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
