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

## Fase 9 - Carrito, checkout, pago y recipes

Esta fase extrajo pantallas completas del flujo de compra desde `src/app/App.tsx`, manteniendo el estado principal y la navegacion en `App.tsx`. La extraccion fue mecanica: JSX, clases, textos, condiciones, calculos visibles y callbacks se conservaron.

### Estado inicial de la fase

- `git status --short`: limpio antes de editar.
- `App.tsx`: 5469 lineas aproximadamente al iniciar la fase.
- El carrito y checkout seguian con estado local/mock.
- No se tocaron `frontend` ni `backend`.

### Secciones extraidas

| Seccion | Ubicacion aproximada anterior en `App.tsx` | Extraida | Nuevo archivo destino | Riesgo | Notas |
|---|---:|---|---|---|---|
| `CartPage` | `src/app/App.tsx:638` | Si | `src/features/cart/components/CartPage.tsx` | medio | Mantiene carrito vacio, items, cantidades, vaciar carrito, cupon, stock por sede y modales de login/stock. |
| Items del carrito | dentro de `CartPage` | Si | `src/features/cart/components/CartPage.tsx` | medio | Sigue usando `ProductBox` compartido; no se cambio sumar/restar/eliminar. |
| Resumen de carrito | dentro de `CartPage` | Si | `src/features/cart/components/CartPage.tsx` | medio | Se preservaron subtotal, IVA, descuento, total y formato USD/VES. |
| Aplicacion visual de cupon | dentro de `CartPage` y `DeliverySelectPage` | Si | `src/features/cart/components/CartPage.tsx`, `src/features/checkout/components/DeliverySelectPage.tsx` | medio | `DISCOUNT_CODES` sigue en `App.tsx` y se pasa como prop. |
| `DeliverySelectPage` | `src/app/App.tsx:1003` | Si | `src/features/checkout/components/DeliverySelectPage.tsx` | medio | Mantiene delivery/pickup, sede, direccion, receptor, resumen y bloqueo de delivery para controlados. |
| `GpsMapWidget` | `src/app/App.tsx:2517` | Si | `src/components/order/GpsMapWidget.tsx` | bajo | Se movio como componente compartido porque tambien lo usa el panel delivery. |
| `addressToPin` | `src/app/App.tsx:2613` | Si | `src/components/order/GpsMapWidget.tsx` | bajo | Se exporta junto al mapa para conservar uso en delivery sin cambiar la pantalla. |
| `PreCheckoutMedicalPage` | `src/app/App.tsx:1257` | Si | `src/features/recipes/components/PreCheckoutMedicalPage.tsx` | medio | Mantiene carga mock de recipe, contador, aprobacion simulada y avisos de recipe fisico. |
| `CheckoutPage` | `src/app/App.tsx:1507` | Si | `src/features/payment/components/CheckoutPage.tsx` | medio | Mantiene pago movil, transferencia, datos fiscales, temporizador y validacion de pago exacto. |
| `TrackingPage` | `src/app/App.tsx:1814` | No | Pendiente | medio | Queda para una fase de pedidos/tracking/resenas. |
| `RefundForm` | `src/app/App.tsx:1425` | No | Pendiente | medio | Pertenece a perfil/reembolsos y no al checkout normal. |
| Admin completo | varias secciones | No | Pendiente | alto | Fuera de alcance. |
| Delivery completo | varias secciones | No | Pendiente | alto | Solo se movio el mapa compartido; el panel delivery sigue en `App.tsx`. |

### Archivos creados

- `src/features/cart/components/CartPage.tsx`
- `src/features/cart/index.ts`
- `src/features/checkout/components/DeliverySelectPage.tsx`
- `src/features/checkout/index.ts`
- `src/features/payment/components/CheckoutPage.tsx`
- `src/features/payment/index.ts`
- `src/features/recipes/components/PreCheckoutMedicalPage.tsx`
- `src/features/recipes/index.ts`
- `src/components/order/GpsMapWidget.tsx`
- `src/components/order/index.ts`

### Archivos modificados

- `src/app/App.tsx`
- `src/features/index.ts`
- `docs/MODULARIZATION_TRACKER.md`
- `docs/CODEX_AUDIT.md`

### Props principales

`CartPage` recibe:

- `cartItems`
- `setCartItems`
- `onNav`
- `discountApplied`
- `discountCode`
- `setDiscountApplied`
- `setDiscountCode`
- `user`
- `hasActiveOrder`
- `selectedSede`
- `products`
- `discountCodes`

`DeliverySelectPage` recibe:

- `cartItems`
- `onNav`
- `deliveryMode`
- `setDeliveryMode`
- `selectedSede`
- `setSelectedSede`
- `deliveryAddress`
- `setDeliveryAddress`
- `discountApplied`
- `discountCode`
- `setDiscountApplied`
- `setDiscountCode`
- `user`
- `onConfirmOrder`
- `sedes`
- `discountCodes`
- `demoContact`
- `veAreas`

