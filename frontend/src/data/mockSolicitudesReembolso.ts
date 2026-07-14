import { EstadoSolicitudReembolso, MetodoPago } from "../domain";
import type { SolicitudReembolso } from "../domain";
import { TRANSACCION_IDS } from "./mockTransacciones";
import { USUARIO_IDS } from "./mockUsuarios";

export const mockSolicitudesReembolso: SolicitudReembolso[] = [
  {
    id_reembolso: 8001,
    id_usuario: USUARIO_IDS.Cliente,
    id_transaccion: TRANSACCION_IDS.ReembolsoPendiente,
    metodo_reembolso: MetodoPago.PagoMovil,
    banco: "Banco de Venezuela",
    codigo_area: "0414",
    telefono: "1234567",
    tipo_documento_identidad: "V",
    documento_identidad: "12345678",
    nombre_titular: null,
    numero_cuenta: null,
    fecha_solicitud: "2026-07-01T10:00:00.000Z",
    estado_solicitud: EstadoSolicitudReembolso.Pendiente,
  },
  {
    id_reembolso: 8002,
    id_usuario: USUARIO_IDS.Cliente,
    id_transaccion: TRANSACCION_IDS.ReembolsoRealizado,
    metodo_reembolso: MetodoPago.Transferencia,
    banco: "Banesco",
    codigo_area: null,
    telefono: null,
    tipo_documento_identidad: "V",
    documento_identidad: "12345678",
    nombre_titular: "María González",
    numero_cuenta: "0134-0001-23-0001234567",
    fecha_solicitud: "2026-06-20T10:00:00.000Z",
    estado_solicitud: EstadoSolicitudReembolso.Realizada,
  },
  {
    id_reembolso: 8003,
    id_usuario: USUARIO_IDS.Cliente,
    id_transaccion: TRANSACCION_IDS.ReembolsoRechazado,
    metodo_reembolso: MetodoPago.Transferencia,
    banco: "Mercantil",
    codigo_area: null,
    telefono: null,
    tipo_documento_identidad: "V",
    documento_identidad: "12345678",
    nombre_titular: "María González",
    numero_cuenta: "0105-0001-23-0001234567",
    fecha_solicitud: "2026-06-18T10:00:00.000Z",
    estado_solicitud: EstadoSolicitudReembolso.Rechazada,
  },
];
