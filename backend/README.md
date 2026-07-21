# Backend FHEC

API Express/TypeScript integrada con Supabase. Cada solicitud autenticada valida el JWT con Supabase y usa un cliente aislado con el token de ese usuario.

## Configuracion

1. Copia `.env.example` como `.env`.
2. Configura `SUPABASE_URL` y `SUPABASE_ANON_KEY`.
3. Configura `SUPABASE_SERVICE_ROLE_KEY` solo para administracion de usuarios y para sincronizar las cuentas de prueba. Nunca expongas esta clave al frontend.

Las variables de CORS, limites y rate limiting tienen valores locales seguros en `.env.example`.

## Comandos

```bash
npm install
npm run dev
npm start
npm run typecheck
npm run check
```

El servidor escucha en `http://localhost:3000` de forma predeterminada y publica la API bajo `/api`.

## Cuentas de prueba reales

El frontend autocompleta cinco cuentas: cliente, repartidor, auxiliar, auditor y superadministrador. Para crearlas o reconciliarlas de forma idempotente en Supabase Auth y en la tabla `usuarios`:

```bash
npm run seed:test-accounts
```

`DEMO_ACCOUNT_PASSWORD` debe coincidir con `VITE_DEMO_ACCOUNT_PASSWORD` del frontend. El script confirma los correos de prueba, corrige sus roles y actualiza la contraseña; requiere la clave service-role.
