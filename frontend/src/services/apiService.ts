import { requestJson } from "./httpClient";

/** Compatibilidad con las llamadas POST existentes. */
export const apiClient = <T>(endpoint: string, data: object) =>
  requestJson<T>(endpoint, { method: "POST", body: data });
