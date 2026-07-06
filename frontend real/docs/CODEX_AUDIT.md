# CODEX_AUDIT - Farmahumana / FHEC frontend real

Fecha de auditoria: 2026-07-05.

## 1. Resumen del entorno local

- Sistema operativo detectado: macOS 15.7.4, Darwin 24.6.0, x86_64.
- Node.js: v22.23.1.
- npm: 10.9.8.
- pnpm: 11.10.0.
- Git: 2.55.0.
- Corepack: 0.34.6.
- Vite global: no instalado/no reconocido; no es obligatorio.
- Vite local del proyecto: 6.3.5.
- Gestor usado para este frontend: pnpm.

Estado inicial relevante:

- Al inicio no existian `node`, `npm`, `pnpm` ni `corepack` en el PATH.
- Git y Homebrew si estaban disponibles.
- Se instalo Node.js LTS 22 con Homebrew (`node@22`), lo que dejo disponibles Node, npm y Corepack.
- Se habilito Corepack para exponer `pnpm`.

## 2. Estado de instalacion

Comando usado dentro de `frontend real`:

```bash
pnpm install
```

Resultado:

- Instalacion finalizada correctamente.
- Se genero `pnpm-lock.yaml`.
- Se uso `pnpm-workspace.yaml` porque no habia lockfile previo y ya existia workspace de pnpm.

Incidencias y correcciones minimas:

- Primer intento en sandbox: fallo con `ENOTFOUND registry.npmjs.org`; se repitio con acceso de red.
- Primer intento completo: `ERR_PNPM_IGNORED_BUILDS` para `@tailwindcss/oxide` y `esbuild`.
- Correccion aplicada en `pnpm-workspace.yaml`: se aprobaron esos builds requeridos por Vite/Tailwind.
- El override de Vite se movio a `pnpm-workspace.yaml`, porque pnpm 11 ya no lee el bloque `pnpm.overrides` dentro de `package.json`.
- `react` y `react-dom` estaban como peer dependencies opcionales; se declararon como dependencias directas:
  - `react@18.3.1`
  - `react-dom@18.3.1`

No se agregaron librerias UI nuevas, frameworks nuevos, backend ni Supabase CLI.

## 3. Estado de ejecucion local

Script disponible:

```json
"dev": "vite"
```

Comando probado:

```bash
pnpm dev --host 127.0.0.1
```

Resultado:

- El intento normal desde el sandbox fallo con `listen EPERM`.
- Con permiso para abrir puerto local, Vite arranco correctamente.
- URL local generada:

```text
http://127.0.0.1:5173/
```

Verificacion HTTP:

```text
HTTP/1.1 200 OK
Content-Type: text/html
```

## 4. Estado de build

Script disponible:

```json
"build": "vite build"
```

Comando probado:

```bash
pnpm build
```

Resultado:

- Build exitoso.
- `dist/` fue generado correctamente.
- Se transformaron 1608 modulos.

Advertencia no bloqueante:

- Vite reporto un chunk JS de aproximadamente 517 kB despues de minificacion.
- Recomendacion futura: evaluar code splitting con `dynamic import()` o `manualChunks`, pero no en esta fase porque podria afectar la arquitectura y el flujo visual.

## 5. Estructura real del frontend

Carpetas esperadas en la raiz del repositorio:

- `frontend`: existe; carpeta temporal de pruebas, no se trabajo sobre ella.
- `frontend real`: existe; carpeta objetivo de esta fase.
- `backend`: existe; no se modifico.

Archivos relevantes en `frontend real`:

- `package.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`
- `vite.config.ts`
- `index.html`
- `src/main.tsx`
- `src/app/App.tsx`
- `src/styles/index.css`

No se encontro:

- `tsconfig.json`
- `src/App.tsx`
- `package-lock.json`
- `yarn.lock`

Entrada de la aplicacion:

- `index.html` monta `/src/main.tsx`.
- `src/main.tsx` monta `./app/App.tsx`.
- `src/main.tsx` importa `./styles/index.css`.

Componente principal:

- `src/app/App.tsx`
- Tamano aproximado: 8120 lineas.
- Estado: monolitico. Contiene tipos, datos mock, componentes visuales, navegacion por estado, flujos de carrito, checkout, tracking, login, perfil, delivery y admin.

Carpetas principales dentro de `src`:

- `src/app`
- `src/app/components`
- `src/app/components/ui`
- `src/app/components/figma`
- `src/imports`
- `src/imports/pasted_text`
- `src/styles`

## 6. Diagnostico de codigo generado por Figma

Hallazgos principales:

- `App.tsx` solo importa `./components/ui/sonner` desde la carpeta de componentes.
- `App.tsx` no importa actualmente `src/app/data.ts`, `src/app/shared.ts`, `src/app/types.ts` ni las pantallas separadas en `src/app/components`.
- Hay una posible duplicacion entre:
  - datos y tipos definidos dentro de `src/app/App.tsx`;
  - `src/app/data.ts`;
  - `src/app/shared.ts`;
  - `src/app/types.ts`;
  - componentes separados en `src/app/components`.
- Existen datos demo/mock en varias zonas:
  - `PRODUCTS`
  - `DEMO_ACCOUNTS`
  - `DEMO_ORDERS`
  - `DEMO_GLOBAL_ORDERS`
  - `DEMO_RECIPES`
  - `DEMO_ADMIN_ORDERS`
  - `DEMO_CONTACT`
  - `NOTIF_DATA`
- Hay duplicados intencionales o de prueba, por ejemplo productos mock para "Productos similares".
- Hay persistencia local minima con `localStorage` para historial de busqueda.
- No se detecto integracion real con API, Supabase, Axios o backend.

Archivos que parecen importantes para el prototipo actual:

- `src/app/App.tsx`: fuente visual y funcional principal actual.
- `src/main.tsx`: entrada React.
- `src/styles/index.css`, `src/styles/theme.css`, `src/styles/tailwind.css`, `src/styles/fonts.css`, `src/styles/globals.css`: estilos del prototipo.
- `src/imports/logo-farmahumana.png`, recetas y QR importados directamente por `App.tsx`.
- `src/app/components/ui/sonner.tsx`: usado por `App.tsx`.

Archivos que parecen no conectados directamente al montaje actual, sin borrarlos:

- Varias pantallas dentro de `src/app/components`, como `HomePage.tsx`, `CatalogPage.tsx`, `CartPage.tsx`, `CheckoutPages.tsx`, `AdminPanelPage.tsx`, `ProfilePage.tsx`, etc.
- `src/app/data.ts`, `src/app/shared.ts`, `src/app/types.ts`.
- Algunos assets en `src/imports` podrian no estar importados por el `App.tsx` actual.

Estos archivos no se borraron porque pueden representar intentos previos de modularizacion, referencias visuales o material generado por Figma Make.

## 7. Riesgos tecnicos

- Alto riesgo de romper UI si se refactoriza `App.tsx` sin una estrategia incremental.
- La navegacion depende de estado local y callbacks dentro del monolito.
- Muchos flujos comparten tipos, datos mock y helpers definidos inline.
- Los estilos dependen de Tailwind, clases largas y CSS global/theme; no conviene tocar estilos en la siguiente fase inicial.
- Hay assets visuales pesados; el logo empaquetado ocupa alrededor de 2.2 MB en build.
- El build pasa, pero no hay `tsconfig.json` ni script de typecheck. Vite transpila TSX, pero no valida tipos de forma estricta.
- El chunk principal supera 500 kB minificado; no bloquea, pero confirma que el prototipo esta cargando gran parte de la app en un solo bundle.
- Hay imagenes remotas de Unsplash en slides; dependen de red en tiempo de ejecucion.

## 8. Recomendacion para la siguiente fase

Primero:

- Tomar `src/app/App.tsx` como fuente de verdad visual.
- Crear un mapa de pantallas, datos mock, tipos y handlers antes de mover codigo.
- Separar por etapas muy pequenas, validando build despues de cada cambio.
- Priorizar extraccion de datos mock y tipos solo cuando este claro que no cambia la UI.

