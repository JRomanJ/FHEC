# PERFORMANCE_REPORT - Farmahumana / FHEC

Fecha: 2026-07-06.

## Fase 15 - Code splitting por feature

Esta fase aplica code splitting por pantallas/features usando `React.lazy` y `Suspense`, sin cambiar UI, navegacion, estado global, servicios, datos mock, dominio, view models ni comportamiento visual.

No se agregaron librerias, no se agrego React Router, no se agrego state management y no se implemento backend/API.

## Baseline antes de code splitting

Comando:

- `pnpm build`

Resultado:

- Build exitoso.
- Modulos transformados: 1725.
- CSS principal: `125.24 kB`, gzip `19.99 kB`.
- JS principal: `545.84 kB`, gzip `131.25 kB`.
- Warning: `Some chunks are larger than 500 kB after minification`.

Archivos principales generados antes:

- `dist/assets/index-B35PDpQm.js`: `545.84 kB`, gzip `131.25 kB`.
- `dist/assets/index-BGe-3C9S.css`: `125.24 kB`, gzip `19.99 kB`.

Features sospechosas de peso inicial:

- Admin: `AdminPanelPage`, `SuperadminModules`, formularios y tablas administrativas.
- Perfil: `ProfilePage`.
- Auth: `LoginPage`.
- Delivery: `DeliveryPanelPage` y subcomponentes.
- Tracking: `TrackingPage` y subcomponentes.
- Checkout/pago/carrito/recipes.
- Catalogo/detalle/favoritos/notificaciones.

Estrategia:

- Mantener layout, navbar, footer y busqueda superior como carga inicial para no alterar la estructura visual.
- Convertir pantallas renderizadas condicionalmente por `page` en componentes lazy.
- Usar `Suspense fallback={null}` para evitar introducir un loader visual nuevo.
- Evitar `manualChunks` en esta fase.

## Cambios realizados

Archivo principal modificado:

- `src/app/App.tsx`

Cambios:

- Se reemplazaron imports estaticos de pantallas por `React.lazy`.
- Se agrego `Suspense` alrededor de login/registro y del area principal de paginas.
- Se mantuvieron iguales las condiciones de render, props y callbacks.
- Se mantuvo `Navbar` y `Footer` como imports estaticos.

Archivos auxiliares modificados:

- `src/components/layout/AppLayout.tsx`
- `src/features/notifications/components/NotificationsPage.tsx`

Motivo:

- `NotificationsPage` exportaba `INITIAL_NOTIFICATIONS` y `AppNotification`; eso arrastraba la pantalla de notificaciones al bundle principal.
- El estado inicial y el tipo ahora salen de `src/viewModels/notificationViewModels.ts`, que es una dependencia de datos pequena y no visual.

## Features lazy-loaded

Pantallas cargadas de forma diferida:

- `LoginPage`
- `ProfilePage`
- `HomePage`
- `CatalogPage`
- `ProductDetailPage`
- `CartPage`
- `DeliverySelectPage`
- `CheckoutPage`
- `PreCheckoutMedicalPage`
- `AdminPanel`
- `BannerManagementPage`
- `DeliveryPanel`
- `FavoritesPage`
- `NotificationsPage`
- `TrackingPage`

Se conservaron estaticos:

- `Navbar`
- `Footer`
- `SmartSearch` dentro del layout, porque forma parte de la barra superior aprobada.
- Servicios, data, domain y view models compartidos necesarios para estado global/mock.

## Resultado despues de code splitting

Comando:

- `pnpm build`

Resultado:

- Build exitoso.
- Modulos transformados: 1708.
- CSS principal: `125.24 kB`, gzip `19.99 kB`.
- JS principal: `278.39 kB`, gzip `81.60 kB`.
- Warning de chunk mayor a 500 kB: eliminado.

Reduccion:

- JS principal antes: `545.84 kB`.
- JS principal despues: `278.39 kB`.
- Reduccion aproximada: `267.45 kB` menos en el chunk inicial.
- Reduccion aproximada porcentual: 49%.

Chunks generados por feature/pantalla:

| Chunk | Tamano | Gzip |
|---|---:|---:|
| `FavoritesPage-*.js` | `2.75 kB` | `1.32 kB` |
| `HomePage-*.js` | `3.59 kB` | `1.52 kB` |
| `NotificationsPage-*.js` | `4.59 kB` | `1.71 kB` |
| `BannerManagementPage-*.js` | `4.85 kB` | `1.88 kB` |
| `CatalogPage-*.js` | `5.15 kB` | `1.90 kB` |
| `PreCheckoutMedicalPage-*.js` | `7.44 kB` | `2.47 kB` |
| `ProductDetailPage-*.js` | `9.37 kB` | `2.79 kB` |
| `DeliverySelectPage-*.js` | `11.10 kB` | `3.45 kB` |
| `CartPage-*.js` | `14.04 kB` | `3.97 kB` |
| `CheckoutPage-*.js` | `14.05 kB` | `3.83 kB` |
| `TrackingPage-*.js` | `21.18 kB` | `5.99 kB` |
| `LoginPage-*.js` | `21.38 kB` | `4.76 kB` |
| `DeliveryPanelPage-*.js` | `21.82 kB` | `6.02 kB` |
| `ProfilePage-*.js` | `44.93 kB` | `8.74 kB` |
| `AdminPanelPage-*.js` | `75.81 kB` | `15.29 kB` |

Vite tambien genero chunks pequenos para iconos y componentes compartidos usados por las pantallas lazy.

## Decision sobre manualChunks

No se uso `manualChunks`.

Motivo:

- `React.lazy` por feature elimino el warning principal.
- `manualChunks` agregaria complejidad de build sin necesidad inmediata.
- Mantener la configuracion de Vite simple reduce riesgo en esta fase.

## Riesgos y notas

- `fallback={null}` puede mostrar un espacio vacio muy breve mientras carga el chunk de una pantalla. Se eligio para no introducir un loader visual nuevo.
- Home y Catalog tambien se cargan diferidos. La UI final no cambia, pero el primer render depende de descargar el chunk de `HomePage`.
- `SmartSearch` permanece en el bundle inicial porque forma parte del navbar y esta visible en la experiencia principal.
- Servicios/data/view models compartidos siguen en el bundle inicial si `App.tsx` o `Navbar` los requieren.

## Verificacion local

| Comando | Resultado |
|---|---|
| `pnpm dev --host 127.0.0.1` | Primer intento en sandbox fallo con `listen EPERM` al abrir `127.0.0.1:5173`. |
| `pnpm dev --host 127.0.0.1` con permiso elevado | Exitoso; Vite arranco en `http://127.0.0.1:5173/`. |
| `curl -I http://127.0.0.1:5173/` con permiso elevado | `HTTP/1.1 200 OK`. |

El servidor Vite temporal fue detenido despues de la verificacion.

## Recomendaciones futuras

1. Mantener este code splitting por pantalla mientras no exista React Router.
2. Si el bundle vuelve a crecer, revisar imports compartidos desde `src/app/data.ts`.
3. Evaluar lazy loading mas fino dentro de admin solo si vuelve a aparecer un warning de chunk grande.
4. Evitar `manualChunks` salvo que haya una necesidad clara de separar vendor o admin.
