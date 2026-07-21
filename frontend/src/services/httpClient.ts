import { API_CONFIG } from "../config/api";

const ACCESS_TOKEN_KEY = "fhec_access_token";
const REFRESH_TOKEN_KEY = "fhec_refresh_token";

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

interface RefreshEnvelope {
  success: boolean;
  data: { session: StoredSession };
}

export class HttpClientError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "HttpClientError";
    this.status = status;
  }
}

export function saveSession(session: StoredSession | null) {
  if (!session) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hasStoredSession() {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY) && localStorage.getItem(REFRESH_TOKEN_KEY));
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeoutMs?: number;
}

let refreshInFlight: Promise<boolean> | null = null;

const refreshStoredSession = async () => {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/auth/refresh`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
    });
    if (!response.ok) return false;
    const payload = await response.json() as RefreshEnvelope;
    if (!payload.data?.session) return false;
    saveSession(payload.data.session);
    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
};

const pathsWithoutAutomaticRefresh = new Set(["/login", "/log", "/auth/refresh"]);

async function performRequest<T>(path: string, options: RequestOptions, allowRetry: boolean): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? API_CONFIG.timeoutMs);
  const headers = new Headers(options.headers);
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    if (response.status === 401 && allowRetry && !pathsWithoutAutomaticRefresh.has(path) && getStoredRefreshToken()) {
      refreshInFlight ??= refreshStoredSession().finally(() => { refreshInFlight = null; });
      const refreshed = await refreshInFlight;
      if (refreshed) return performRequest<T>(path, options, false);
      clearSession();
    }

    const payload = await response.json().catch(() => null) as { message?: string } | null;
    if (!response.ok) throw new HttpClientError(payload?.message ?? "Error en el servidor.", response.status);
    return payload as T;
  } catch (error) {
    if (error instanceof HttpClientError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new HttpClientError("El servidor tardo demasiado en responder.");
    }
    throw new HttpClientError(error instanceof Error ? error.message : "No se pudo conectar con el servidor.");
  } finally {
    window.clearTimeout(timeout);
  }
}

export function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return performRequest<T>(path, options, true);
}
