import { supabase } from './supabaseClient.js';

export const insertRole = async (rol: string) => {
    const { data, error } = await supabase.from('roles').insert([{ rol: rol}]);
    if (error) throw error;
    return data;
}

export const assingnRole = async (userId: string, newRole: string) => {
    const { data, error } = await supabase
        .from('usuarios')
        .update({ rol: newRole})
        .eq('id', userId);
    if (error) throw error;
    return data;
}