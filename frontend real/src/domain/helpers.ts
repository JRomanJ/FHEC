import {
  EstadoPedido,
  EstadoPersonalOperativo,
  EstadoProducto,
  EstadoRecipe,
  EstadoSede,
  NivelControlProducto,
} from "./enums";
import type { Cupon, Pedido, PersonalOperativo, Producto, Recipe, Sede } from "./types";

export function esProductoHabilitado(producto: Producto): boolean {
  return producto.estado_producto === EstadoProducto.Habilitado;
}

export function esSedeHabilitada(sede: Sede): boolean {
  return sede.estado_sede === EstadoSede.Habilitada;
}

export function esPersonalHabilitado(personal: PersonalOperativo): boolean {
  return personal.estado_personal === EstadoPersonalOperativo.Habilitado;
}

export function requiereRecipeDigital(producto: Producto): boolean {
  return (
    producto.nivel_control === NivelControlProducto.RecipeDigital ||
    producto.nivel_control === NivelControlProducto.RecipeDigitalFisico
  );
}

export function requiereRecipeFisico(producto: Producto): boolean {
  return producto.nivel_control === NivelControlProducto.RecipeDigitalFisico;
}

export function esPickupObligatorio(producto: Producto): boolean {
  return requiereRecipeFisico(producto);
}

export function calcularDescuentoUnitario(producto: Producto): number {
  if (!producto.descuento_porcentaje || producto.descuento_porcentaje <= 0) {
    return 0;
  }

  return producto.precio_usd * (producto.descuento_porcentaje / 100);
}

export function calcularPrecioConDescuento(producto: Producto): number {
  return Math.max(0, producto.precio_usd - calcularDescuentoUnitario(producto));
}

export function cuponEstaVigente(cupon: Cupon, fechaReferencia?: string): boolean {
  const referencia = Date.parse(fechaReferencia ?? new Date().toISOString());
  const inicio = Date.parse(cupon.fecha_inicio);
  const fin = Date.parse(cupon.fecha_fin);

  if (!Number.isFinite(referencia) || !Number.isFinite(inicio) || !Number.isFinite(fin)) {
    return false;
  }

  return inicio <= referencia && referencia <= fin;
}

export function cuponEsGeneral(cupon: Cupon): boolean {
  return cupon.id_usuario === null;
}

export function cuponEsDeUsuario(cupon: Cupon): boolean {
  return cupon.id_usuario !== null;
}

export function pedidoEstaActivo(pedido: Pedido): boolean {
  return (
    pedido.estado_pedido !== EstadoPedido.Entregado &&
    pedido.estado_pedido !== EstadoPedido.Cancelado
  );
}

export function pedidoEstaEntregado(pedido: Pedido): boolean {
  return pedido.estado_pedido === EstadoPedido.Entregado;
}

export function recipeEstaPendiente(recipe: Recipe): boolean {
  return recipe.estado_recipe === EstadoRecipe.Pendiente;
}

export function recipeEstaAprobado(recipe: Recipe): boolean {
  return recipe.estado_recipe === EstadoRecipe.Aprobado;
}

export function recipeEstaRechazado(recipe: Recipe): boolean {
  return recipe.estado_recipe === EstadoRecipe.Rechazado;
}
