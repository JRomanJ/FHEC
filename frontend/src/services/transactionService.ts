import { requestJson } from "./httpClient";
import type { RemoteTransaction } from "./orderService";

interface ApiEnvelope<T> { success: boolean; data: T }

export async function getRemoteTransactions(): Promise<RemoteTransaction[]> {
  return (await requestJson<ApiEnvelope<RemoteTransaction[]>>("/transactions")).data;
}

export async function updateRemoteTransaction(id: string, input: Record<string, unknown>): Promise<RemoteTransaction> {
  return (await requestJson<ApiEnvelope<RemoteTransaction>>(`/transactions/${encodeURIComponent(id)}`, { method: "PATCH", body: input })).data;
}

export async function annulRemoteTransaction(id: string, motivo: string): Promise<RemoteTransaction> {
  return (await requestJson<ApiEnvelope<RemoteTransaction>>(`/transactions/${encodeURIComponent(id)}`, { method: "DELETE", body: { motivo } })).data;
}
