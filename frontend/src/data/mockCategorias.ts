import type { Categoria } from "../domain";

export const CATEGORIA_IDS = {
  Diabetes: 1,
  Cardiovascular: 2,
  Antibioticos: 3,
  Vitaminas: 4,
  Gastrointestinal: 5,
  Analgesicos: 6,
  SistemaNervioso: 7,
  EquiposMedicos: 8,
  Descartables: 9,
  HigienePersonal: 10,
  Dermatologia: 11,
  Oftalmologia: 12,
} as const;

export const mockCategorias: Categoria[] = [
  { id_categoria: CATEGORIA_IDS.Diabetes, nombre_categoria: "Diabetes" },
  { id_categoria: CATEGORIA_IDS.Cardiovascular, nombre_categoria: "Cardiovascular" },
  { id_categoria: CATEGORIA_IDS.Antibioticos, nombre_categoria: "Antibióticos" },
  { id_categoria: CATEGORIA_IDS.Vitaminas, nombre_categoria: "Vitaminas" },
  { id_categoria: CATEGORIA_IDS.Gastrointestinal, nombre_categoria: "Gastrointestinal" },
  { id_categoria: CATEGORIA_IDS.Analgesicos, nombre_categoria: "Analgésicos" },
  { id_categoria: CATEGORIA_IDS.SistemaNervioso, nombre_categoria: "Sistema Nervioso" },
  { id_categoria: CATEGORIA_IDS.EquiposMedicos, nombre_categoria: "Equipos Médicos" },
  { id_categoria: CATEGORIA_IDS.Descartables, nombre_categoria: "Descartables" },
  { id_categoria: CATEGORIA_IDS.HigienePersonal, nombre_categoria: "Higiene Personal" },
  { id_categoria: CATEGORIA_IDS.Dermatologia, nombre_categoria: "Dermatología" },
  { id_categoria: CATEGORIA_IDS.Oftalmologia, nombre_categoria: "Oftalmología" },
];

export const mockCategoriaVisual = {
  [CATEGORIA_IDS.Diabetes]: { count: 12, emoji: "💉", color: "#179150" },
  [CATEGORIA_IDS.Cardiovascular]: { count: 28, emoji: "🫀", color: "#c62828" },
  [CATEGORIA_IDS.Antibioticos]: { count: 19, emoji: "💊", color: "#e65100" },
  [CATEGORIA_IDS.Vitaminas]: { count: 35, emoji: "⚡", color: "#f9a825" },
  [CATEGORIA_IDS.Analgesicos]: { count: 22, emoji: "🩺", color: "#1565c0" },
  [CATEGORIA_IDS.Gastrointestinal]: { count: 15, emoji: "🔬", color: "#006064" },
  [CATEGORIA_IDS.SistemaNervioso]: { count: 9, emoji: "🧠", color: "#283593" },
  [CATEGORIA_IDS.EquiposMedicos]: { count: 8, emoji: "🩻", color: "#6a1b9a" },
  [CATEGORIA_IDS.Descartables]: { count: 14, emoji: "🧤", color: "#37474f" },
  [CATEGORIA_IDS.HigienePersonal]: { count: 31, emoji: "🧴", color: "#0277bd" },
  [CATEGORIA_IDS.Dermatologia]: { count: 17, emoji: "🫧", color: "#ad1457" },
  [CATEGORIA_IDS.Oftalmologia]: { count: 6, emoji: "👁️", color: "#00695c" },
} as const;
