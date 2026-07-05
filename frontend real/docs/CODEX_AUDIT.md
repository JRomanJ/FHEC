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
