import { supabase } from './supabaseClient.js';

export const insertRole = async (rol: string) => {
    const { data, error } = await supabase.from('roles').insert([{ rol: rol}]);
    if (error) throw error;
    return data;
}

export const assingnRole = async (userId: string, newRole: string) => {
    const { data, error } = await supabase
        .from('perfiles')
        .update({ rol: newRole})
        .eq('id_usuario', userId);
    if (error) throw error;
    return data;
}