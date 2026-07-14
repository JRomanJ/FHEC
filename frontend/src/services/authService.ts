import type { AuthUser, UserRole } from "../app/types";
import { clearSession, requestJson, saveSession } from "./httpClient";

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
  if (["cliente", "repartidor", "auxiliar", "auditor", "superadmin"].includes(role)) {
    return role as UserRole;
  }
  return "cliente";
};

export async function registerUser(userData: Record<string, unknown>) {
  return requestJson<ApiEnvelope<unknown>>("/log", { method: "POST", body: userData });
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const response = await requestJson<ApiEnvelope<{ user: BackendUser; session: BackendSession | null }>>("/login", {
    method: "POST",
    body: { email, password },
  });
  saveSession(response.data.session);
  const user = response.data.user;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
    cedula: `${user.documentType || "V"}-${user.document}`,
    phone: user.phone,
    areaCode: user.areaCode,
    address: user.address ?? "",
  };
}

export function logout() {
  clearSession();
}

export async function updateUser(userId: string, userData: Record<string, unknown>): Promise<AuthUser> {
  const response = await requestJson<ApiEnvelope<BackendUser>>(`/users/${userId}`, {
    method: "PATCH",
    body: userData,
  });

  const user = response.data;
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
    cedula: `${user.documentType || "V"}-${user.document}`,
    phone: user.phone,
    areaCode: user.areaCode,
    address: user.address ?? "",
  };
}