import { getTransaccionById, mockSolicitudesReembolso } from "../data";
import { EstadoSolicitudReembolso, MetodoPago } from "../domain";
import type { SolicitudReembolso } from "../domain";

export type RefundProfileStatus = "Pendiente" | "En revisión" | "Aprobado" | "Rechazado";
export type RefundAdminStatus = "Pendiente" | "Realizada";

export interface RefundProfileViewModel {
  id: string;
  method: string;
  bank: string;
  reference: string;
  amount: string;
  status: RefundProfileStatus;
}

export interface RefundAdminViewModel {
  id: string;
  method: string;
  bank: string;
  areaCode: string;
  phone: string;
  reference: string;
  amount: string;
  date: string;
  status: RefundAdminStatus;
  refundMethod: string;
  refundBank: string;
  refundAreaCode: string;
  refundPhone: string;
  refundDocType: string;
  refundDoc: string;
  holder: string;
  account: string;
}

export interface RefundRequestFormViewModel {
  method: string;
  bank: string;
  areaCode: string;
  phone: string;
  reference: string;
  amount: string;
  date: string;
}

export interface RefundStatusViewModel {
  status: RefundProfileStatus | RefundAdminStatus;
  label: string;
}

const LEGACY_PROFILE_REFUNDS: RefundProfileViewModel[] = [
  {
    id: "REM-001",
    method: "Pago Móvil",
    bank: "Banco de Venezuela",
    reference: "987654321",
    amount: "$12.50",
    status: "Aprobado",
  },
  {
    id: "REM-002",
    method: "Transferencia",
    bank: "Banesco",
    reference: "123456789",
    amount: "$8.00",
    status: "Pendiente",
  },
];

const LEGACY_ADMIN_REFUNDS: RefundAdminViewModel[] = [
  {
    id: "REM-001",
    method: "Pago Móvil",
    bank: "Banco de Venezuela",
    areaCode: "0414",
    phone: "1234567",
    reference: "987654321",
    amount: "$12.50",
    date: "2024-06-08",
    status: "Pendiente",
    refundMethod: "Pago Móvil",
    refundBank: "Banco de Venezuela",
    refundAreaCode: "0414",
    refundPhone: "1234567",
    refundDocType: "V",
    refundDoc: "12345678",
    holder: "",
    account: "",
  },
  {
    id: "REM-002",
    method: "Transferencia",
    bank: "Banesco",
    areaCode: "",
    phone: "",
    reference: "123456789",
    amount: "$8.00",
    date: "2024-06-07",
    status: "Pendiente",
    refundMethod: "Transferencia",
    refundBank: "Banesco",
    refundAreaCode: "",
    refundPhone: "",
    refundDocType: "V",
    refundDoc: "87654321",
    holder: "Pedro Martínez",
    account: "0134-0000-10-0000000001",
  },
  {
    id: "REM-003",
    method: "Pago Móvil",
    bank: "Mercantil",
    areaCode: "0416",
    phone: "5551234",
    reference: "456789012",
    amount: "$22.00",
    date: "2024-06-05",
    status: "Realizada",
    refundMethod: "Transferencia",
    refundBank: "Mercantil",
    refundAreaCode: "",
    refundPhone: "",
    refundDocType: "E",
    refundDoc: "8765432",
    holder: "Laura Díaz",
    account: "0105-0000-21-0000000099",
  },
];

function formatRefundId(id_reembolso: number): string {
  return `REM-${String(id_reembolso).padStart(3, "0")}`;
}

function formatAmount(amount: number | null | undefined): string {
  return amount == null ? "$0.00" : `$${amount.toFixed(2)}`;
}

function toProfileStatus(status: SolicitudReembolso["estado_solicitud"]): RefundProfileStatus {
  if (status === EstadoSolicitudReembolso.Realizada) return "Aprobado";
  if (status === EstadoSolicitudReembolso.Rechazada) return "Rechazado";
  return "Pendiente";
}

function toAdminStatus(status: SolicitudReembolso["estado_solicitud"]): RefundAdminStatus {
  return status === EstadoSolicitudReembolso.Realizada ? "Realizada" : "Pendiente";
}

function cloneRefund<T extends RefundProfileViewModel | RefundAdminViewModel>(refund: T): T {
  return { ...refund };
}

export function toRefundProfileViewModel(solicitud: SolicitudReembolso): RefundProfileViewModel {
  const transaccion = getTransaccionById(solicitud.id_transaccion);
  return {
    id: formatRefundId(solicitud.id_reembolso),
    method: transaccion?.metodo_pago ?? solicitud.metodo_reembolso,
    bank: transaccion?.banco_emisor ?? solicitud.banco,
    reference: transaccion?.referencia_bancaria ?? "",
    amount: formatAmount(transaccion?.monto_confirmado),
    status: toProfileStatus(solicitud.estado_solicitud),
  };
}

export function toRefundAdminViewModel(solicitud: SolicitudReembolso): RefundAdminViewModel {
  const transaccion = getTransaccionById(solicitud.id_transaccion);
  return {
    id: formatRefundId(solicitud.id_reembolso),
    method: transaccion?.metodo_pago ?? solicitud.metodo_reembolso,
    bank: transaccion?.banco_emisor ?? solicitud.banco,
    areaCode: transaccion?.codigo_area_emisor ?? "",
    phone: transaccion?.telefono_emisor ?? "",
    reference: transaccion?.referencia_bancaria ?? "",
    amount: formatAmount(transaccion?.monto_confirmado),
    date: solicitud.fecha_solicitud.slice(0, 10),
    status: toAdminStatus(solicitud.estado_solicitud),
    refundMethod: solicitud.metodo_reembolso,
    refundBank: solicitud.banco,
    refundAreaCode: solicitud.codigo_area ?? "",
    refundPhone: solicitud.telefono ?? "",
    refundDocType: solicitud.tipo_documento_identidad ?? "",
    refundDoc: solicitud.documento_identidad ?? "",
    holder: solicitud.nombre_titular ?? "",
    account: solicitud.numero_cuenta ?? "",
  };
}

export function toRefundRequestFormViewModel(): RefundRequestFormViewModel {
  return {
    method: MetodoPago.PagoMovil,
    bank: "",
    areaCode: "0414",
    phone: "",
    reference: "",
    amount: "",
    date: "",
  };
}

export function toRefundStatusViewModel(
  status: RefundProfileStatus | RefundAdminStatus,
): RefundStatusViewModel {
  return { status, label: status };
}

export function getProfileRefundViewModels(id_usuario?: number): RefundProfileViewModel[] {
  return mockSolicitudesReembolso
    .filter((solicitud) => id_usuario == null || solicitud.id_usuario === id_usuario)
    .map(toRefundProfileViewModel);
}

export function getAdminRefundViewModels(): RefundAdminViewModel[] {
  return mockSolicitudesReembolso.map(toRefundAdminViewModel);
}

export function getLegacyProfileRefundViewModels(_id_usuario?: number): RefundProfileViewModel[] {
  return LEGACY_PROFILE_REFUNDS.map(cloneRefund);
}

export function getLegacyAdminRefundViewModels(): RefundAdminViewModel[] {
  return LEGACY_ADMIN_REFUNDS.map(cloneRefund);
}
