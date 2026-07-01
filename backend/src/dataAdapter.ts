import { supabase, getAuthedClient } from './supabaseClient.js';

// Cuando se tengamos la base de datos real estos adaptadores se deberan modificar


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

// LEER de la tabla de usuarios
export const getUsers = async () => {
    const { data, error } = await supabase
    .from('usuarios')
    .select('correo, created_at');    

    if (error) throw error;
    return data;
}

export const getUserCredentials =  async (email: string) => {
    const { data, error } = await supabase
    .from('usuarios')
    .select('id, correo, password_hash')
    .eq('correo', email)
    .single();

    if (error) return null; // Si no se encuentra el usuario, devuelve null
    return data;
}

export const upsertProductoCentral = async (productoData: any) => {
    const { data: producto, error} = await supabase
    .from('productos')
    .upsert(
        productoData,
        { onConflict: 'codigo_barras' }
    )
    .select('id')
    .single();

    if (error) {
        throw new Error(`Fallo en el registro de producto: ${error.message}`);
    }
    return producto;
}

export const obtenerSedePorNombre = async(nombre: string) => {
    const { data, error } = await supabase
        .from('sedes')
        .select('*')
        .eq('nombre', nombre)
        .single();
    if (error) throw new Error(`Fallo en obtener la sede: ${error.message}`)
    return data;
}

export const procesarIngresoInventario = async(productoData: any, sedeId: string) =>{
    //Avisar a supabase que el administrador esta autenticado
    const supabase = await getAuthedClient();


    const producto = await upsertProductoCentral(productoData);
    
    const { error: errStock } = await (supabase as any)
        .rpc('incrementar_stock', {
            p_producto_id: producto.id,
            p_sede_id: sedeId
        });
    if (errStock) {
        throw new Error(`Fallo en la actualizacion de inventario: ${errStock.message}`)
    }
    
    return { success: true, productoId: producto.id }
}

export const actualizarPrecioSede = async (productoId: string, sedeId: string, precioUsd: number) => {
    console.log('Buscando en inventario con:', {
        productoId: productoId, // Verifica que sea igual al UUID de la columna id_producto
        sedeId: sedeId          // Verifica que sea igual al UUID de la columna id_sede
    });
    
    const supabase = await getAuthedClient();
    const { data, error } = await supabase 
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

export const buscarProducto = async (criterios:{principio_activo?: string, marca_comercial?: string, presentacion?: string}) => {
    const supabase = await getAuthedClient();
    
    let query = supabase.from('productos').select('*');

    if (criterios.principio_activo) {
        query = query.ilike('principio_activo', `%${criterios.principio_activo}%`);
    }
    if (criterios.marca_comercial) {
        query = query.ilike('marca_comercial', `%${criterios.marca_comercial}%`);
    }
    if (criterios.presentacion) {
        query = query.ilike('presentacion', `%${criterios.presentacion}%`);
    }
    
    const {data: producto, error} = await query.maybeSingle();
    if (error) throw new Error(`Error buscando producto: ${error.message}`);

    return producto;
}

export const registrarSede = async (nombre: string, direccion: string, latitud: number, longitud: number) => {
    const supabase = await getAuthedClient();

    const {data, error } = await supabase
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

export const cambiarSedePerfil = async (userId: string, sedeId: string) => {
    
    if (sedeId!) throw new Error("La id de la sede no es valida");

    const { error } = await supabase
        .from('perfiles')
        .update({ id_sede: sedeId })
        .eq('id_usuario', userId);
    
        if (error) throw error;
}