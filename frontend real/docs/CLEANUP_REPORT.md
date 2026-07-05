# CLEANUP_REPORT - Farmahumana / FHEC

Fecha: 2026-07-05 19:11:46 -04.

## Resumen

La fase 12 elimino residuos comprobados del export de Figma Make y de la modularizacion previa sin cambiar la UI ni los flujos visuales. La limpieza se centro en archivos legacy no importados, assets sin referencia, helpers duplicados en `App.tsx`, un feature legacy de reembolso sin ruta activa y dependencias claramente no importadas.

No se modifico `backend`.
No se modifico `frontend` de pruebas.
No se implemento API real, Supabase, `fetch`, persistencia ni backend.

## Baseline antes de limpieza

| Elemento | Estado |
|---|---|
| `git status --short` | limpio antes de iniciar la fase |
| Build inicial | `pnpm build` exitoso |
| Warning inicial | chunk JS mayor a 500 kB, no bloqueante |
| `App.tsx` inicial | 287 lineas |
| `AdminPanelPage.tsx` inicial | 2001 lineas |
| Fuente visual activa | `src/features`, `src/components/layout`, `src/components/product`, `src/app/data.ts` como puente |
| Candidatos base | `docs/CLEANUP_CANDIDATES.md` |

## Acciones realizadas

| Ruta | Tipo | Evidencia | Accion | Riesgo | Resultado |
|---|---|---|---|---|---|
| `src/app/App.tsx` | helpers, tipos y mocks duplicados | `rg` y revision manual confirmaron que existian en `src/app/data.ts` o `src/app/types.ts` | Se reemplazaron por imports desde `./data` y `./types` | bajo | Build exitoso; `App.tsx` quedo en 192 lineas |
| `src/app/components/*.tsx` legacy | pantallas Figma duplicadas | No habia imports activos desde `src`; las versiones activas viven en `src/features` o `src/components` | Se eliminaron 20 archivos legacy | bajo-medio | Build exitoso |
| `src/app/components/figma/ImageWithFallback.tsx` | helper Figma legacy | Solo sostenia pantallas legacy eliminadas | Se elimino | bajo | Build exitoso |
| `src/app/shared.ts` | puente legacy | Solo era usado por pantallas legacy de `src/app/components` | Se elimino | bajo | Build exitoso |
| `src/features/refunds/*` | feature legacy no conectado | `rg` encontro referencias solo en docs; `src/features/index.ts` exportaba el barrel pero no habia render activo | Se elimino y se quito el export del barrel | medio | Build exitoso |
| `src/imports/Captura_de_pantalla_*.png` | capturas residuales | No habia imports, rutas ni referencias en `src`; solo aparecian en docs de candidatos | Se eliminaron | medio | Build exitoso |
| `src/imports/IMG_2380.PNG`, `IMG_2381.PNG`, `IMG_2382.PNG` | imagenes residuales | No habia imports, rutas ni referencias en `src` | Se eliminaron | medio | Build exitoso |
| `src/imports/WhatsApp_Image_*.jpeg` | imagenes residuales | No habia imports, rutas ni referencias en `src` | Se eliminaron | medio | Build exitoso |
| `src/imports/image*.png` | imagenes Figma residuales | No habia imports, rutas ni referencias en `src` | Se eliminaron | medio | Build exitoso |
| `src/imports/pasted_text/*.md` | notas historicas de prototipo | No forman parte del build ni de `src` activo | Se movieron a `docs/archive` | bajo | Build exitoso |
| `package.json` y `pnpm-lock.yaml` | dependencias no usadas | `rg` confirmo cero imports activos | Se eliminaron 13 dependencias no usadas y se sincronizo lockfile | medio | Build exitoso |

## Archivos eliminados

Pantallas y componentes legacy de `src/app/components`:

- `AdminPanelPage.tsx`
- `BannerManagementPage.tsx`
- `CartPage.tsx`
- `CatalogPage.tsx`
- `CheckoutPages.tsx`
- `DeliveryPages.tsx`
- `DeliveryPanel.tsx`
- `DeliveryPanelPage.tsx`
- `FavoritesPage.tsx`
- `Footer.tsx`
- `HomePage.tsx`
- `LoginPageComponent.tsx`
- `Navbar.tsx`
- `NotificationsPage.tsx`
- `ProductCard.tsx`
- `ProductDetailPage.tsx`
- `ProfilePage.tsx`
- `SmartSearch.tsx`
- `TrackingPage.tsx`
- `figma/ImageWithFallback.tsx`

Otros archivos eliminados:

- `src/app/shared.ts`
- `src/features/refunds/components/RefundForm.tsx`
- `src/features/refunds/components/index.ts`
- `src/features/refunds/index.ts`

Assets eliminados de `src/imports`:

- `Captura_de_pantalla_2026-06-21_095718.png`
- `Captura_de_pantalla_2026-07-04_a_la_s__3.59.42_p._m..png`
- `Captura_de_pantalla_2026-07-04_a_la_s__4.01.30_p._m..png`
- `Captura_de_pantalla_2026-07-04_a_la_s__5.24.14_p._m..png`
- `Captura_de_pantalla_2026-07-04_a_la_s__5.29.00_p._m..png`
- `Captura_de_pantalla_2026-07-04_a_la_s__5.50.21_p._m..png`
- `Captura_de_pantalla_2026-07-04_a_la_s__7.59.46_p._m..png`
- `Captura_de_pantalla_2026-07-04_a_la_s__8.01.26_p._m..png`
- `IMG_2380.PNG`
- `IMG_2381.PNG`
- `IMG_2382.PNG`
- `WhatsApp_Image_2026-07-04_at_16.44.26.jpeg`
- `WhatsApp_Image_2026-07-04_at_16.44.49.jpeg`
- `WhatsApp_Image_2026-07-04_at_16.47.00.jpeg`
- `image.png`
- `image-1.png`
- `image-2.png`
- `image-3.png`

