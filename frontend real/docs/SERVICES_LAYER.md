# SERVICES_LAYER - Farmahumana / FHEC

`src/services` es la capa mock que prepara al frontend para una API futura. En esta fase todos los servicios leen desde `src/data`; no hay llamadas reales a backend, Supabase ni `fetch`.

## Diferencia entre data y services

- `src/data`: contiene arrays mock, selectores puros y adapters legacy.
- `src/services`: expone casos de lectura por dominio, simulando los endpoints o consultas que luego vendran del backend.
- `src/config/api.ts`: define placeholders (`USE_MOCK_DATA`, `API_BASE_URL`, `API_TIMEOUT_MS`) sin obligar a `.env`.
- `src/services/httpClient.ts`: placeholder documentado para futura API. Si se usa hoy, lanza error intencional.

## Servicios creados

- `categoryService.ts`: `getCategorias`, `getCategoriaById`, `getCategoriasParaFiltro`, `getCategoriasParaNavbar`, `getCategoriasParaFooter`, `getCategoriasParaAdmin`.
- `productService.ts`: `getProductos`, `getProductosHabilitados`, `getProductoById`, `getProductosByCategoria`, `getProductosByPrincipioActivo`, `getProductosSimilares`, `getProductosDisponiblesPorSede`, `buscarProductos`, `getFormasFarmaceuticas`, `getProductosParaCatalogo`, `getProductoDetalle`, helpers legacy de productos.
- `sedeService.ts`: `getSedes`, `getSedesHabilitadas`, `getSedeById`, `sedeEsSeleccionable`, adapters legacy de sedes.
- `inventoryService.ts`: `getInventario`, `getInventarioBySede`, `getInventarioByProducto`, `getStockDisponible`, `productoDisponibleEnSede`, `getProductosConStockPorSede`.
- `couponService.ts`: `getCupones`, `getCuponByCodigo`, `getCuponesGenerales`, `getCuponesDeUsuario`, `getCuponesVisiblesParaUsuario`, `cuponEstaVigente`, `validarCuponParaUsuario`, `existeCuponVigenteConCodigo`, `getEstadoVisualCupon`.
- `userService.ts`: `getUsuarios`, `getUsuarioById`, `getUsuarioByCorreo`, `getUsuarioActualMock`, `getUsuarioActualAuthMock`, `getUsuariosOperativos`, `getDemoAccounts`.
- `authService.ts`: `loginMock`, `logoutMock`, `validarCredencialesMock`.
- `profileService.ts`: `getPerfilUsuario`, `getPreferenciasNotificacion`, `getHistorialPedidosUsuario`, `getCuponesPerfilUsuario`, `getSolicitudesReembolsoUsuario`.
- `orderService.ts`: `getPedidos`, `getPedidoById`, `getPedidosByUsuario`, `getPedidoActivoByUsuario`, `getDetallesByPedido`, `getResumenPedido`, `getPedidosPorEstado`, `getPedidosPorPreparar`, `getPedidosPorRetirar`, `getPedidosListosParaDelivery`, `getPedidosEnCamino`, `getPedidosEntregados`, `pedidoTieneProductosControlados`, `pedidoRequiereRecipe`, `pedidoRequierePickupObligatorio`.
- `cartService.ts`: `getCarritoUsuario`, `getCarritoUsuarioPorSede`, `getResumenCarrito`, `validarStockCarrito`, `calcularSubtotalCarrito`, `calcularIva`, `calcularTotalCarrito`.
- `recipeService.ts`: `getRecipes`, `getRecipeById`, `getRecipesByPedido`, `getRecipesByDetallePedido`, `getRecipesPendientes`, `getRecipesAuditados`, `getRecipeAuditViewModels`.
- `refundService.ts`: `getSolicitudesReembolso`, `getSolicitudReembolsoById`, `getSolicitudesReembolsoByUsuario`, `getSolicitudesReembolsoPendientes`, `getSolicitudesReembolsoRealizadas`, `getRefundAdminViewModels`.
- `notificationService.ts`: `getNotificaciones`, `getNotificacionesByUsuario`, `getNotificacionesNoLeidasByUsuario`, `getNotificacionesPromocionalesByUsuario`, `getNotificacionesPedidoByUsuario`.
- `adminService.ts`: `getCatalogoAdmin`, `getInventarioAdmin`, `getPersonalOperativoAdmin`, `getMonitorGlobalPedidos`, `getResenasServicio`, `getCuponesAdmin`, `getReembolsosAdmin`, `getOperacionesAdmin`, `getAuditoriaAdmin`, `getStatusColorsAdmin`.
- `deliveryService.ts`: `getPedidosDisponiblesDelivery`, `getPedidosAsignadosDelivery`, `getViajesCompletadosDelivery`, `repartidorPuedeAsignarsePedido`.
- `bannerService.ts`: `getBanners`, `getBannerById`, `getBannersLegacy`.
- `index.ts`: re-export general de servicios.

## UI conectada en esta fase

`src/app/App.tsx` usa servicios solo para datos de bajo riesgo:

- Banners: `getBannersLegacy()`.
- Categorias: `getCategoriasParaFiltro()`.
- Selector de sedes: `getSedesListLegacy()`.
- Sedes del checkout: `getSedesLegacy()`.

No se conectaron productos, cupones, pedidos, recipes, delivery, admin ni notificaciones porque sus formatos visuales actuales no son equivalentes uno a uno con la fuente central.

## Futuro reemplazo por API

Cuando el backend este disponible, la ruta recomendada es:

1. Mantener las firmas publicas de `src/services`.
2. Cambiar implementaciones internas para usar `httpClient`.
3. Convertir respuestas API a los mismos view models que consume la UI.
4. Retirar `src/data/mock*.ts` solo cuando cada pantalla este conectada y validada.

La UI no deberia llamar directamente a `fetch` ni a Supabase. Esa decision debe quedar encapsulada en servicios.