No tocar todavia:

- `backend`.
- `frontend` de pruebas.
- Layouts, colores, textos visibles, responsive, assets o estilos visuales.
- Eliminacion de archivos generados por Figma.
- Migraciones de framework o cambios de tecnologia.

Foco futuro confirmado:

- Todas las fases futuras de limpieza y preparacion deben centrarse en `frontend real`.

## 9. Fase 2 - Base tecnica de dominio

Fecha de actualizacion: 2026-07-05.

Objetivo:

- Crear una base TypeScript de dominio alineada con la base de datos final y el DFD.
- Mantener intacto el prototipo visual generado por Figma Make.
- Preparar la fase siguiente de centralizacion de datos mock.

Archivos creados:

- `src/domain/types.ts`
- `src/domain/enums.ts`
- `src/domain/constants.ts`
- `src/domain/helpers.ts`
- `src/domain/index.ts`
- `docs/DOMAIN_MODEL.md`

Tipos principales creados:

- `Usuario`
- `CodigoVerificacion`
- `Producto`
- `Categoria`
- `Sede`
- `Transaccion`
- `Cupon`
- `InteraccionUsuario`
- `Favorito`
- `PersonalOperativo`
- `SolicitudReembolso`
- `InventarioSede`
- `Carrito`
- `Pedido`
- `PedidoPreparado`
- `EntregaPickup`
- `EntregaDelivery`
- `DetallePedido`
- `Recipe`
- `AuditoriaRecipe`
- `Notificacion`
- `Banner`

Enums/valores cerrados creados:

- `PropositoCodigoVerificacion`
- `EstadoCodigoVerificacion`
- `NivelControlProducto`
- `EstadoProducto`
- `EstadoSede`
- `MetodoPago`
- `MetodoEntrega`
- `RolPersonalOperativo`
- `EstadoPersonalOperativo`
- `EstadoPedido`
- `EstadoRecipe`
- `ResultadoAuditoriaRecipe`
- `EstadoSolicitudReembolso`
- `TipoInteraccionUsuario`
- `TipoNotificacion`

Constantes creadas:

- `IVA_PORCENTAJE`
- `METODOS_PAGO_DISPONIBLES`
- `METODOS_ENTREGA_DISPONIBLES`
- `TIPOS_DOCUMENTO_IDENTIDAD`
- `CODIGOS_PAIS_MOCK`
- `CODIGOS_AREA_VENEZUELA_MOCK`
- `BANCOS_MOCK`
- `FORMAS_FARMACEUTICAS_BASE`
- `UNIDADES_CONCENTRACION_BASE`
- `ESTADOS_PEDIDO_ACTIVOS`
- `ESTADOS_PEDIDO_TERMINALES`

Helpers puros creados:

- `esProductoHabilitado`
- `esSedeHabilitada`
- `esPersonalHabilitado`
- `requiereRecipeDigital`
- `requiereRecipeFisico`
- `esPickupObligatorio`
- `calcularPrecioConDescuento`
- `calcularDescuentoUnitario`
- `cuponEstaVigente`
- `cuponEsGeneral`
- `cuponEsDeUsuario`
- `pedidoEstaActivo`
- `pedidoEstaEntregado`
- `recipeEstaPendiente`
- `recipeEstaAprobado`
- `recipeEstaRechazado`

Decisiones tomadas:

- Los IDs de entidades de base de datos usan `number`.
- Los timestamps usan `string` para representar ISO strings provenientes de API.
- Los decimales usan `number` por ahora.
- Los campos nullable de base de datos se modelan como `T | null`.
- Los valores cerrados se implementaron como objetos `as const` con type alias, manteniendo valores legibles para uso futuro en UI.
- `src/app/App.tsx` no fue refactorizado ni conectado a la capa nueva.
- `src/app/types.ts`, `src/app/data.ts` y `src/app/shared.ts` se mantienen por compatibilidad temporal con el prototipo.

Que no se toco:

- No se modifico `src/app/App.tsx`.
- No se cambiaron estilos, colores, layout, textos visibles, rutas ni navegacion.
- No se borraron componentes, mocks, assets ni archivos generados por Figma.
- No se modifico `backend`.
- No se modifico `frontend` de pruebas.
- No se instalaron librerias nuevas.

Verificacion:

- `pnpm exec tsc -v` no esta disponible porque el proyecto no expone un binario local de TypeScript.
- Se valido sintaxis de `src/domain/index.ts` con Vite en modo SSR:

```bash
pnpm exec vite build --ssr src/domain/index.ts --outDir /private/tmp/fhec-domain-check --emptyOutDir false
```

Resultado:

- Validacion SSR exitosa.
- 5 modulos transformados.

Build completo:

```bash
pnpm build
```

Resultado:

- Build exitoso.
- 1608 modulos transformados.
- Se mantiene la advertencia no bloqueante de chunk JS mayor a 500 kB.

Recomendacion para la fase siguiente:

- Centralizar datos mock de productos, categorias, sedes, cupones, usuarios demo, pedidos, recetas, notificaciones e inventario.
- Mapear primero los datos mock hacia los tipos de `src/domain`.
- Mantener `App.tsx` como fuente visual hasta tener paridad clara, y migrar por pantallas o flujos pequenos con build despues de cada paso.

## 10. Fase 3 - Centralizacion de datos mock

Fecha de actualizacion: 2026-07-05.

Objetivo:

- Crear una fuente mock centralizada alineada con `src/domain`.
- Reducir duplicacion en `src/app/data.ts` y `src/app/shared.ts` mediante puentes compatibles.
- Mantener intacta la UI aprobada y no refactorizar `App.tsx`.

Archivos creados:

- `src/data/mockCategorias.ts`
- `src/data/mockSedes.ts`
- `src/data/mockProductos.ts`
- `src/data/mockInventarioSedes.ts`
- `src/data/mockUsuarios.ts`
- `src/data/mockPersonalOperativo.ts`
- `src/data/mockCupones.ts`
- `src/data/mockCarritos.ts`
- `src/data/mockPedidos.ts`
- `src/data/mockDetallePedidos.ts`
- `src/data/mockRecipes.ts`
- `src/data/mockAuditoriaRecipes.ts`
- `src/data/mockTransacciones.ts`
- `src/data/mockSolicitudesReembolso.ts`
- `src/data/mockNotificaciones.ts`
- `src/data/mockBanners.ts`
- `src/data/mockEntregas.ts`
- `src/data/selectors.ts`
- `src/data/adapters.ts`
- `src/data/viewModels.ts`
- `src/data/index.ts`
- `docs/MOCK_DATA_MODEL.md`

Archivos modificados:

- `src/app/data.ts`
- `src/app/shared.ts`
- `docs/CODEX_AUDIT.md`

Datos centralizados:

- Categorias y metadata visual temporal.
- Formas farmaceuticas desde `src/domain/constants.ts`.
- Productos en formato `Producto`, con metadata visual separada.
- Inventario por sede con `stock_disponible`.
- Usuarios demo.
- Personal operativo.
- Cupones generales, de usuario, vigentes y vencidos.
- Carritos.
- Pedidos en revision medica, pendiente por pago, preparacion, retiro, delivery, camino, entregado y cancelado.
- Detalles de pedidos.
- Recipes pendientes, aprobados y rechazados.
- Auditorias de recipes.
- Transacciones con monto exacto.
- Solicitudes de reembolso pendientes, realizadas y rechazadas.
- Notificaciones principales.
- Banners con imagen plana.

Selectores creados:

