# MODULARIZATION_TRACKER - Farmahumana / FHEC

Este tracker registra la primera modularizacion real del frontend. El criterio de esta fase fue extraer componentes completos de bajo riesgo desde `src/app/App.tsx`, manteniendo clases, textos, callbacks, estado local y comportamiento visual.

## Estado inicial

- `git status --short` mostro cambios pendientes de fases anteriores dentro de `frontend real`.
- No se tocaron `frontend` ni `backend`.
- `App.tsx` seguia como orquestador y contenia auth, perfil, admin, delivery, catalogo, carrito, checkout y notificaciones.

## Secciones encontradas

| Seccion | Ubicacion aproximada en `App.tsx` | Extraida | Nuevo archivo destino | Riesgo | Notas |
|---|---:|---|---|---|---|
| `LoginPage` | antes `src/app/App.tsx:4085`, ahora importado | Si | `src/features/auth/components/LoginPage.tsx` | bajo | Se movio el componente completo, con login, registro, recuperacion y modal OTP. |
| `OtpInput` local de auth | antes `src/app/App.tsx:4048` | Si | `src/features/auth/components/LoginPage.tsx` | bajo | Se mantiene local al feature auth; no se conecto a otros flujos para evitar cambios de DOM/clases. |
| Registro | dentro de `LoginPage` | Si | `src/features/auth/components/LoginPage.tsx` | bajo | Se preservaron textos, clases y validacion visual. |
| Recuperacion de contraseña | dentro de `LoginPage` | Si | `src/features/auth/components/LoginPage.tsx` | bajo | Se preservo flujo mock y PIN demo. |
| Modal OTP de registro | dentro de `LoginPage` | Si | `src/features/auth/components/LoginPage.tsx` | bajo | Se mantuvo JSX inline exacto para no alterar tamanos de inputs. |
| `ProfilePage` | antes `src/app/App.tsx:6665`, ahora importado | Si | `src/features/profile/components/ProfilePage.tsx` | bajo | Se movio el componente completo con sus tabs internos. |
| Datos personales de perfil | dentro de `ProfilePage` | Si | `src/features/profile/components/ProfilePage.tsx` | bajo | Estado local y handlers permanecen dentro del componente. |
| Cambio de correo | dentro de `ProfilePage` | Si | `src/features/profile/components/ProfilePage.tsx` | bajo | OTP inline preservado. |
| Cambio de telefono | dentro de `ProfilePage` | Si | `src/features/profile/components/ProfilePage.tsx` | bajo | OTP inline preservado. |
| Notificaciones de perfil | dentro de `ProfilePage` | Si | `src/features/profile/components/ProfilePage.tsx` | bajo | Toggles visuales y estado local sin cambios. |
| Seguridad/cambio de contrasena | dentro de `ProfilePage` | Si | `src/features/profile/components/ProfilePage.tsx` | bajo | Validacion visual mock sin persistencia real. |
| Historial de pedidos | dentro de `ProfilePage` | Si | `src/features/profile/components/ProfilePage.tsx` | bajo | Recibe `demoOrders` desde `App.tsx`; paginado intacto. |
| Reembolsos de perfil | dentro de `ProfilePage` | Si | `src/features/profile/components/ProfilePage.tsx` | bajo | Estado inicial desde view model legacy; formulario sigue local. |
| Cupones de perfil | dentro de `ProfilePage` | Si | `src/features/profile/components/ProfilePage.tsx` | bajo | Sigue usando `getLegacyProfileCouponViewModels()`. |
| `DEMO_ACCOUNTS` | `src/app/App.tsx:85` | No | Pendiente | medio | Se mantiene en `App.tsx` porque tambien lo usa staff/admin. Se pasa como prop a auth. |
| `DEMO_CONTACT` | `src/app/App.tsx:6015` | No | Pendiente | medio | Se mantiene en `App.tsx` porque checkout/delivery select lo usa para datos de receptor. |
| `VE_AREAS` | `src/app/App.tsx:2332` | No | Pendiente | bajo | Se pasa como prop a auth/perfil para conservar opciones visibles. |
| `DOC_TYPES` | `src/app/App.tsx:2333` | No | Pendiente | medio | Se pasa como prop porque incluye `G`; no se reemplazo por dominio para no cambiar UI. |
| Formulario staff | `src/app/App.tsx:4904+` | No | Pendiente | medio | No se extrajo porque pertenece a admin y se modularizara despues. |
| Catalogo/carrito/checkout | varias secciones | No | Pendiente | alto | Fuera de alcance de esta fase. |
| Admin/delivery completos | varias secciones | No | Pendiente | alto | Fuera de alcance de esta fase. |

