import {
  EstadoPedido,
  calcularPrecioConDescuento,
  requiereRecipeDigital,
  requiereRecipeFisico,
} from "../domain";
import type { Banner, Pedido, Producto, Usuario } from "../domain";
import { mockBanners } from "./mockBanners";
import { mockCategoriaVisual, mockCategorias } from "./mockCategorias";
import { mockCupones } from "./mockCupones";
import { mockDetallePedidos } from "./mockDetallePedidos";
import { mockInventarioSedes } from "./mockInventarioSedes";
import { mockPedidos } from "./mockPedidos";
import { mockProductoVisual, mockProductos } from "./mockProductos";
import { mockSedeVisual, mockSedes, SEDE_IDS, SEDE_SLUGS } from "./mockSedes";
import { mockUsuarios, USUARIO_IDS } from "./mockUsuarios";
import type {
  LegacyAuthUser,
  LegacyCategory,
  LegacyDemoOrder,
  LegacyGlobalOrder,
  LegacyProduct,
  LegacySede,
  LegacySedeListItem,
  LegacySlide,
} from "./viewModels";

const ROLE_BY_USER_ID: Record<number, LegacyAuthUser["role"]> = {
  [USUARIO_IDS.Cliente]: "cliente",
  [USUARIO_IDS.Repartidor]: "repartidor",
  [USUARIO_IDS.Auxiliar]: "auxiliar",
  [USUARIO_IDS.Auditor]: "auditor",
  [USUARIO_IDS.Superadmin]: "superadmin",
};

const ORDER_STATUS_LABELS: Record<EstadoPedido, string> = {
  [EstadoPedido.EnRevisionMedica]: "En validación médica",
  [EstadoPedido.PendientePorPago]: "Pendiente pago",
  [EstadoPedido.EnPreparacion]: "Por preparar",
  [EstadoPedido.PorRetirar]: "Por retirar",
  [EstadoPedido.ListoParaDelivery]: "Listo para delivery",
  [EstadoPedido.EnCamino]: "En tránsito",
  [EstadoPedido.Entregado]: "Entregado",
  [EstadoPedido.Cancelado]: "Cancelado",
};

export const STATUS_COLORS: Record<string, string> = {
  "En validación médica": "bg-amber-100 text-amber-800",
  "Pendiente pago": "bg-blue-100 text-blue-800",
  "Por preparar": "bg-orange-100 text-orange-800",
  "Por retirar": "bg-purple-100 text-purple-800",
  "Listo para delivery": "bg-cyan-100 text-cyan-800",
  "En tránsito": "bg-indigo-100 text-indigo-800",
  Entregado: "bg-green-100 text-green-800",
  Cancelado: "bg-red-100 text-red-800",
};

function getCategoriaName(id_categoria: number | null): string {
  return mockCategorias.find((categoria) => categoria.id_categoria === id_categoria)?.nombre_categoria ?? "";
}

function getStockMap(id_producto: number) {
  return {
    principal:
      mockInventarioSedes.find(
        (item) => item.id_producto === id_producto && item.id_sede === SEDE_IDS.Principal,
      )?.stock_disponible ?? 0,
    clinica:
      mockInventarioSedes.find(
        (item) => item.id_producto === id_producto && item.id_sede === SEDE_IDS.ClinicaHumana,
      )?.stock_disponible ?? 0,
  };
}

