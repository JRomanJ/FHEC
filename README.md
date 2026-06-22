## 🛠️ Requisitos del Entorno
Antes de iniciar, asegúrate de tener instalado:
* [Node.js](https://nodejs.org/) (Versión 18+).
* **Configuración de Acceso:** Solicitar las **llaves (credenciales) de conexión a la BBDD** y la **URL del host** al responsable de arquitectura. Estas deben configurarse en tus variables de entorno locales.



## 🚀 Cómo Iniciar el Proyecto
El proyecto requiere ejecutar el backend y el frontend de forma simultánea en terminales separadas.

### 1. Preparación del Backend
    1. Accede a la carpeta del servidor: `cd backend`
    2. Instala las dependencias necesarias: `npm install`
    3. Asegúrate de que las llaves de la BBDD y la URL del host estén correctamente configuradas en tu archivo de entorno (`.env`). Esta informacion e privada y se tienen que pedir al administrador en otro canal privado (whatsapp, telegram).
    4. Inicia el servidor (host): `npx tsx src/server.ts`

### 2. Preparación del Frontend
    1. En una terminal nueva, accede a la carpeta del cliente: `cd frontend`
    2. Instala las dependencias: `npm install`
    3. Inicia el entorno de desarrollo: `npm run dev`

## 🧪 Prueba de Integración
Una vez ambos entornos estén corriendo accede a `http://localhost:5173` en tu navegador.

## 📁 Estructura del Repositorio
* /backend: Lógica del servidor, rutas de API y conexión a base de datos.
* /frontend: Interfaz de usuario construida con React, Vite y TypeScript.