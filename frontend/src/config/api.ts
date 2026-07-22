export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
export const API_TIMEOUT_MS = 10000;

export const API_CONFIG = {
  baseUrl: API_BASE_URL.replace(/\/$/, ""),
  timeoutMs: API_TIMEOUT_MS,
} as const;

export const BRANCH_IDS = {
  principal: "4ece25d5-6823-490c-b5df-32872e25cbcd", // Farmacia Pzo
  clinica: "2db6ab66-6924-4af5-b443-0efe9b990ba7", // Farmacia San Felix
} as const;
