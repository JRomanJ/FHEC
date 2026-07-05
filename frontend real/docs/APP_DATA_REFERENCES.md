# APP_DATA_REFERENCES - Farmahumana / FHEC

Este documento mapea los datos locales encontrados en `src/app/App.tsx`. La Fase 5 agrego adaptadores visuales exactos para productos y cupones, y conecto solo referencias de bajo riesgo.

## Resumen

| Dato local | Ubicacion aproximada | Reemplazado | Fuente nueva | Riesgo | Nota |
|---|---:|---|---|---|---|
| `DEFAULT_SLIDES` | `src/app/App.tsx:107` | Si | `bannerService.getBannersLegacy()` | bajo | Mantiene titulo, subtitulo, etiqueta, imagen, CTA y paleta legacy. |
| `CATS` | `src/app/App.tsx:109` | Si | `categoryService.getCategoriasParaFiltro()` | bajo | Mantiene nombres, contadores, emoji y colores usados por home/filtros. |
| `SEDES_LIST` | `src/app/App.tsx:664` | Si | `sedeService.getSedesListLegacy()` | bajo | Mantiene slugs, nombres cortos, ciudad y direccion corta del selector. |
| `SEDES` | `src/app/App.tsx:2415` | Si | `sedeService.getSedesLegacy()` | bajo | Mantiene nombre, direccion, horario y URL de mapas del checkout. |
| `PRODUCTS` | `src/app/App.tsx:105` | Si | `productService.getAppProductViewModels()` | bajo | Reemplaza el array inline por un view model con el mismo shape visual. |
| `DISCOUNT_CODES` | `src/app/App.tsx:2416` | Si | `couponService.getCouponApplyCodeMap()` | bajo | Mantiene exactamente `FHEC10`, `SALUD15`, `BIENVENIDO`, `FHEC2024`. |
| `coupons` admin | `src/app/App.tsx:4964` | Si | `couponService.getLegacyAdminCouponViewModels()` | bajo | Mantiene codigos, fechas, descuentos y usuario exclusivo actuales. |
| `USER_COUPONS` | `src/app/App.tsx:6830` | Si | `couponService.getLegacyProfileCouponViewModels()` | bajo | Mantiene estados visuales `vigente`, `usado`, `vencido`. |
| `BRAND_SYNONYMS` | `src/app/App.tsx:38` | No | `productService` / `src/data/mockProductos.ts` | bajo | Ya existe centralizado, pero no se toco para limitar cambios en busqueda. |
| `FREQUENTLY_BOUGHT_TOGETHER` | `src/app/App.tsx:63` | No | `productService.getProductosFrecuentes()` | medio | Aun no se usa en la UI; migrarlo debe validarse con detalle de producto. |
| `DEMO_ACCOUNTS` | `src/app/App.tsx:75` | No | `authService` / `userService` | medio | Login mock depende de estado local; migrar en fase de autenticacion mock. |
| `VE_AREAS` | `src/app/App.tsx:2326` | No | `src/domain/constants.ts` | bajo | Valores coinciden; puede migrarse junto con formularios. |
| `DOC_TYPES` | `src/app/App.tsx:2327` | No | `src/domain/constants.ts` | medio | App usa `G`; dominio usa `RIF`. Cambiarlo alteraria opciones visibles. |
| `VE_BANKS` | `src/app/App.tsx:2330` | No | `src/domain/constants.ts` | bajo | Migracion segura cuando se normalicen formularios de pago/reembolso. |
| `COMPLETED_TRIPS_DEMO` | `src/app/App.tsx:3538` | No | `deliveryService` | alto | Forma visual de delivery no esta alineada aun con pedidos/entregas centralizadas. |
| `ALL_ORDERS` | `src/app/App.tsx:3566` | No | `deliveryService` | alto | Debe migrarse junto con asignacion de repartidor y estados visibles. |
| `DEMO_GLOBAL_ORDERS` | `src/app/App.tsx:4714` | No | `adminService.getMonitorGlobalPedidos()` | alto | El monitor admin usa campos visuales mas ricos que el adapter actual. |
| `STATUS_COLORS` | `src/app/App.tsx:4725` | No | `adminService.getStatusColorsAdmin()` | bajo | Ya esta centralizado; puede moverse con monitor admin. |
| `ROLE_OPTIONS` | `src/app/App.tsx:4936` | No | `personal_operativo` / `domain` | bajo | Migracion segura si se conserva casing visual actual. |
| `DEMO_RECIPES` | `src/app/App.tsx:5892` | No | `recipeService` / `productViewModels` | alto | Incluye imagenes y estructura especifica del panel admin. |
| `DEMO_ADMIN_ORDERS` | `src/app/App.tsx:5898` | No | `adminService` / `orderService` | alto | Debe migrarse con operaciones admin completas. |
| `USER_SEDE_MAP` | `src/app/App.tsx:5922` | No | `sedeService` / `userService` | medio | Relacion usuario-sede aun es visual/local en admin. |
| `DEMO_REFUNDS` | `src/app/App.tsx:5939` | No | `refundService` | alto | La tabla visual tiene campos resumidos; requiere adapter dedicado. |
| `DEMO_ORDERS` | `src/app/App.tsx:6707` | No | `profileService.getHistorialPedidosUsuario()` | medio | El perfil usa formato resumido; migrar con pruebas de historial. |
| `DEMO_CONTACT` | `src/app/App.tsx:6718` | No | `profileService.getPerfilUsuario()` | medio | Debe migrarse junto con formularios de perfil. |
| `VENEZUELA_BANKS` | `src/app/App.tsx:6867` | No | `src/domain/constants.ts` | bajo | Migrable con reembolso/perfil. |
| `NOTIF_DATA` | `src/app/App.tsx:7715` | No | `notificationService` | medio | Fuente central tiene una notificacion adicional; conectar directo cambiaria cantidad visible. |
| `STAFF_SEDES` | `src/app/App.tsx:7961` | No | `sedeService` / `userService` | medio | Esta atado a texto de staff en admin, conviene migrar con personal operativo. |

