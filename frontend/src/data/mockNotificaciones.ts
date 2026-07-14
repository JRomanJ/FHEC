import { TipoNotificacion } from "../domain";
import type { Notificacion } from "../domain";
import { USUARIO_IDS } from "./mockUsuarios";

export const mockNotificaciones: Notificacion[] = [
  { id_notificacion: 1, id_usuario: USUARIO_IDS.Cliente, titulo: "Pedido listo para retiro", mensaje: "Tu pedido #FHEC-20241204-8471 está listo. Preséntate con tu PIN y cédula.", fecha_notificacion: "2026-07-05T10:05:00.000Z", leida: false, tipo_notificacion: TipoNotificacion.PedidoPorRetirar },
  { id_notificacion: 2, id_usuario: USUARIO_IDS.Cliente, titulo: "Récipe aprobado", mensaje: "Tu récipe para Losartán 50mg fue validado. Ya puedes proceder al pago.", fecha_notificacion: "2026-07-05T09:10:00.000Z", leida: false, tipo_notificacion: TipoNotificacion.Recipe },
  { id_notificacion: 3, id_usuario: USUARIO_IDS.Cliente, titulo: "Oferta especial", mensaje: "Hasta 20% OFF en vitaminas y suplementos esta semana.", fecha_notificacion: "2026-07-05T07:30:00.000Z", leida: false, tipo_notificacion: TipoNotificacion.Promocional },
  { id_notificacion: 4, id_usuario: USUARIO_IDS.Cliente, titulo: "Pedido entregado", mensaje: "Tu pedido anterior fue entregado. ¿Cómo fue tu experiencia?", fecha_notificacion: "2026-07-04T18:05:00.000Z", leida: true, tipo_notificacion: TipoNotificacion.PedidoEntregado },
  { id_notificacion: 5, id_usuario: USUARIO_IDS.Cliente, titulo: "Récipe rechazado", mensaje: "El récipe para Amoxicilina 500mg requiere correcciones. Ver detalles.", fecha_notificacion: "2026-07-03T15:00:00.000Z", leida: true, tipo_notificacion: TipoNotificacion.Recipe },
  { id_notificacion: 6, id_usuario: USUARIO_IDS.Cliente, titulo: "Pedido en camino", mensaje: "Tu pedido salió de la sede y va en ruta con nuestro repartidor.", fecha_notificacion: "2026-07-05T13:50:00.000Z", leida: false, tipo_notificacion: TipoNotificacion.PedidoEnCamino },
  { id_notificacion: 7, id_usuario: USUARIO_IDS.Cliente, titulo: "Solicitud de reembolso recibida", mensaje: "Recibimos tu solicitud y será revisada por el equipo administrativo.", fecha_notificacion: "2026-07-01T10:10:00.000Z", leida: true, tipo_notificacion: TipoNotificacion.SolicitudReembolso },
  { id_notificacion: 8, id_usuario: USUARIO_IDS.Cliente, titulo: "Reembolso realizado", mensaje: "Tu reembolso fue procesado por el método seleccionado.", fecha_notificacion: "2026-06-21T11:00:00.000Z", leida: true, tipo_notificacion: TipoNotificacion.Reembolso },
];
