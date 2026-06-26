import { supabase } from './supabaseClient.js';

// Cuando se tengamos la base de datos real estos adaptadores se deberan modificar


// GUARDAR en la tabla de usuarios
export const insertUser = async (correo: string, password_hash: string, nombre_completo: string, tipo_documento_identidad: string, documento_identidad: string, telefono: string, codigo_area: string, acepta_terminos: boolean, acepta_promociones: boolean) => {
    const { data, error } = await supabase
    .from('clientes')
    .insert([{ correo, password_hash, nombre_completo, tipo_documento_identidad, documento_identidad, telefono, codigo_area, acepta_terminos, acepta_promociones }])
    .select()
    .single();

    if (error) {
        if (error.code === '23505') throw new Error('El correo ya está registrado');
        throw error;
    }
    return data;
}

// LEER de la tabla de usuarios
export const getUsers = async () => {
    const { data, error } = await supabase
    .from('clientes')
    .select('correo, created_at');    

    if (error) throw error;
    return data;
}

export const getUserCredentials =  async (email: string) => {
    const { data, error } = await supabase
    .from('clientes')
    .select('id, correo, password_hash')
    .eq('correo', email)
    .single();

    if (error) return null; // Si no se encuentra el usuario, devuelve null
    return data;
}