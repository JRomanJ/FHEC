import type { PostgrestError } from '@supabase/supabase-js';
import { createAuthedClient } from './supabaseClient.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ProductoCarrito {
    id_inventario: string;
    cantidad: number;
    fecha_agregado: string;
    fecha_actualizacion: string;
    inventario: {
        id: string;
        id_producto: string;
        id_sede: string;
        stock_disponible: number | null;
        precio_usd: number | null;
        descuento_porcentaje: number | null;
        productos: Record<string, unknown> | null;
    };
}

const validarIdInventario = (idInventario: string) => {
    if (!UUID_PATTERN.test(idInventario)) {
        throw Object.assign(new Error('El id del inventario no es un UUID valido.'), { status: 400 });
    }
};

const validarCantidad = (cantidad: number, permitirCero = false) => {
    const minimo = permitirCero ? 0 : 1;
    if (!Number.isInteger(cantidad) || cantidad < minimo) {
        const mensaje = permitirCero
            ? 'La cantidad debe ser un numero entero mayor o igual que cero.'
            : 'La cantidad debe ser un numero entero mayor que cero.';
        throw Object.assign(new Error(mensaje), { status: 400 });
    }
};

const lanzarErrorCarrito = (accion: string, error: PostgrestError): never => {
    const statusPorCodigo: Record<string, number> = {
        '22023': 400,
        '23503': 400,
        '23514': 400,
        '42501': 403,
        P0002: 404,
    };

    throw Object.assign(
        new Error(`${accion}: ${error.message}`),
        { status: statusPorCodigo[error.code] ?? 500 },
    );
};

export const obtenerCarrito = async (accessToken: string): Promise<ProductoCarrito[]> => {
    const client = createAuthedClient(accessToken);
    const { data, error } = await client
        .from('carritos')
        .select(`id_inventario, cantidad, fecha_agregado, fecha_actualizacion, inventario!inner(id, id_producto, id_sede, stock_disponible, precio_usd, descuento_porcentaje, productos(*))`)
        .order('fecha_agregado', { ascending: true });

    if (error) lanzarErrorCarrito('No se pudo obtener el carrito', error);
    return (data ?? []) as unknown as ProductoCarrito[];
};



export const agregarProductoCarrito = async (
    accessToken: string,
    idInventario: string,
    cantidad = 1,
) => {
    validarIdInventario(idInventario);
    validarCantidad(cantidad);

    const client = createAuthedClient(accessToken);
    const { data, error } = await client.rpc('agregar_producto_carrito', {
        p_id_inventario: idInventario,
        p_cantidad: cantidad,
    });

    if (error) lanzarErrorCarrito('No se pudo agregar el producto al carrito', error);
    return data;
};

export const establecerCantidadProductoCarrito = async (
    accessToken: string,
    idInventario: string,
    cantidad: number,
) => {
    validarIdInventario(idInventario);
    validarCantidad(cantidad, true);

    const client = createAuthedClient(accessToken);
    const { data, error } = await client.rpc('establecer_cantidad_producto_carrito', {
        p_id_inventario: idInventario,
        p_cantidad: cantidad,
    });

    if (error) lanzarErrorCarrito('No se pudo cambiar la cantidad del producto', error);
    return data as number;
};

export const disminuirProductoCarrito = async (
    accessToken: string,
    idInventario: string,
    cantidad = 1,
) => {
    validarIdInventario(idInventario);
    validarCantidad(cantidad);

    const client = createAuthedClient(accessToken);
    const { data, error } = await client.rpc('disminuir_producto_carrito', {
        p_id_inventario: idInventario,
        p_cantidad: cantidad,
    });

    if (error) lanzarErrorCarrito('No se pudo disminuir la cantidad del producto', error);
    return data as number;
};

export const eliminarProductoCarrito = async (
    accessToken: string,
    idInventario: string,
) => {
    validarIdInventario(idInventario);

    const client = createAuthedClient(accessToken);
    const { data, error } = await client.rpc('eliminar_producto_carrito', {
        p_id_inventario: idInventario,
    });

    if (error) lanzarErrorCarrito('No se pudo eliminar el producto del carrito', error);
    return data as boolean;
};

export const vaciarCarrito = async (accessToken: string) => {
    const client = createAuthedClient(accessToken);
    const { data, error } = await client.rpc('vaciar_carrito');

    if (error) lanzarErrorCarrito('No se pudo vaciar el carrito', error);
    return data as number;
};