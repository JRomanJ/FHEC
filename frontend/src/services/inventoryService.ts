import { mockInventarioSedes, getProductoById } from "../data";
import { esProductoHabilitado } from "../domain";

export function getInventario() {
  return mockInventarioSedes;
}

export function getInventarioBySede(id_sede: number) {
  return mockInventarioSedes.filter((item) => item.id_sede === id_sede);
}

export function getInventarioByProducto(id_producto: number) {
  return mockInventarioSedes.filter((item) => item.id_producto === id_producto);
}

export function getStockDisponible(id_producto: number, id_sede: number): number {
  return (
    mockInventarioSedes.find(
      (item) => item.id_producto === id_producto && item.id_sede === id_sede,
    )?.stock_disponible ?? 0
  );
}

export function productoDisponibleEnSede(
  id_producto: number,
  id_sede: number,
  cantidad = 1,
): boolean {
  return getStockDisponible(id_producto, id_sede) >= cantidad;
}

export function getProductosConStockPorSede(id_sede: number) {
  return getInventarioBySede(id_sede)
    .map((inventario) => {
      const producto = getProductoById(inventario.id_producto);
      if (!producto || !esProductoHabilitado(producto)) return null;
      return { producto, stock_disponible: inventario.stock_disponible };
    })
    .filter((item): item is NonNullable<typeof item> => item != null);
}
