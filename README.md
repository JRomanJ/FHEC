## DESCRIPCIÓN GENERAL DEL PROYECTO

Farmahumana E-Commerce (FHEC) es una plataforma web desarrollada para digitalizar y optimizar el proceso de venta de productos farmacéuticos de Farmahumana, permitiendo que los clientes consulten productos, verifiquen disponibilidad por sede, gestionen favoritos y carrito de compras, formalicen pedidos, apliquen cupones, registren pagos y seleccionen modalidades de entrega como retiro en mostrador o despacho a domicilio.

El proyecto surge como respuesta a la necesidad de modernizar el modelo comercial tradicional de la farmacia, el cual depende principalmente de la atención presencial en sede física. Esta limitación reduce el alcance comercial de la empresa, dificulta la captación de nuevos clientes, impide aprovechar información sobre preferencias e intenciones de compra, y restringe la implementación de servicios logísticos y administrativos propios de un entorno digital.

La solución busca ofrecer un canal de venta más accesible, organizado y seguro, manteniendo la lógica propia del negocio farmacéutico. Por ello, el sistema contempla la gestión de productos, categorías, inventario por sede, precios, descuentos, cupones, usuarios, personal operativo, notificaciones, pagos, solicitudes de reembolso, preparación de pedidos y entregas. Además, incorpora reglas específicas para productos con control médico, como la carga y auditoría de récipes digitales, la validación de récipes físicos cuando corresponda y la restricción de modalidades de entrega según el tipo de producto.

Desde el punto de vista del cliente, FHEC permite explorar el catálogo disponible, consultar productos relacionados por principio activo, recibir sugerencias comerciales, registrar interacciones, construir un carrito de compra, concretar pedidos y hacer seguimiento del proceso hasta su entrega. Desde el punto de vista de la farmacia, la plataforma facilita la administración del catálogo, el control de inventario, la gestión del personal operativo, la preparación de pedidos, la validación farmacéutica, la asignación de entregas y la consulta de reseñas del servicio.

El objetivo principal del proyecto es construir una base funcional para un ecosistema de comercio electrónico farmacéutico que permita ampliar el alcance de Farmahumana, mejorar la experiencia de compra del cliente, reducir la dependencia exclusiva del mostrador físico y organizar digitalmente los procesos comerciales, operativos y administrativos asociados a la venta de productos farmacéuticos.

## ESTRUCTURA GENERAL DEL REPO

La estructura final esperada del repositorio es:

```text
FHEC/
  frontend/
  backend/
```

- `frontend/`: contiene la aplicacion frontend principal, visualmente aprobada, modularizada, limpia y optimizada.
- `backend/`: contiene el backend, API, base de datos o configuracion del lado servidor.

Notas importantes sobre carpetas:

- La carpeta temporal `frontend/` no forma parte de la estructura final del proyecto.
- La carpeta temporal `frontend/` se eliminara despues de las pruebas.
- La carpeta que contiene el frontend final debe quedar nombrada como `frontend/`.
- Mientras el renombrado no se haya hecho, los comandos del frontend deben ejecutarse dentro de la carpeta que actualmente contiene el frontend final. En este repositorio esa carpeta puede seguir apareciendo temporalmente como `frontend real/`.
- No se deben borrar ni renombrar carpetas sin coordinarlo previamente con el equipo.

## FRONTEND

### Estado actual del frontend

El frontend actual ya tiene preparada una base tecnica limpia para continuar con integracion real de backend/API/base de datos.

Estado actual:

- UI visual aprobada.
- Codigo modularizado por features.
- Datos mock centralizados.
- Servicios mock preparados para futura API.
- Tipos de dominio alineados con el modelo de base de datos y DFD.
- View models/adapters para mantener separada la UI visual del modelo de datos.
- Limpieza de residuos de Figma Make.
- Code splitting por feature.
- Build funcional.
- No usa API real todavia.
- No usa Supabase todavia.
- No tiene persistencia real todavia.

El frontend funciona como una base limpia para implementar logica real, validaciones reales, servicios de API y consultas a base de datos en fases posteriores.

### Tecnologias principales

Tecnologias detectadas en el frontend actual:

- React.
- TypeScript/TSX en el codigo fuente.
- Vite.
- pnpm.
- Tailwind CSS y CSS global.
- Radix/shadcn como base de componentes UI.
- lucide-react para iconos.
- sonner para notificaciones/toasts.

