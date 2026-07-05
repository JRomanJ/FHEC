# APP_DATA_REFERENCES - Farmahumana / FHEC

Este documento mapea los datos locales encontrados en `src/app/App.tsx` durante la Fase 4. La migracion se hizo de forma conservadora: solo se conectaron constantes cuyo adapter mantiene los mismos valores visibles.

| Dato local | Ubicacion aproximada | Reemplazado | Fuente nueva | Riesgo | Nota |
|---|---:|---|---|---|---|
| `DEFAULT_SLIDES` | `src/app/App.tsx:121` | Si | `bannerService.getBannersLegacy()` | bajo | Mantiene titulo, subtitulo, etiqueta, imagen, CTA y paleta legacy. |
| `CATS` | `src/app/App.tsx:123` | Si | `categoryService.getCategoriasParaFiltro()` | bajo | Mantiene nombres, contadores, emoji y colores usados por home/filtros. |
| `SEDES_LIST` | `src/app/App.tsx:678` | Si | `sedeService.getSedesListLegacy()` | bajo | Mantiene slugs, nombres cortos, ciudad y direccion corta del selector. |
| `SEDES` | `src/app/App.tsx:2429` | Si | `sedeService.getSedesLegacy()` | bajo | Mantiene nombre, direccion, horario y URL de mapas del checkout. |
| `BRAND_SYNONYMS` | `src/app/App.tsx:34` | No | `productService` / `src/data/mockProductos.ts` | bajo | Ya existe centralizado, pero no se toco para limitar cambios en busqueda. |
| `FREQUENTLY_BOUGHT_TOGETHER` | `src/app/App.tsx:63` | No | `productService.getProductosFrecuentes()` | medio | Debe migrarse junto con detalle de producto para validar carruseles. |
| `DEMO_ACCOUNTS` | `src/app/App.tsx:75` | No | `authService` / `userService` | medio | Login mock depende de estado local; migrar en fase de autenticacion mock. |
| `PRODUCTS` | `src/app/App.tsx:101` | No | `productService` / `src/data` | alto | El adapter central usa `packSize` con formato legacy distinto; migrarlo puede cambiar texto visible en cards. |
| `VE_AREAS` | `src/app/App.tsx:2340` | No | `src/domain/constants.ts` | bajo | Valores coinciden; puede migrarse junto con formularios. |
| `DOC_TYPES` | `src/app/App.tsx:2341` | No | `src/domain/constants.ts` | medio | App usa `G`; dominio usa `RIF`. Cambiarlo alteraria opciones visibles. |
| `VE_BANKS` | `src/app/App.tsx:2344` | No | `src/domain/constants.ts` | bajo | Migracion segura cuando se normalicen formularios de pago/reembolso. |
| `DISCOUNT_CODES` | `src/app/App.tsx:2430` | No | `couponService` | medio | Fuente central incluye cupones de usuario y vencidos; conectar directo podria cambiar validacion actual. |
| `COMPLETED_TRIPS_DEMO` | `src/app/App.tsx:3552` | No | `deliveryService` | alto | Forma visual de delivery no esta alineada aun con pedidos/entregas centralizadas. |
| `ALL_ORDERS` | `src/app/App.tsx:3580` | No | `deliveryService` | alto | Debe migrarse junto con asignacion de repartidor y estados visibles. |
| `DEMO_GLOBAL_ORDERS` | `src/app/App.tsx:4728` | No | `adminService.getMonitorGlobalPedidos()` | alto | El monitor admin usa campos visuales mas ricos que el adapter actual. |
| `STATUS_COLORS` | `src/app/App.tsx:4739` | No | `adminService.getStatusColorsAdmin()` | bajo | Ya esta centralizado; puede moverse con monitor admin. |
| `ROLE_OPTIONS` | `src/app/App.tsx:4950` | No | `personal_operativo` / `domain` | bajo | Migracion segura si se conserva casing visual actual. |
| `DEMO_RECIPES` | `src/app/App.tsx:5911` | No | `recipeService` | alto | Incluye imagenes y estructura especifica del panel admin. |
| `DEMO_ADMIN_ORDERS` | `src/app/App.tsx:5917` | No | `adminService` / `orderService` | alto | Debe migrarse con operaciones admin completas. |
| `USER_SEDE_MAP` | `src/app/App.tsx:5941` | No | `sedeService` / `userService` | medio | Relacion usuario-sede aun es visual/local en admin. |
| `DEMO_REFUNDS` | `src/app/App.tsx:5958` | No | `refundService` | alto | La tabla visual tiene campos resumidos; requiere adapter dedicado. |
| `DEMO_ORDERS` | `src/app/App.tsx:6726` | No | `profileService.getHistorialPedidosUsuario()` | medio | El perfil usa formato resumido; migrar con pruebas de historial. |
| `DEMO_CONTACT` | `src/app/App.tsx:6737` | No | `profileService.getPerfilUsuario()` | medio | Debe migrarse junto con formularios de perfil. |
| `USER_COUPONS` | `src/app/App.tsx:6849` | No | `couponService` | medio | La UI de perfil tiene estados visuales propios de cupon. |
| `VENEZUELA_BANKS` | `src/app/App.tsx:6886` | No | `src/domain/constants.ts` | bajo | Migrable con reembolso/perfil. |
| `NOTIF_DATA` | `src/app/App.tsx:7734` | No | `notificationService` | medio | Fuente central tiene una notificacion adicional; conectar directo cambiaria cantidad visible. |
| `STAFF_SEDES` | `src/app/App.tsx:7981` | No | `sedeService` / `userService` | medio | Esta atado a texto de staff en admin, conviene migrar con personal operativo. |

## Recomendacion de migracion

1. Migrar formularios de pago/reembolso con constants exactas (`VE_AREAS`, `VE_BANKS`) sin tocar `DOC_TYPES` hasta decidir `G` vs `RIF`.
2. Crear adapters visuales especificos para `PRODUCTS` antes de reemplazar el array inline.
3. Migrar cupones con una funcion que replique exactamente los codigos aceptados hoy.
4. Dejar admin, delivery, recipes y reembolsos para una fase dedicada con pruebas de flujo.
