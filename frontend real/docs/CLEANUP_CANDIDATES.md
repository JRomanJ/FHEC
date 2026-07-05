# CLEANUP_CANDIDATES - Farmahumana / FHEC

Fecha: 2026-07-05.

Este documento prepara la fase 12 de limpieza exhaustiva. No se borraron archivos de riesgo medio o alto en la fase 11. El build pasa despues de la modularizacion final, por lo que los candidatos listados aqui deben revisarse con comparacion visual y build antes de eliminarse o fusionarse.

## Actualizacion Fase 12

La fase 12 ya proceso una parte importante de este inventario. Ver `docs/CLEANUP_REPORT.md` para la evidencia completa.

Procesado y eliminado:

- Duplicados legacy en `src/app/components/*`, excepto `src/app/components/ui/*`.
- `src/app/components/figma/ImageWithFallback.tsx`.
- `src/app/shared.ts`.
- `src/features/refunds/*`, porque no tenia ruta activa ni imports reales.
- Assets no referenciados en `src/imports`: capturas, `IMG_238*.PNG`, `WhatsApp_Image_*.jpeg` e `image*.png`.
- Dependencias no importadas: MUI, Emotion, Popper, canvas-confetti, motion, React DnD, React Popper, React Masonry, React Router y React Slick.

Procesado y movido:

- `src/imports/pasted_text/*.md` hacia `docs/archive`.

Conservado por riesgo o valor arquitectonico:

- `src/app/components/ui/*`.
- `src/app/data.ts`.
- `src/app/types.ts`.
- `src/domain`, `src/data`, `src/services` y `src/viewModels`.
- `src/features/admin/components/AdminPanelPage.tsx`, pendiente de division interna.
- `src/components/layout/AppLayout.tsx`, pendiente de division interna.

## Criterios

| Riesgo | Significado | Accion recomendada |
|---|---|---|
| bajo | Evidencia fuerte de que no participa en el montaje actual o es duplicado simple. | Borrar o fusionar en fase 12 si build y revision visual pasan. |
| medio | Puede ser referencia visual, prototipo alterno, puente temporal o material de Figma. | Revisar manualmente antes de borrar. |
| alto | Puede sostener UI, tipos, estilos o componentes base compartidos. | Conservar hasta tener sustituto probado. |

## Archivos posiblemente no usados

