import { API_CONFIG } from "../config/api";

export class MockHttpClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MockHttpClientError";
  }
}

export async function requestJson<T>(_path: string): Promise<T> {
  throw new MockHttpClientError(
    `httpClient es un placeholder. USE_MOCK_DATA=${String(API_CONFIG.useMockData)}; no hay llamadas reales configuradas.`,
  );
}
