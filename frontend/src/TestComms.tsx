import { useState } from 'react';
import { apiClient } from './apiService';

export const TestComms = () => {
    const [message, setMessage] = useState<string>('');

    const handleLogin = async () => {
        try{
            const response = await apiClient('/login', { 
                email: 'mariagonzales@gmail.com',
                password: 'clave123'
            });

            setMessage(JSON.stringify(response));

            if (response.success) {
                console.log('Exito:', response.data);
            }else{
                alert('! ' + response.message);
            }
        }catch (error){
            alert('Error critico: No se pudo conectar con el servidor.');
            console.error(error);
        }
    
    };

    const handleLogg = async () => {
        try{
            const response = await apiClient('/log', {
                //Datos que recibira el backend
                // Credenciales para Auth
                correo: "mariagonzales@gmail.com",
                password: "clave123",
                
                // Datos personales y perfil
                nombre_completo: "Maria Gonzalez",
                tipo_documento_identidad: "V",
                documento_identidad: "153451923",
                telefono: "+58-0208023",
                codigo_area: "0286",
                
                // Preferencias y términos (todos en true)
                acepta_terminos: true,
                acepta_promociones: true,
                acepta_promociones_sms: true,
                acepta_promociones_correo: true,
                acepta_notificaciones: true,
                acepta_notificaciones_sms: true,
                acepta_notificaciones_correo: true

            });
            setMessage(JSON.stringify(response));

            if(response.success) {
                console.log('Exito: ', response.data);
            }else {
                alert("!" + response.message);
            }
        }catch (error){
            alert('Error critico: No se pudo conectar con el servidor.');
            console.error(error);
        }

    }

    return (
        <div>   
            <button style={{ color: 'black' }} onClick={handleLogin}>Probar Loggin</button>
            <button style={{ color: 'black' }} onClick={handleLogg}>Probar Registro</button>
            <p>Respuesta del servidor: {message}</p>
        </div>
    );
    
}
