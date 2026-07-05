import { EstadoSolicitudReembolso } from "../domain";
import { getTransaccionById, mockSolicitudesReembolso } from "../data";

export function getSolicitudesReembolso() {
  return mockSolicitudesReembolso;
}

export function getSolicitudReembolsoById(id_reembolso: number | null | undefined) {
  if (id_reembolso == null) return null;
  return mockSolicitudesReembolso.find((solicitud) => solicitud.id_reembolso === id_reembolso) ?? null;
}

export function getSolicitudesReembolsoByUsuario(id_usuario: number) {
  return mockSolicitudesReembolso.filter((solicitud) => solicitud.id_usuario === id_usuario);
}

export function getSolicitudesReembolsoPendientes() {
  return mockSolicitudesReembolso.filter(
    (solicitud) => solicitud.estado_solicitud === EstadoSolicitudReembolso.Pendiente,
  );
}

export function getSolicitudesReembolsoRealizadas() {
  return mockSolicitudesReembolso.filter(
    (solicitud) => solicitud.estado_solicitud === EstadoSolicitudReembolso.Realizada,
  );
}

export function getRefundAdminViewModels() {
  return mockSolicitudesReembolso.map((solicitud) => ({
    solicitud,
    transaccion: getTransaccionById(solicitud.id_transaccion),
  }));
}
