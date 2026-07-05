import { DEMO_CONTACT, DEMO_ORDERS } from "../data";
import { getCuponesVisiblesParaUsuario } from "./couponService";
import { getPedidosByUsuario } from "./orderService";
import { getSolicitudesReembolsoByUsuario } from "./refundService";
import { getUsuarioById } from "./userService";

export function getPerfilUsuario(id_usuario: number) {
  const usuario = getUsuarioById(id_usuario);
  if (!usuario) return null;
  return {
    usuario,
    contacto: usuario.correo ? DEMO_CONTACT[usuario.correo] ?? null : null,
  };
}

export function getPreferenciasNotificacion(id_usuario: number) {
  const usuario = getUsuarioById(id_usuario);
  if (!usuario) return null;
  return {
    acepta_notificaciones: usuario.acepta_notificaciones,
    acepta_notificaciones_sms: usuario.acepta_notificaciones_sms,
    acepta_notificaciones_correo: usuario.acepta_notificaciones_correo,
    acepta_promociones: usuario.acepta_promociones,
    acepta_promociones_sms: usuario.acepta_promociones_sms,
    acepta_promociones_correo: usuario.acepta_promociones_correo,
  };
}

export function getHistorialPedidosUsuario(id_usuario: number) {
  const pedidos = getPedidosByUsuario(id_usuario);
  const pedidoIds = new Set(pedidos.map((pedido) => pedido.id_pedido));
  return DEMO_ORDERS.filter((order) => {
    const numericId = Number(order.id.split("-").at(-1));
    return Array.from(pedidoIds).some((id_pedido) => String(id_pedido).endsWith(String(numericId)));
  });
}

export function getCuponesPerfilUsuario(id_usuario: number) {
  return getCuponesVisiblesParaUsuario(id_usuario);
}

export function getSolicitudesReembolsoUsuario(id_usuario: number) {
  return getSolicitudesReembolsoByUsuario(id_usuario);
}