| Ruta | Tipo de residuo | Evidencia | Riesgo | Recomendacion |
|---|---|---|---|---|
| `src/app/components/AdminPanelPage.tsx` | pantalla legacy generada | El panel activo vive en `src/features/admin/components/AdminPanelPage.tsx`; no hay imports activos desde `src/app/components`. | medio | Revisar visualmente contra el feature actual; borrar en fase 12 si no aporta diferencias aprobadas. |
| `src/app/components/BannerManagementPage.tsx` | pantalla legacy generada | La pagina activa vive en `src/features/admin/components/BannerManagementPage.tsx`. | medio | Revisar y borrar en fase 12 si es duplicado. |
| `src/app/components/CartPage.tsx` | pantalla legacy generada | El carrito activo vive en `src/features/cart/components/CartPage.tsx`. | medio | Comparar contra feature; borrar si no queda uso. |
| `src/app/components/CatalogPage.tsx` | pantalla legacy generada | Catalogo activo en `src/features/catalog/components/CatalogPage.tsx`. | medio | Borrar solo despues de confirmar que no conserva variantes visuales. |
| `src/app/components/CheckoutPages.tsx` | pantalla legacy generada | Checkout/pago activos en `src/features/checkout` y `src/features/payment`. | medio | Revisar manualmente. |
| `src/app/components/DeliveryPages.tsx` | pantalla legacy generada | Flujo de entrega activo en `src/features/checkout`; panel repartidor activo en `src/features/delivery`. | medio | Revisar manualmente. |
| `src/app/components/DeliveryPanel.tsx` | pantalla legacy generada | Panel activo en `src/features/delivery/components/DeliveryPanelPage.tsx`. | medio | Revisar y borrar si es duplicado. |
| `src/app/components/DeliveryPanelPage.tsx` | pantalla legacy generada | Panel activo en `src/features/delivery/components/DeliveryPanelPage.tsx`. | medio | Revisar y borrar si es duplicado. |
| `src/app/components/FavoritesPage.tsx` | pantalla legacy generada | Favoritos activo en `src/features/favorites/components/FavoritesPage.tsx`. | medio | Revisar y borrar si es duplicado. |
| `src/app/components/Footer.tsx` | layout legacy generado | Footer activo en `src/components/layout/AppLayout.tsx`. | medio | Revisar y borrar si es duplicado. |
| `src/app/components/HomePage.tsx` | pantalla legacy generada | Home activo en `src/features/catalog/components/HomePage.tsx`. | medio | Revisar visualmente. |
| `src/app/components/LoginPageComponent.tsx` | auth legacy generado | Auth activo en `src/features/auth/components/LoginPage.tsx`. | medio | Revisar porque puede contener detalles visuales de Figma. |
| `src/app/components/Navbar.tsx` | layout legacy generado | Navbar activo en `src/components/layout/AppLayout.tsx`. | medio | Revisar y borrar si es duplicado. |
| `src/app/components/NotificationsPage.tsx` | pantalla legacy generada | Notificaciones activas en `src/features/notifications/components/NotificationsPage.tsx`. | medio | Revisar y borrar si es duplicado. |
| `src/app/components/ProductCard.tsx` | producto legacy generado | Componente activo en `src/components/product/ProductDisplay.tsx`. | medio | Revisar porque puede tener variantes de card. |
| `src/app/components/ProductDetailPage.tsx` | pantalla legacy generada | Detalle activo en `src/features/product-detail/components/ProductDetailPage.tsx`. | medio | Revisar visualmente. |
| `src/app/components/ProfilePage.tsx` | perfil legacy generado | Perfil activo en `src/features/profile/components/ProfilePage.tsx`. | medio | Revisar porque usa `codigoqr-usuario.jpg` en version legacy. |
| `src/app/components/SmartSearch.tsx` | busqueda legacy generada | Busqueda activa en `src/features/search/components/SmartSearch.tsx`. | medio | Revisar y borrar si es duplicado. |
| `src/app/components/TrackingPage.tsx` | tracking legacy generado | Tracking activo en `src/features/orders/components/TrackingPage.tsx`. | medio | Revisar y borrar si es duplicado. |
| `src/app/components/figma/ImageWithFallback.tsx` | helper Figma | No aparece import activo fuera de `src/app/components`. | medio | Conservar hasta borrar pantallas legacy; luego revisar si queda sin uso. |
| `src/app/shared.ts` | puente/legacy | No se detectan imports activos desde `src` en esta fase. | medio | Revisar contenido y fusionar con `src/app/data.ts`, `src/data` o eliminar si queda sin uso. |

## Componentes UI base que NO deben borrarse sin confirmacion

| Ruta | Tipo | Evidencia | Riesgo | Recomendacion |
|---|---|---|---|---|
| `src/app/components/ui/sonner.tsx` | UI base activa | `src/app/App.tsx` importa `Toaster` desde este archivo. | alto | Conservar. |
| `src/app/components/ui/*.tsx` | UI base shadcn/Radix generada | Varios componentes pueden ser usados por features presentes o futuras aunque no todos aparezcan importados hoy. | alto | No borrar en fase 12 sin busqueda de imports y prueba visual. |
| `src/app/components/ui/use-mobile.ts` | hook UI base | Puede ser usado por componentes UI o futuras pantallas. | medio | Revisar imports antes de borrar. |
| `src/app/components/ui/utils.ts` | helper UI base | Puede sostener variantes/clases de componentes UI. | medio | Revisar imports antes de borrar. |

## Exports, imports y funciones legacy

