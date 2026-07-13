import { API_CONFIG } from "../config/api";

const ACCESS_TOKEN_KEY = "fhec_access_token";
const REFRESH_TOKEN_KEY = "fhec_refresh_token";

export class HttpClientError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "HttpClientError";
    this.status = status;
  }
}

export function saveSession(session: { accessToken: string; refreshToken: string } | null) {
  if (!session) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeoutMs?: number;
}

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? API_CONFIG.timeoutMs);
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (refreshToken) headers.set("X-Refresh-Token", refreshToken);

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const payload = await response.json().catch(() => null) as { message?: string } | null;
    if (!response.ok) throw new HttpClientError(payload?.message ?? "Error en el servidor.", response.status);
    return payload as T;
  } catch (error) {
    if (error instanceof HttpClientError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new HttpClientError("El servidor tardó demasiado en responder.");
    }
    throw new HttpClientError(error instanceof Error ? error.message : "No se pudo conectar con el servidor.");
  } finally {
    window.clearTimeout(timeout);
  }
}
