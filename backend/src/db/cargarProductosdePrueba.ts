import { productosParaPrueba } from './datosPrueba.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { updateBranchPrice } from './sedes.js';
import { processInventoryEntry } from './inventario.js';

export const cargarTodoEnSede = async (client: SupabaseClient, sedeId: string) => {
    console.log('Iniciando carga masiva con precios aleatorios...');
    
    for (const prod of productosParaPrueba) {
        try {
            // Generar precio aleatorio entre 5.00 y 50.00
            const precioAleatorio = parseFloat((Math.random() * (50 - 5) + 5).toFixed(2));
            
            // 1. Registramos el producto en inventario
            const resultado = await processInventoryEntry(client, prod, sedeId);
            
            // 2. Registramos el precio en la tabla que vincula producto, sede y precio
            // Nota: Aquí pasamos el ID del producto que nos devolvió la función anterior
            await updateBranchPrice(client, resultado.productoId, sedeId, precioAleatorio);
            
            console.log(`✅ ${prod.principio_activo} cargado a $${precioAleatorio}`);
        } catch (error) {
            if (error instanceof Error) {
                console.error(`❌ Fallo: ${error.message}`);
            } else {
                console.error('❌ Ocurrió un error desconocido', error);
            }
        }
    }
    return { success: true, message: 'Carga masiva completada con éxito.' };
}
