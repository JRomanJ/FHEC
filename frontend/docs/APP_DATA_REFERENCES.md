# APP_DATA_REFERENCES - Farmahumana / FHEC

Este documento mapea los datos locales encontrados en `src/app/App.tsx`. Las fases 5 y 6 agregaron adaptadores visuales exactos y conectaron solo referencias de bajo riesgo, manteniendo el prototipo visual aprobado.

## Resumen

| Dato local | Ubicacion aproximada | Reemplazado | Fuente nueva | Riesgo | Nota |
|---|---:|---|---|---|---|
| `PRODUCTS` | `src/app/App.tsx:111` | Si | `productService.getAppProductViewModels()` | bajo | Mantiene el mismo shape visual de producto para home, catalogo, detalle, carrito y admin. |
| `DEFAULT_SLIDES` | `src/app/App.tsx:113` | Si | `bannerService.getBannersLegacy()` | bajo | Mantiene titulo, subtitulo, etiqueta, imagen, CTA y paleta legacy. |
| `CATS` | `src/app/App.tsx:115` | Si | `categoryService.getCategoriasParaFiltro()` | bajo | Mantiene nombres, contadores, emoji y colores usados por home/filtros. |
| `SEDES_LIST` | `src/app/App.tsx:670` | Si | `sedeService.getSedesListLegacy()` | bajo | Mantiene slugs, nombres cortos, ciudad y direccion corta del selector. |
| `SEDES` | `src/app/App.tsx:2421` | Si | `sedeService.getSedesLegacy()` | bajo | Mantiene nombre, direccion, horario y URL de mapas del checkout. |
| `DISCOUNT_CODES` | `src/app/App.tsx:2422` | Si | `couponService.getCouponApplyCodeMap()` | bajo | Mantiene exactamente `FHEC10`, `SALUD15`, `BIENVENIDO`, `FHEC2024`. |
| `coupons` admin | `src/app/App.tsx:4964` | Si | `couponService.getLegacyAdminCouponViewModels()` | bajo | Mantiene codigos, fechas, descuentos y usuario exclusivo actuales. |
| `USER_COUPONS` | `src/app/App.tsx:6765` | Si | `couponService.getLegacyProfileCouponViewModels()` | bajo | Mantiene estados visuales `vigente`, `usado`, `vencido`. |
| `COMPLETED_TRIPS_DEMO` | `src/app/App.tsx:3544` | Si | `deliveryService.getLegacyDeliveryCompletedTripViewModels()` | bajo | Mantiene viajes completados, sedes, fechas y costos de delivery. |
| `ALL_ORDERS` | `src/app/App.tsx:3565` | Si | `deliveryService.getLegacyDeliveryAvailableOrderViewModels()` | bajo | Mantiene pedidos disponibles, PIN, distancia, productos y notas. |
| `DEMO_GLOBAL_ORDERS` | `src/app/App.tsx:4691` | Si | `orderService.getLegacyAdminMonitorOrderViewModels()` | bajo | Mantiene monitor global, referencias de pago, responsables y costos de envio. |
| `DEMO_RECIPES` | `src/app/App.tsx:5860` | Si | `recipeService.getLegacyRecipeAuditViewModels()` | bajo | Mantiene imagenes de recipe, producto, cliente, concentracion y estado visual. |
| `DEMO_ADMIN_ORDERS` | `src/app/App.tsx:5862` | Si | `orderService.getLegacyAdminOrderViewModels()` | bajo | Mantiene operaciones admin, estado, sede, totales y productos. |
| `DEMO_REFUNDS` | `src/app/App.tsx:5898` | Si | `refundService.getLegacyAdminRefundViewModels()` | bajo | Mantiene tabla admin de reembolsos y campos del modal. |
| `DEMO_ORDERS` | `src/app/App.tsx:6650` | Si | `orderService.getLegacyOrderHistoryViewModels()` | bajo | Mantiene historial de pedidos del perfil, paginado y totales visibles. |
| `refundRequests` inicial | `src/app/App.tsx:6833` | Si | `refundService.getLegacyProfileRefundViewModels()` | bajo | Mantiene reembolsos del perfil y permite que el formulario siga agregando solicitudes locales. |
| `NOTIF_DATA` | `src/app/App.tsx:7642` | Si | `notificationService.getLegacyNotificationViewModels()` | bajo | Mantiene cantidad, iconos, textos, tiempos relativos y leido/no leido. |
| `BRAND_SYNONYMS` | `src/app/App.tsx:44` | No | `productService` / `src/data/mockProductos.ts` | bajo | Ya existe centralizado, pero no se toco para limitar cambios en busqueda. |
| `FREQUENTLY_BOUGHT_TOGETHER` | `src/app/App.tsx:73` | No | `productService` futuro | medio | Se usa en detalle de producto; migrar con validacion visual de recomendados. |
| `DEMO_ACCOUNTS` | `src/app/App.tsx:85` | No | `authService` / `userService` | medio | Login mock depende de estado local; migrar en fase de autenticacion mock. |
| `VE_AREAS` | `src/app/App.tsx:2332` | No | `src/domain/constants.ts` | bajo | Valores coinciden; puede migrarse junto con formularios. |
| `DOC_TYPES` | `src/app/App.tsx:2333` | No | `src/domain/constants.ts` | medio | App usa `G`; dominio usa `RIF`. Cambiarlo alteraria opciones visibles. |
| `VE_BANKS` | `src/app/App.tsx:2336` | No | `src/domain/constants.ts` | bajo | Migracion segura cuando se normalicen formularios de pago/reembolso. |
| `STATUS_COLORS` | `src/app/App.tsx:4704` | No | `adminService.getStatusColorsAdmin()` | bajo | Ya esta centralizado; puede moverse con monitor admin. |
| `ROLE_OPTIONS` | `src/app/App.tsx:4904` | No | `personal_operativo` / `domain` | bajo | Migracion segura si se conserva casing visual actual. |
| `USER_SEDE_MAP` | `src/app/App.tsx:5881` | No | `sedeService` / `userService` | medio | Relacion usuario-sede aun es visual/local en admin. |
| `DEMO_CONTACT` | `src/app/App.tsx:6660` | No | `profileService.getPerfilUsuario()` | medio | Debe migrarse junto con formularios de perfil. |
| `VENEZUELA_BANKS` | `src/app/App.tsx:6794` | No | `src/domain/constants.ts` | bajo | Migrable con reembolso/perfil. |
| `STAFF_SEDES` | `src/app/App.tsx:7881` | No | `sedeService` / `userService` | medio | Esta atado a texto de staff en admin, conviene migrar con personal operativo. |