- `getCategoriaById`
- `getCategorias`
- `getFormasFarmaceuticas`
- `getSedes`
- `getSedesHabilitadas`
- `getProductoById`
- `getProductos`
- `getProductosHabilitados`
- `getInventarioProductoEnSede`
- `getStockDisponible`
- `getProductosDisponiblesPorSede`
- `getProductosSimilares`
- `getCupones`
- `getCuponesGenerales`
- `getCuponesDeUsuario`
- `getCuponByCodigo`
- `getPedidosByUsuario`
- `getPedidoActivoByUsuario`
- `getDetallesByPedido`
- `getRecipesByPedido`
- `getRecipesPendientes`
- `getPedidosPorPreparar`
- `getPedidosSinRepartidor`
- `getPedidosAsignadosARepartidor`
- `getSolicitudesReembolsoByUsuario`
- `getNotificacionesByUsuario`
- `getAuditoriaByRecipe`
- `getTransaccionById`
- `getPersonalOperativoByUsuario`
- `getBanners`
- `getCarritoByUsuario`

Exports mantenidos por compatibilidad:

- `PRODUCTS`
- `CATS`
- `SEDES`
- `SEDES_LIST`
- `DEMO_ACCOUNTS`
- `DEMO_CONTACT`
- `DEMO_ORDERS`
- `DEMO_GLOBAL_ORDERS`
- `DISCOUNT_CODES`
- `NOTIF_DATA`
- `DEFAULT_SLIDES`
- `STATUS_COLORS`
- `BRAND_SYNONYMS`
- `FREQUENTLY_BOUGHT_TOGETHER`

Decisiones tomadas:

- `Producto` de dominio se mantiene limpio y alineado con DB.
- Propiedades visuales como color, rating, reviews, contraindicaciones, posologia y stock legacy viven en metadata/adaptadores.
- `stock` global legacy se deriva de `mockInventarioSedes`.
- `stockSedes` legacy se deriva del inventario por sede.
- Los banners de dominio usan imagen plana; los gradientes necesarios para formato legacy quedan solo en adaptador.
- `src/app/data.ts` y `src/app/shared.ts` quedaron como puentes temporales hacia `src/data`.

Que sigue dependiendo de mocks antiguos:

- `src/app/App.tsx` conserva sus datos inline (`PRODUCTS`, `CATS`, `SEDES`, `DEMO_ACCOUNTS`, `DEMO_ORDERS`, `NOTIF_DATA`, etc.).
- Algunas pantallas separadas en `src/app/components` tienen mocks internos propios, por ejemplo paneles de admin/delivery.
- No se migraron esos bloques porque hacerlo exigiria tocar flujos visuales y estado local del prototipo.

Verificacion:

- Validacion aislada de `src/data/index.ts` con Vite SSR: exitosa.
- Validacion aislada de `src/app/shared.ts` con Vite SSR: exitosa.
- Validacion aislada de `src/app/data.ts` con Vite SSR: exitosa.
- Build completo con `pnpm build`: exitoso.
- Se mantiene la advertencia no bloqueante de chunk JS mayor a 500 kB.

Recomendacion para la siguiente fase:

- Crear servicios mock sobre `src/data/selectors.ts`.
- Conectar `App.tsx` de forma incremental a `src/app/data.ts` o directamente a servicios mock.
- Migrar primero categorias, sedes, productos e inventario porque tienen menor riesgo visual.
- Dejar pedidos, recipes, admin y delivery para una fase posterior con pruebas de flujo.

## Fase 4 - Servicios mock y primeras conexiones seguras

Archivos creados:

- `src/config/api.ts`
- `src/services/categoryService.ts`
- `src/services/productService.ts`
- `src/services/sedeService.ts`
- `src/services/inventoryService.ts`
- `src/services/cartService.ts`
- `src/services/orderService.ts`
- `src/services/couponService.ts`
- `src/services/userService.ts`
- `src/services/authService.ts`
- `src/services/profileService.ts`
- `src/services/recipeService.ts`
- `src/services/refundService.ts`
- `src/services/notificationService.ts`
- `src/services/adminService.ts`
- `src/services/bannerService.ts`
- `src/services/deliveryService.ts`
- `src/services/httpClient.ts`
- `src/services/index.ts`
- `docs/APP_DATA_REFERENCES.md`
- `docs/SERVICES_LAYER.md`

Archivos modificados:

- `src/app/App.tsx`
- `docs/CODEX_AUDIT.md`

Servicios creados:

- Categorias, productos, sedes, inventario, cupones, usuarios, auth mock, perfil, pedidos, carrito, recipes, reembolsos, notificaciones, admin, banners y delivery.
- Todos leen desde `src/data` y `src/domain`.
- No se agregaron dependencias.
- No se implementaron llamadas reales a API, Supabase ni `fetch`.

Placeholder de API:

- `src/config/api.ts` define `USE_MOCK_DATA`, `API_BASE_URL` y `API_TIMEOUT_MS`.
- `src/services/httpClient.ts` queda como placeholder intencional; si se usa hoy, lanza error para evitar llamadas reales accidentales.

Conexiones seguras hechas en `App.tsx`:

- `DEFAULT_SLIDES` ahora se obtiene desde `bannerService.getBannersLegacy()`.
- `CATS` ahora se obtiene desde `categoryService.getCategoriasParaFiltro()`.
- `SEDES_LIST` ahora se obtiene desde `sedeService.getSedesListLegacy()`.
- `SEDES` ahora se obtiene desde `sedeService.getSedesLegacy()`.

Datos locales que siguen pendientes:

- `PRODUCTS`, porque el adapter central no replica exactamente el formato visible de `packSize` usado por `App.tsx`.
- `DISCOUNT_CODES`, porque la fuente central incluye cupones de usuario y vencidos que podrian cambiar validacion visible.
- `DEMO_ACCOUNTS`, `DEMO_ORDERS`, `DEMO_GLOBAL_ORDERS`, `DEMO_RECIPES`, `DEMO_ADMIN_ORDERS`, `DEMO_REFUNDS`, `NOTIF_DATA`, delivery y datos de perfil.
- Constantes de formularios como `DOC_TYPES` quedan pendientes porque el prototipo usa `G` y el dominio usa `RIF`.

Documentacion nueva:

- `docs/APP_DATA_REFERENCES.md` lista arrays y constantes locales de `App.tsx`, estado de migracion y riesgo.
- `docs/SERVICES_LAYER.md` explica la diferencia entre `src/data` y `src/services`, servicios disponibles y ruta futura hacia API.

Resultado de build:

- `pnpm build`: exitoso.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.

Riesgos detectados:

- Reemplazar productos sin adapter visual exacto puede cambiar texto de cards y detalle.
- Conectar cupones directamente puede cambiar codigos aceptados o estados visibles.
- Admin, delivery, recipes, reembolsos y notificaciones requieren adapters especificos antes de conectarse a servicios.

Recomendacion para la siguiente fase:

- Crear adapters visuales exactos para productos y cupones antes de reemplazar esos arrays en `App.tsx`.
- Migrar formularios de pago/reembolso por constantes compartidas, cuidando `G` vs `RIF`.
- Dejar admin, delivery y recipes para una fase de modularizacion con pruebas de flujo.

## Fase 5 - Adaptadores visuales para productos y cupones

Archivos creados:

- `src/viewModels/productViewModels.ts`
- `src/viewModels/couponViewModels.ts`
- `src/viewModels/index.ts`
- `docs/VISUAL_ADAPTERS.md`

Archivos modificados:

- `src/app/App.tsx`
- `src/app/data.ts`
- `src/services/productService.ts`
- `src/services/couponService.ts`
- `docs/APP_DATA_REFERENCES.md`
- `docs/CODEX_AUDIT.md`

View models y adaptadores de productos:

- `ProductCardViewModel`
- `ProductDetailViewModel`
- `ProductSearchViewModel`
- `ProductSimilarViewModel`
- `ProductCartItemViewModel`
- `ProductAdminCatalogViewModel`
- `ProductAdminInventoryViewModel`
- `ProductRecipeAuditViewModel`
- `toProductCardViewModel`
- `toProductDetailViewModel`
- `toProductSearchViewModel`
- `toProductSimilarViewModel`
- `toProductCartItemViewModel`
- `toProductAdminCatalogViewModel`
- `toProductAdminInventoryViewModel`
- `toProductRecipeAuditViewModel`
- `getAppProductViewModels`

