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