## Operacionales

| Referencia | Pantalla/seccion | Estado | Riesgo | Nota |
|---|---|---|---|---|
| `COMPLETED_TRIPS_DEMO` | Delivery, viajes completados | Reemplazado | bajo | `getLegacyDeliveryCompletedTripViewModels()` devuelve la lista exacta y clones. |
| `ALL_ORDERS` | Delivery, pedidos disponibles/asignados | Reemplazado | bajo | `getLegacyDeliveryAvailableOrderViewModels()` preserva PIN, distancia y productos. |
| `DEMO_GLOBAL_ORDERS` | Superadmin, monitor global | Reemplazado | bajo | `getLegacyAdminMonitorOrderViewModels()` preserva columnas y textos de estado. |
| `DEMO_RECIPES` | Admin auditor, auditoria de recipes | Reemplazado | bajo | `getLegacyRecipeAuditViewModels()` preserva imagenes y shape del modal. |
| `DEMO_ADMIN_ORDERS` | Admin auxiliar, operaciones | Reemplazado | bajo | `getLegacyAdminOrderViewModels()` preserva campos usados por tabla y modal. |
| `DEMO_REFUNDS` | Admin superadmin, reembolsos | Reemplazado | bajo | `getLegacyAdminRefundViewModels()` preserva campos de pago y reembolso. |
| `DEMO_ORDERS` | Perfil, historial de pedidos | Reemplazado | bajo | `getLegacyOrderHistoryViewModels()` preserva paginado, productos y totales. |
| `refundRequests` inicial | Perfil, solicitudes de reembolso | Reemplazado | bajo | `getLegacyProfileRefundViewModels()` preserva estados visuales del perfil. |
| `NOTIF_DATA` | Dropdown/navbar y pagina notificaciones | Reemplazado | bajo | `getLegacyNotificationViewModels()` conserva iconos y tiempos relativos. |