View models y adaptadores de cupones:

- `CouponAdminViewModel`
- `CouponProfileViewModel`
- `CouponApplyViewModel`
- `CouponBadgeViewModel`
- `toCouponAdminViewModel`
- `toCouponProfileViewModel`
- `toCouponApplyViewModel`
- `toCouponBadgeViewModel`
- `getCouponVisualStatus`
- `formatCouponDiscount`
- `formatCouponDateRange`
- `getCouponApplyCodeMap`
- `getLegacyAdminCouponViewModels`
- `getLegacyProfileCouponViewModels`

Cambios en `App.tsx`:

- `PRODUCTS` ahora se obtiene desde `getAppProductViewModels()`.
- `DISCOUNT_CODES` ahora se obtiene desde `getCouponApplyCodeMap()`.
- El estado inicial de cupones admin ahora usa `getLegacyAdminCouponViewModels()`.
- `USER_COUPONS` ahora usa `getLegacyProfileCouponViewModels()`.

Compatibilidad preservada:

- Se mantuvieron los nombres locales `PRODUCTS`, `DISCOUNT_CODES` y `USER_COUPONS`.
- Se preservo `packSize` como `"30"`, `"28"`, etc.; no se reintrodujo `"x 30"`.
- Se preservaron precios, descuentos, stock global, stock por sede, badges de control, colores, rating, reviews, textos medicos y datos visibles de cupones.
- `src/app/data.ts` exporta ahora productos y cupones aplicables desde los adaptadores exactos.

Que no se toco:

- No se cambio layout, color, responsive, cards, tablas, modales, navegacion ni textos visibles.
- No se modularizo `App.tsx`.
- No se tocaron `backend` ni `frontend`.
- No se implemento API real, Supabase ni `fetch`.
- No se migraron `DEMO_RECIPES`, `DEMO_ADMIN_ORDERS`, delivery, reembolsos ni notificaciones.

Verificacion:

- Build completo con `pnpm build`: exitoso.
- Se mantiene la advertencia no bloqueante de chunk JS mayor a 500 kB.
- Verificacion puntual SSR de view models: productos y cupones devuelven los valores visuales esperados. El sandbox reporto un aviso no bloqueante de WebSocket de Vite, pero la carga SSR devolvio los datos correctamente.

Riesgos pendientes:

- `BRAND_SYNONYMS` y `FREQUENTLY_BOUGHT_TOGETHER` siguen locales en `App.tsx`.
- `DOC_TYPES` sigue local por la diferencia entre `G` y `RIF`.
- Admin operativo, delivery, auditoria, reembolsos y notificaciones todavia necesitan adapters visuales exactos antes de migrarse.

Recomendacion para la siguiente fase:

- Crear adapters para recipes/admin/delivery/reembolsos antes de tocar esos flujos.
- Migrar constantes de formularios de bajo riesgo (`VE_AREAS`, `VE_BANKS`) manteniendo `DOC_TYPES` pendiente.
- Empezar una modularizacion controlada solo cuando los view models principales esten estables.

## Fase 6 - Adaptadores operacionales

Archivos creados:

- `src/viewModels/orderViewModels.ts`
- `src/viewModels/recipeViewModels.ts`
- `src/viewModels/deliveryViewModels.ts`
- `src/viewModels/refundViewModels.ts`
- `src/viewModels/notificationViewModels.ts`
- `docs/OPERATIONAL_VIEW_MODELS.md`

Archivos modificados:

- `src/viewModels/index.ts`
- `src/services/orderService.ts`
- `src/services/recipeService.ts`
- `src/services/deliveryService.ts`
- `src/services/refundService.ts`
- `src/services/notificationService.ts`
- `src/services/adminService.ts`
- `src/app/data.ts`
- `src/app/App.tsx`
- `docs/APP_DATA_REFERENCES.md`
- `docs/CODEX_AUDIT.md`

View models creados:

- Pedidos: `OrderHistoryViewModel`, `ActiveOrderViewModel`, `AdminOrderViewModel`, `AdminMonitorOrderViewModel`, `OrderPreparationViewModel`, `PickupOrderViewModel`, `DeliveryOrderViewModel`, `OrderReviewViewModel`, `OrderDetailLineViewModel`, `OrderSummaryViewModel`.
- Recipes/auditoria: `RecipeAuditViewModel`, `RecipeDetailModalViewModel`, `RecipeStatusViewModel`, `RecipeOrderContextViewModel`.
- Delivery: `DeliveryAvailableOrderViewModel`, `DeliveryAssignedOrderViewModel`, `DeliveryCompletedTripViewModel`, `DeliveryDashboardStatsViewModel`.
- Reembolsos: `RefundProfileViewModel`, `RefundAdminViewModel`, `RefundRequestFormViewModel`, `RefundStatusViewModel`.
- Notificaciones: `NotificationViewModel`, `NotificationDropdownViewModel`, `NotificationPanelViewModel`, `NotificationBadgeViewModel`.

Cambios en `App.tsx`:

- `COMPLETED_TRIPS_DEMO` ahora usa `getLegacyDeliveryCompletedTripViewModels()`.
- `ALL_ORDERS` ahora usa `getLegacyDeliveryAvailableOrderViewModels()`.
- `DEMO_GLOBAL_ORDERS` ahora usa `getLegacyAdminMonitorOrderViewModels()`.
- `DEMO_RECIPES` ahora usa `getLegacyRecipeAuditViewModels()`.
- `DEMO_ADMIN_ORDERS` ahora usa `getLegacyAdminOrderViewModels()`.
- `DEMO_REFUNDS` ahora usa `getLegacyAdminRefundViewModels()`.
- `DEMO_ORDERS` ahora usa `getLegacyOrderHistoryViewModels()`.
- El estado inicial de `refundRequests` ahora usa `getLegacyProfileRefundViewModels()`.
- `NOTIF_DATA` ahora usa `getLegacyNotificationViewModels()`.
- Se retiraron imports directos de imagenes de recipe desde `App.tsx`; esas imagenes se importan en `recipeViewModels.ts`.

Compatibilidad preservada:

- Se mantuvieron los nombres locales `DEMO_*`, `ALL_ORDERS`, `COMPLETED_TRIPS_DEMO` y `NOTIF_DATA`.
- Los getters legacy devuelven clones para que `useState` pueda editar estado local sin mutar la semilla.
- Se preservaron ids visibles, fechas, nombres, productos, precios, costos de envio, referencias de pago, PIN, distancias, iconos, textos e imagenes.
- `src/app/data.ts` sigue como puente temporal y ahora exporta listas operacionales legacy.

Que no se toco:

- No se cambio layout, color, responsive, cards, tablas, modales, navegacion, textos visibles ni comportamiento visual.
- No se modularizo `App.tsx`.
- No se tocaron `backend` ni `frontend`.
- No se implemento API real, Supabase ni `fetch`.
- No se migraron `DEMO_ACCOUNTS`, `DEMO_CONTACT`, `USER_SEDE_MAP`, `STAFF_SEDES`, `VE_AREAS`, `DOC_TYPES`, `VE_BANKS` ni `VENEZUELA_BANKS`.

Resultado de build:

- `pnpm build`: exitoso.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.

Riesgos pendientes:

- Auth/profile/personal operativo siguen con datos locales en `App.tsx`.
- Formularios de pago/reembolso siguen con constantes locales; `DOC_TYPES` requiere decidir `G` vs `RIF`.
- Los snapshots legacy de pedidos, recipes, delivery, reembolsos y notificaciones preservan UI; reemplazarlos por datos 100% derivados de `src/data` debe hacerse durante modularizacion con verificacion visual.

Recomendacion para la siguiente fase:

- Modularizar de forma controlada empezando por componentes de bajo riesgo ya alimentados por view models.
- Mantener `src/app/data.ts` como puente hasta extraer features por pantalla.
- No sustituir snapshots legacy por datos derivados sin una comparacion visual de las pantallas afectadas.

## Fase 7 - Modularizacion inicial de auth, perfil y formularios

Archivos creados:

- `src/features/auth/components/LoginPage.tsx`
- `src/features/auth/index.ts`
- `src/features/profile/components/ProfilePage.tsx`
- `src/features/profile/index.ts`
- `src/features/index.ts`
- `docs/MODULARIZATION_TRACKER.md`

Archivos modificados:

- `src/app/App.tsx`
- `src/app/types.ts`
- `docs/CODEX_AUDIT.md`

Secciones extraidas:

- `LoginPage`, incluyendo login, registro, recuperacion de contrasena y flujo OTP mock.
- `OtpInput` local usado como apoyo dentro del feature auth.
- `ProfilePage`, incluyendo datos personales, correo, telefono, notificaciones, seguridad, historial, reembolsos y cupones.

Cambios en `App.tsx`:

- `App.tsx` ahora importa `LoginPage` desde `src/features/auth`.
- `App.tsx` ahora importa `ProfilePage` desde `src/features/profile`.
- `App.tsx` sigue controlando la pantalla actual, usuario, carrito, checkout, notificaciones compartidas y navegacion.
- `DEMO_ACCOUNTS`, `DEMO_CONTACT`, `VE_AREAS` y `DOC_TYPES` permanecen en `App.tsx` porque tambien alimentan otros flujos no modularizados.
- Se pasan props a auth/perfil para conservar exactamente los mismos datos visibles.

Tipos:

- `src/app/types.ts` se alineo con los tipos inline vigentes: `Page` incluye `register`, `Slide` incluye `ctaLink`, y `Product` incluye campos opcionales usados por los view models actuales.

Secciones no extraidas:

- Catalogo, detalle de producto, carrito, delivery select, checkout, pago, tracking.
- Admin completo, auditoria, inventario, monitor global, delivery completo.
- Staff/personal operativo, porque sigue acoplado al panel admin.
- Formularios globales reutilizables, porque los OTP y campos actuales tienen clases/ids especificos por contexto.

Impacto visual esperado:

- Ninguno. La extraccion fue de componentes completos con clases, textos, estructura JSX y handlers preservados.

Resultado de build:

- `pnpm build`: exitoso.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.

Riesgos pendientes:

- `ProfilePage` sigue siendo grande internamente; conviene dividirlo por tabs en una fase posterior con verificacion visual.
- `DEMO_ACCOUNTS` y `DEMO_CONTACT` siguen compartidos desde `App.tsx`.
- `DOC_TYPES` sigue local por la diferencia `G` vs `RIF`.
- No existe typecheck estricto; Vite sigue compilando sin `tsconfig.json`.

Recomendacion para la siguiente fase:

- Extraer subcomponentes internos de perfil por tabs (`ProfilePersonalInfoSection`, `ProfileNotificationsSection`, `ProfileSecuritySection`, `ProfileOrderHistorySection`, `ProfileRefundsSection`, `ProfileCouponsSection`) usando el mismo patron de props.
- Despues modularizar staff/admin de bajo riesgo, sin tocar monitor ni operaciones complejas.
- Mantener backend/API/Supabase fuera del alcance hasta que el frontend este modularizado.

## Fase 8 - Modularizacion de catalogo, busqueda y detalle de producto

Archivos creados:

- `src/components/product/ProductDisplay.tsx`
- `src/components/product/index.ts`
- `src/features/catalog/components/HomePage.tsx`
- `src/features/catalog/components/CatalogPage.tsx`
- `src/features/catalog/index.ts`
- `src/features/search/components/SmartSearch.tsx`
- `src/features/search/index.ts`
- `src/features/product-detail/components/ProductDetailPage.tsx`
- `src/features/product-detail/index.ts`

Archivos modificados:

- `src/app/App.tsx`
- `src/features/index.ts`
- `docs/MODULARIZATION_TRACKER.md`
- `docs/CODEX_AUDIT.md`

Secciones extraidas:

- `ProductBox`, `ProductCard` y `Stars` hacia `src/components/product`.
- `SmartSearch` hacia `src/features/search`.
- `HomePage` y `CatalogPage` hacia `src/features/catalog`.
- `ProductDetailPage` hacia `src/features/product-detail`.

Cambios en `App.tsx`:

- `App.tsx` importa `HomePage`, `CatalogPage`, `SmartSearch`, `ProductDetailPage`, `ProductBox` y `ProductCard`.
- `Navbar` ahora pasa a `SmartSearch` las mismas fuentes existentes: `PRODUCTS`, `CATS` y `BRAND_SYNONYMS`.
- `App.tsx` mantiene la pantalla actual, producto seleccionado, carrito, favoritos, busqueda, sede, checkout, admin, delivery y notificaciones.
- Las secciones de carrito/favoritos/admin que todavia usan producto siguen consumiendo `ProductBox`/`ProductCard` importados.

Secciones no extraidas:

- Carrito completo, delivery select, pre-checkout, checkout, pago y tracking.
- Admin completo, inventario admin, auditoria admin, reembolsos admin y monitor global.
- Delivery completo.
- Navegacion principal completa.

Reduccion aproximada:

- `App.tsx` paso de 6385 lineas a 5469 lineas.
- Se movieron 965 lineas aproximadamente a componentes de catalogo, busqueda, detalle y producto reusable.

Impacto visual esperado:

- Ninguno. La extraccion fue mecanica y con JSX, clases, textos, badges, imagenes, condiciones, callbacks y estilos preservados.
- No se agrego React Router, state management externo, API real, Supabase ni `fetch`.
- No se tocaron `frontend` ni `backend`.

Resultado de build:

- `pnpm build`: exitoso.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.

Riesgos pendientes:

- `ProductCard` ahora es reusable y alimenta pantallas todavia no modularizadas; cualquier cambio futuro debe validarse contra catalogo, inicio, detalle, favoritos, carrito y admin.
- El catalogo mantiene filtros locales dentro de `CatalogPage`; extraerlos a hooks o servicios debe esperar a una fase posterior.
- El detalle de producto mantiene logica visual de recipe y similares dentro del feature; no conviene conectarlo a flujos de checkout hasta modularizar carrito.
- Busqueda sigue usando historial en `localStorage` como antes; no se conecto a API ni persistencia real.

Recomendacion para la siguiente fase:

- Modularizar carrito y componentes de resumen usando `ProductBox`/`ProductCard` ya extraidos.
- Despues separar checkout/pago/tracking con el mismo patron de props, sin cambiar persistencia mock.
- Mantener admin y delivery completo fuera del alcance hasta que el flujo de compra este aislado.

## Fase 9 - Modularizacion de carrito, checkout, pago y recipes

Archivos creados:

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

Archivos modificados:

- `src/app/App.tsx`
- `src/features/index.ts`
- `docs/MODULARIZATION_TRACKER.md`
- `docs/CODEX_AUDIT.md`

Secciones extraidas:

- `CartPage`, incluyendo carrito vacio, items, cantidades, eliminar/vaciar, resumen, cupon, modal de login y modal de stock insuficiente.
- `DeliverySelectPage`, incluyendo metodo delivery/pickup, sede, direccion, receptor, cupon y resumen.
- `PreCheckoutMedicalPage`, incluyendo carga mock de recipes, contador de auditoria, aprobacion simulada y avisos de recipe fisico.
- `CheckoutPage`, incluyendo pago movil, transferencia, datos fiscales, temporizador, resumen y validacion de pago exacto.
- `GpsMapWidget` y `addressToPin` hacia `src/components/order` como componente compartido.

Cambios en `App.tsx`:

