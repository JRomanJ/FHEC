import type {
  EstadoCodigoVerificacion,
  EstadoPedido,
  EstadoPersonalOperativo,
  EstadoProducto,
  EstadoRecipe,
  EstadoSede,
  EstadoSolicitudReembolso,
  MetodoEntrega,
  MetodoPago,
  NivelControlProducto,
  PropositoCodigoVerificacion,
  ResultadoAuditoriaRecipe,
  RolPersonalOperativo,
  TipoInteraccionUsuario,
  TipoNotificacion,
} from "./enums";

export type TimestampISO = string;
export type Decimal = number;
export type Nullable<T> = T | null;

export interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  correo: Nullable<string>;
  codigo_area: Nullable<string>;
  telefono: Nullable<string>;
  tipo_documento_identidad: Nullable<string>;
  documento_identidad: Nullable<string>;
  direccion_fiscal: Nullable<string>;
  contrasena: string;
  acepta_terminos: boolean;
  acepta_promociones: boolean;
  acepta_promociones_sms: boolean;
  acepta_promociones_correo: boolean;
  acepta_notificaciones: boolean;
  acepta_notificaciones_sms: boolean;
  acepta_notificaciones_correo: boolean;
  fecha_registro: TimestampISO;
}

export interface CodigoVerificacion {
  id_codigo: number;
  id_usuario: Nullable<number>;
  correo_destino: Nullable<string>;
  codigo_area_destino: Nullable<string>;
  telefono_destino: Nullable<string>;
  codigo: string;
  proposito: PropositoCodigoVerificacion;
  fecha_emision: TimestampISO;
  fecha_expiracion: TimestampISO;
  estado: EstadoCodigoVerificacion;
  fecha_uso: Nullable<TimestampISO>;
}

export interface Producto {
  id_producto: number;
  nombre_producto: string;
  principio_activo: string;
  marca_comercial: string;
  id_categoria: Nullable<number>;
  forma_farmaceutica: string;
  concentracion: Nullable<Decimal>;
  unidad_concentracion: Nullable<string>;
  unidades: Nullable<number>;
  descripcion: Nullable<string>;
  imagen_producto: Nullable<string>;
  relevancia: Nullable<number>;
  nivel_control: NivelControlProducto;
  precio_usd: Decimal;
  descuento_porcentaje: Nullable<Decimal>;
  estado_producto: EstadoProducto;
}

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
}

export interface Sede {
  id_sede: number;
  nombre_sede: string;
  direccion_sede: string;
  coordenadas_gps: string;
  estado_sede: EstadoSede;
}

export interface Transaccion {
  id_transaccion: number;
  metodo_pago: MetodoPago;
  banco_emisor: string;
  codigo_area_emisor: Nullable<string>;
  telefono_emisor: Nullable<string>;
  tipo_documento_emisor: Nullable<string>;
  documento_emisor: Nullable<string>;
  referencia_bancaria: string;
  monto_confirmado: Decimal;
  fecha_pago: TimestampISO;
  fecha_confirmacion: TimestampISO;
}

export interface Cupon {
  id_cupon: number;
  id_usuario: Nullable<number>;
  codigo_cupon: string;
  valor_descuento: Decimal;
  fecha_inicio: TimestampISO;
  fecha_fin: TimestampISO;
}

export interface InteraccionUsuario {
  id_interaccion: number;
  id_usuario: number;
  id_producto: number;
  tipo_interaccion: TipoInteraccionUsuario;
  fecha_interaccion: TimestampISO;
}

export interface Favorito {
  id_usuario: number;
  id_producto: number;
  fecha_agregado: TimestampISO;
}

export interface PersonalOperativo {
  id_personal_operativo: number;
  id_usuario: number;
  id_sede: Nullable<number>;
  rol: RolPersonalOperativo;
  estado_personal: EstadoPersonalOperativo;
}

export interface SolicitudReembolso {
  id_reembolso: number;
  id_usuario: number;
  id_transaccion: number;
  metodo_reembolso: MetodoPago;
  banco: string;
  codigo_area: Nullable<string>;
  telefono: Nullable<string>;
  tipo_documento_identidad: Nullable<string>;
  documento_identidad: Nullable<string>;
  nombre_titular: Nullable<string>;
  numero_cuenta: Nullable<string>;
  fecha_solicitud: TimestampISO;
  estado_solicitud: EstadoSolicitudReembolso;
}

export interface InventarioSede {
  id_producto: number;
  id_sede: number;
  stock_disponible: number;
}

export interface Carrito {
  id_usuario: number;
  id_producto: number;
  id_sede: number;
  cantidad: number;
  fecha_agregado: TimestampISO;
}

export interface Pedido {
  id_pedido: number;
  id_usuario: number;
  id_sede: number;
  id_transaccion: Nullable<number>;
  id_cupon: Nullable<number>;
  metodo_entrega: MetodoEntrega;
  nombre_receptor: string;
  codigo_area_receptor: string;
  telefono_receptor: string;
  direccion_entrega: Nullable<string>;
  coordenadas_entrega: Nullable<string>;
  nombre_factura: string;
  codigo_area_factura: string;
  telefono_factura: string;
  tipo_documento_fiscal: string;
  documento_fiscal: string;
  direccion_fiscal: string;
  subtotal: Decimal;
  iva: Decimal;
  costo_entrega: Nullable<Decimal>;
  descuento_aplicado: Nullable<Decimal>;
  total_pedido: Decimal;
  tasa_bcv: Decimal;
  estado_pedido: EstadoPedido;
  pin_entrega: Nullable<string>;
  fecha_creacion: TimestampISO;
  fecha_limite: Nullable<TimestampISO>;
  fecha_entrega: Nullable<TimestampISO>;
  calificacion_servicio: Nullable<number>;
  comentario_servicio: Nullable<string>;
}

export interface PedidoPreparado {
  id_pedido: number;
  id_personal_operativo: number;
  fecha_preparacion: TimestampISO;
}

export interface EntregaPickup {
  id_pedido: number;
  id_personal_operativo: number;
  fecha_entrega: TimestampISO;
}

export interface EntregaDelivery {
  id_pedido: number;
  id_personal_operativo: number;
  fecha_asignacion: TimestampISO;
  fecha_entrega: Nullable<TimestampISO>;
}

export interface DetallePedido {
  id_detalle_pedido: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: Decimal;
  descuento_unitario: Nullable<Decimal>;
  subtotal_linea: Decimal;
}

export interface Recipe {
  id_recipe: number;
  id_detalle_pedido: number;
  archivo_recipe: string;
  fecha_carga: TimestampISO;
  estado_recipe: EstadoRecipe;
}

export interface AuditoriaRecipe {
  id_recipe: number;
  id_personal_operativo: number;
  resultado_auditoria: ResultadoAuditoriaRecipe;
  razones_rechazo: Nullable<string>;
  comentario_rechazo: Nullable<string>;
  fecha_auditoria: TimestampISO;
}

export interface Notificacion {
  id_notificacion: number;
  id_usuario: number;
  titulo: string;
  mensaje: string;
  fecha_notificacion: TimestampISO;
  leida: boolean;
  tipo_notificacion: TipoNotificacion;
}

export interface Banner {
  id_banner: number;
  titulo: string;
  subtitulo: Nullable<string>;
  etiqueta: Nullable<string>;
  texto_accion: Nullable<string>;
  url_accion: Nullable<string>;
  url_imagen: string;
}
