import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    agregarProductoCarrito,
    disminuirProductoCarrito,
    eliminarProductoCarrito,
    establecerCantidadProductoCarrito,
    obtenerCarrito,
    vaciarCarrito,
} from './db/carritos.js';
import { createAuthedClient, supabase } from './db/supabaseClient.js';
import { userLogger } from './db/usuarios.js';
import { loginUser } from './authService.js';
import { findUserAuth, findUserByCedula } from './db/usuarios.js'
import { processInventoryEntry } from './db/inventario.js';
import { updateBranchPrice, getBranchByName, createBranch } from './db/sedes.js';
import { findProduct } from './db/productos.js';
import { insertRole, assingnRole } from './db/roles.js';
import { cargarTodoEnSede } from './db/cargarProductosdePrueba.js';
import { getProducosWithFilters } from './db/inventario.js';

const email = process.env.CART_TEST_EMAIL;
const password = process.env.CART_TEST_PASSWORD;
const inventoryIdFromEnv = process.env.CART_TEST_INVENTORY_ID;
const allowClearingExistingCart = process.env.CART_TEST_ALLOW_CLEAR === 'true';


// 2. ID de la sede (debe ser un UUID que exista previamente en la tabla de sedes)
const sedeIdSimulada = '123e4567-e89b-12d3-a456-426614174000';

const assert: (condition: unknown, message: string) => asserts condition = (condition, message) => {
    if (!condition) throw new Error(`Prueba fallida: ${message}`);
};

const getItemQuantity = async (client: SupabaseClient, inventoryId: string) => {
    const cart = await obtenerCarrito(client);
    return cart.find((item) => item.id_inventario === inventoryId)?.cantidad ?? 0;
};

const selectInventoryForTest = async (client: SupabaseClient) => {
    let query = client
        .from('inventario')
        .select('id, stock_disponible')
        .gte('stock_disponible', 3)
        .order('stock_disponible', { ascending: false });

    if (inventoryIdFromEnv) {
        query = query.eq('id', inventoryIdFromEnv);
    }

    const { data, error } = await query.limit(1);
    if (error) throw new Error(`No se pudo buscar inventario para la prueba: ${error.message}`);

    const inventory = data?.[0];
    if (!inventory) {
        const detail = inventoryIdFromEnv
            ? 'El CART_TEST_INVENTORY_ID no existe o tiene menos de 3 unidades disponibles.'
            : 'No existe ningun inventario con al menos 3 unidades disponibles.';
        throw new Error(detail);
    }

    return inventory as { id: string; stock_disponible: number };
};

const runCartTest = async () => {
    if (!email || !password) {
        throw new Error(
            'Configura CART_TEST_EMAIL y CART_TEST_PASSWORD en el archivo .env antes de ejecutar la prueba.',
        );
    }

    console.log('\n=== PRUEBA INTEGRAL DEL CARRITO ===');
    console.log('1. Iniciando sesion con la cuenta de prueba...');

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (loginError) throw new Error(`No se pudo iniciar sesion: ${loginError.message}`);
    if (!loginData.session) throw new Error('Supabase no devolvio una sesion autenticada.');

    const db = createAuthedClient(loginData.session.access_token);
    const initialCart = await obtenerCarrito(db);

    if (initialCart.length > 0 && !allowClearingExistingCart) {
        throw new Error(
            'La cuenta ya tiene productos en su carrito. Usa una cuenta de prueba vacia o configura ' +
            'CART_TEST_ALLOW_CLEAR=true si aceptas que la prueba lo vacie.',
        );
    }

    let cleanupAllowed = false;

    try {
        cleanupAllowed = true;
        await vaciarCarrito(db);

        console.log('2. Buscando automaticamente un producto con stock...');
        const inventory = await selectInventoryForTest(db);
        console.log(`   Inventario seleccionado: ${inventory.id} (stock: ${inventory.stock_disponible})`);

        console.log('3. Agregando una unidad...');
        await agregarProductoCarrito(db, inventory.id, 1);
        assert(await getItemQuantity(db, inventory.id) === 1, 'la cantidad debia ser 1.');

        console.log('4. Agregando dos unidades a la misma linea...');
        await agregarProductoCarrito(db, inventory.id, 2);
        assert(await getItemQuantity(db, inventory.id) === 3, 'la cantidad debia acumularse hasta 3.');

        console.log('5. Disminuyendo una unidad...');
        const quantityAfterDecrease = await disminuirProductoCarrito(db, inventory.id, 1);
        assert(quantityAfterDecrease === 2, 'la funcion debia devolver una cantidad restante de 2.');
        assert(await getItemQuantity(db, inventory.id) === 2, 'la cantidad guardada debia ser 2.');

        console.log('6. Estableciendo la cantidad directamente en 1...');
        await establecerCantidadProductoCarrito(db, inventory.id, 1);
        assert(await getItemQuantity(db, inventory.id) === 1, 'la cantidad debia ser 1.');

        console.log('7. Disminuyendo hasta cero para eliminar automaticamente la linea...');
        const quantityAfterRemovingLastUnit = await disminuirProductoCarrito(db, inventory.id, 1);
        assert(quantityAfterRemovingLastUnit === 0, 'la funcion debia devolver cero.');
        assert(await getItemQuantity(db, inventory.id) === 0, 'la linea debia desaparecer del carrito.');

        console.log('8. Probando la eliminacion directa de una linea...');
        await agregarProductoCarrito(db, inventory.id, 1);
        const removed = await eliminarProductoCarrito(db, inventory.id);
        assert(removed, 'la eliminacion directa debia devolver true.');
        assert(await getItemQuantity(db, inventory.id) === 0, 'la linea eliminada no debia existir.');

        console.log('9. Dejando dos unidades registradas para comprobar la persistencia...');
        await agregarProductoCarrito(db, inventory.id, 2);
        assert(await getItemQuantity(db, inventory.id) === 2, 'la cantidad final debia ser 2.');

        console.log('\nOK: todas las operaciones del carrito funcionan correctamente.');
        console.log(`Quedaron 2 unidades registradas en el inventario ${inventory.id}.`);

        const readline = createInterface({ input, output });
        const answer = await readline.question(
            '\nEscribe V para vaciar el carrito o T para terminar y conservarlo: ',
        );
        readline.close();

        if (answer.trim().toLowerCase() === 'v') {
            const deletedRows = await vaciarCarrito(db);
            assert(deletedRows >= 1, 'vaciar el carrito debia eliminar al menos una linea.');
            assert((await obtenerCarrito(db)).length === 0, 'el carrito debia quedar vacio.');
            console.log('El carrito de la cuenta de prueba quedo vacio.\n');
        } else {
            console.log('Prueba terminada. Los productos permanecen registrados en el carrito.\n');
        }
    } catch (error) {
        if (cleanupAllowed) {
            try {
                await vaciarCarrito(db);
                console.error('Se limpio el carrito de prueba despues del fallo.');
            } catch (cleanupError) {
                console.error('No se pudo limpiar el carrito despues del fallo:', cleanupError);
            }
        }
        throw error;
    }
};