`PreCheckoutMedicalPage` recibe:

- `cartItems`
- `onNav`

`CheckoutPage` recibe:

- `cartItems`
- `onNav`
- `discountApplied`
- `deliveryMode`
- `selectedSede`
- `onClearCart`
- `user`
- `veAreas`
- `docTypes`
- `veBanks`

### Estado que quedo en App.tsx

- Pantalla actual (`page`).
- Carrito (`cartItems`), cantidades y `activeOrderItems`.
- Cupon aplicado (`cartDiscountApplied`, `cartDiscountCode`).
- Estado global de pedido activo (`hasActiveOrder`).
- Modo de entrega, sede y direccion de checkout.
- Usuario autenticado.
- Constantes compartidas de formularios y pago: `VE_AREAS`, `DOC_TYPES`, `VE_BANKS`.
- Datos puente: `SEDES`, `DISCOUNT_CODES`, `DEMO_CONTACT`.

### Estado que se movio con los componentes

- Estado local de input/error/exito de cupon en carrito.
- Modal de login requerido y modal de stock insuficiente del carrito.
- Estado local de receptor en metodo de entrega.
- Estado local de cupon dentro de metodo de entrega.
- Estado local de archivos de recipe, envio mock y contador de auditoria.
- Estado local de metodo de pago, referencia, banco, monto, temporizador y datos fiscales.
- Estado local del pin del mapa compartido.

### Decisiones

- No se extrajo un `OrderSummaryCard` comun porque carrito, metodo de entrega y pago tienen variaciones visuales pequenas. Unificarlos ahora podia cambiar estructura o textos.
- `DISCOUNT_CODES`, `SEDES` y `DEMO_CONTACT` se mantienen en `App.tsx` como datos compartidos y se pasan por props.
- `VE_AREAS`, `DOC_TYPES` y `VE_BANKS` siguen en `App.tsx` porque tambien alimentan auth/perfil/reembolsos; moverlas debe hacerse con una normalizacion separada.
- `GpsMapWidget` se movio a `src/components/order` para evitar dependencias desde features hacia `App.tsx`.
- No se implemento persistencia real, backend, Supabase, API ni `fetch`.

### Verificacion

- `pnpm build`: exitoso.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.
- `App.tsx` paso de 5469 lineas a 4288 lineas.

### Pendiente recomendado

1. Extraer `TrackingPage` en una fase de pedidos, tracking y resenas.
2. Modularizar `RefundForm` junto con reembolsos de perfil/admin.
3. Extraer constantes compartidas de formularios y pago cuando se resuelva `G` vs `RIF`.
4. Modularizar admin y delivery completo en fases posteriores.

## Fase 10 - Panel administrativo

Esta fase extrajo el bloque administrativo completo desde `src/app/App.tsx` hacia `src/features/admin`. Se movieron funciones completas para conservar tabs, tablas, formularios, modales, estados locales, validaciones visuales y comportamiento mock.

### Estado inicial de la fase

- `git status --short`: limpio antes de editar.
- `App.tsx`: 4288 lineas aproximadamente al iniciar la fase.
- El panel admin usaba datos mock/view models legacy y estado local.
- No se tocaron `frontend` ni `backend`.

### Secciones extraidas

