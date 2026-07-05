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

## Fase 11 - Modularizacion final y preparacion de limpieza

Esta fase extrajo las ultimas zonas grandes desde `src/app/App.tsx` sin cambiar UI: layout global, navbar/footer, notificaciones, delivery, tracking/reseña, favoritos, banners standalone y un formulario legacy de reembolso. Tambien se creo el inventario de limpieza para la fase 12.

### Estado inicial de la fase

- `git status --short`: limpio antes de editar.
- `App.tsx`: 2321 lineas al iniciar la fase.
- `AdminPanelPage.tsx`: 2001 lineas; se reviso pero no se dividio internamente por riesgo de tocar tabs y estado compartido.

### Secciones extraidas

| Seccion | Ubicacion aproximada anterior | Extraida | Nuevo archivo destino | Riesgo | Notas |
|---|---:|---|---|---|---|
| Navbar y barras de navegacion | `src/app/App.tsx:124-626` | Si | `src/components/layout/AppLayout.tsx` | medio | Incluye `NavDropdown`, `CatNavButton`, `SedeSelector`, `MobileUserMenu`, `Navbar` y `MenuBtn`. |
| Footer | `src/app/App.tsx:2064` | Si | `src/components/layout/AppLayout.tsx` | bajo | Se preservaron columnas, redes, metodos de pago y categorias. |
| Tracking / Mi Pedido / reseña | `src/app/App.tsx:731` | Si | `src/features/orders/components/TrackingPage.tsx` | medio | Incluye timeline, PIN, demo controls, receta rechazada, resumen y reseña. |
| Favorites | `src/app/App.tsx:1247` | Si | `src/features/favorites/components/FavoritesPage.tsx` | bajo | Se movio porque seguia como pagina grande standalone. |
| Gestion de banners standalone | `src/app/App.tsx:1326` | Si | `src/features/admin/components/BannerManagementPage.tsx` | bajo | Se mantiene como pantalla standalone `page === "banners"`. |
| Delivery / repartidor | `src/app/App.tsx:1443` | Si | `src/features/delivery/components/DeliveryPanelPage.tsx` | medio | Incluye tabs, pedidos disponibles, mis viajes, viajes completados, PIN y limite de 3 viajes. |
| Notificaciones globales | `src/app/App.tsx:1959` | Si | `src/features/notifications/components/NotificationsPage.tsx` | bajo | Se movio la pagina completa y el estado sigue en `App.tsx`. |
| Formulario legacy de reembolso | `src/app/App.tsx:648` | Si | `src/features/refunds/components/RefundForm.tsx` | medio | No esta conectado a una ruta activa; queda documentado como candidato para decidir en fase 12. |
| `AdminPanelPage.tsx` interno | `src/features/admin/components/AdminPanelPage.tsx` | No | Pendiente | medio | No se dividio porque la separacion de secciones requiere validar estado compartido y modales. |
| Modales globales genericos | varias zonas | No | Pendiente | medio | Los modales estan embebidos en features y no se abstrajeron para no cambiar overlays. |

### Archivos creados

- `src/components/layout/AppLayout.tsx`
- `src/components/layout/index.ts`
- `src/features/delivery/components/DeliveryPanelPage.tsx`
- `src/features/delivery/components/index.ts`
- `src/features/delivery/index.ts`
- `src/features/favorites/components/FavoritesPage.tsx`
- `src/features/favorites/components/index.ts`
- `src/features/favorites/index.ts`
- `src/features/notifications/components/NotificationsPage.tsx`
- `src/features/notifications/components/index.ts`
- `src/features/notifications/index.ts`
- `src/features/orders/components/TrackingPage.tsx`
- `src/features/orders/components/index.ts`
- `src/features/orders/index.ts`
- `src/features/refunds/components/RefundForm.tsx`
- `src/features/refunds/components/index.ts`
- `src/features/refunds/index.ts`
- `src/features/admin/components/BannerManagementPage.tsx`
- `docs/CLEANUP_CANDIDATES.md`

### Archivos modificados

- `src/app/App.tsx`
- `src/features/index.ts`
- `src/features/admin/components/index.ts`
- `docs/MODULARIZATION_TRACKER.md`
- `docs/CODEX_AUDIT.md`

### Props principales

`Navbar` recibe:

- `cartCount`, `onNav`, `page`, `searchQuery`, `setSearchQuery`
- `user`, `onLogout`, `onCategorySelect`
- `cartItems`, `onUpdateCartQuantity`, `onRemoveFromCart`
- `hasActiveOrder`, `appNotifs`, `setAppNotifs`
- `selectedSede`, `onSedeChange`, `products`, `categories`, `brandSynonyms`