- `App.tsx` importa `CartPage` desde `src/features/cart`.
- `App.tsx` importa `DeliverySelectPage` desde `src/features/checkout`.
- `App.tsx` importa `CheckoutPage` desde `src/features/payment`.
- `App.tsx` importa `PreCheckoutMedicalPage` desde `src/features/recipes`.
- `App.tsx` importa `GpsMapWidget` y `addressToPin` desde `src/components/order`.
- `App.tsx` sigue controlando `cartItems`, `activeOrderItems`, `hasActiveOrder`, cupon aplicado, modo de entrega, sede, direccion, usuario y navegacion.
- `DISCOUNT_CODES`, `SEDES`, `DEMO_CONTACT`, `VE_AREAS`, `DOC_TYPES` y `VE_BANKS` se mantienen en `App.tsx` y se pasan como props a los componentes extraidos.

Secciones no extraidas:

- `TrackingPage`, que queda pendiente para una fase de pedidos/tracking/resenas.
- `RefundForm`, que queda pendiente para modularizacion de reembolsos.
- Admin completo, inventario admin, auditoria admin, monitor global y delivery completo.
- Navegacion principal completa.

Reduccion aproximada:

- `App.tsx` paso de 5469 lineas a 4288 lineas.
- Se movieron 1181 lineas aproximadamente a features de carrito, checkout, pago, recipes y componente compartido de mapa.

Impacto visual esperado:

- Ninguno. La extraccion fue mecanica y con JSX, clases, textos, badges, condiciones, callbacks, calculos visibles y estilos preservados.
- No se agrego React Router, state management externo, API real, Supabase ni `fetch`.
- No se tocaron `frontend` ni `backend`.
- El pago sigue validando monto exacto; no se introdujeron subpagos, pagos parciales ni pagos de diferencia.
- Productos controlados siguen forzando pickup visualmente.

Resultado de build:

- `pnpm build`: exitoso.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.

Riesgos pendientes:

- `TrackingPage` todavia mezcla pedido activo, timers, estados, recipe rechazada, delivery/pickup y resena.
- `RefundForm` sigue compartiendo `VE_AREAS`, `DOC_TYPES` y `VE_BANKS` desde `App.tsx`.
- `GpsMapWidget` ahora es compartido por checkout y delivery; cualquier cambio futuro debe validarse en ambas pantallas.
- Los resumenes de pedido siguen duplicados visualmente por pantalla para evitar una unificacion prematura.

Recomendacion para la siguiente fase:

- Modularizar `TrackingPage` como feature de pedidos/tracking/resenas.
- Despues modularizar reembolsos y separar `RefundForm`.
- Mantener admin y delivery completo para fases dedicadas.

## Fase 10 - Modularizacion del panel administrativo

Archivos creados:

- `src/features/admin/components/AdminPanelPage.tsx`
- `src/features/admin/components/index.ts`
- `src/features/admin/sections/index.ts`
- `src/features/admin/index.ts`

Archivos modificados:

- `src/app/App.tsx`
- `src/features/index.ts`
- `docs/MODULARIZATION_TRACKER.md`
- `docs/CODEX_AUDIT.md`

Secciones extraidas:

- `AdminPanel` completo, incluyendo tabs internos, permisos visuales por rol y navegacion interna del panel.
- `SuperadminModules`, incluyendo contenido/banners, catalogo admin, personal operativo, monitor global, inventario y cupones.
- `InventarioTab`, incluyendo stock por sede, edicion mock y modal de stock.
- Auditoria de recipes, incluyendo tabla, modal, aprobar/rechazar, motivos y acciones de imagen.
- Operaciones administrativas, incluyendo KPIs, filtros, tabla, modal de pedido, empacado, despacho y PIN demo.
- Reembolsos admin, incluyendo tabla, modal de detalle y confirmacion mock.

Cambios en `App.tsx`:

- `App.tsx` importa `AdminPanel` desde `src/features/admin`.
- `App.tsx` sigue como orquestador global y mantiene pantalla actual, sesion, rol, navegacion general, productos y slides.
- El render del panel admin conserva las mismas props principales: `user`, `onNav`, `products`, `setProducts`, `slides` y `setSlides`.
- Se quitaron imports admin legacy que ya no se usaban directamente en `App.tsx`.

Secciones no extraidas:

- `BannerManagementPage` standalone, porque corresponde a `page === "banners"` y no al bloque admin principal extraido.
- `DeliveryPanel`, fuera de alcance de esta fase.
- `NotificationsPage`, fuera de alcance de esta fase.
- `TrackingPage` y `RefundForm`, pendientes para modulos de tracking/reembolsos.
- No se encontro una seccion admin dedicada de resenas separada dentro del bloque extraido.

Reduccion aproximada:

- `App.tsx` paso de 4288 lineas a 2321 lineas.
- Se movieron cerca de 1967 lineas al feature admin.

Impacto visual esperado:

- Ninguno. La extraccion fue mecanica y preservo JSX, clases, textos, iconos, badges, tablas, formularios, modales, condiciones visuales y callbacks.
- No se agrego React Router, state management externo, API real, Supabase ni `fetch`.
- No se tocaron `frontend` ni `backend`.

Resultado de build:

- `pnpm build`: exitoso.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.

Riesgos pendientes:

- `AdminPanelPage.tsx` sigue siendo grande; conviene dividirlo por secciones admin en una fase posterior con validacion visual.
- `SuperadminModules` comparte estado interno entre varias secciones; partirlo requiere cuidado para no cambiar formularios, tabs ni validaciones visuales.
- `BannerManagementPage` standalone, delivery, notificaciones globales, tracking y reembolsos de cliente siguen pendientes de modularizacion.

Recomendacion para la siguiente fase:

- Modularizar delivery/repartidor completo y notificaciones globales.
- Luego dividir `AdminPanelPage.tsx` en secciones internas mas pequenas si el panel ya fue validado visualmente.

## Fase 11 - Modularizacion final y preparacion de limpieza

Archivos creados:

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

Archivos modificados:

- `src/app/App.tsx`
- `src/features/index.ts`
- `src/features/admin/components/index.ts`
- `docs/MODULARIZATION_TRACKER.md`
- `docs/CODEX_AUDIT.md`

Secciones extraidas:

- Layout global y navegacion: `NavDropdown`, `CatNavButton`, `SedeSelector`, `MobileUserMenu`, `Navbar`, `MenuBtn` y `Footer`.
- Pedido activo/tracking/reseña: `TrackingPage`.
- Delivery/repartidor: `DeliveryPanel`.
- Notificaciones globales: `NotificationsPage` e `INITIAL_NOTIFICATIONS`.
- Favoritos: `FavoritesPage`.
- Gestion de banners standalone: `BannerManagementPage`.
- Reembolso cliente legacy: `RefundForm`, extraido pero no conectado porque no estaba renderizado.

Cambios en `App.tsx`:

- `App.tsx` importa `Navbar` y `Footer` desde `src/components/layout`.
- `App.tsx` importa `TrackingPage`, `DeliveryPanel`, `NotificationsPage`, `FavoritesPage` y `BannerManagementPage` desde sus features.
- `App.tsx` mantiene solo el estado orquestador: pantalla, sesion, carrito, producto seleccionado, favoritos, busqueda, sede, checkout, pedido activo, slides y notificaciones.
- No se cambio navegacion, textos, clases, badges, formularios ni comportamiento visual.

Secciones no extraidas:

- `AdminPanelPage.tsx` no se dividio internamente; sigue en `src/features/admin/components/AdminPanelPage.tsx` porque partirlo requiere manejar estado compartido entre tabs, modales y secciones.
- No se crearon modales globales reutilizables; los modales siguen dentro de sus features para no cambiar overlays.
- No se hizo limpieza profunda de `src/app/components/*`, assets ni puentes legacy.

Reduccion aproximada:

- `App.tsx` paso de 2321 lineas a 287 lineas.
- `AdminPanelPage.tsx` se mantuvo en 2001 lineas.

Impacto visual esperado:

- Ninguno. La extraccion fue mecanica y preservo JSX, clases, textos visibles, iconos, badges, tablas, formularios, modales, condiciones y callbacks.
- No se agrego React Router, state management externo, API real, Supabase ni `fetch`.
- No se tocaron `frontend` ni `backend`.

