import type { SupabaseClient } from '@supabase/supabase-js';

export interface CuponInput {
    codigo_cupon: string;
    descuento_porcentaje: number;
    fecha_inicio: string;
    fecha_vencimiento: string;
    id_usuario?: string | null;
}

const CUPON_COLUMNS = 'id_cupon, codigo_cupon, descuento_porcentaje, fecha_inicio, fecha_vencimiento, id_usuario, usado_en, id_pedido_uso, fecha_creacion, fecha_actualizacion';

const throwDbError = (message: string, error: { message: string; code?: string }): never => {
    const statusByCode: Record<string, number> = {
        '22023': 400,
        '23503': 400,
        '23505': 409,
        '23514': 409,
        '42501': 403,
        P0002: 404,
    };
    throw Object.assign(new Error(`${message}: ${error.message}`), {
        status: statusByCode[error.code ?? ''] ?? 500,
        code: error.code,
    });
};

export const listarCupones = async (client: SupabaseClient) => {
    const { data, error } = await client
        .from('cupones')
        .select(CUPON_COLUMNS)
        .order('fecha_creacion', { ascending: false });
    if (error) throwDbError('No se pudieron consultar los cupones', error);
    return data ?? [];
};

export const obtenerCuponPorCodigo = async (client: SupabaseClient, codigo: string) => {
    const { data, error } = await client
        .from('cupones')
        .select(CUPON_COLUMNS)
        .ilike('codigo_cupon', codigo.trim())
        .maybeSingle();
    if (error) throwDbError('No se pudo consultar el cupon', error);
    return data;
};

export const insertarCupon = async (client: SupabaseClient, input: CuponInput) => {
    const { data, error } = await client.from('cupones').insert(input).select(CUPON_COLUMNS).single();
    if (error) throwDbError('No se pudo crear el cupon', error);
    return data;
};

export const actualizarCupon = async (client: SupabaseClient, idCupon: string, input: Partial<CuponInput>) => {
    const { data, error } = await client
        .from('cupones')
        .update({ ...input, fecha_actualizacion: new Date().toISOString() })
        .eq('id_cupon', idCupon)
        .select(CUPON_COLUMNS)
        .maybeSingle();
    if (error) throwDbError('No se pudo actualizar el cupon', error);
    return data;
};

export const eliminarCupon = async (client: SupabaseClient, idCupon: string) => {
    const { data, error } = await client
        .from('cupones')
        .delete()
        .eq('id_cupon', idCupon)
        .select('id_cupon')
        .maybeSingle();
    if (error) throwDbError('No se pudo eliminar el cupon', error);
    return Boolean(data);
};
