import { supabase, getAuthedClient } from './supabaseClient.js';


export const createBranch = async (nombre: string, direccion: string, latitud: number, longitud: number) => {
    const supabase = await getAuthedClient();

    const {data, error } = await supabase
        .from('sedes')
        .insert([{
            nombre: nombre,
            direccion: direccion,
            latitud: latitud,
            longitud: longitud
        }])
        .select();
    if (error) {
        console.error('Error al registrar sede: ', error);
        throw new Error(`Error al insertar sede: ${error.message}`);
    }
    return data;
}

export const getBranchByName = async(nombre: string) => {
    const { data, error } = await supabase
        .from('sedes')
        .select('*')
        .eq('nombre', nombre)
        .single();
    if (error) throw new Error(`Fallo en obtener la sede: ${error.message}`)
    return data;
}

export const updateBranchPrice = async (productoId: string, sedeId: string, precioUsd: number) => {
    console.log('Buscando en inventario con:', {
        productoId: productoId, // Verifica que sea igual al UUID de la columna id_producto
        sedeId: sedeId          // Verifica que sea igual al UUID de la columna id_sede
    });
    
    const supabase = await getAuthedClient();
    const { data, error } = await supabase 
        .from('inventario')
        .update({ precio_usd: precioUsd })
        .eq('id_producto', productoId)
        .eq('id_sede', sedeId)
        .select();

    if (error) throw new Error(`Error actualizando precio: ${error.message}`);

if (!data || data.length === 0) {
    throw new Error(`No se encontró ninguna fila en inventario con id_producto: ${productoId} y sede: ${sedeId}`);
}

    return data;
};