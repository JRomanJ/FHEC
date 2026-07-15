import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validarIdProducto = (idProducto: string) => {
    if (!UUID_PATTERN.test(idProducto)) {
        throw Object.assign(new Error('El id del producto no es un UUID valido.'), { status: 400 });
    }
};

const lanzarErrorFavoritos = (accion: string, error: PostgrestError): never => {
    const statusPorCodigo: Record<string, number> = {
        '22023': 400,
        '23503': 400,
        '23514': 400,
        '42501': 403,
        P0002: 404,
    };

    throw Object.assign(
        new Error(`${accion}: ${error.message}`),
        { status: statusPorCodigo[error.code] ?? 500 },
    );
};

export const listarFavoritos = async (client: SupabaseClient): Promise<string[]> => {
    const { data, error } = await client
        .from('favoritos')
        .select('id_producto')
        .order('created_at', { ascending: true });

    if (error) lanzarErrorFavoritos('No se pudieron obtener los favoritos', error);

    return (data ?? []).map((row) => String(row.id_producto));
};

export const agregarFavorito = async (client: SupabaseClient, idProducto: string): Promise<boolean> => {
    validarIdProducto(idProducto);

    const { data, error } = await client.rpc('agregar_favorito', {
        p_id_producto: idProducto,
    });

    if (error) lanzarErrorFavoritos('No se pudo agregar el producto a favoritos', error);
    return Boolean(data);
};

export const quitarFavorito = async (client: SupabaseClient, idProducto: string): Promise<boolean> => {
    validarIdProducto(idProducto);

    const { data, error } = await client.rpc('quitar_favorito', {
        p_id_producto: idProducto,
    });

    if (error) lanzarErrorFavoritos('No se pudo quitar el producto de favoritos', error);
    return Boolean(data);
};

export const vaciarFavoritos = async (client: SupabaseClient): Promise<number> => {
    const { data, error } = await client.rpc('vaciar_favoritos');

    if (error) lanzarErrorFavoritos('No se pudieron limpiar los favoritos', error);
    return Number(data ?? 0);
};