| Seccion | Ubicacion aproximada anterior en `App.tsx` | Extraida | Nuevo archivo destino | Riesgo | Notas |
|---|---:|---|---|---|---|
| `AdminPanel` | `src/app/App.tsx:3126` | Si | `src/features/admin/components/AdminPanelPage.tsx` | medio | Contenedor principal con tabs por rol, auditor, auxiliar y superadmin. |
| Navegacion interna admin | dentro de `AdminPanel` | Si | `src/features/admin/components/AdminPanelPage.tsx` | medio | Se preservaron tabs, labels, iconos y permisos visuales por rol. |
| Auditoria de recipes | dentro de `AdminPanel` | Si | `src/features/admin/components/AdminPanelPage.tsx` | medio | Tabla, modal, aprobar/rechazar, motivos y acciones de imagen quedaron intactos. |
| Operaciones admin | dentro de `AdminPanel` | Si | `src/features/admin/components/AdminPanelPage.tsx` | medio | KPIs, filtros, tabla, modal de pedido, empacado, despacho y PIN demo quedaron intactos. |
| Reembolsos admin | dentro de `AdminPanel` | Si | `src/features/admin/components/AdminPanelPage.tsx` | medio | Tabla, modal de detalle y confirmar reembolso siguen con estado mock local. |
| `SuperadminModules` | `src/app/App.tsx:2115` | Si | `src/features/admin/components/AdminPanelPage.tsx` | medio | Contenido, catalogo, personal, monitor, inventario y cupones permanecen juntos para no romper estado interno. |
| Contenido/banners dentro de superadmin | dentro de `SuperadminModules` | Si | `src/features/admin/components/AdminPanelPage.tsx` | medio | Logo, banners, preview y formulario inline quedaron intactos. |
| Catalogo admin | dentro de `SuperadminModules` | Si | `src/features/admin/components/AdminPanelPage.tsx` | medio | Tabla, filtros, formulario de producto, nivel de control, estado y descuento quedaron intactos. |
| Inventario | `src/app/App.tsx:1966` y dentro de admin | Si | `src/features/admin/components/AdminPanelPage.tsx` | medio | `InventarioTab` se movio completo con edicion de stock por sede. |
| Personal operativo | dentro de `SuperadminModules` | Si | `src/features/admin/components/AdminPanelPage.tsx` | medio | Tabla, formulario, roles, sede y habilitar/inhabilitar quedaron intactos. |
| Cupones admin | dentro de `SuperadminModules` | Si | `src/features/admin/components/AdminPanelPage.tsx` | medio | Tabla, formulario, filtros y validacion de duplicado vigente quedaron intactos. |
| Monitor global | dentro de `SuperadminModules` | Si | `src/features/admin/components/AdminPanelPage.tsx` | medio | KPIs, filtros, tabla y totales quedaron intactos. |
| `BannerManagementPage` standalone | `src/app/App.tsx:1331` | No | Pendiente | bajo | Es una pagina separada (`page === "banners"`), no parte directa del panel admin actual. |
| Reseñas admin dedicadas | no encontrada como seccion admin separada | No | Pendiente | medio | No existe una seccion dedicada en el bloque actual; las resenas siguen ligadas a tracking/perfil. |
| Delivery/repartidor completo | `src/app/App.tsx:1448` | No | Pendiente | alto | Fuera de alcance de esta fase. |
| Notificaciones globales | `src/app/App.tsx:3926` | No | Pendiente | medio | Fuera de alcance. |

### Archivos creados

- `src/features/admin/components/AdminPanelPage.tsx`
- `src/features/admin/components/index.ts`
- `src/features/admin/sections/index.ts`
- `src/features/admin/index.ts`

### Archivos modificados

- `src/app/App.tsx`
- `src/features/index.ts`
- `docs/MODULARIZATION_TRACKER.md`
- `docs/CODEX_AUDIT.md`

### Props principales

`AdminPanel` recibe:

- `user`
- `onNav`
- `products`
- `setProducts`
- `slides`
- `setSlides`

### Estado que quedo en App.tsx

- Pantalla actual (`page`).
- Usuario y rol de sesion.
- Navegacion general.
- Productos y slides como fuentes pasadas al admin.
- `staffSede`, usado por delivery y calculado en el orquestador.

### Estado que se movio al feature admin

- Tab activo del panel admin.
- Estado de auditoria de recipes, recipe seleccionado, motivos y comentario de rechazo.
- Estado de operaciones: pedidos, filtros, orden seleccionado y PIN.
- Estado de reembolsos admin.
- Estado de contenido/banners dentro de superadmin.
- Estado de catalogo admin y formulario de producto.
- Estado de inventario por sede y modal de stock.
- Estado de personal operativo y formulario de asignacion.
- Estado de cupones admin y validacion visual de duplicado vigente.
- Estado de monitor global y filtros.

### Decisiones

- Se movio el bloque admin completo a un solo archivo grande para conservar la UI y evitar partir tabs/modales interdependientes antes de una validacion visual mas fina.
- No se crearon secciones separadas todavia porque `SuperadminModules` comparte estado local entre catalogo, inventario, contenido, personal, monitor y cupones.
- Los getters legacy admin ahora viven dentro del feature admin.
- `App.tsx` solo importa `AdminPanel` y sigue pasandole datos.
- No se implemento persistencia real, backend, Supabase, API ni `fetch`.

### Verificacion

- `pnpm build`: exitoso.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.
- `App.tsx` paso de 4288 lineas a 2321 lineas.

### Pendiente recomendado

1. Dividir `AdminPanelPage.tsx` por secciones (`AdminAuditSection`, `AdminOperationsSection`, `AdminRefundsSection`, `AdminCatalogSection`, `AdminInventorySection`, `AdminStaffSection`, `AdminCouponsSection`, `AdminMonitorSection`) con comparacion visual.
2. Extraer `BannerManagementPage` standalone si se decide integrarlo al feature admin o mantenerlo como feature de contenido.
3. Crear una seccion de resenas admin si el prototipo final la requiere visualmente.
4. Modularizar delivery/repartidor completo y notificaciones globales en la ultima tanda.
