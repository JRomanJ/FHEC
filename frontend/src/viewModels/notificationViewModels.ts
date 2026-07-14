import { mockNotificaciones } from "../data";
import { TipoNotificacion } from "../domain";
import type { Notificacion } from "../domain";

export interface NotificationBadgeViewModel {
  unreadCount: number;
  hasUnread: boolean;
}

export interface NotificationViewModel {
  id: number;
  type: string;
  icon: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export type NotificationDropdownViewModel = NotificationViewModel;
export type NotificationPanelViewModel = NotificationViewModel;

const LEGACY_NOTIFICATIONS: NotificationViewModel[] = [
  {
    id: 1,
    type: "order",
    icon: "📦",
    title: "Pedido listo para retiro",
    body: "Tu pedido #FHEC-20241204-8471 está listo. Preséntate con tu PIN y cédula.",
    time: "Hace 5 min",
    read: false,
  },
  {
    id: 2,
    type: "recipe",
    icon: "✅",
    title: "Récipe aprobado",
    body: "Tu récipe para Losartán 50mg fue validado. Ya puedes proceder al pago.",
    time: "Hace 1 hr",
    read: false,
  },
  {
    id: 3,
    type: "promo",
    icon: "💊",
    title: "Oferta especial",
    body: "Hasta 20% OFF en vitaminas y suplementos esta semana.",
    time: "Hace 3 hrs",
    read: false,
  },
  {
    id: 4,
    type: "order",
    icon: "🏠",
    title: "Pedido entregado",
    body: "Tu pedido anterior fue entregado. ¿Cómo fue tu experiencia?",
    time: "Ayer",
    read: true,
  },
  {
    id: 5,
    type: "recipe",
    icon: "⚠️",
    title: "Récipe rechazado",
    body: "El récipe para Amoxicilina 500mg requiere correcciones. Ver detalles.",
    time: "Hace 2 días",
    read: true,
  },
  {
    id: 6,
    type: "info",
    icon: "🕐",
    title: "Horario extendido",
    body: "Esta semana atendemos L–S hasta las 9 PM en nuestra sede principal.",
    time: "Hace 3 días",
    read: true,
  },
  {
    id: 7,
    type: "promo",
    icon: "⭐",
    title: "Programa de puntos",
    body: "¡Acumula puntos con cada compra y canjéalos por descuentos!",
    time: "Hace 5 días",
    read: true,
  },
];

const NOTIFICATION_META: Record<TipoNotificacion, { type: string; icon: string; time: string }> = {
  [TipoNotificacion.Promocional]: { type: "promo", icon: "💊", time: "Hace 3 hrs" },
  [TipoNotificacion.PedidoPorPagar]: { type: "order", icon: "💳", time: "Hace 30 min" },
  [TipoNotificacion.PedidoPorRetirar]: { type: "order", icon: "📦", time: "Hace 5 min" },
  [TipoNotificacion.PedidoEnCamino]: { type: "order", icon: "🏍️", time: "Hace 10 min" },
  [TipoNotificacion.PedidoEntregado]: { type: "order", icon: "🏠", time: "Ayer" },
  [TipoNotificacion.Reembolso]: { type: "refund", icon: "💸", time: "Hace 2 días" },
  [TipoNotificacion.SolicitudReembolso]: { type: "refund", icon: "🧾", time: "Hace 4 días" },
  [TipoNotificacion.Recipe]: { type: "recipe", icon: "✅", time: "Hace 1 hr" },
};

function cloneNotification(notification: NotificationViewModel): NotificationViewModel {
  return { ...notification };
}

export function toNotificationViewModel(notificacion: Notificacion): NotificationViewModel {
  const meta = NOTIFICATION_META[notificacion.tipo_notificacion];
  return {
    id: notificacion.id_notificacion,
    type: meta.type,
    icon: meta.icon,
    title: notificacion.titulo,
    body: notificacion.mensaje,
    time: meta.time,
    read: notificacion.leida,
  };
}

export function toNotificationBadgeViewModel(notificaciones: NotificationViewModel[]): NotificationBadgeViewModel {
  const unreadCount = notificaciones.filter((notificacion) => !notificacion.read).length;
  return { unreadCount, hasUnread: unreadCount > 0 };
}

export function getNotificationViewModels(id_usuario?: number): NotificationViewModel[] {
  return mockNotificaciones
    .filter((notificacion) => id_usuario == null || notificacion.id_usuario === id_usuario)
    .map(toNotificationViewModel);
}

export function getNotificationDropdownViewModels(id_usuario?: number): NotificationDropdownViewModel[] {
  return getNotificationViewModels(id_usuario);
}

export function getNotificationPanelViewModels(id_usuario?: number): NotificationPanelViewModel[] {
  return getNotificationViewModels(id_usuario);
}

export function getUnreadNotificationCount(id_usuario?: number): number {
  return getNotificationViewModels(id_usuario).filter((notificacion) => !notificacion.read).length;
}

export function getLegacyNotificationViewModels(_id_usuario?: number): NotificationViewModel[] {
  return LEGACY_NOTIFICATIONS.map(cloneNotification);
}

export function getLegacyUnreadNotificationCount(id_usuario?: number): number {
  return getLegacyNotificationViewModels(id_usuario).filter((notificacion) => !notificacion.read).length;
}
