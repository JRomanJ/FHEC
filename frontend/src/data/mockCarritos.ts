import type { Carrito } from "../domain";
import { PRODUCTO_IDS } from "./mockProductos";
import { SEDE_IDS } from "./mockSedes";
import { USUARIO_IDS } from "./mockUsuarios";

export const mockCarritos: Carrito[] = [
  {
    id_usuario: USUARIO_IDS.Cliente,
    id_producto: PRODUCTO_IDS.Metformina500,
    id_sede: SEDE_IDS.Principal,
    cantidad: 1,
    fecha_agregado: "2026-07-05T10:10:00.000Z",
  },
  {
    id_usuario: USUARIO_IDS.Cliente,
    id_producto: PRODUCTO_IDS.VitaminaC1000,
    id_sede: SEDE_IDS.Principal,
    cantidad: 2,
    fecha_agregado: "2026-07-05T10:12:00.000Z",
  },
];