export function toLegacyProduct(producto: Producto): LegacyProduct {
  const visual = mockProductoVisual[producto.id_producto as keyof typeof mockProductoVisual];
  const stockSedes = getStockMap(producto.id_producto);
  return {
    id: producto.id_producto,
    name: producto.nombre_producto,
    brand: producto.marca_comercial,
    category: getCategoriaName(producto.id_categoria),
    presentation: producto.forma_farmaceutica,
    packSize: producto.unidades == null ? "" : `x ${producto.unidades}`,
    priceUSD: producto.precio_usd,
    stock: stockSedes.principal + stockSedes.clinica,
    needsRecipe: requiereRecipeDigital(producto),
    rating: visual?.rating ?? 4.5,
    reviews: visual?.reviews ?? 0,
    bgColor: visual?.bgColor ?? "#f8fafc",
    accentColor: visual?.accentColor ?? "#179150",
    imageUrl: producto.imagen_producto ?? undefined,
    description: producto.descripcion ?? "",
    activeIngredient: producto.principio_activo,
    contraindications: visual?.contraindications ?? "",
    posology: visual?.posology ?? "",
    discount: producto.descuento_porcentaje ?? undefined,
    controlledSubstance: requiereRecipeFisico(producto) || undefined,
    stockSedes,
    concentration: producto.concentracion == null ? undefined : String(producto.concentracion),
    concentrationUnit: producto.unidad_concentracion ?? undefined,
    enabled: producto.estado_producto === "Habilitado",
  };
}

export function toLegacyCategory(id_categoria: number): LegacyCategory {
  const categoria = mockCategorias.find((item) => item.id_categoria === id_categoria);
  const visual = mockCategoriaVisual[id_categoria as keyof typeof mockCategoriaVisual];
  return {
    name: categoria?.nombre_categoria ?? "",
    count: visual?.count ?? 0,
    emoji: visual?.emoji ?? "•",
    color: visual?.color ?? "#179150",
  };
}

export function toLegacySedeListItem(id_sede: number): LegacySedeListItem {
  const sede = mockSedes.find((item) => item.id_sede === id_sede)!;
  const visual = mockSedeVisual[id_sede as keyof typeof mockSedeVisual];
  return {
    id: SEDE_SLUGS[id_sede as keyof typeof SEDE_SLUGS],
    name: visual.shortName,
    city: visual.city,
    address: visual.addressShort,
  };
}

export function toLegacySede(id_sede: number): LegacySede {
  const sede = mockSedes.find((item) => item.id_sede === id_sede)!;
  const visual = mockSedeVisual[id_sede as keyof typeof mockSedeVisual];
  return {
    id: SEDE_SLUGS[id_sede as keyof typeof SEDE_SLUGS],
    name: sede.nombre_sede,
    address: sede.direccion_sede,
    hours: visual.hours,
    mapsUrl: visual.mapsUrl,
  };
}

export function toLegacyAuthUser(usuario: Usuario): LegacyAuthUser {
  return {
    id: String(usuario.id_usuario),
    name: usuario.nombre_completo,
    email: usuario.correo ?? "",
    password: usuario.contrasena,
    role: ROLE_BY_USER_ID[usuario.id_usuario] ?? "cliente",
    cedula:
      usuario.tipo_documento_identidad && usuario.documento_identidad
        ? `${usuario.tipo_documento_identidad}-${usuario.documento_identidad}`
        : "",
    acepta_promociones: usuario.acepta_promociones,
    acepta_promociones_sms: usuario.acepta_promociones_sms,
    acepta_promociones_correo: usuario.acepta_promociones_correo,
    acepta_notificaciones: usuario.acepta_notificaciones,
    acepta_notificaciones_sms: usuario.acepta_notificaciones_sms,
    acepta_notificaciones_correo: usuario.acepta_notificaciones_correo,
  };
}

function getPedidoProducts(id_pedido: number): string[] {
  return mockDetallePedidos
    .filter((detalle) => detalle.id_pedido === id_pedido)
    .map((detalle) => mockProductos.find((producto) => producto.id_producto === detalle.id_producto)?.nombre_producto)
    .filter((name): name is string => Boolean(name));
}

export function toLegacyDemoOrder(pedido: Pedido): LegacyDemoOrder {
  const products = getPedidoProducts(pedido.id_pedido);
  return {
    id: `ORD-${pedido.fecha_creacion.slice(0, 4)}-${String(pedido.id_pedido).slice(-3)}`,
    date: pedido.fecha_creacion.slice(0, 10),
    status: pedido.estado_pedido === EstadoPedido.Entregado ? "Entregado" : pedido.estado_pedido === EstadoPedido.Cancelado ? "Cancelado" : "En curso",
    items: products.length,
    totalBs: Number((pedido.total_pedido * pedido.tasa_bcv).toFixed(2)),
    totalUsd: pedido.total_pedido,
    products,
  };
}

