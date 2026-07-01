import { supabase } from './supabaseClient.js';

export const insertProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('perfiles')
        .insert([{
            id_usuario: userId,
            id_sede: null,
            rol: 'cliente'
        }]);
        if (error) throw error;
        return data;
}

export const updateProfileBranch = async (userId: string, sedeId: string) => {
    
    if (sedeId!) throw new Error("La id de la sede no es valida");

    const { error } = await supabase
        .from('perfiles')
        .update({ id_sede: sedeId })
        .eq('id_usuario', userId);
    
        if (error) throw error;
}