Resultado de build:

- `pnpm build`: exitoso.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.

Inventario de limpieza:

- Se creo `docs/CLEANUP_CANDIDATES.md`.
- El inventario lista candidatos en `src/app/components/*`, `src/app/shared.ts`, helpers inline de `App.tsx`, assets posiblemente residuales en `src/imports`, puentes legacy y duplicados entre `src/app/data.ts`, `src/data`, `src/services`, `src/viewModels`, `src/app/types.ts` y `src/domain/types.ts`.
- No se borraron archivos de riesgo medio o alto.

Riesgos pendientes:

- `src/app/components/ui/*` no debe borrarse sin confirmacion archivo por archivo.
- `src/app/data.ts` y `src/app/types.ts` siguen siendo puentes activos para features visuales.
- `src/features/refunds/components/RefundForm.tsx` requiere decision: conectar, conservar como referencia o eliminar.
- `AdminPanelPage.tsx`, `AppLayout.tsx`, `TrackingPage.tsx` y `DeliveryPanelPage.tsx` todavia pueden dividirse internamente en fases futuras.

Recomendacion para la fase 12:

- Empezar por borrar duplicados confirmados de bajo riesgo y helpers inline sin uso.
- Revisar manualmente `src/app/components/*` y assets no importados antes de eliminarlos.
- Mantener `src/app/components/ui/*`, `src/app/data.ts` y `src/app/types.ts` hasta completar una migracion controlada de tipos/helpers.

## Fase 12 - Limpieza exhaustiva

Reporte principal:

- `docs/CLEANUP_REPORT.md`

Resumen de limpieza:

- Se eliminaron duplicados legacy de `src/app/components/*` que ya estaban reemplazados por features activos.
- Se conservaron los componentes UI base en `src/app/components/ui/*`.
- Se elimino `src/app/shared.ts`, usado solo por componentes legacy.
- Se elimino `src/features/refunds/*`, porque no tenia ruta activa ni imports reales.
- Se movieron notas historicas desde `src/imports/pasted_text` hacia `docs/archive`.
- Se eliminaron assets no referenciados en `src/imports`: capturas, imagenes `IMG_238*.PNG`, `WhatsApp_Image_*.jpeg` e `image*.png`.
- Se limpiaron helpers, tipos y mocks duplicados en `src/app/App.tsx`; ahora el orquestador importa desde `src/app/data.ts` y `src/app/types.ts`.
- Se eliminaron dependencias sin imports activos y se sincronizo `pnpm-lock.yaml`.

Archivos modificados:

- `src/app/App.tsx`
- `src/features/index.ts`
- `package.json`
- `pnpm-lock.yaml`
- `docs/CLEANUP_REPORT.md`
- `docs/CLEANUP_CANDIDATES.md`
- `docs/MODULARIZATION_TRACKER.md`
- `docs/CODEX_AUDIT.md`

Archivos eliminados principales:

- `src/app/components/AdminPanelPage.tsx`
- `src/app/components/BannerManagementPage.tsx`
- `src/app/components/CartPage.tsx`
- `src/app/components/CatalogPage.tsx`
- `src/app/components/CheckoutPages.tsx`
- `src/app/components/DeliveryPages.tsx`
- `src/app/components/DeliveryPanel.tsx`
- `src/app/components/DeliveryPanelPage.tsx`
- `src/app/components/FavoritesPage.tsx`
- `src/app/components/Footer.tsx`
- `src/app/components/HomePage.tsx`
- `src/app/components/LoginPageComponent.tsx`
- `src/app/components/Navbar.tsx`
- `src/app/components/NotificationsPage.tsx`
- `src/app/components/ProductCard.tsx`
- `src/app/components/ProductDetailPage.tsx`
- `src/app/components/ProfilePage.tsx`
- `src/app/components/SmartSearch.tsx`
- `src/app/components/TrackingPage.tsx`
- `src/app/components/figma/ImageWithFallback.tsx`
- `src/app/shared.ts`
- `src/features/refunds/components/RefundForm.tsx`
- `src/features/refunds/components/index.ts`
- `src/features/refunds/index.ts`

Dependencias eliminadas:

- `@emotion/react`
- `@emotion/styled`
- `@mui/icons-material`
- `@mui/material`
- `@popperjs/core`
- `canvas-confetti`
- `motion`
- `react-dnd`
- `react-dnd-html5-backend`
- `react-popper`
- `react-responsive-masonry`
- `react-router`
- `react-slick`

Estado de archivos principales:

- `App.tsx`: 192 lineas; sigue como orquestador principal.
- `AdminPanelPage.tsx`: 2001 lineas; se conserva pendiente de division interna.
- `src/app/data.ts`: se conserva como puente activo.
- `src/app/types.ts`: se conserva para tipos UI legacy.
- `src/domain`, `src/data`, `src/services` y `src/viewModels`: se conservan como arquitectura preparada para backend/API futura.

Resultado de build:

- `pnpm build`: exitoso.
- Bundle final JS: `546.06 kB`, gzip `130.97 kB`.
- CSS final: `125.27 kB`, gzip `20.00 kB`.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.
- Verificacion local: `pnpm dev --host 127.0.0.1` requirio permiso elevado por `listen EPERM`; Vite respondio `HTTP/1.1 200 OK` en `http://127.0.0.1:5174/` y luego se detuvo.

Notas de entorno:

- Tras limpiar dependencias, `pnpm build` requirio resincronizar `node_modules`.
- El intento dentro del sandbox fallo por DNS hacia `registry.npmjs.org`; se repitio `pnpm install --ignore-scripts --config.confirmModulesPurge=false` con permiso de red y finalizo correctamente.

Impacto visual esperado:

- Ninguno. No se cambiaron clases, estilos, layout, textos visibles, navegacion, cards, tablas, modales, formularios ni flujos visuales.
- No se implemento backend, API real, Supabase ni `fetch`.
- No se tocaron `frontend` ni `backend`.

Pendientes recomendados:

- Dividir internamente `AdminPanelPage.tsx` por secciones administrativas.
- Dividir `AppLayout.tsx` en navbar, barra secundaria, menus y footer.
- Dividir `TrackingPage.tsx` y `DeliveryPanelPage.tsx` en subcomponentes internos.
- Evaluar code splitting por feature para resolver el warning de chunk mayor a 500 kB.
- Mantener validacion visual antes de cualquier limpieza adicional de `src/app/components/ui/*`.

## Fase 13 - Division interna de modulos grandes

Fecha de actualizacion: 2026-07-05.

Objetivo:

- Dividir internamente los modulos grandes restantes sin cambiar la UI ni el comportamiento visual.
- Mantener `App.tsx` como orquestador principal.
- No introducir backend, Supabase, API real, `fetch`, router, state management ni librerias nuevas.

Baseline:

- `git status --short`: limpio antes de iniciar la fase.
- Build inicial: `pnpm build` exitoso.
- Advertencia existente: chunk JS mayor a 500 kB; no bloqueante.
- `AdminPanelPage.tsx`: 2001 lineas al inicio.
- `AppLayout.tsx`: 638 lineas al inicio.
- `TrackingPage.tsx`: 532 lineas al inicio.
- `DeliveryPanelPage.tsx`: 522 lineas al inicio.
- `App.tsx`: 192 lineas al inicio.

Archivos creados:

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

Archivos modificados:

- `src/features/admin/components/AdminPanelPage.tsx`
- `src/features/admin/sections/index.ts`
- `src/components/layout/AppLayout.tsx`
- `src/components/layout/index.ts`
- `src/features/orders/components/TrackingPage.tsx`
- `src/features/orders/components/index.ts`
- `src/features/delivery/components/DeliveryPanelPage.tsx`
- `src/features/delivery/components/index.ts`
- `docs/MODULARIZATION_TRACKER.md`
- `docs/CLEANUP_CANDIDATES.md`
- `docs/CODEX_AUDIT.md`

