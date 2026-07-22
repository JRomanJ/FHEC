import type { SupabaseClient } from '@supabase/supabase-js';

const TRANSACTION_COLUMNS = 'id_transaccion, id_pedido, id_usuario, metodo_pago, banco_emisor, codigo_area_emisor, telefono_emisor, tipo_documento_emisor, documento_emisor, referencia_bancaria, monto_confirmado_usd, monto_confirmado_bs, tasa_bcv, estado_transaccion, fecha_pago, fecha_confirmacion, fecha_actualizacion, anulada_en, anulada_por, motivo_anulacion';

export const listarTransacciones = async (client: SupabaseClient, userId?: string) => {
    let query = client.from('transacciones').select(TRANSACTION_COLUMNS).order('fecha_confirmacion', { ascending: false });
    if (userId) query = query.eq('id_usuario', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
};

export const obtenerTransaccion = async (client: SupabaseClient, transactionId: string) => {
    const { data, error } = await client.from('transacciones').select(TRANSACTION_COLUMNS).eq('id_transaccion', transactionId).maybeSingle();
    if (error) throw error;
    return data;
};

export const actualizarTransaccion = async (adminClient: SupabaseClient, transactionId: string, input: Record<string, unknown>) => {
    const allowed = ['banco_emisor', 'codigo_area_emisor', 'telefono_emisor', 'tipo_documento_emisor', 'documento_emisor', 'referencia_bancaria', 'fecha_pago'];
    const payload = Object.fromEntries(allowed.filter((key) => input[key] !== undefined).map((key) => [key, input[key]]));
    if (Object.keys(payload).length === 0) throw Object.assign(new Error('No se enviaron campos editables.'), { status: 400 });
    payload.fecha_actualizacion = new Date().toISOString();
    const { data, error } = await adminClient.from('transacciones').update(payload).eq('id_transaccion', transactionId).select(TRANSACTION_COLUMNS).maybeSingle();
    if (error) throw error;
    return data;
};

export const anularTransaccion = async (adminClient: SupabaseClient, transactionId: string, userId: string, reason: string) => {
    if (!reason.trim()) throw Object.assign(new Error('El motivo de anulacion es obligatorio.'), { status: 400 });
    const now = new Date().toISOString();
    const { data, error } = await adminClient.from('transacciones').update({ estado_transaccion: 'anulada', anulada_en: now, anulada_por: userId, motivo_anulacion: reason.trim(), fecha_actualizacion: now }).eq('id_transaccion', transactionId).eq('estado_transaccion', 'confirmada').select(TRANSACTION_COLUMNS).maybeSingle();
    if (error) throw error;
    return data;
};