// Ejemplo de uso
const runSystem = async () => {
    try{
        //REGISTRAR NUEVO USUARIO
        console.log('---Registrando usuario---');
        const newUser = await userLogger({
            email: 'anatorres@gmail.com',
            password: 'clave123',
            nombre_completo: 'Ana Torres',
            tipo_documento_identidad: 'V',
            documento_identidad: '21346234',
            telefono: '+58-0201893',
            codigo_area: '0286',
            acepta_terminos: true,
            acepta_promociones: true,
            acepta_promociones_sms: true,
            acepta_promociones_correo: true,
            acepta_notificaciones: true,
            acepta_notificaciones_sms: true,
            acepta_notificaciones_correo: true
        });
        //await userLogger('carlosvega@gmail.com', 'clave123', 'Carlos Vega', 'V', '32145897', '+58-0201893', '0286', true, true, true, true, true, true, true);
        console.log('Usuario registrado con exito!', newUser);


        //INICIAR SESION
        console.log('\n---Iniciando sesión---');
        const loggedUser = await loginUser('anatorres@gmail.com', 'clave123');
        console.log('Usuario autenticado con exito!', loggedUser);
        
        //REGISTRAR SEDE
        /*const sedes = await createBranch('Farmacia San Felix', 'Calle 321', 840, -72.65);
        const nuevoSedeId = sedes[0].id;*/
        //OBTENER SEDE
        //const sede = await getBranchByName('Farmacia Pzo');
        
        //PROCESAR PRODUCTOS DE PRUEBA
        //console.log('\n--- Cargando productos de prueba ---');
        //await cargarTodoEnSede(sede.id);

       /* const filtros = {
            //principio_activo: 'Amox', // Buscará todo lo que contenga "Amox"
            //categoria: 'alergias',
            principio_activo: 'Loratadina'
        }
             // Llamada a la función ensambladora
        const productos = await getProducosWithFilters(sede.id, filtros);

        console.log('--- Inventario en Sede ---');

        // O un formato más detallado
        productos.forEach(p => {
            console.log(`--- ${p.marca_comercial} (${p.concentracion}) ---`);
            console.log(`Stock: ${p.stock_disponible} | Precio: ${p.precio_usd}$`);
            console.log(`ID: ${p.id_producto}`);
        });*/
        /*
        
        if (!user || !sede) {
            console.error("No se pudo encontrar el usuario o la sede. Verifica los datos.");
            return;
        }
        //ACTUALIZAR SEDE DE PERFIL
        console.log('\n--- Actualizando Sede de Perfil ---');
        
        cambiarSedePerfil(user.id, sede.id)
        .then((respuesta) => {
            console.log('--- PRUEBA EXITOSA ---');
            console.log('La sede de su perfil ha sido modificada correctamente')
        })
        .catch((error) => {
            console.error('--- ERROR EN LA PRUEBA ---');
            console.error('Detalles del fallo: ', error.message);
        });
*/
        //REGISTRAR ROL
        /*console.log('\n--- Registrando Rol ---');
        await insertRole('cliente');
        await insertRole('repartidor');
        await insertRole('auxiliar');
        await insertRole('auditor');
        await insertRole('admin');
        await insertRole('super_admin');
        console.log('Rol registrado con exito!');*/

        //BUSCAR USUARIO POR CEDULA Y ASIGNAR ROL
        /*console.log('\n--- Asignando Rol a Usuario ---');
        const user = await findUserByCedula('V', '32145897');
        if (!user){
            console.error("No se pudo encontrar el usuario. Verifica los datos.");
            return;
        }
        await assingnRole(user.id, 'auditor');*/

        } catch (error) {
            console.error('Error en el sistema:', error);
    }      
}

runSystem();

runCartTest().catch((error) => {
    console.error('\nERROR EN LA PRUEBA DEL CARRITO');
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
