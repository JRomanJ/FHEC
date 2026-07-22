import { TipoNotificacion } from "../domain";
import { mockNotificaciones } from "../data";
import type { NotificationViewModel } from "../viewModels/notificationViewModels";
import { requestJson } from "./httpClient";

interface BackendNotification {
  id_notificacion: number;
  titulo: string;
  mensaje: string;
  fecha_notificacion: string;
  leida: boolean;
  tipo_notificacion: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

const relativeTime = (timestamp: string) => {
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 60_000));
  if (elapsedMinutes < 1) return "Ahora";
  if (elapsedMinutes < 60) return `Hace ${elapsedMinutes} min`;
  const hours = Math.floor(elapsedMinutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Ayer" : `Hace ${days} días`;
};

const toRemoteViewModel = (notification: BackendNotification): NotificationViewModel => ({
  id: notification.id_notificacion,
  type: notification.tipo_notificacion === "promocional" ? "promo" : "info",
  icon: notification.tipo_notificacion === "promocional" ? "💊" : "🔔",
  title: notification.titulo,
  body: notification.mensaje,
  time: relativeTime(notification.fecha_notificacion),
  read: notification.leida,
});

export async function getRemoteNotifications(): Promise<NotificationViewModel[]> {
  const response = await requestJson<ApiEnvelope<BackendNotification[]>>("/notifications");
  return response.data.map(toRemoteViewModel);
}

export async function markRemoteNotificationRead(id: number): Promise<void> {
  await requestJson<ApiEnvelope<unknown>>(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllRemoteNotificationsRead(): Promise<void> {
  await requestJson<ApiEnvelope<unknown>>("/notifications/read-all", { method: "PATCH" });
}

export async function deleteRemoteNotification(id: number): Promise<void> {
  await requestJson<ApiEnvelope<unknown>>(`/notifications/${id}`, { method: "DELETE" });
}

export {
  getLegacyNotificationViewModels,
  getLegacyUnreadNotificationCount,
  getNotificationDropdownViewModels,
  getNotificationPanelViewModels,
  getNotificationViewModels,
  getUnreadNotificationCount,
  toNotificationBadgeViewModel,
  toNotificationViewModel,
} from "../viewModels/notificationViewModels";

export function getNotificaciones() {
  return mockNotificaciones;
}

export function getNotificacionesByUsuario(id_usuario: number) {
  return mockNotificaciones.filter((notificacion) => notificacion.id_usuario === id_usuario);
}

export function getNotificacionesNoLeidasByUsuario(id_usuario: number) {
  return getNotificacionesByUsuario(id_usuario).filter((notificacion) => !notificacion.leida);
}

export function getNotificacionesPromocionalesByUsuario(id_usuario: number) {
  return getNotificacionesByUsuario(id_usuario).filter(
    (notificacion) => notificacion.tipo_notificacion === TipoNotificacion.Promocional,
  );
}

export function getNotificacionesPedidoByUsuario(id_usuario: number) {
  return getNotificacionesByUsuario(id_usuario).filter((notificacion) =>
    [
      TipoNotificacion.PedidoPorPagar,
      TipoNotificacion.PedidoPorRetirar,
      TipoNotificacion.PedidoEnCamino,
      TipoNotificacion.PedidoEntregado,
    ].includes(notificacion.tipo_notificacion),
  );
}
