import type { SupabaseClient } from '@supabase/supabase-js';

export const createProduct = async (client: SupabaseClient, productoData: any) => {
    const { data: producto, error} = await client
    .from('productos')
    .upsert(
        productoData,
        { onConflict: 'codigo_barras' }
    )
    .select('id')
    .single();

    if (error) {
        throw new Error(`Fallo en el registro de producto: ${error.message}`);
    }
    return producto;
}
export const findProduct = async (client: SupabaseClient, criterios:{principio_activo?: string, marca_comercial?: string, forma_farmaceutica?: string}) => {
    let query = client.from('productos').select('*');

    if (criterios.principio_activo) {
        query = query.ilike('principio_activo', `%${criterios.principio_activo}%`);
    }
    if (criterios.marca_comercial) {
        query = query.ilike('marca_comercial', `%${criterios.marca_comercial}%`);
    }
    if (criterios.forma_farmaceutica) {
        query = query.ilike('forma_farmaceutica', `%${criterios.forma_farmaceutica}%`);
    }
    
    const {data: producto, error} = await query.maybeSingle();
    if (error) throw new Error(`Error buscando producto: ${error.message}`);

    return producto;
}
