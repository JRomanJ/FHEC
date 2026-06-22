# Backend del Proyecto

Este directorio contiene la lógica del lado del servidor y la integración con una base de datos de prueba (supabase) para el manejo de registros, autenticación y reglas de negocio. Está desarrollado utilizando Node.js y TypeScript.

## Requisitos Previos

Para ejecutar este proyecto de forma local, es necesario contar con:
* [Node.js](https://nodejs.org/) (versión LTS recomendada).
* `npm` (incluido con Node.js) como gestor de paquetes.


**Variables de Entorno (Conexión a Base de Datos):**

   El proyecto utiliza un archivo de variables de entorno para mantener seguras las credenciales de conexión a Supabase.
   
   * Localiza el archivo `.env.example` en la raíz de este directorio.
   * Duplica este archivo y renómbralo estrictamente como `.env`.
   * Abre el archivo `.env` recién creado. Debería tener la siguiente estructura:

    env
        SUPABASE_URL=aqui_va_la_url_del_proyecto
        SUPABASE_SERVICE_ROLE_KEY=aqui_va_la_clave_secreta_del_backend
        

   Solicita al administrador del proyecto los valores reales para la URL y la clave, y reemplázalos en el .env.
   
   > **Importante:** El archivo `.env` está ignorado en Git. Por motivos de seguridad, nunca hagas un commit con credenciales reales.

## Ejecución en Entorno Local
Posicionarse en la carpeta del backend desde la terminal y ejecutar:
bash
   npm install
   npm run dev