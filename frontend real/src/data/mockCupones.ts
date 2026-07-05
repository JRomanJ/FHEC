import type { Cupon } from "../domain";
import { USUARIO_IDS } from "./mockUsuarios";

export const CUPON_IDS = {
  Fhec10: 1,
  Salud15: 2,
  Bienvenido: 3,
  Fhec2024: 4,
  Cliente5: 5,
} as const;

export const mockCupones: Cupon[] = [
  {
    id_cupon: CUPON_IDS.Fhec10,
    id_usuario: null,
    codigo_cupon: "FHEC10",
    valor_descuento: 10,
    fecha_inicio: "2026-01-01T00:00:00.000Z",
    fecha_fin: "2026-12-31T23:59:59.000Z",
  },
  {
    id_cupon: CUPON_IDS.Salud15,
    id_usuario: null,
    codigo_cupon: "SALUD15",
    valor_descuento: 15,
    fecha_inicio: "2026-06-01T00:00:00.000Z",
    fecha_fin: "2026-09-30T23:59:59.000Z",
  },
  {
    id_cupon: CUPON_IDS.Bienvenido,
    id_usuario: USUARIO_IDS.Cliente,
    codigo_cupon: "BIENVENIDO",
    valor_descuento: 5,
    fecha_inicio: "2026-01-01T00:00:00.000Z",
    fecha_fin: "2026-12-31T23:59:59.000Z",
  },
  {
    id_cupon: CUPON_IDS.Fhec2024,
    id_usuario: null,
    codigo_cupon: "FHEC2024",
    valor_descuento: 20,
    fecha_inicio: "2024-01-01T00:00:00.000Z",
    fecha_fin: "2024-12-31T23:59:59.000Z",
  },
  {
    id_cupon: CUPON_IDS.Cliente5,
    id_usuario: USUARIO_IDS.Cliente,
    codigo_cupon: "CLIENTE5",
    valor_descuento: 5,
    fecha_inicio: "2025-01-01T00:00:00.000Z",
    fecha_fin: "2025-12-31T23:59:59.000Z",
  },
];
