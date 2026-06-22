const API_BASE_URL = 'http://localhost:3000/api';

export const apiClient = async (endpoint: string, data: object) => {
    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.message || 'Error en el servidor');
        }

        return { success: true, data: result };
    } catch (error) {
        
        console.error('Error en la peticion:', error);
        return {
            success: false,
            message: (error as Error).message || 'No se pudo conectar con el servidor'
        };
    }
};