| Ruta | Tipo de residuo | Evidencia | Riesgo | Recomendacion |
|---|---|---|---|---|
| `src/app/App.tsx` (`VES_RATE`, `fmtVES`, `fmtUSD`, `H7`, `H9`, `effectivePrice`) | helpers duplicados | Despues de fase 11, estos helpers ya tienen equivalentes en `src/app/data.ts` y varios features los importan desde alli. | bajo | Eliminar del orquestador en fase 12 si `rg` confirma que no se usan en `App.tsx`. |
| `src/app/App.tsx` (`FREQUENTLY_BOUGHT_TOGETHER`) | mock legacy inline | No hay referencia activa en `App.tsx` despues de fase 11. Existe export central en `src/app/data.ts`/`src/data`. | bajo | Borrar del orquestador en fase 12 si build pasa. |
| `src/features/refunds/components/RefundForm.tsx` | componente legacy aislado | Se extrajo desde `App.tsx`, pero no hay ruta activa que lo renderice actualmente. | medio | Decidir si se conecta a perfil/reembolsos o se elimina tras validar flujo real. |
| `src/features/admin/components/AdminPanelPage.tsx` | archivo grande pendiente | Tiene 2001 lineas y contiene varias secciones internas. | medio | Dividir por secciones admin en fase posterior si no cambia UI. |
| `src/components/layout/AppLayout.tsx` | layout grande pendiente | Contiene navbar, dropdowns, selector de sede, menu movil y footer en un solo archivo. | medio | Dividir en `TopNavigationBar`, `SecondaryNavigationBar`, `Footer`, `SedeSelector` despues de validacion visual. |
| `src/features/orders/components/TrackingPage.tsx` | feature grande pendiente | Contiene timeline, demo controls, review, recipe rejected y resumen. | medio | Dividir internamente despues de validar flujo. |
| `src/features/delivery/components/DeliveryPanelPage.tsx` | feature grande pendiente | Contiene tabs, modales, filtros, cards y tabla de viajes. | medio | Dividir internamente despues de validar flujo. |

## Duplicados entre capas

| Ruta | Tipo de duplicado | Evidencia | Riesgo | Recomendacion |
|---|---|---|---|---|
| `src/app/types.ts` vs `src/domain/types.ts` | tipos legacy vs dominio DB | Features visuales usan `src/app/types.ts`; dominio DB vive en `src/domain/types.ts`. | alto | Conservar ambos hasta crear tipos UI definitivos o adaptadores tipados. |
| `src/app/data.ts` vs `src/data/*` | puente legacy vs mocks centralizados | Muchos features importan helpers y datos legacy desde `src/app/data.ts`; `src/data` es la fuente mock central. | alto | Mantener como puente; reducir exports gradualmente. |
| `src/app/shared.ts` vs `src/app/data.ts` | posible puente duplicado | `src/app/shared.ts` aparece documentado como puente temporal, pero no se detectan imports activos en `src`. | medio | Revisar contenido y fusionar/eliminar en fase 12. |
| `src/services/*` vs `src/viewModels/*` | consultas mock vs adaptadores visuales | Es una separacion intencional; no borrar. | alto | Conservar; documentar contratos antes de API real. |
| `src/data/viewModels.ts` vs `src/viewModels/*` | view models en dos carpetas | `src/data/viewModels.ts` importa tipos de `src/app/types`; `src/viewModels` contiene adaptadores principales. | medio | Revisar si `src/data/viewModels.ts` sigue siendo necesario o debe moverse/fusionarse. |

## Mocks viejos o reemplazados

| Ruta | Tipo de mock | Evidencia | Riesgo | Recomendacion |
|---|---|---|---|---|
| `src/app/components/*` | mocks internos de pantallas legacy | Varias pantallas generadas por Figma pueden tener mocks propios desconectados del `src/data` central. | medio | No borrar sin comparar contra features actuales. |
| `src/app/App.tsx` (`DEMO_ACCOUNTS`, `DEMO_CONTACT`, `DISCOUNT_CODES`, `SEDES`) | mocks/orquestacion aun activos | Siguen alimentando auth, perfil, carrito/checkout y delivery select. | alto | No borrar; mover a puente/service cuando se haga limpieza controlada. |
| `src/app/data.ts` (`DEMO_*`, `PRODUCTS`, `DISCOUNT_CODES`) | exports legacy compatibles | Aun lo consumen features y admin. | alto | Conservar en fase 12; solo fusionar con pruebas. |