No se debe asumir el uso de tecnologias no presentes en el proyecto actual.

### Requisitos para correr el frontend

Versiones con las que el entorno fue probado:

- Node.js v22.23.1 o version moderna compatible.
- npm 10.9.8 o version compatible.
- pnpm 11.10.0 o version compatible.
- Git 2.55.0 o version compatible.

Se recomienda usar una version moderna/LTS de Node.js y pnpm, porque el frontend ya fue probado con pnpm.

Comandos para verificar el entorno:

```bash
node -v
npm -v
pnpm -v
git --version
```

Para habilitar pnpm mediante Corepack, si esta disponible:

```bash
corepack enable
```

Si el entorno no reconoce `pnpm`, otra opcion es instalarlo globalmente:

```bash
npm install -g pnpm
```

Usa solo una de esas opciones segun el entorno local.

### Instalacion del frontend

Con la estructura final esperada:

```bash
cd frontend
pnpm install
```

Si la carpeta aun no fue renombrada y sigue llamandose `frontend real`, usar temporalmente:

```bash
cd "frontend real"
pnpm install
```

La estructura final debe quedar como `frontend/`.

### Correr el frontend en desarrollo

Con la estructura final esperada:

```bash
cd frontend
pnpm dev --host 127.0.0.1
```

Vite mostrara una URL similar a:

```text
http://127.0.0.1:5173/
```

Si el puerto `5173` esta ocupado, Vite puede usar otro puerto disponible.

### Compilar el frontend

Con la estructura final esperada:

```bash
cd frontend
pnpm build
```

El build debe pasar correctamente.

Despues del code splitting por feature, el warning de chunk mayor a 500 kB fue eliminado.

### Estructura interna del frontend

Estructura principal esperada:

```text
frontend/src/
  app/
  components/
  config/
  data/
  domain/
  features/
  services/
  viewModels/
```

Descripcion de carpetas:

- `src/app`: orquestador principal de la aplicacion.
- `src/components`: componentes compartidos de layout, producto, orden, UI, modales y piezas reutilizables.
- `src/config`: configuracion futura para API.
- `src/data`: datos mock centralizados.
- `src/domain`: tipos, enums, constantes y helpers alineados con el modelo de base de datos.
- `src/features`: modulos por funcionalidad.
- `src/services`: servicios mock y futura capa de conexion con API.
- `src/viewModels`: adaptadores entre datos del dominio y la UI visual.

### Features principales

Features actuales:

- `auth`
- `profile`
- `catalog`
- `search`
- `product-detail`
- `cart`
- `checkout`
- `payment`
- `recipes`
- `admin`
- `delivery`
- `orders` / tracking
- `notifications`
- `favorites`

Cada feature debe mantenerse lo mas aislada posible. Los cambios grandes deben evitar mezclar UI, datos mock, servicios y reglas de negocio dentro de un mismo componente.

### Documentacion tecnica del frontend

La documentacion tecnica debe vivir en `frontend/docs/`.

Mientras la carpeta aun se llame `frontend real`, estos documentos estan temporalmente en `frontend real/docs/`.

Documentos disponibles:

- `CODEX_AUDIT.md`: bitacora tecnica de fases, decisiones, builds y estado general del frontend.
- `DOMAIN_MODEL.md`: descripcion del modelo de dominio alineado con base de datos y reglas de negocio.
- `MOCK_DATA_MODEL.md`: descripcion de los datos mock centralizados y sus relaciones.
- `SERVICES_LAYER.md`: explicacion de la capa de servicios mock y su futura sustitucion por API real.
- `VISUAL_ADAPTERS.md`: documentacion de adaptadores visuales para proteger la UI aprobada.
- `OPERATIONAL_VIEW_MODELS.md`: view models y adaptadores de pedidos, recipes, delivery, reembolsos y notificaciones.
- `MODULARIZATION_TRACKER.md`: seguimiento de la modularizacion por fases.
- `CLEANUP_REPORT.md`: reporte de limpieza profunda, residuos eliminados y candidatos conservados.
- `PERFORMANCE_REPORT.md`: reporte de code splitting, tamanos de bundle y resultado de performance/build.
- `CLEANUP_CANDIDATES.md`: candidatos de limpieza futura o revision manual.

### Estado de performance

Se aplico code splitting por feature con `React.lazy` y `Suspense`.

Resultado documentado:

