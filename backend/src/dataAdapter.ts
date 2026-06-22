import { supabase } from './supabaseClient.js';

// Cuando se tenga la base de datos real estos adaptadores se deberan modificar


// GUARDAR en la tabla de usuarios
export const insertUser = async (email: string, passwordHash: string) => {
    const { data, error } = await supabase
    .from('users')
    .insert([{ email, password_hash: passwordHash}])
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

export const getUserByEmail =  async (email: string) => {
    const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

    if (error) return null; // Si no se encuentra el usuario, devuelve null
    return data;
}