import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient.js';


export const createBranch = async (client: SupabaseClient, nombre: string, direccion: string, latitud: number, longitud: number) => {
    const {data, error } = await client
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

export const updateBranchPrice = async (client: SupabaseClient, productoId: string, sedeId: string, precioUsd: number) => {
    const { data, error } = await client
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