## Archivos movidos

Se movieron notas historicas desde `src/imports/pasted_text` hacia `docs/archive`:

- `farmahumana-prototype-correcti.md`
- `navegacion-y-producto-ajustes.md`
- `responsive-mobile-fixes.md`

## Archivos modificados

- `src/app/App.tsx`
- `src/features/index.ts`
- `package.json`
- `pnpm-lock.yaml`
- `docs/CLEANUP_REPORT.md`
- `docs/CLEANUP_CANDIDATES.md`
- `docs/CODEX_AUDIT.md`
- `docs/MODULARIZATION_TRACKER.md`

## Dependencias eliminadas

Se eliminaron dependencias sin imports activos en `src`:

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

Dependencias conservadas por uso activo o por ser base UI:

- React, React DOM, Vite, Tailwind y plugin React.
- Radix/shadcn, aunque varios archivos UI base no estan renderizados hoy.
- `lucide-react`, `sonner`, `next-themes`, `cmdk`, `input-otp`, `embla-carousel-react`, `react-day-picker`, `react-hook-form`, `recharts`, `vaul`, `tw-animate-css`, `tailwind-merge`, `clsx`.

## Assets conservados

Se conservaron los assets que aparecen importados en codigo activo o en el build:

- `src/imports/logo-farmahumana.png`
- `src/imports/codigoqr-usuario.jpg`
- `src/imports/recipe-Ana.jpg`
- `src/imports/recipe-Jose.jpg`
- `src/imports/recipe-Maria.jpg`

## Builds de control

| Momento | Resultado |
|---|---|
| Baseline antes de limpiar | `pnpm build` exitoso |
| Despues de limpiar `App.tsx` y legacy components | `pnpm build` exitoso |
| Despues de limpiar assets | `pnpm build` exitoso |
| Despues de limpiar dependencias y sincronizar `pnpm-lock.yaml` | `pnpm build` exitoso |
| Build final | `pnpm build` exitoso |

Build final:

- 1703 modulos transformados.
- JS final: `546.06 kB`, gzip `130.97 kB`.
- CSS final: `125.27 kB`, gzip `20.00 kB`.
- Persiste la advertencia no bloqueante de chunk JS mayor a 500 kB.

Nota de entorno:

- Tras limpiar dependencias, `pnpm build` requirio resincronizar `node_modules`.
- El sandbox sin red genero errores `ENOTFOUND registry.npmjs.org`.
- Se repitio `pnpm install --ignore-scripts --config.confirmModulesPurge=false` con permiso de red y finalizo correctamente.

## Verificacion local

| Comando | Resultado |
|---|---|
| `pnpm dev --host 127.0.0.1` | Primer intento en sandbox fallo con `listen EPERM` al abrir `127.0.0.1:5173`. |
| `pnpm dev --host 127.0.0.1` con permiso elevado | Exitoso; Vite uso `http://127.0.0.1:5174/` porque `5173` estaba ocupado. |
| `curl -I http://127.0.0.1:5174/` con permiso elevado | `HTTP/1.1 200 OK`. |

El servidor Vite temporal fue detenido despues de la verificacion.

## Candidatos no eliminados por riesgo

| Ruta | Motivo |
|---|---|
| `src/app/components/ui/*` | Componentes base shadcn/Radix. Aunque casi no entran al bundle activo, pueden ser reutilizados y no deben borrarse sin decision especifica. |
| `src/app/data.ts` | Puente activo hacia datos/view models legacy usados por features. |
| `src/app/types.ts` | Tipos UI legacy activos; no deben fusionarse aun con `src/domain/types.ts`. |
| `src/domain/*` | Contratos alineados con DB final, aunque no todos se usen todavia. |
| `src/services/*` | Capa mock/API futura documentada. |
| `src/viewModels/*` | Adaptadores visuales usados para preservar UI. |
| `src/data/*` | Fuente mock central. |
| `src/features/admin/components/AdminPanelPage.tsx` | Sigue grande, pero dividirlo requiere validar tabs, modales y estado interno. |
| `src/components/layout/AppLayout.tsx` | Puede dividirse mas adelante, pero tocar navbar/footer ya es riesgo visual. |
| `src/features/orders/components/TrackingPage.tsx` | Puede dividirse en timeline, resumen y reseña despues. |
| `src/features/delivery/components/DeliveryPanelPage.tsx` | Puede dividirse en tabs/cards/modales despues. |

## Riesgos restantes

- El bundle JS sigue superando 500 kB. No se cambio por ahora porque resolverlo requiere code splitting o cambios de arquitectura.
- `AdminPanelPage.tsx` mantiene muchas responsabilidades administrativas en un solo archivo.
- `src/app/components/ui/*` conserva componentes UI base no usados hoy; se recomienda decidir su politica antes de eliminarlos.
- `src/app/data.ts` y `src/app/types.ts` siguen como puentes legacy necesarios para la UI actual.

## Recomendaciones para la siguiente fase

1. Dividir internamente `AdminPanelPage.tsx` por secciones administrativas con validacion visual.
2. Dividir `AppLayout.tsx` en navbar superior, barra secundaria, selector de sede, menus y footer.
3. Evaluar code splitting por feature para eliminar el warning de chunk mayor a 500 kB.
4. Mantener `src/app/data.ts` hasta que los features consuman servicios/view models directamente.
5. Mantener `src/app/types.ts` hasta definir tipos UI estables separados del modelo DB.
6. Revisar componente por componente `src/app/components/ui/*` antes de cualquier eliminacion.
