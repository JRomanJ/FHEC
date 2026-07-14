import { EstadoPedido, MetodoEntrega, MetodoPago } from "./enums";

export const IVA_PORCENTAJE = 0.16;

export const METODOS_PAGO_DISPONIBLES = [
  { value: MetodoPago.PagoMovil, label: "Pago móvil" },
  { value: MetodoPago.Transferencia, label: "Transferencia" },
] as const;

export const METODOS_ENTREGA_DISPONIBLES = [
  { value: MetodoEntrega.Delivery, label: "Delivery" },
  { value: MetodoEntrega.Pickup, label: "Pickup" },
] as const;

export const TIPOS_DOCUMENTO_IDENTIDAD = ["V", "E", "J", "P", "RIF"] as const;
export type TipoDocumentoIdentidad = (typeof TIPOS_DOCUMENTO_IDENTIDAD)[number];

export const CODIGOS_PAIS_MOCK = ["+58"] as const;

export const CODIGOS_AREA_VENEZUELA_MOCK = [
  "0412",
  "0414",
  "0416",
  "0424",
  "0426",
] as const;

export const BANCOS_MOCK = [
  "Banesco",
  "Banesco Universal, C.A.",
  "Banco de Venezuela",
  "Provincial",
  "BBVA Provincial",
  "Bancamiga",
  "Mercantil",
  "Bicentenario",
  "BNC",
  "Banco Exterior",
  "Banplus",
  "Venezolano de Crédito",
  "Del Sur",
  "Banco Activo",
  "100% Banco",
  "Banco del Tesoro",
  "Otro",
] as const;

export const FORMAS_FARMACEUTICAS_BASE = [
  "Tabletas",
  "Comprimidos",
  "Cápsulas",
  "Jarabe",
  "Suspensión",
  "Gotas",
  "Crema",
  "Gel",
  "Solución",
  "Solución oral",
  "Comprimidos efervescentes",
  "Efervescente",
  "Inyectable",
  "Ungüento",
  "Parche",
  "Supositorio",
] as const;

export const UNIDADES_CONCENTRACION_BASE = [
  "mg",
  "g",
  "mcg",
  "mL",
  "%",
  "UI",
] as const;

export const ESTADOS_PEDIDO_ACTIVOS = [
  EstadoPedido.EnRevisionMedica,
  EstadoPedido.PendientePorPago,
  EstadoPedido.EnPreparacion,
  EstadoPedido.PorRetirar,
  EstadoPedido.ListoParaDelivery,
  EstadoPedido.EnCamino,
] as const;

export const ESTADOS_PEDIDO_TERMINALES = [
  EstadoPedido.Entregado,
  EstadoPedido.Cancelado,
] as const;
