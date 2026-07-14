# VISUAL_ADAPTERS - Farmahumana / FHEC

La Fase 5 agrega adaptadores visuales para productos y cupones. Estos adaptadores no modifican el modelo de dominio; convierten datos mock centralizados y metadata temporal al shape exacto que consume el prototipo aprobado.

## Archivos creados

- `src/viewModels/productViewModels.ts`
- `src/viewModels/couponViewModels.ts`
- `src/viewModels/index.ts`

## Productos

View models creados:

- `ProductCardViewModel`
- `ProductDetailViewModel`
- `ProductSearchViewModel`
- `ProductSimilarViewModel`
- `ProductCartItemViewModel`
- `ProductAdminCatalogViewModel`
- `ProductAdminInventoryViewModel`
- `ProductRecipeAuditViewModel`

Adaptadores creados:

- `toProductCardViewModel(producto, options)`
- `toProductDetailViewModel(producto, options)`
- `toProductSearchViewModel(producto, options)`
- `toProductSimilarViewModel(producto, options)`
- `toProductCartItemViewModel(carritoItem, producto, sede, options)`
- `toProductAdminCatalogViewModel(producto, options)`
- `toProductAdminInventoryViewModel(producto, inventario, sede, options)`
- `toProductRecipeAuditViewModel(recipe, detallePedido, producto, pedido, options)`
- `getAppProductViewModels()`
- `getProductCardViewModels()`
- `getFrequentlyBoughtTogetherProductIds()`

Datos preservados visualmente:

- `name`, `brand`, `category`, `presentation`.
- `packSize` como `"30"`, `"28"`, etc., no como `"x 30"`.
- `priceUSD`, `discount`, `stock`, `stockSedes`.
- `needsRecipe`, `controlledSubstance`.
- `rating`, `reviews`, `bgColor`, `accentColor`.
- `description`, `activeIngredient`, `contraindications`, `posology`.
- `concentration`, `concentrationUnit`.

Datos de DB mock usados:

- `mockProductos`
- `mockCategorias`
- `mockInventarioSedes`
- `nivel_control`, `estado_producto`, `precio_usd`, `descuento_porcentaje`.

Metadata visual temporal:

- `mockProductoVisual` mantiene rating, reviews, colores, contraindicaciones y posologia visual.
- El stock global visible se deriva de `mockInventarioSedes`.
- `controlledSubstance` se deriva de `NivelControlProducto.RecipeDigitalFisico`.

## Cupones

View models creados:

- `CouponAdminViewModel`
- `CouponProfileViewModel`
- `CouponApplyViewModel`
- `CouponBadgeViewModel`

Adaptadores creados:

- `toCouponAdminViewModel(cupon, options)`
- `toCouponProfileViewModel(cupon, options)`
- `toCouponApplyViewModel(cupon, options)`
- `toCouponBadgeViewModel(status)`
- `getCouponVisualStatus(cupon, options)`
- `formatCouponDiscount(cupon)`
- `formatCouponDateRange(cupon)`
- `getCouponApplyViewModels()`
- `getCouponApplyCodeMap()`
- `getCouponAdminViewModels()`
- `getCouponProfileViewModels(id_usuario?)`
- `getLegacyAdminCouponViewModels()`
- `getLegacyProfileCouponViewModels()`

Datos preservados visualmente:

- Mapa de aplicacion: `FHEC10`, `SALUD15`, `BIENVENIDO`, `FHEC2024`.
- Cupones admin: `FARMA10`, `BIENVENIDA20`, `VERANO5`, `VIP2024`.
- Cupones de perfil: estados `vigente`, `usado`, `vencido`.
- Fechas visibles en formato `YYYY-MM-DD`.
- `userEmail` para cupon exclusivo.
- Badge de descuento como `% OFF`.

Datos de DB mock usados:

- `mockCupones` para cupones aplicables y adaptadores de dominio.
- `mockPedidos` para derivar uso cuando se trabaja con `Cupon` real.
- `mockUsuarios` para resolver correo de cupon de usuario.

Metadata visual temporal:

- Las listas legacy de admin/perfil viven en `couponViewModels.ts` porque los codigos actuales aprobados no coinciden todavia con `mockCupones`.
- No se agrego `estado_cupon` al dominio. Vigente/vencido/usado se deriva en adaptadores.

## Reemplazos hechos

- `App.tsx` reemplazo el array inline `PRODUCTS` por `getAppProductViewModels()`.
- `App.tsx` reemplazo `DISCOUNT_CODES` por `getCouponApplyCodeMap()`.
- `App.tsx` reemplazo los cupones admin por `getLegacyAdminCouponViewModels()`.
- `App.tsx` reemplazo los cupones de perfil por `getLegacyProfileCouponViewModels()`.
- `src/app/data.ts` ahora exporta `PRODUCTS` y `DISCOUNT_CODES` desde estos adaptadores exactos.

## Pendiente

- `BRAND_SYNONYMS` y `FREQUENTLY_BOUGHT_TOGETHER` siguen en `App.tsx`.
- Admin operativo, auditoria, delivery, reembolsos y notificaciones siguen con mocks locales.
- `DEMO_RECIPES` requiere adapter visual con imagenes y estados exactos antes de conectarse.
- `DOC_TYPES` sigue local por la diferencia `G` vs `RIF`.

## Riesgo

Los reemplazos hechos son de bajo riesgo porque mantienen los mismos nombres de constantes y el mismo shape. Las zonas de mayor riesgo siguen siendo carrito profundo, checkout, admin operativo, delivery y auditoria, porque combinan datos mock con estado local editable.