export function toLegacyGlobalOrder(pedido: Pedido): LegacyGlobalOrder {
  const usuario = mockUsuarios.find((item) => item.id_usuario === pedido.id_usuario);
  const sede = mockSedes.find((item) => item.id_sede === pedido.id_sede);
  return {
    id: `ORD-${pedido.fecha_creacion.slice(0, 4)}-${String(pedido.id_pedido).slice(-3)}`,
    date: pedido.fecha_creacion.replace("T", " ").slice(0, 16),
    client: usuario?.nombre_completo ?? pedido.nombre_receptor,
    sede: sede?.nombre_sede.includes("Principal") ? "Principal" : "Clínica Humana",
    status: ORDER_STATUS_LABELS[pedido.estado_pedido],
    total: pedido.total_pedido,
    approvedBy:
      pedido.estado_pedido === EstadoPedido.EnRevisionMedica ||
      pedido.estado_pedido === EstadoPedido.Cancelado
        ? "—"
        : "Carlos Vega",
    preparedBy:
      pedido.estado_pedido === EstadoPedido.EnRevisionMedica ||
      pedido.estado_pedido === EstadoPedido.PendientePorPago ||
      pedido.estado_pedido === EstadoPedido.Cancelado
        ? "—"
        : "Ana Torres",
    dispatchedBy:
      pedido.estado_pedido === EstadoPedido.EnCamino ||
      pedido.estado_pedido === EstadoPedido.Entregado
        ? "José Ramos"
        : "—",
  };
}

export function toLegacySlide(banner: Banner): LegacySlide {
  const paletteByBanner: Record<number, Pick<LegacySlide, "from" | "via" | "to">> = {
    1: { from: "#0b1e1e", via: "#003d2e", to: "#179150" },
    2: { from: "#031b24", via: "#00546a", to: "#50e9f8" },
    3: { from: "#006064", via: "#5c0f0f", to: "#c62828" },
  };
  const palette = paletteByBanner[banner.id_banner] ?? paletteByBanner[1];

  return {
    title: banner.titulo,
    subtitle: banner.subtitulo ?? "",
    badge: banner.etiqueta ?? "",
    ...palette,
    img: banner.url_imagen,
    cta: banner.texto_accion ?? "",
    ctaLink: banner.url_accion ?? undefined,
  };
}

export const PRODUCTS: LegacyProduct[] = mockProductos.map(toLegacyProduct);
export const CATS: LegacyCategory[] = mockCategorias.map((categoria) =>
  toLegacyCategory(categoria.id_categoria),
);
export const SEDES_LIST: LegacySedeListItem[] = mockSedes.map((sede) =>
  toLegacySedeListItem(sede.id_sede),
);
export const SEDES: LegacySede[] = mockSedes.map((sede) => toLegacySede(sede.id_sede));
export const DEMO_ACCOUNTS: LegacyAuthUser[] = mockUsuarios.map(toLegacyAuthUser);
export const DEFAULT_SLIDES: LegacySlide[] = mockBanners.map(toLegacySlide);
export const DEMO_ORDERS: LegacyDemoOrder[] = mockPedidos.map(toLegacyDemoOrder);
export const DEMO_GLOBAL_ORDERS: LegacyGlobalOrder[] = mockPedidos.map(toLegacyGlobalOrder);

export const DEMO_CONTACT: Record<string, { phone: string; address: string }> = Object.fromEntries(
  mockUsuarios
    .filter((usuario) => usuario.correo)
    .map((usuario) => [
      usuario.correo!,
      {
        phone: `${usuario.codigo_area ?? ""}-${usuario.telefono ?? ""}`,
        address: usuario.direccion_fiscal ?? "",
      },
    ]),
);

export const DISCOUNT_CODES: Record<string, number> = Object.fromEntries(
  mockCupones.map((cupon) => [cupon.codigo_cupon, cupon.valor_descuento]),
);

export { calcularPrecioConDescuento };
