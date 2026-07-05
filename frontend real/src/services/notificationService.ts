import { TipoNotificacion } from "../domain";
import { mockNotificaciones } from "../data";

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
