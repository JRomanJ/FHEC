import { userLogger, loginUser } from './authService.js';

// Ejemplo de uso
const runSystem = async () => {
    try{
        //Registrar un nuevo usuario correo, passwordHash, nombre_completo, tipo_documento_identidad, documento_identidad, telefono, codigo_area, acepta_terminos, acepta_promociones
        console.log('---Registrando usuario---');
        const newUser = await userLogger('prueba3@correo.com', 'clave123', 'Nombre Usuario', 'V', '12345183', '+58-0201023', '0286', true, true);
        console.log('Usuario registrado con exito!', newUser);


        //Iniciar sesion con el usuario registrado
        console.log('\n---Iniciando sesión---');
        const loggedUser = await loginUser('prueba3@correo.com', 'clave123');
        console.log('Usuario autenticado con exito!', loggedUser);

    } catch (error) {
        console.error('Error en el sistema:', error);
    }
};
runSystem();