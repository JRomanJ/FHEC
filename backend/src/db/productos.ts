import { supabase, getAuthedClient } from './supabaseClient.js';

export const createProduct = async (productoData: any) => {
    const { data: producto, error} = await supabase
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
export const getProduct = async (criterios:{principio_activo?: string, marca_comercial?: string, presentacion?: string}) => {
    const supabase = await getAuthedClient();
    
    let query = supabase.from('productos').select('*');

    if (criterios.principio_activo) {
        query = query.ilike('principio_activo', `%${criterios.principio_activo}%`);
    }
    if (criterios.marca_comercial) {
        query = query.ilike('marca_comercial', `%${criterios.marca_comercial}%`);
    }
    if (criterios.presentacion) {
        query = query.ilike('presentacion', `%${criterios.presentacion}%`);
    }
    
    const {data: producto, error} = await query.maybeSingle();
    if (error) throw new Error(`Error buscando producto: ${error.message}`);

    return producto;
}