- El bundle principal se redujo aproximadamente de `545.84 kB` a `278.39 kB`.
- El gzip del bundle principal quedo aproximadamente en `81.60 kB`.
- El warning de chunk mayor a 500 kB desaparecio.
- No se agrego React Router.
- No se agrego state management nuevo.
- No se uso `manualChunks`.

### Como debe continuar el frontend

Lineamientos para continuar:

- No volver a hardcodear datos directamente dentro de componentes.
- Usar `src/data` mientras no exista backend real.
- Usar `src/services` como capa para reemplazar mocks por API real.
- Usar `src/domain` para tipos, enums, constantes y reglas del modelo.
- Usar `src/viewModels` para adaptar datos sin romper la UI visual.
- Mantener features separadas.
- No meter logica de negocio pesada directamente en JSX.
- No mezclar UI con consultas directas a base de datos.
- No conectar Supabase directamente desde componentes visuales sin una capa de servicio.
- Mantener `pnpm build` pasando antes de subir cambios.

### Integracion frontend/backend sugerida

Flujo conceptual recomendado:

```text
UI Feature -> ViewModel/Adapter -> Service -> API/Backend -> DB
```

La integracion debe hacerse progresivamente:

1. Mantener la UI actual.
2. Reemplazar funciones mock en `src/services` por llamadas reales.
3. Mantener `src/viewModels` para no romper la UI.
4. Usar `src/domain` como referencia del modelo.
5. Validar en backend todas las reglas criticas.
6. Mantener validaciones frontend solo como apoyo visual.

### Reglas importantes del negocio a respetar

- Productos se inhabilitan, no se eliminan fisicamente.
- Personal operativo se inhabilita, no se elimina fisicamente.
- Sedes se inhabilitan, no se eliminan fisicamente.
- Categorias pueden dejar productos sin categoria.
- Stock se maneja por sede.
- Carrito depende de usuario, producto y sede.
- Un pedido tiene maximo un cupon.
- Un pedido tiene maximo una transaccion.
- Pago debe ser exacto.
- No debe haber subpagos ni pagos de diferencia.
- Reembolso es flujo separado del pago.
- Recipes se asocian al detalle del pedido.
- Auditoria se asocia al recipe.
- Productos con recipe digital y fisico son pickup obligatorio.
- Cupones no tienen estado propio; vigencia se deriva por fechas.
- No debe haber dos cupones vigentes con el mismo codigo.

### Que NO esta implementado todavia en frontend

Actualmente NO esta implementado todavia:

- Backend real.
- Conexion con Supabase.
- API real.
- Autenticacion real.
- Persistencia real.
- Pagos reales.
- Subida real de archivos.
- Notificaciones reales.
- Actualizacion real de stock.
- Creacion real de pedidos.
- Logica real de validacion en servidor.
- Consultas reales a base de datos.

Todo eso queda para fases posteriores.

### Buenas practicas para proximos desarrolladores frontend

- Trabajar sobre `frontend/`.
- No editar carpetas temporales de pruebas.
- No volver a poner arrays mock dentro de componentes.
- No borrar `src/domain`, `src/data`, `src/services` ni `src/viewModels` sin entender su funcion.
- No romper adapters visuales si cambia la API.
- Probar visualmente pantallas principales despues de cambios grandes.
- Mantener `pnpm build` pasando.
- Documentar cambios arquitectonicos importantes.
- Coordinar cambios de contrato con backend.

### Comandos utiles del frontend

```bash
cd frontend
pnpm install
pnpm dev --host 127.0.0.1
pnpm build
```

Comando util para revisar el estado de Git:

```bash
git status --short
```

Si la carpeta aun se llama `frontend real`, usar temporalmente:

```bash
cd "frontend real"
```

## BACKEND

El backend contiene la logica del servidor, rutas de API y conexion a base de datos.

Antes de iniciar, asegurese de tener instalado:

- Node.js 18+.
- Acceso a las llaves o credenciales de conexion a la base de datos.
- URL del host correspondiente.

Las credenciales de conexion a la base de datos y la URL del host deben solicitarse al responsable de arquitectura o administrador por un canal privado. No deben compartirse ni versionarse en el repositorio.

Preparacion del backend:

```bash
cd backend
npm install
```

Configurar las llaves de base de datos y URL del host en el archivo de entorno local:

```text
.env
```

Iniciar el servidor:

```bash
npx tsx src/server.ts
```

Para pruebas de integracion, el backend y el frontend deben ejecutarse de forma simultanea en terminales separadas.