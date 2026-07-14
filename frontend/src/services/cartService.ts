import { IVA_PORCENTAJE, calcularPrecioConDescuento } from "../domain";
import { getProductoById, mockCarritos } from "../data";
import { validarCuponParaUsuario } from "./couponService";
import { getStockDisponible } from "./inventoryService";

export function getCarritoUsuario(id_usuario: number) {
  return mockCarritos.filter((item) => item.id_usuario === id_usuario);
}

export function getCarritoUsuarioPorSede(id_usuario: number, id_sede: number) {
  return getCarritoUsuario(id_usuario).filter((item) => item.id_sede === id_sede);
}

export function calcularSubtotalCarrito(id_usuario: number, id_sede: number) {
  return getCarritoUsuarioPorSede(id_usuario, id_sede).reduce((subtotal, item) => {
    const producto = getProductoById(item.id_producto);
    if (!producto) return subtotal;
    return subtotal + calcularPrecioConDescuento(producto) * item.cantidad;
  }, 0);
}

export function calcularIva(subtotal: number) {
  return subtotal * IVA_PORCENTAJE;
}

export function validarStockCarrito(id_usuario: number, id_sede: number) {
  return getCarritoUsuarioPorSede(id_usuario, id_sede).map((item) => ({
    item,
    stock_disponible: getStockDisponible(item.id_producto, id_sede),
    disponible: getStockDisponible(item.id_producto, id_sede) >= item.cantidad,
  }));
}

export function getResumenCarrito(id_usuario: number, id_sede: number) {
  const items = getCarritoUsuarioPorSede(id_usuario, id_sede);
  const subtotal = calcularSubtotalCarrito(id_usuario, id_sede);
  const iva = calcularIva(subtotal);
  return {
    items,
    subtotal,
    iva,
    total: subtotal + iva,
    stock: validarStockCarrito(id_usuario, id_sede),
  };
}

export function calcularTotalCarrito(id_usuario: number, id_sede: number, codigoCupon?: string) {
  const subtotal = calcularSubtotalCarrito(id_usuario, id_sede);
  const iva = calcularIva(subtotal);
  const descuentoPorcentaje =
    codigoCupon == null
      ? 0
      : validarCuponParaUsuario(codigoCupon, id_usuario).cupon?.valor_descuento ?? 0;
  const descuento = subtotal * (descuentoPorcentaje / 100);
  return {
    subtotal,
    iva,
    descuento,
    total: Math.max(0, subtotal + iva - descuento),
  };
}
