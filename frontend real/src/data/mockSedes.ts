import { EstadoSede } from "../domain";
import type { Sede } from "../domain";

export const SEDE_IDS = {
  Principal: 1,
  ClinicaHumana: 2,
} as const;

export const SEDE_SLUGS = {
  [SEDE_IDS.Principal]: "principal",
  [SEDE_IDS.ClinicaHumana]: "clinica",
} as const;

export const mockSedes: Sede[] = [
  {
    id_sede: SEDE_IDS.Principal,
    nombre_sede: "Ciudad Guayana — Principal",
    direccion_sede: "Parcela 01-02, Local Manzana 04, Calle 07, Ciudad Guayana 8050, Bolívar",
    coordenadas_gps: "8.3036,-62.7340",
    estado_sede: EstadoSede.Habilitada,
  },
  {
    id_sede: SEDE_IDS.ClinicaHumana,
    nombre_sede: "Clínica Humana",
    direccion_sede: "986M+QJ4, Frente a la Mezquita, Av. José Gumilla, Ciudad Guayana 8051, Bolívar",
    coordenadas_gps: "8.3619,-62.7658",
    estado_sede: EstadoSede.Habilitada,
  },
];

export const mockSedeVisual = {
  [SEDE_IDS.Principal]: {
    shortName: "Sede Principal",
    city: "Ciudad Guayana",
    addressShort: "Calle 07, Manzana 04, Bolívar",
    hours: "Lun–Sáb: 8:00 am – 8:00 pm · Dom: 9:00 am – 6:00 pm",
    mapsUrl: "https://maps.google.com/?q=Ciudad+Guayana+Bolivar+Venezuela",
  },
  [SEDE_IDS.ClinicaHumana]: {
    shortName: "Clínica Humana",
    city: "Ciudad Guayana",
    addressShort: "Av. José Gumilla, Bolívar",
    hours: "Lun–Sáb: 8:00 am – 8:00 pm · Dom: 9:00 am – 6:00 pm",
    mapsUrl: "https://maps.google.com/?q=Clinica+Humana+Ciudad+Guayana+Venezuela",
  },
} as const;
