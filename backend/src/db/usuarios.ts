import { supabase } from './supabaseClient.js';

// GUARDAR en la tabla de usuarios
export const insertUser = async (id: string, nombre_completo: string, tipo_documento_identidad: string, documento_identidad: string, telefono: string, 
    codigo_area: string, acepta_terminos: boolean, acepta_promociones: boolean,  acepta_promociones_sms: boolean, acepta_promociones_correo: boolean, 
    acepta_notificaciones: boolean, acepta_notificaciones_sms: boolean, acepta_notificaciones_correo: boolean) => {
    const { data, error } = await supabase
    .from('usuarios')
    .insert([{ id, nombre_completo, tipo_documento_identidad, documento_identidad, telefono, codigo_area, acepta_terminos, acepta_promociones, 
        acepta_promociones_sms, acepta_promociones_correo, acepta_notificaciones, acepta_notificaciones_sms, acepta_notificaciones_correo }])
    .select()
    .single();

    if (error) {
        console.error("Error completo de Supabase:", JSON.stringify(error, null, 2));
        throw new Error(`Error en registro: ${error.message || 'Error desconocido'}`);
    }
    return data;
}
// LEER de la tabla de usuarios
export const readUsers = async () => {
    const { data, error } = await supabase
    .from('usuarios')
    .select('correo, created_at');    

    if (error) throw error;
    return data;
}
export const findUserAuth =  async (email: string) => {
    const { data, error } = await supabase
    .from('usuarios')
    .select('id, correo, password_hash')
    .eq('correo', email)
    .single();

    if (error) return null; // Si no se encuentra el usuario, devuelve null
    return data;
}
export const findUserByCedula = async (tipo_documento_identidad: string, documento_identidad: string) => {
    const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('tipo_documento_identidad', tipo_documento_identidad)
    .eq('documento_identidad', documento_identidad)
    .single();

    if (error) return null;
    return data;
}