## Archivos creados

- `src/features/auth/components/LoginPage.tsx`
- `src/features/auth/index.ts`
- `src/features/profile/components/ProfilePage.tsx`
- `src/features/profile/index.ts`
- `src/features/index.ts`

## Archivos modificados

- `src/app/App.tsx`
- `src/app/types.ts`
- `docs/MODULARIZATION_TRACKER.md`
- `docs/CODEX_AUDIT.md`

## Props principales

`LoginPage` recibe:

- `onLogin`
- `onNav`
- `initialView`
- `demoAccounts`
- `veAreas`
- `docTypes`

`ProfilePage` recibe:

- `user`
- `onNav`
- `onLogout`
- `demoOrders`
- `demoContact`
- `veAreas`
- `docTypes`

## Estado que quedo en App.tsx

- Pantalla actual (`page`).
- Usuario autenticado (`user`).
- Carrito, favoritos, producto seleccionado, busqueda y sede visible.
- Estado compartido de notificaciones.
- Estado de checkout/delivery select.
- Datos compartidos usados por otros modulos: `DEMO_ACCOUNTS`, `DEMO_CONTACT`, `VE_AREAS`, `DOC_TYPES`.

## Estado que se movio con los componentes

- Estado de login, registro, recuperacion y OTP de auth.
- Estado de tabs de perfil.
- Estado de edicion de datos personales.
- Estado de cambio de correo/telefono con OTP.
- Estado de preferencias de notificacion del perfil.
- Estado de cambio de contrasena.
- Estado local de historial, reembolsos y modal de reembolso.

## Decisiones

- No se extrajeron componentes reutilizables globales de formularios porque los OTP actuales usan clases y ids distintos por contexto. Forzar un componente compartido podia cambiar DOM, tamanos o foco.
- `OtpInput` se movio con auth, pero no se uso para reemplazar los OTP inline actuales.
- `App.tsx` sigue como orquestador principal.
- No se introdujo React Router ni state management externo.
- No se agregaron dependencias.

## Verificacion

- `pnpm build`: exitoso.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.

## Pendiente recomendado

1. Extraer constantes compartidas de formularios (`VE_AREAS`, `VE_BANKS`, `VENEZUELA_BANKS`) sin tocar `DOC_TYPES` hasta resolver `G` vs `RIF`.
2. Modularizar `DEMO_ACCOUNTS` junto con auth/staff para evitar duplicar cuentas demo.
3. Modularizar `DEMO_CONTACT` junto con perfil y checkout/delivery select.
4. Extraer subcomponentes internos de `ProfilePage` solo cuando se pueda validar visualmente cada tab.
5. Dejar catalogo, carrito, checkout, admin y delivery completo para fases posteriores.

## Fase 8 - Catalogo, busqueda y detalle de producto

Esta fase extrajo componentes completos de producto, catalogo, busqueda y detalle desde `src/app/App.tsx`. La estrategia fue mover JSX existente sin cambiar clases, textos, condiciones, callbacks ni estado visual.

### Estado inicial de la fase

- `git status --short`: limpio antes de editar.
- `App.tsx`: 6385 lineas aproximadamente al iniciar la fase.
- `App.tsx` ya usaba datos consistentes para productos mediante `getAppProductViewModels()`.
- No se tocaron `frontend` ni `backend`.

### Secciones extraidas

