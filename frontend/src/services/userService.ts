import { DEMO_ACCOUNTS, USUARIO_IDS, mockPersonalOperativo, mockUsuarios, toLegacyAuthUser } from "../data";

export function getUsuarios() {
  return mockUsuarios;
}

export function getUsuarioById(id_usuario: number | null | undefined) {
  if (id_usuario == null) return null;
  return mockUsuarios.find((usuario) => usuario.id_usuario === id_usuario) ?? null;
}

export function getUsuarioByCorreo(correo: string) {
  const normalized = correo.trim().toLowerCase();
  return mockUsuarios.find((usuario) => usuario.correo?.toLowerCase() === normalized) ?? null;
}

export function getUsuarioActualMock() {
  return getUsuarioById(USUARIO_IDS.Cliente);
}

export function getUsuarioActualAuthMock() {
  const usuario = getUsuarioActualMock();
  return usuario ? toLegacyAuthUser(usuario) : null;
}

export function getUsuariosOperativos() {
  const operativeUserIds = new Set(mockPersonalOperativo.map((personal) => personal.id_usuario));
  return mockUsuarios.filter((usuario) => operativeUserIds.has(usuario.id_usuario));
}

export function getDemoAccounts() {
  return DEMO_ACCOUNTS;
}