## Productos

| Referencia | Ubicacion aproximada | Pantalla/seccion | Estado | Riesgo | Nota |
|---|---:|---|---|---|---|
| `PRODUCTS` | `src/app/App.tsx:111` | Fuente base para home/catalogo/detalle/carrito/admin | Reemplazado | bajo | Ahora viene de `getAppProductViewModels()`. |
| Busqueda smart | `src/app/App.tsx:395` | Navbar/buscador | Usa `PRODUCTS` adaptado | bajo | No se cambio la logica de busqueda. |
| `HomePage.products` | `src/app/App.tsx:1042` | Productos destacados | Usa `PRODUCTS` adaptado | bajo | Conserva stock por sede y cards. |
| `CatalogPage.products` | `src/app/App.tsx:1148` | Catalogo y filtros | Usa `PRODUCTS` adaptado | bajo | Mantiene categoria, marca y forma farmaceutica. |
| `ProductDetailPage.product/products` | `src/app/App.tsx:1315` | Detalle y similares | Usa `PRODUCTS` adaptado | bajo | Similares siguen calculados por `activeIngredient` dentro de la UI. |
| `CartPage.cartItems` | `src/app/App.tsx:1549` | Carrito y stock modal | Parcial | medio | Items agregados usan productos adaptados; no se cambio flujo de carrito. |
| Tracking fallback | `src/app/App.tsx:2837` | Mi Pedido demo | Usa `PRODUCTS` adaptado | bajo | Mantiene `PRODUCTS.slice(0, 3)`. |
| `catalogProducts` | `src/app/App.tsx:4884` | Superadmin catalogo/inventario | Usa productos adaptados | medio | Admin conserva estado local editable. |

## Cupones

| Referencia | Ubicacion aproximada | Pantalla/seccion | Estado | Riesgo | Nota |
|---|---:|---|---|---|---|
| `DISCOUNT_CODES` | `src/app/App.tsx:2422` | Carrito y seleccion de entrega | Reemplazado | bajo | Mapa exacto desde `getCouponApplyCodeMap()`. |
| `CartPage.applyDiscount` | `src/app/App.tsx:1574` | Aplicar descuento en carrito | Usa mapa adaptado | bajo | No se cambio texto de exito/error. |
| `DeliverySelectPage.applyDiscount` | `src/app/App.tsx:1944` | Aplicar descuento antes de checkout | Usa mapa adaptado | bajo | No se cambio calculo de totales. |
| `coupons` admin | `src/app/App.tsx:4964` | Superadmin cupones | Reemplazado | bajo | Lista exacta desde `getLegacyAdminCouponViewModels()`. |
| Duplicado vigente admin | `src/app/App.tsx:4991` | Validacion visual admin | Sin cambio funcional | medio | Sigue usando validacion local sobre estado editable. |
| `USER_COUPONS` | `src/app/App.tsx:6765` | Perfil, Mis Cupones | Reemplazado | bajo | Lista exacta desde `getLegacyProfileCouponViewModels()`. |

## Pendiente recomendado

1. Migrar constantes de formularios (`VE_AREAS`, `VE_BANKS`, `VENEZUELA_BANKS`) por constantes compartidas, manteniendo `DOC_TYPES` pendiente hasta resolver `G` vs `RIF`.
2. Migrar `BRAND_SYNONYMS` y `FREQUENTLY_BOUGHT_TOGETHER` cuando se extraiga busqueda/detalle de producto.
3. Migrar `DEMO_ACCOUNTS`, `DEMO_CONTACT`, `USER_SEDE_MAP` y `STAFF_SEDES` junto con auth/profile/personal operativo.
4. Mantener `App.tsx` sin modularizacion amplia hasta una fase dedicada con extraccion por features.
