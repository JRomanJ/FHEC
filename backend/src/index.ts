import { userLogger, loginUser } from './authService.js';
import { procesarIngresoInventario } from './dataAdapter.js';

const productoDePrueba = {
  principio_activo: 'Loratadina',
  marca_comercial: 'Clarityne',
  id_categoria: 'cat-alergias-123', // Definido como varchar en la tabla
  presentacion: 'Jarabe',
  cantidad_presentacion: '120ml',
  descripcion: 'Antihistamínico indicado para el alivio de síntomas alérgicos.',
  imagen_producto: 'https://ejemplo.com/imagenes/clarityne-jarabe.jpg',
  relecancia: 5.0, // Se respeta la escritura exacta de la columna en la BD
  nivel_control: 'Venta libre',
  codigo_barras: '7591040001234' // Campo único utilizado para el onConflict
};

// 2. ID de la sede (debe ser un UUID que exista previamente en la tabla de sedes)
const sedeIdSimulada = '123e4567-e89b-12d3-a456-426614174000';

// Ejemplo de uso
const runSystem = async () => {
    try{
        //Registrar un nuevo usuario correo, passwordHash, nombre_completo, tipo_documento_identidad, documento_identidad, telefono, codigo_area, acepta_terminos, acepta_promociones
        /*console.log('---Registrando usuario---');
        const newUser = await userLogger('prueba3@correo.com', 'clave123', 'Nombre Usuario', 'V', '12345183', '+58-0201023', '0286', true, true);
        console.log('Usuario registrado con exito!', newUser);


        //Iniciar sesion con el usuario registrado
        console.log('\n---Iniciando sesión---');
        const loggedUser = await loginUser('prueba3@correo.com', 'clave123');
        console.log('Usuario autenticado con exito!', loggedUser);
*/
        //Ingresar a Inventario
        procesarIngresoInventario(productoDePrueba, sedeIdSimulada)
        .then((respuesta) => {
            console.log('--- PRUEBA EXITOSA ---');
            console.log('El producto fue procesado correctamente con el ID:', respuesta.productoId);
        })
        .catch((error) => {
            console.error('--- ERROR EN LA PRUEBA ---');
            console.error('Detalles del fallo:', error.message);
        });

    } catch (error) {
        console.error('Error en el sistema:', error);
    }
};
runSystem();