| Seccion | Ubicacion aproximada anterior en `App.tsx` | Extraida | Nuevo archivo destino | Riesgo | Notas |
|---|---:|---|---|---|---|
| `ProductBox` | `src/app/App.tsx:131` | Si | `src/components/product/ProductDisplay.tsx` | bajo | Se mantiene como componente reusable porque carrito, favoritos y admin todavia lo usan. |
| `ProductCard` | `src/app/App.tsx:184` | Si | `src/components/product/ProductDisplay.tsx` | medio | Se preservo el estado del modal de recipe, cantidad en carrito, favorito, badges y stock por sede. |
| `Stars` | `src/app/App.tsx:120` | Si | `src/components/product/ProductDisplay.tsx` | bajo | Se movio junto con los componentes de producto aunque no sea parte central de esta fase. |
| `SmartSearch` | `src/app/App.tsx:368` | Si | `src/features/search/components/SmartSearch.tsx` | medio | Ahora recibe `products`, `categories` y `brandSynonyms` como props desde `Navbar`. |
| `HomePage` | `src/app/App.tsx:1050` | Si | `src/features/catalog/components/HomePage.tsx` | bajo | Se preservo carrusel, productos destacados y filtro por stock de sede. |
| `CatalogPage` | `src/app/App.tsx:1156` | Si | `src/features/catalog/components/CatalogPage.tsx` | medio | Se preservaron filtros, ordenamiento, contador, grid y estado local de filtros dentro del componente. |
| `ProductDetailPage` | `src/app/App.tsx:1323` | Si | `src/features/product-detail/components/ProductDetailPage.tsx` | medio | Se preservaron layout, modal de recipe, aviso controlado, CTA, favoritos y similares por principio activo. |
| Product cards en carrito/favoritos/admin | varias secciones | No | Pendiente | medio | Siguen en `App.tsx`, pero usan `ProductBox`/`ProductCard` importados desde `src/components/product`. |
| Carrito completo | `src/app/App.tsx:1555+` | No | Pendiente | alto | Fuera de alcance para evitar tocar checkout y flujo de compra. |
| Checkout/pago/tracking | varias secciones | No | Pendiente | alto | Fuera de alcance de esta fase. |
| Admin/delivery completos | varias secciones | No | Pendiente | alto | Se modularizaran en fases posteriores. |

### Archivos creados

- `src/components/product/ProductDisplay.tsx`
- `src/components/product/index.ts`
- `src/features/catalog/components/HomePage.tsx`
- `src/features/catalog/components/CatalogPage.tsx`
- `src/features/catalog/index.ts`
- `src/features/search/components/SmartSearch.tsx`
- `src/features/search/index.ts`
- `src/features/product-detail/components/ProductDetailPage.tsx`
- `src/features/product-detail/index.ts`

### Archivos modificados

- `src/app/App.tsx`
- `src/features/index.ts`
- `docs/MODULARIZATION_TRACKER.md`
- `docs/CODEX_AUDIT.md`

### Props principales

`HomePage` recibe:

- `products`
- `onProductClick`
- `onAddToCart`
- `onNav`
- `cartItems`
- `onUpdateQuantity`
- `favoriteIds`
- `onToggleFavorite`
- `slides`
- `selectedSede`

`CatalogPage` recibe:

- `products`
- `searchQuery`
- `onProductClick`
- `onAddToCart`
- `cartItems`
- `onUpdateQuantity`
- `favoriteIds`
- `onToggleFavorite`
- `preselectedCategory`

`ProductDetailPage` recibe:

- `product`
- `products`
- `onAddToCart`
- `onBack`
- `onProductClick`
- `onNav`
- `favoriteIds`
- `onToggleFavorite`
- `cartItems`
- `onUpdateQuantity`
- `selectedSede`

`SmartSearch` recibe:

- `searchQuery`
- `setSearchQuery`
- `onNav`
- `products`
- `categories`
- `brandSynonyms`

### Estado que quedo en App.tsx

- Pantalla actual (`page`).
- Producto seleccionado (`selectedProductId`).
- Busqueda global (`searchQuery`).
- Carrito y favoritos.
- Sede visible (`displaySede`).
- Banners/slides.
- Categoria preseleccionada.
- Checkout, tracking, admin, delivery y notificaciones.

### Estado que se movio con los componentes

- Estado del carrusel de inicio.
- Estado local de filtros del catalogo (`selCats`, `selBrands`, `selPres`, `sortBy`, `showFilters`).
- Estado del dropdown de busqueda y historial local de busqueda.
- Estado del modal de recipe en tarjetas.
- Estado del modal de recipe en detalle de producto.

### Decisiones

- `ProductBox` y `ProductCard` se ubicaron en `src/components/product` porque aun son compartidos por pantallas pendientes de modularizar.
- `HomePage` se ubico dentro de `src/features/catalog` porque su bloque principal de negocio en esta fase son productos destacados.
- `SmartSearch` no importa datos directamente: recibe las mismas fuentes que ya existian en `App.tsx` para preservar el resultado visual.
- No se movio el estado principal de navegacion ni se introdujo React Router.
- No se agregaron dependencias.

### Verificacion

- `pnpm build`: exitoso.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.
- `App.tsx` quedo en 5469 lineas.

### Pendiente recomendado

1. Modularizar carrito y resumen de carrito, usando `ProductBox`/`ProductCard` ya extraidos.
2. Modularizar delivery select, pre-checkout, checkout, pago y tracking en una fase separada.
3. Extraer admin catalogo/inventario solo despues de aislar formularios y tablas de bajo riesgo.
4. Mantener `ProductCard` sin unificacion adicional hasta validar todas sus apariciones visuales.