## Productos

| Referencia | Ubicacion aproximada | Pantalla/seccion | Estado | Riesgo | Nota |
|---|---:|---|---|---|---|
| `PRODUCTS` | `src/app/App.tsx:105` | Fuente base para home/catalogo/detalle/carrito/admin | Reemplazado | bajo | Ahora viene de `getAppProductViewModels()`. |
| Busqueda smart | `src/app/App.tsx:395` | Navbar/buscador | Usa `PRODUCTS` adaptado | bajo | No se cambio la logica de busqueda. |
| `HomePage.products` | `src/app/App.tsx:1042` | Productos destacados | Usa `PRODUCTS` adaptado | bajo | Conserva stock por sede y cards. |
| `CatalogPage.products` | `src/app/App.tsx:1148` | Catalogo y filtros | Usa `PRODUCTS` adaptado | bajo | Mantiene categoria, marca y forma farmaceutica. |
| `ProductDetailPage.product/products` | `src/app/App.tsx:1315` | Detalle y similares | Usa `PRODUCTS` adaptado | bajo | Similares siguen calculados por `activeIngredient` dentro de la UI. |
| `CartPage.cartItems` | `src/app/App.tsx:1549` | Carrito y stock modal | Parcial | medio | Items agregados usan productos adaptados; no se cambio flujo de carrito. |
| Similares en carrito | `src/app/App.tsx:1593` | Modal de stock insuficiente | Usa `PRODUCTS` adaptado | bajo | Mantiene criterio visual por categoria y stock. |
| Tracking fallback | `src/app/App.tsx:2831` | Mi Pedido demo | Usa `PRODUCTS` adaptado | bajo | Mantiene `PRODUCTS.slice(0, 3)`. |
| `FavoritesPage.products` | `src/app/App.tsx:3241` | Favoritos | Usa `PRODUCTS` adaptado | bajo | No se cambio estado de favoritos. |
| `catalogProducts` | `src/app/App.tsx:4916` | Superadmin catalogo/inventario | Usa `PRODUCTS` adaptado | medio | Admin conserva estado local editable. |
| `InventarioTab` | `src/app/App.tsx:5736`, `6694` | Inventario admin | Usa productos adaptados | medio | Sigue dependiente de estado local admin. |
| `AdminPanel.products` | `src/app/App.tsx:8072` | Admin general | Usa `PRODUCTS` adaptado | medio | No se migraron operaciones internas. |

## Cupones

| Referencia | Ubicacion aproximada | Pantalla/seccion | Estado | Riesgo | Nota |
|---|---:|---|---|---|---|
| `DISCOUNT_CODES` | `src/app/App.tsx:2416` | Carrito y seleccion de entrega | Reemplazado | bajo | Mapa exacto desde `getCouponApplyCodeMap()`. |
| `CartPage.applyDiscount` | `src/app/App.tsx:1574` | Aplicar descuento en carrito | Usa mapa adaptado | bajo | No se cambio texto de exito/error. |
| `DeliverySelectPage.applyDiscount` | `src/app/App.tsx:1944` | Aplicar descuento antes de checkout | Usa mapa adaptado | bajo | No se cambio calculo de totales. |
| `coupons` admin | `src/app/App.tsx:4964` | Superadmin cupones | Reemplazado | bajo | Lista exacta desde `getLegacyAdminCouponViewModels()`. |
| Duplicado vigente admin | `src/app/App.tsx:4991` | Validacion visual admin | Sin cambio funcional | medio | Sigue usando validacion local sobre estado editable. |
| `USER_COUPONS` | `src/app/App.tsx:6830` | Perfil, Mis Cupones | Reemplazado | bajo | Lista exacta desde `getLegacyProfileCouponViewModels()`. |

## Pendiente recomendado

1. Migrar `BRAND_SYNONYMS` y `FREQUENTLY_BOUGHT_TOGETHER` cuando se extraiga busqueda/detalle de producto.
2. Crear adapters exactos para `DEMO_RECIPES`, `DEMO_ADMIN_ORDERS`, delivery y reembolsos antes de conectarlos.
3. Migrar formularios (`VE_AREAS`, `VE_BANKS`) por constantes compartidas, dejando `DOC_TYPES` pendiente hasta resolver `G` vs `RIF`.
4. Mantener `App.tsx` sin modularizacion amplia hasta tener pruebas visuales o una fase dedicada.