`TrackingPage` recibe:

- `onNav`
- `orderItems`
- `deliveryMode`
- `discountPct`
- `onOrderComplete`

`DeliveryPanel` recibe:

- `onNav`
- `userSede`

`NotificationsPage` recibe:

- `onNav`
- `notifs`
- `setNotifs`

### Estado que quedo en App.tsx

- Pantalla actual (`page`).
- Sesion/rol (`user`).
- Carrito, cantidades, pedido activo y cupon aplicado.
- Producto seleccionado, favoritos y busqueda.
- Sede visual, sede de checkout, modo de entrega y direccion.
- Slides de banners.
- Notificaciones globales compartidas entre navbar y pagina.
- Navegacion general y callbacks hacia features.

### Estado que se movio con los features

- Estado interno de navbar: dropdowns, carrito rapido, notificaciones rapidas y menu movil.
- Estado interno de tracking: demo controls, timer, PIN, receta rechazada y reseña.
- Estado interno de delivery: tabs, sede, PIN, pedidos asignados, filtros de viajes y modales.
- Estado interno de notificaciones: notificacion seleccionada y detalle.
- Estado interno de banners standalone: edicion y draft.
- Estado interno del formulario legacy de reembolso.

### Decisiones

- `App.tsx` quedo como orquestador final y no se introdujo router ni state management externo.
- `AdminPanelPage.tsx` no se dividio internamente porque aun concentra estado compartido entre tabs, modales y secciones admin.
- Los modales se mantuvieron dentro de sus features para evitar cambios de overlay o layout.
- `RefundForm` se extrajo pero no se conecto, porque no estaba renderizado en el flujo activo.
- Se creo `docs/CLEANUP_CANDIDATES.md` en vez de borrar archivos legacy.

### Verificacion

- `pnpm build`: exitoso.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.
- `App.tsx` paso de 2321 lineas a 287 lineas.

### Pendiente recomendado para fase 12

1. Revisar y borrar duplicados confirmados en `src/app/components/*`.
2. Eliminar helpers inline no usados de `src/app/App.tsx`.
3. Revisar assets no importados de `src/imports`.
4. Decidir si `RefundForm` se conserva, se conecta o se elimina.
5. No borrar `src/app/components/ui/*`, `src/app/data.ts` ni `src/app/types.ts` sin una validacion especifica.

## Fase 12 - Limpieza exhaustiva

- `git status --short`: limpio antes de iniciar la fase.
- Build inicial: `pnpm build` exitoso.
- `App.tsx`: 287 lineas al iniciar la fase, 192 lineas al finalizar.
- `AdminPanelPage.tsx`: 2001 lineas; no se dividio internamente en esta fase.
- Reporte detallado: `docs/CLEANUP_REPORT.md`.

### Residuos eliminados

| Residuo | Ubicacion | Eliminado | Riesgo | Nota |
|---|---|---|---|---|
| Pantallas legacy duplicadas | `src/app/components/*.tsx` | Si | bajo-medio | Las versiones activas viven en `src/features` y `src/components`. |
| Helper Figma legacy | `src/app/components/figma/ImageWithFallback.tsx` | Si | bajo | Solo sostenia pantallas legacy eliminadas. |
| Puente legacy | `src/app/shared.ts` | Si | bajo | Solo era usado por componentes legacy eliminados. |
| Feature de reembolso no conectado | `src/features/refunds/*` | Si | medio | No tenia ruta activa ni imports reales; se elimino el export del barrel. |
| Assets no referenciados | `src/imports/Captura_de_pantalla_*.png`, `IMG_238*.PNG`, `WhatsApp_Image_*.jpeg`, `image*.png` | Si | medio | Sin imports, rutas ni aparicion en build. |
| Notas historicas dentro de `src` | `src/imports/pasted_text/*.md` | Movido | bajo | Se movieron a `docs/archive`. |
| Dependencias no usadas | `package.json`, `pnpm-lock.yaml` | Si | medio | Se quitaron 13 dependencias sin imports activos. |
| Helpers/tipos/mocks inline | `src/app/App.tsx` | Si | bajo | Se importan desde `src/app/data.ts` y `src/app/types.ts`. |

### Conservado deliberadamente

