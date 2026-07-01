import { supabase } from './supabaseClient.js';

// GUARDAR en la tabla de usuarios
export const insertUser = async (userId: string, nombre_completo: string, tipo_documento_identidad: string, documento_identidad: string, telefono: string, codigo_area: string, acepta_terminos: boolean, acepta_promociones: boolean) => {
    const { data, error } = await supabase
    .from('usuarios')
    .insert([{ userId, nombre_completo, tipo_documento_identidad, documento_identidad, telefono, codigo_area, acepta_terminos, acepta_promociones }])
    .select()
    .single();

    if (error) {
        console.error("Error completo de Supabase:", JSON.stringify(error, null, 2));
        throw new Error(`Error en registro: ${error.message || 'Error desconocido'}`);
    }
    return data;
}
// LEER de la tabla de usuarios
export const getUsers = async () => {
    const { data, error } = await supabase
    .from('usuarios')
    .select('correo, created_at');    

    if (error) throw error;
    return data;
}
export const getUserAuth =  async (email: string) => {
    const { data, error } = await supabase
    .from('usuarios')
    .select('id, correo, password_hash')
    .eq('correo', email)
    .single();

    if (error) return null; // Si no se encuentra el usuario, devuelve null
    return data;
}