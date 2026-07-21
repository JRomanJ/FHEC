import type { AuthUser, UserRole } from "../app/types";
import {
  clearSession,
  getStoredRefreshToken,
  hasStoredSession,
  requestJson,
  saveSession,
} from "./httpClient";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: string;
  documentType: string;
  document: string;
  phone?: string;
  areaCode?: string;
  address?: string;
}

interface BackendSession {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

const normalizeRole = (role: string): UserRole => {
  if (role === "super_admin" || role === "admin") return "superadmin";
  if (["cliente", "repartidor", "auxiliar", "auditor", "superadmin"].includes(role)) return role as UserRole;
  return "cliente";
};

const mapUser = (user: BackendUser): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: normalizeRole(user.role),
  cedula: [user.documentType, user.document].filter(Boolean).join("-") || "—",
  phone: user.phone,
  areaCode: user.areaCode,
  address: user.address ?? "",
});

export async function registerUser(userData: Record<string, unknown>) {
  return requestJson<ApiEnvelope<{ userId: string; emailConfirmationRequired: boolean }>>("/log", {
    method: "POST",
    body: userData,
  });
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const response = await requestJson<ApiEnvelope<{ user: BackendUser; session: BackendSession }>>("/login", {
    method: "POST",
    body: { email, password },
  });
  saveSession(response.data.session);
  return mapUser(response.data.user);
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await requestJson<ApiEnvelope<{ user: BackendUser }>>("/auth/me");
  return mapUser(response.data.user);
}

export function hasSession() {
  return hasStoredSession();
}

export async function logout() {
  const refreshToken = getStoredRefreshToken();
  try {
    if (refreshToken) {
      await requestJson<ApiEnvelope<never>>("/logout", { method: "POST", body: { refreshToken } });
    }
  } finally {
    clearSession();
  }
}

export async function updateUser(userId: string, userData: Record<string, unknown>): Promise<AuthUser> {
  const response = await requestJson<ApiEnvelope<BackendUser>>(`/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: userData,
  });
  return mapUser(response.data);
}
