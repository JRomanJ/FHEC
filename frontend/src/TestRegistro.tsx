import { useState } from 'react';
import { apiClient } from './apiService';

export const TestRegistro = () => {
    const [respuesta, setRespuesta] = useState<string>('');

    const handleLogin = async () => {
        const response = await apiClient('/login', { 
            email: 'prueba1@correo.com',
            password: 'clave123'
        });

        setRespuesta(JSON.stringify(response));

        if (response.success) {
            console.log('Exito:', response.data);
        }else{
            alert('! ' + response.message);
        }
    };

    return (
        <div>   
            <button onClick={handleLogin}>Probar Conexion con el Backend</button>
            <p>Respuesta del servidor: {respuesta}</p>
        </div>
    );
    
}