| Ruta | Motivo |
|---|---|
| `src/app/components/ui/*` | UI base shadcn/Radix; no se borra sin decision especifica archivo por archivo. |
| `src/app/data.ts` | Puente activo para features visuales y getters legacy. |
| `src/app/types.ts` | Tipos UI legacy activos; no se fusionaron con dominio DB. |
| `src/domain/*` | Contratos de dominio alineados con DB final. |
| `src/data/*` | Fuente mock central. |
| `src/services/*` | Capa mock/API futura. |
| `src/viewModels/*` | Adaptadores visuales activos. |

### Pendientes posteriores

1. Dividir `src/features/admin/components/AdminPanelPage.tsx` por secciones administrativas.
2. Dividir `src/components/layout/AppLayout.tsx` en navbar, barra secundaria, menus y footer.
3. Dividir `src/features/orders/components/TrackingPage.tsx` en timeline, resumen y reseña.
4. Dividir `src/features/delivery/components/DeliveryPanelPage.tsx` en dashboard, tabs, cards y modales.
5. Evaluar code splitting por feature para resolver el warning de chunk JS mayor a 500 kB.
6. Mantener validacion visual antes de cualquier limpieza adicional en componentes UI base.

### Verificacion

- `pnpm build`: exitoso al final de la fase.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.
- No se modifico `backend`, no se modifico `frontend` de pruebas y no se implemento API real.

## Fase 13 - Division interna de modulos grandes

Esta fase dividio archivos grandes restantes mediante extraccion mecanica de JSX, sin cambiar UI ni comportamiento visual.

### Baseline

- `git status --short`: limpio antes de editar.
- Build inicial: `pnpm build` exitoso.
- `App.tsx`: 192 lineas; no se modifico.
- `AdminPanelPage.tsx`: 2001 lineas.
- `AppLayout.tsx`: 638 lineas.
- `TrackingPage.tsx`: 532 lineas.
- `DeliveryPanelPage.tsx`: 522 lineas.

### Secciones divididas

| Seccion | Ubicacion anterior | Extraida | Nuevo archivo destino | Riesgo | Notas |
|---|---|---|---|---|---|
| Modulos superadmin | `src/features/admin/components/AdminPanelPage.tsx` | Si | `src/features/admin/sections/SuperadminModules.tsx` | medio | Se movio el bloque administrativo grande sin cambiar tabs ni estado compartido. |
| Inventario admin | `AdminPanelPage.tsx` | Si | `src/features/admin/sections/SuperadminModules.tsx` | medio | Sigue agrupado dentro del modulo superadmin para evitar dividir estado antes de validacion visual. |
| Footer global | `src/components/layout/AppLayout.tsx` | Si | `src/components/layout/Footer.tsx` | bajo | Se preservaron columnas, categorias, redes y metodos de pago. |
| Selector de sede | `src/components/layout/AppLayout.tsx` | Si | `src/components/layout/SedeSelector.tsx` | bajo | Mantiene las mismas opciones y callbacks. |
| Dropdown de categorias | `src/components/layout/AppLayout.tsx` | Si | `src/components/layout/CategoryDropdown.tsx` | bajo | Mantiene el mismo `CatNavButton` y comportamiento visual. |
| Menu movil de usuario | `src/components/layout/AppLayout.tsx` | Si | `src/components/layout/MobileUserMenu.tsx` | medio | Se preservaron accesos, badges y callbacks. |
| Helpers visuales de layout | `src/components/layout/AppLayout.tsx` | Si | `src/components/layout/layoutShared.ts` | bajo | Solo mueve constantes y calculos usados por layout. |
| PIN de tracking | `src/features/orders/components/TrackingPage.tsx` | Si | `src/features/orders/components/OrderPinCard.tsx` | bajo | Sin cambios de PIN ni condicion visual. |
| Resumen de items | `src/features/orders/components/TrackingPage.tsx` | Si | `src/features/orders/components/OrderItemsSummary.tsx` | bajo | Mantiene productos, totales, descuento, delivery y formato. |
| Timeline de pedido | `src/features/orders/components/TrackingPage.tsx` | Si | `src/features/orders/components/OrderTrackingTimeline.tsx` | medio | Mantiene mobile/desktop timeline y estados. |
| Formulario de resena | `src/features/orders/components/TrackingPage.tsx` | Si | `src/features/orders/components/OrderReviewForm.tsx` | bajo | Mantiene rating, textarea y botones. |
| Modales/feedback de tracking | `src/features/orders/components/TrackingPage.tsx` | Si | `src/features/orders/components/TrackingFeedbackModals.tsx` | bajo | Mantiene pedido cancelado, header y popup de gracias. |
| Modales delivery | `src/features/delivery/components/DeliveryPanelPage.tsx` | Si | `DeliveryPinModal.tsx`, `DeliveryMaxTripsModal.tsx` | bajo | Mantiene overlay, PIN demo y modal de limite de 3 pedidos. |
| Header/tabs delivery | `src/features/delivery/components/DeliveryPanelPage.tsx` | Si | `DeliveryHeader.tsx`, `DeliveryTabs.tsx` | bajo | Mantiene secciones y navegacion interna. |
| Pedidos disponibles delivery | `src/features/delivery/components/DeliveryPanelPage.tsx` | Si | `DeliveryAvailableOrders.tsx` | medio | Mantiene filtro por sede, expansion, mapa y asignacion visual. |
| Viajes completados delivery | `src/features/delivery/components/DeliveryPanelPage.tsx` | Si | `DeliveryCompletedTrips.tsx` | bajo | Mantiene filtros, tabla y total acumulado. |
| Viajes asignados delivery | `src/features/delivery/components/DeliveryPanelPage.tsx` | Si | `DeliveryAssignedOrders.tsx` | medio | Mantiene cards, llamada, WhatsApp, mapa y confirmacion por PIN. |