## Assets e imagenes

| Ruta | Tipo de residuo | Evidencia | Riesgo | Recomendacion |
|---|---|---|---|---|
| `src/imports/logo-farmahumana.png` | asset activo | Usado por auth y layout activo; aparece en build. | alto | Conservar. |
| `src/imports/codigoqr-usuario.jpg` | asset activo | Usado por `src/features/profile/components/ProfilePage.tsx`. | alto | Conservar. |
| `src/imports/recipe-Ana.jpg` | asset activo | Usado por `src/data/mockRecipes.ts` y `src/viewModels/recipeViewModels.ts`. | alto | Conservar. |
| `src/imports/recipe-Jose.jpg` | asset activo | Usado por `src/data/mockRecipes.ts` y `src/viewModels/recipeViewModels.ts`. | alto | Conservar. |
| `src/imports/recipe-Maria.jpg` | asset activo | Usado por `src/data/mockRecipes.ts` y `src/viewModels/recipeViewModels.ts`. | alto | Conservar. |
| `src/imports/Captura_de_pantalla_*.png` | posible residuo Figma/referencia | No se detectaron imports activos en `src`; nombres indican capturas. | medio | Revisar visualmente; mover a `docs/assets` o borrar si no se necesita. |
| `src/imports/IMG_2380.PNG`, `IMG_2381.PNG`, `IMG_2382.PNG` | posible residuo visual | No se detectaron imports activos en features actuales. | medio | Revisar manualmente antes de borrar. |
| `src/imports/WhatsApp_Image_*.jpeg` | posible residuo visual | No se detectaron imports activos en features actuales. | medio | Revisar manualmente antes de borrar. |
| `src/imports/image.png`, `image-1.png`, `image-2.png`, `image-3.png` | posible residuo Figma | No se detectaron imports activos en features actuales. | medio | Revisar manualmente antes de borrar. |
| `src/imports/pasted_text/*.md` | notas/procedencia Figma | No forman parte de build; pueden ser referencia historica. | bajo | Mover a `docs/archive` o borrar si el equipo confirma que ya no hacen falta. |

## Build, temporales y generados

| Ruta | Tipo | Evidencia | Riesgo | Recomendacion |
|---|---|---|---|---|
| `dist/` | build generado | `pnpm build` lo regenera. | bajo | Debe permanecer ignorado por Git; borrar localmente solo si se quiere limpiar workspace. |
| `node_modules/` | dependencias instaladas | Generado por `pnpm install`. | bajo | Debe permanecer ignorado por Git. |
| `.env`, `.env.local` | secretos/config local | No deben versionarse. | alto | Mantener en `.gitignore`; no crear valores reales en esta fase. |

## Recomendacion para fase 12

1. Ejecutar `rg` de imports por cada candidato antes de borrar.
2. Borrar primero `src/app/App.tsx` helpers inline sin uso y `FREQUENTLY_BOUGHT_TOGETHER`, si el build sigue pasando.
3. Comparar `src/app/components/*` contra los features activos y eliminar solo duplicados confirmados.
4. No borrar `src/app/components/ui/*` salvo que se confirme archivo por archivo.
5. Revisar assets no importados con inspeccion visual antes de eliminarlos.
6. Mantener `src/app/data.ts` y `src/app/types.ts` hasta que los features usen una capa UI/domain mas estable.
7. Dividir internamente `AdminPanelPage.tsx`, `AppLayout.tsx`, `TrackingPage.tsx` y `DeliveryPanelPage.tsx` solo despues de validar que la UI se conserva.