Lineas aproximadas antes/despues:

| Archivo | Antes | Despues | Nota |
|---|---:|---:|---|
| `AdminPanelPage.tsx` | 2001 | 831 | Se extrajo el bloque `SuperadminModules`; las secciones internas quedan agrupadas para limpieza posterior. |
| `AppLayout.tsx` | 638 | 285 | Se extrajeron dropdown de categorias, selector de sede, menu movil, footer y helpers visuales. |
| `TrackingPage.tsx` | 532 | 354 | Se extrajeron PIN, resumen de items, timeline, resena y modales de feedback. |
| `DeliveryPanelPage.tsx` | 522 | 126 | Se extrajeron modales, header, tabs, pedidos disponibles, viajes completados y viajes asignados. |
| `App.tsx` | 192 | 192 | No se modifico en esta fase. |

Builds ejecutados:

- Build inicial: exitoso.
- Build despues de dividir admin: exitoso.
- Build despues de dividir layout: exitoso.
- Build despues de dividir tracking: exitoso.
- Build despues de dividir delivery/final: exitoso.

Resultado final de build:

- `pnpm build`: exitoso.
- Modulos transformados: 1724.
- CSS final: `125.24 kB`, gzip `19.99 kB`.
- JS final: `547.73 kB`, gzip `131.68 kB`.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.

Verificacion local:

- `pnpm dev --host 127.0.0.1` dentro del sandbox fallo con `listen EPERM`.
- Con permiso para abrir puerto local, Vite arranco en `http://127.0.0.1:5174/` porque el puerto 5173 estaba ocupado.
- `curl -I http://127.0.0.1:5174/`: `HTTP/1.1 200 OK`.
- El servidor local fue detenido despues de la verificacion.

Decisiones:

- Se mantuvo el estado compartido en los componentes padres.
- La division fue mecanica, por props, sin cambiar clases, textos, condiciones, callbacks ni datos mock.
- No se dividio aun `SuperadminModules.tsx` porque sigue concentrando tabs, modales y estado administrativo compartido; queda como candidato de fase 14.
- No se introdujo code splitting dinamico, router ni estado global.

Impacto visual esperado:

- Ninguno. No se cambiaron colores, layout, responsive, textos visibles, navegacion, cards, tablas, modales, formularios, badges, columnas, imagenes ni flujos visuales.

Pendientes para fase 14:

1. Revisar si conviene dividir `SuperadminModules.tsx` por secciones administrativas mas pequenas.
2. Revisar props redundantes generadas por la division mecanica.
3. Evaluar imports/exports internos que puedan quedar sin uso despues de validacion visual.
4. Evaluar code splitting por feature para resolver el warning de chunk mayor a 500 kB, solo si se aprueba en una fase posterior.

## Fase 14 - Limpieza final y optimizacion interna

Fecha de actualizacion: 2026-07-05.

Objetivo:

- Limpiar codigo muerto y residuos posteriores a la modularizacion sin cambiar UI ni comportamiento visual.
- Revisar `src/features`, `src/components`, `src/services`, `src/viewModels`, `src/data`, `src/domain`, `src/app`, `src/imports`, `src/styles`, `package.json` y barrels.
- Mantener sin cambios backend, API real, Supabase, `fetch`, router, state management y code splitting dinamico.

Resumen:

- Se extrajo `InventarioTab` desde `src/features/admin/sections/SuperadminModules.tsx` a `src/features/admin/sections/AdminInventorySection.tsx`.
- Se limpiaron imports de iconos no usados en `AdminPanelPage.tsx` y `AppLayout.tsx`.
- Se redujeron barrels internos para exportar solo superficies publicas necesarias.
- Se elimino el barrel raiz `src/features/index.ts` porque no tenia consumidores.
- Se redujo `src/app/data.ts` retirando exports legacy sin referencias activas.
- Se retiro el adaptador legacy duplicado de notificaciones en `src/data/adapters.ts`.
- Se elimino el tipo `LegacyNotification` de `src/data/viewModels.ts`.
- Se deduplicaron imports de imagenes de recipes en `src/viewModels/recipeViewModels.ts`.
- Se elimino el resolver Figma `figma:asset` de `vite.config.ts`, sin referencias reales en el codigo actual.
- Se eliminaron `.DS_Store` residuales.

Archivos creados:

- `src/features/admin/sections/AdminInventorySection.tsx`

Archivos eliminados:

- `src/.DS_Store`
- `src/app/.DS_Store`
- `src/features/index.ts`

Archivos principales modificados:

- `src/app/data.ts`
- `src/components/layout/AppLayout.tsx`
- `src/components/layout/index.ts`
- `src/data/adapters.ts`
- `src/data/viewModels.ts`
- `src/features/admin/components/AdminPanelPage.tsx`
- `src/features/admin/sections/SuperadminModules.tsx`
- `src/features/admin/sections/index.ts`
- `src/features/delivery/components/index.ts`
- `src/features/orders/components/index.ts`
- `src/viewModels/recipeViewModels.ts`
- `vite.config.ts`
- `docs/CLEANUP_REPORT.md`
- `docs/MODULARIZATION_TRACKER.md`
- `docs/CLEANUP_CANDIDATES.md`
- `docs/CODEX_AUDIT.md`

Estado final de archivos grandes:

| Archivo | Estado final aproximado | Nota |
|---|---:|---|
| `src/app/App.tsx` | 192 lineas | Orquestador principal, sin cambios funcionales. |
| `src/features/admin/components/AdminPanelPage.tsx` | 824 lineas | Orquestador admin; se limpiaron imports. |
| `src/features/admin/sections/SuperadminModules.tsx` | 1044 lineas | Se extrajo inventario; quedan tabs/secciones compartidas. |
| `src/features/admin/sections/AdminInventorySection.tsx` | 153 lineas | Nuevo modulo extraido sin cambios visuales. |
| `src/components/layout/AppLayout.tsx` | 284 lineas | Se limpiaron imports. |
| `src/features/orders/components/TrackingPage.tsx` | 354 lineas | Sin cambios en esta fase. |
| `src/features/delivery/components/DeliveryPanelPage.tsx` | 126 lineas | Sin cambios en esta fase. |

Resultado de build:

- `pnpm build`: exitoso.
- Build final: 1725 modulos transformados.
- JS final: `545.84 kB`, gzip `131.25 kB`.
- CSS final: `125.24 kB`, gzip `19.99 kB`.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.

Verificacion local:

- `pnpm dev --host 127.0.0.1` fallo dentro del sandbox con `listen EPERM`.
- Con permiso elevado, Vite arranco en `http://127.0.0.1:5173/`.
- `curl -I http://127.0.0.1:5173/` respondio `HTTP/1.1 200 OK`.
- El servidor temporal fue detenido despues de la verificacion.

Notas:

- `pnpm exec tsc --version` fallo porque `tsc` no esta instalado localmente; no se instalaron dependencias nuevas.
- No se eliminaron dependencias en esta fase porque las dependencias restantes tienen imports activos, sostienen UI base o pertenecen al build.
- No se eliminaron assets aprobados: todos aparecen referenciados en codigo activo o en build.

Impacto visual esperado:

- Ninguno. No se cambiaron clases, colores, layout, responsive, textos visibles, navegacion, cards, tablas, modales, formularios, badges, imagenes ni flujos visuales.

Proximos pasos:

1. Evaluar code splitting por feature en una fase separada para resolver el warning de chunk mayor a 500 kB.
2. Mantener `src/app/data.ts` como puente hasta reemplazar gradualmente imports legacy por servicios/view models directos.
3. Mantener `src/app/types.ts` hasta definir tipos UI finales separados del modelo DB.
4. Dividir mas `SuperadminModules.tsx` solo si se puede aislar estado por seccion administrativa sin riesgo visual.

Reporte detallado:

- Ver `docs/CLEANUP_REPORT.md`.