### Estado que quedo en padres

- `AdminPanelPage.tsx`: estado administrativo compartido, tab activa, modales y callbacks.
- `AppLayout.tsx`: estado de dropdowns/navbar, props globales desde `App.tsx` y callbacks de navegacion.
- `TrackingPage.tsx`: estado de demo, timer, PIN visible, receta rechazada, rating, comentario y popup.
- `DeliveryPanelPage.tsx`: tabs, sede seleccionada, PIN, pedido seleccionado, viajes asignados, orden expandida y filtros de viajes completados.

### Estado movido

- No se movio estado compartido relevante.
- Solo se movieron constantes/helper visuales de bajo riesgo hacia `layoutShared.ts`, `trackingShared.ts` y `deliveryShared.ts`.

### Archivos creados

- `src/features/admin/sections/SuperadminModules.tsx`
- `src/components/layout/CategoryDropdown.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/MobileUserMenu.tsx`
- `src/components/layout/SedeSelector.tsx`
- `src/components/layout/layoutShared.ts`
- `src/features/orders/components/OrderItemsSummary.tsx`
- `src/features/orders/components/OrderPinCard.tsx`
- `src/features/orders/components/OrderReviewForm.tsx`
- `src/features/orders/components/OrderTrackingTimeline.tsx`
- `src/features/orders/components/TrackingFeedbackModals.tsx`
- `src/features/orders/components/trackingShared.ts`
- `src/features/delivery/components/DeliveryAssignedOrders.tsx`
- `src/features/delivery/components/DeliveryAvailableOrders.tsx`
- `src/features/delivery/components/DeliveryCompletedTrips.tsx`
- `src/features/delivery/components/DeliveryHeader.tsx`
- `src/features/delivery/components/DeliveryMaxTripsModal.tsx`
- `src/features/delivery/components/DeliveryPinModal.tsx`
- `src/features/delivery/components/DeliveryTabs.tsx`
- `src/features/delivery/components/deliveryShared.ts`

### Lineas despues de la fase

- `AdminPanelPage.tsx`: 831 lineas.
- `SuperadminModules.tsx`: 1193 lineas.
- `AppLayout.tsx`: 285 lineas.
- `TrackingPage.tsx`: 354 lineas.
- `DeliveryPanelPage.tsx`: 126 lineas.
- `App.tsx`: 192 lineas, sin cambios.

### Verificacion

- Build inicial: exitoso.
- Build intermedio despues de admin: exitoso.
- Build intermedio despues de layout: exitoso.
- Build intermedio despues de tracking: exitoso.
- Build final despues de delivery: exitoso.
- `pnpm dev --host 127.0.0.1`: el sandbox bloqueo el puerto con `listen EPERM`; con permiso local Vite respondio `HTTP/1.1 200 OK` en `http://127.0.0.1:5174/`.

### Pendiente recomendado para fase 14

1. Revisar `src/features/admin/sections/SuperadminModules.tsx`, que sigue siendo grande.
2. Revisar props redundantes generadas por la division mecanica.
3. Revisar exports internos que no se necesiten fuera de cada feature.
4. Evaluar code splitting por feature en una fase especifica, porque el warning de chunk JS mayor a 500 kB persiste.
