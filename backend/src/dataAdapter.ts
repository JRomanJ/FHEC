import { supabase } from './supabaseClient.js';

// Cuando se tengamos la base de datos real estos adaptadores se deberan modificar


// GUARDAR en la tabla de usuarios
export const insertUser = async (email: string, passwordHash: string, rol: string, nombre: string, cedula: string, telefono: string) => {
    const { data, error } = await supabase
    .from('users')
    .insert([{ email, password_hash: passwordHash, nombre, rol, cedula, telefono}])
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
    .from('users')
    .select('email, created_at');    

    if (error) throw error;
    return data;
}

export const getUserCredentials =  async (email: string) => {
    const { data, error } = await supabase
    .from('users')
    .select('id, email, password_hash, rol')
    .eq('email', email)
    .single();

    if (error) return null; // Si no se encuentra el usuario, devuelve null
    return data;
}