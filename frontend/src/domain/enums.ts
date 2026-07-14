export const PropositoCodigoVerificacion = {
  Registro: "Registro",
  Recuperacion: "Recuperación",
  CambioContacto: "Cambio de contacto",
} as const;
export type PropositoCodigoVerificacion =
  (typeof PropositoCodigoVerificacion)[keyof typeof PropositoCodigoVerificacion];

export const EstadoCodigoVerificacion = {
  Activo: "Activo",
  Usado: "Usado",
  Expirado: "Expirado",
  Invalidado: "Invalidado",
} as const;
export type EstadoCodigoVerificacion =
  (typeof EstadoCodigoVerificacion)[keyof typeof EstadoCodigoVerificacion];

export const NivelControlProducto = {
  Normal: "Normal",
  RecipeDigital: "Récipe digital",
  RecipeDigitalFisico: "Récipe digital y físico",
} as const;
export type NivelControlProducto =
  (typeof NivelControlProducto)[keyof typeof NivelControlProducto];

export const EstadoProducto = {
  Habilitado: "Habilitado",
  Inhabilitado: "Inhabilitado",
} as const;
export type EstadoProducto = (typeof EstadoProducto)[keyof typeof EstadoProducto];

export const EstadoSede = {
  Habilitada: "Habilitada",
  Inhabilitada: "Inhabilitada",
} as const;
export type EstadoSede = (typeof EstadoSede)[keyof typeof EstadoSede];

export const MetodoPago = {
  PagoMovil: "Pago móvil",
  Transferencia: "Transferencia",
} as const;
export type MetodoPago = (typeof MetodoPago)[keyof typeof MetodoPago];

export const MetodoEntrega = {
  Delivery: "Delivery",
  Pickup: "Pickup",
} as const;
export type MetodoEntrega = (typeof MetodoEntrega)[keyof typeof MetodoEntrega];

export const RolPersonalOperativo = {
  Superadministrador: "Superadministrador",
  Auxiliar: "Auxiliar",
  Auditor: "Auditor",
  Delivery: "Delivery",
} as const;
export type RolPersonalOperativo =
  (typeof RolPersonalOperativo)[keyof typeof RolPersonalOperativo];

export const EstadoPersonalOperativo = {
  Habilitado: "Habilitado",
  Inhabilitado: "Inhabilitado",
} as const;
export type EstadoPersonalOperativo =
  (typeof EstadoPersonalOperativo)[keyof typeof EstadoPersonalOperativo];

export const EstadoPedido = {
  EnRevisionMedica: "En revisión médica",
  PendientePorPago: "Pendiente por pago",
  EnPreparacion: "En preparación",
  PorRetirar: "Por retirar",
  ListoParaDelivery: "Listo para delivery",
  EnCamino: "En camino",
  Entregado: "Entregado",
  Cancelado: "Cancelado",
} as const;
export type EstadoPedido = (typeof EstadoPedido)[keyof typeof EstadoPedido];

export const EstadoRecipe = {
  Pendiente: "Pendiente",
  Aprobado: "Aprobado",
  Rechazado: "Rechazado",
} as const;
export type EstadoRecipe = (typeof EstadoRecipe)[keyof typeof EstadoRecipe];

export const ResultadoAuditoriaRecipe = {
  Aprobado: "Aprobado",
  Rechazado: "Rechazado",
} as const;
export type ResultadoAuditoriaRecipe =
  (typeof ResultadoAuditoriaRecipe)[keyof typeof ResultadoAuditoriaRecipe];

export const EstadoSolicitudReembolso = {
  Pendiente: "Pendiente",
  Realizada: "Realizada",
  Rechazada: "Rechazada",
} as const;
export type EstadoSolicitudReembolso =
  (typeof EstadoSolicitudReembolso)[keyof typeof EstadoSolicitudReembolso];

export const TipoInteraccionUsuario = {
  VistaProducto: "Vista de producto",
  Busqueda: "Búsqueda",
  AgregadoCarrito: "Agregado al carrito",
  AgregadoFavorito: "Agregado a favorito",
  Compra: "Compra",
} as const;
export type TipoInteraccionUsuario =
  (typeof TipoInteraccionUsuario)[keyof typeof TipoInteraccionUsuario];

export const TipoNotificacion = {
  Promocional: "Promocional",
  PedidoPorPagar: "Pedido por pagar",
  PedidoPorRetirar: "Pedido por retirar",
  PedidoEnCamino: "Pedido en camino",
  PedidoEntregado: "Pedido entregado",
  Reembolso: "Reembolso",
  SolicitudReembolso: "Solicitud de reembolso",
  Recipe: "Récipe",
} as const;
export type TipoNotificacion =
  (typeof TipoNotificacion)[keyof typeof TipoNotificacion];
