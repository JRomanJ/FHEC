# Backend FHEC

API Express/TypeScript integrada con Supabase. Cada solicitud autenticada valida el JWT con Supabase y usa un cliente aislado con el token de ese usuario.

## Configuracion

1. Copia `.env.example` como `.env`.
2. Configura `SUPABASE_URL` y `SUPABASE_ANON_KEY`.
3. Configura `SUPABASE_SERVICE_ROLE_KEY` solo para administracion de usuarios y para sincronizar las cuentas de prueba. Nunca expongas esta clave al frontend.

Las variables de CORS, limites y rate limiting tienen valores locales seguros en `.env.example`.
`ORDER_PAYMENT_TTL_MINUTES` controla cuantos minutos se reserva el stock mientras el
pedido espera pago (15 por defecto, con un maximo de 120).

## Comandos

```bash
npm install
npm run dev
npm start
npm run typecheck
npm run check
```

El servidor escucha en `http://localhost:3000` de forma predeterminada.

## Cuentas de prueba reales

El frontend autocompleta cinco cuentas: cliente, repartidor, auxiliar, auditor y superadministrador. Para crearlas o reconciliarlas de forma idempotente en Supabase Auth y en la tabla `usuarios`:

```bash
npm run seed:test-accounts
```

## Banners y notificaciones promocionales

Antes de usar estas rutas, aplica en Supabase la migracion
`supabase/migrations/20260722020000_banners_notificaciones.sql`.

- `GET /banners`: lista publica de banners.
- `POST /banners`: crea un banner y registra la promocion (solo superadmin).
- `PATCH /banners/:bannerId`: actualiza un banner (solo superadmin).
- `DELETE /banners/:bannerId`: elimina un banner (solo superadmin).
- `GET /notifications`: lista las notificaciones del usuario autenticado.
- `PATCH /notifications/:notificationId/read`: marca una como leida.
- `PATCH /notifications/read-all`: marca todas como leidas.
- `DELETE /notifications/:notificationId`: elimina una notificacion propia.

Al insertar un banner, la base registra una notificacion para cada usuario que acepto
notificaciones y promociones. La notificacion interna siempre queda registrada. Para
enviar tambien por correo configura `RESEND_API_KEY` y `NOTIFICATION_FROM_EMAIL`; para
SMS configura las variables `TWILIO_*` de `.env.example`. Cada intento queda auditado
en `estado_envio`, `canales_solicitados` y `canales_enviados`. Los envios pendientes se
pueden reintentar con `POST /banners/:bannerId/notifications/dispatch`.

## Imagenes de banners en Supabase Storage

El bucket se crea o valida de forma segura mediante la API oficial de Storage:

```bash
npm run setup:banner-storage
```

El bucket `banner-images` es publico para lectura y acepta exclusivamente JPG, PNG,
WEBP y AVIF de hasta 5 MB. La service-role nunca se entrega al frontend. Un
superadministrador solicita una URL firmada con `POST /banners/images/upload-url` y el
navegador carga el archivo directamente a esa ruta temporal. Al reemplazar o eliminar
un banner, el backend elimina su imagen administrada. `POST /banners/images/delete`
permite limpiar una carga cancelada desde el formulario.

## Pedidos, pagos y recipes

La instalacion de estas funciones se hace en tres pasos seguros:

1. Ejecuta `supabase/preflight_pedidos_transacciones_recipes.sql`. Es solo lectura.
2. Si todas las dependencias dicen `OK`, ejecuta
   `supabase/migrations/20260722040000_pedidos_transacciones_recipes.sql`. Acepta tanto
   `OK_NO_EXISTE` como `OK_EXISTE_RECONCILIAR`: la migracion es idempotente.
3. Ejecuta `supabase/postflight_pedidos_transacciones_recipes.sql` y confirma que las
   siete tablas, tres funciones, el trigger y RLS aparecen activos.

La migracion es aditiva, reconciliable y transaccional: si alguna sentencia falla,
PostgreSQL revierte la migracion completa. Se puede volver a ejecutar para completar
funciones o permisos faltantes. No elimina tablas ni filas existentes. Al crear un pedido, una
funcion de base de datos valida y descuenta el stock, crea los detalles y crea exactamente
una entrega delivery o pickup en la misma transaccion. Los pedidos vencidos restauran el
stock una sola vez. El backend revisa vencimientos al iniciar, cada minuto y antes de las
operaciones de pedidos/pagos.

Las transacciones se crean al confirmar un pago exacto. `DELETE /transactions/:id` hace
una anulacion logica: conserva la evidencia contable. Los recipes se guardan en el bucket
privado `recipe-files`; crealo o validalo con:

```bash
npm run setup:recipe-storage
```

Rutas principales:

- `POST /orders`, `GET /orders`, `GET /orders/:orderId`.
- `POST /orders/:orderId/transactions`.
- `GET /transactions`, `GET /transactions/:id`, `PATCH /transactions/:id`, `DELETE /transactions/:id`.
- `GET /recipes`, `POST /recipes/upload-url`, `POST /recipes`, `PATCH /recipes/:id/file`, `PATCH /recipes/:id/audit`, `DELETE /recipes/:id`.

El bucket de recipes es privado, admite JPG, PNG, WEBP y PDF hasta 10 MB, y las lecturas
se entregan mediante URLs firmadas temporales. Cada cambio de estado de un recipe crea
automaticamente una fila en `auditoria_recipes`.

`DEMO_ACCOUNT_PASSWORD` debe coincidir con `VITE_DEMO_ACCOUNT_PASSWORD` del frontend. El script confirma los correos de prueba, corrige sus roles y actualiza la contraseña; requiere la clave service-role.
