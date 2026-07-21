import type { SupabaseClient } from '@supabase/supabase-js';

export const insertRole = async (client: SupabaseClient, rol: string) => {
    const { data, error } = await client.from('roles').insert([{ rol }]).select();
    if (error) throw error;
    return data;
}

export const assingnRole = async (client: SupabaseClient, userId: string, newRole: string) => {
    const { data, error } = await client
        .from('usuarios')
        .update({ rol: newRole})
        .eq('id', userId)
        .select('id, rol');
    if (error) throw error;
    return data;
}
