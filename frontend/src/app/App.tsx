import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { Footer, Navbar } from "../components/layout";
import type { NotificationViewModel as AppNotification } from "../viewModels/notificationViewModels";
import {
  BRAND_SYNONYMS,
  CATS,
  DEFAULT_SLIDES,
  DEMO_ACCOUNTS,
  DEMO_CONTACT,
  DISCOUNT_CODES,
  VES_RATE,
} from "./data";
import type { AuthUser, Branch, CartItem, Page, Product, Slide } from "./types";
import { getCurrentUser, hasSession, logout } from "../services/authService";
import { addFavorite, getAvailableBranches, getCatalogProducts, getFavorites, removeFavorite } from "../services/backendService";
import { getRemoteBanners } from "../services/bannerService";
import { getCustomLogoUrl } from "../services/brandingService";
import { getRemoteNotifications } from "../services/notificationService";
import { BRANCH_IDS } from "../config/api";
import { createRemoteOrder, getRemoteOrders, type RemoteOrder, type RemoteOrderDetail } from "../services/orderService";

const LoginPage = lazy(() => import("../features/auth/components/LoginPage").then((module) => ({ default: module.LoginPage })));
const ProfilePage = lazy(() => import("../features/profile/components/ProfilePage").then((module) => ({ default: module.ProfilePage })));
const HomePage = lazy(() => import("../features/catalog/components/HomePage").then((module) => ({ default: module.HomePage })));
const CatalogPage = lazy(() => import("../features/catalog/components/CatalogPage").then((module) => ({ default: module.CatalogPage })));
const ProductDetailPage = lazy(() => import("../features/product-detail/components/ProductDetailPage").then((module) => ({ default: module.ProductDetailPage })));
const CartPage = lazy(() => import("../features/cart/components/CartPage").then((module) => ({ default: module.CartPage })));
const DeliverySelectPage = lazy(() => import("../features/checkout/components/DeliverySelectPage").then((module) => ({ default: module.DeliverySelectPage })));
const CheckoutPage = lazy(() => import("../features/payment/components/CheckoutPage").then((module) => ({ default: module.CheckoutPage })));
const PreCheckoutMedicalPage = lazy(() => import("../features/recipes/components/PreCheckoutMedicalPage").then((module) => ({ default: module.PreCheckoutMedicalPage })));
const AdminPanel = lazy(() => import("../features/admin/components/AdminPanelPage").then((module) => ({ default: module.AdminPanel })));
const BannerManagementPage = lazy(() => import("../features/admin/components/BannerManagementPage").then((module) => ({ default: module.BannerManagementPage })));
const DeliveryPanel = lazy(() => import("../features/delivery/components/DeliveryPanelPage").then((module) => ({ default: module.DeliveryPanel })));
const FavoritesPage = lazy(() => import("../features/favorites/components/FavoritesPage").then((module) => ({ default: module.FavoritesPage })));
const NotificationsPage = lazy(() => import("../features/notifications/components/NotificationsPage").then((module) => ({ default: module.NotificationsPage })));
const TrackingPage = lazy(() => import("../features/orders/components/TrackingPage").then((module) => ({ default: module.TrackingPage })));

const DEFAULT_PAGE_BY_ROLE: Record<AuthUser["role"], Page> = {
  cliente: "home",
  repartidor: "delivery",
  auxiliar: "admin",
  auditor: "admin",
  superadmin: "admin",
};

const PUBLIC_PAGES = new Set<Page>(["home", "catalog", "product", "login", "register"]);
const PAGES_BY_ROLE: Record<AuthUser["role"], Set<Page>> = {
  cliente: new Set(["home", "catalog", "product", "cart", "deliverySelect", "preCheckout", "checkout", "orderComplete", "tracking", "favorites", "profile", "notifications"]),
  repartidor: new Set(["delivery", "profile", "notifications"]),
  auxiliar: new Set(["admin", "profile", "notifications"]),
  auditor: new Set(["admin", "profile", "notifications"]),
  superadmin: new Set(["home", "catalog", "product", "cart", "favorites", "admin", "banners", "profile", "notifications"]),
};

const resolvePageAccess = (requested: Page, user: AuthUser | null): Page => {
  if (!user) return PUBLIC_PAGES.has(requested) ? requested : "login";
  if (requested === "login" || requested === "register") return DEFAULT_PAGE_BY_ROLE[user.role];
  return PAGES_BY_ROLE[user.role].has(requested) ? requested : DEFAULT_PAGE_BY_ROLE[user.role];
};

// ─── Shared form constants ────────────────────────────────────────────────────
const VE_AREAS = ["0412", "0414", "0416", "0424", "0426"];
const DOC_TYPES = ["V", "E", "J", "G", "P"];

// ─── Shared payment constants ─────────────────────────────────────────────────
const VE_BANKS = [
  "Banesco", "Banco de Venezuela", "Mercantil", "BBVA Provincial",
  "Bicentenario", "BNC", "Banco Exterior", "Banplus",
  "Venezolano de Crédito", "Del Sur", "Banco Activo", "100% Banco",
];

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPageRaw] = useState<Page>("home");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [preselectedCategory, setPreselectedCategory] = useState<string | undefined>(undefined);
  const [cartDiscountApplied, setCartDiscountApplied] = useState(0);
  const [activeOrderItems, setActiveOrderItems] = useState<CartItem[]>([]);
  const [activeRemoteOrder, setActiveRemoteOrder] = useState<RemoteOrder | null>(null);
  const [activeOrderDetails, setActiveOrderDetails] = useState<RemoteOrderDetail[]>([]);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [displaySede, setDisplaySede] = useState<string>(BRANCH_IDS.principal);
  // Shared notifications state — lifted so Navbar badge and NotificationsPage share it
  const [appNotifs, setAppNotifs] = useState<AppNotification[]>([]);
  const [cartDiscountCode, setCartDiscountCode] = useState("");
  // Shared checkout delivery state lifted to App so it persists across checkout screens
  const [checkoutDeliveryMode, setCheckoutDeliveryMode] = useState<"delivery"|"pickup">("delivery");
  const [checkoutSede, setCheckoutSede] = useState<string>(BRANCH_IDS.principal);
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    let cancelled = false;
    getRemoteBanners()
      .then((remoteSlides) => {
        if (!cancelled && remoteSlides.length > 0) setSlides(remoteSlides);
      })
      .catch((error) => console.error("No se pudieron cargar los banners:", error));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getCustomLogoUrl()
      .then((url) => { if (!cancelled) setCustomLogoUrl(url); })
      .catch((error) => console.error("No se pudo cargar el logotipo personalizado:", error));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!hasSession()) {
      setAuthReady(true);
      return () => { cancelled = true; };
    }

    getCurrentUser()
      .then((restoredUser) => {
        if (cancelled) return;
        setUser(restoredUser);
        setPageRaw(DEFAULT_PAGE_BY_ROLE[restoredUser.role]);
      })
      .catch((error) => {
        if (!cancelled) console.error("No se pudo restaurar la sesion:", error);
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCatalogProducts(displaySede), getAvailableBranches()])
      .then(([items, realBranches]) => {
        if (!cancelled) {
          setProducts(items);
          setBranches(realBranches);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setProducts([]);
          console.error("No se pudieron cargar los datos reales:", error);
        }
      });
    return () => { cancelled = true; };
  }, [displaySede]);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }

    let cancelled = false;
    getFavorites<string[]>()
      .then((response) => {
        if (cancelled) return;
        const next = new Set<number>();
        const backendIds = response.data ?? [];
        backendIds.forEach((backendId) => {
          const product = products.find((item) => item.backendId === backendId);
          if (product) next.add(product.id);
        });
        setFavoriteIds(next);
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("No se pudieron cargar los favoritos:", error);
        }
      });

    return () => { cancelled = true; };
  }, [products, user]);

  useEffect(() => {
    if (!user || user.role !== "cliente" || products.length === 0) return;
    let cancelled = false;
    getRemoteOrders()
      .then((orders) => {
        if (cancelled) return;
        const pending = orders.find(order => order.estado_pedido === "pendiente");
        if (!pending) return;
        const details = pending.detalles_pedidos ?? [];
        const restoredItems = details.flatMap(detail => {
          const product = products.find(item => item.backendId === detail.id_producto || item.inventoryId === detail.id_inventario);
          return product ? [{ product, quantity: detail.cantidad }] : [];
        });
        setActiveRemoteOrder(pending);
        setActiveOrderDetails(details);
        setActiveOrderItems(restoredItems);
        setHasActiveOrder(true);
      })
      .catch(error => console.error("No se pudo restaurar el pedido pendiente:", error));
    return () => { cancelled = true; };
  }, [products, user]);

  useEffect(() => {
    if (activeRemoteOrder?.estado_pedido !== "expirado") return;
    let cancelled = false;
    getCatalogProducts(displaySede)
      .then(items => { if (!cancelled) setProducts(items); })
      .catch(error => console.error("No se pudo refrescar el stock restaurado:", error));
    return () => { cancelled = true; };
  }, [activeRemoteOrder?.estado_pedido, displaySede]);

  useEffect(() => {
    if (!user) {
      setAppNotifs([]);
      return;
    }
    let cancelled = false;
    const refreshNotifications = () => {
      getRemoteNotifications()
        .then((notifications) => { if (!cancelled) setAppNotifs(notifications); })
        .catch((error) => { if (!cancelled) console.error("No se pudieron cargar las notificaciones:", error); });
    };
    refreshNotifications();
    const interval = window.setInterval(refreshNotifications, 30_000);
    window.addEventListener("focus", refreshNotifications);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshNotifications);
    };
  }, [user]);

  useEffect(() => {
    if (!authReady) return;
    const allowedPage = resolvePageAccess(page, user);
    if (allowedPage !== page) setPageRaw(allowedPage);
  }, [authReady, page, user]);

  const setPage = (requested: Page) => {
    window.scrollTo({ top: 0 });
    setPageRaw(resolvePageAccess(requested, user));
  };

  const handleAuthenticated = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    setCartItems([]);
    setFavoriteIds(new Set());
    setPageRaw(DEFAULT_PAGE_BY_ROLE[authenticatedUser.role]);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("No se pudo revocar la sesion remota:", error);
    } finally {
      setUser(null);
      setCartItems([]);
      setFavoriteIds(new Set());
      setHasActiveOrder(false);
      setActiveOrderItems([]);
      setActiveRemoteOrder(null);
      setActiveOrderDetails([]);
      setPageRaw("home");
    }
  };
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  // La tabla actual de usuarios no incluye una sede asignada.
  const staffSede = user?.role === "superadmin" ? "Todas" : undefined;

  const handleCategorySelect = (category: string) => {
    setPreselectedCategory(category);
  };

  const requireAuthenticatedUser = () => {
    if (user) return true;
    window.scrollTo({ top: 0 });
    setPageRaw("login");
    return false;
  };

  const addToCart = (product: Product, qty = 1) => {
    if (!requireAuthenticatedUser()) return;
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { product, quantity: qty }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    if (!requireAuthenticatedUser()) return;
    setCartItems(prev => {
      return prev.map(i => {
        if (i.product.id === productId) {
          const newQuantity = i.quantity + delta;
          return newQuantity <= 0 ? null : { ...i, quantity: Math.min(newQuantity, i.product.stock) };
        }
        return i;
      }).filter((i): i is CartItem => i !== null);
    });
  };

  const toggleFavorite = async (productId: number) => {
    if (!requireAuthenticatedUser()) return;
    const product = products.find((item) => item.id === productId);
    if (!product?.backendId) {
      return;
    }

    const isFavorite = favoriteIds.has(productId);

    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (isFavorite) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });

    try {
      if (isFavorite) {
        await removeFavorite(product.backendId);
      } else {
        await addFavorite(product.backendId);
      }
    } catch (error) {
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (isFavorite) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });
      console.error("No se pudo actualizar el estado de favoritos:", error);
    }
  };

  const goToProduct = (id: number) => {
    setSelectedProductId(id);
    setPage("product");
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleCreateOrder = async (input: { receiverName: string; receiverPhoneArea: string; receiverPhone: string; deliveryAddress: string; deliveryMode: "delivery" | "pickup"; selectedSede: string; discountCode: string }) => {
    if (!user) return { ok: false, error: "Debes iniciar sesión." };
    try {
      const items = cartItems.map(item => {
        if (!item.product.inventoryId) throw new Error(`El producto ${item.product.name} no tiene inventario asociado.`);
        return { id_inventario: item.product.inventoryId, cantidad: item.quantity };
      });
      const created = await createRemoteOrder({
        pedido: {
          id_sede: input.selectedSede,
          metodo_entrega: input.deliveryMode,
          nombre_receptor: input.receiverName,
          codigo_area_receptor: input.receiverPhoneArea,
          telefono_receptor: input.receiverPhone,
          direccion_entrega: input.deliveryMode === "delivery" ? input.deliveryAddress : null,
          nombre_factura: user.name,
          codigo_area_factura: user.areaCode ?? null,
          telefono_factura: user.phone ?? null,
          tipo_documento_fiscal: user.cedula?.split("-")[0] ?? "V",
          documento_fiscal: user.cedula?.replace(/^[A-Za-z]-/, "") ?? "",
          direccion_fiscal: user.address ?? null,
          codigo_cupon: input.discountCode || null,
          tasa_bcv: VES_RATE,
        },
        items,
      });
      setActiveOrderItems(cartItems);
      setActiveRemoteOrder({ ...created.pedido, detalles_pedidos: created.detalles });
      setActiveOrderDetails(created.detalles);
      setHasActiveOrder(true);
      const reserved = new Map(cartItems.map(item => [item.product.id, item.quantity]));
      setProducts(current => current.map(product => {
        const quantity = reserved.get(product.id) ?? 0;
        return quantity > 0 ? { ...product, stock: Math.max(0, product.stock - quantity) } : product;
      }));
      void getCatalogProducts(displaySede)
        .then(setProducts)
        .catch(error => console.error("No se pudo confirmar el stock actualizado:", error));
      setCartItems([]);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "No se pudo crear el pedido." };
    }
  };

  if (!authReady) {
    return <div className="min-h-screen bg-[#f0fdf7] flex items-center justify-center text-[#006064] font-semibold">Restaurando sesion...</div>;
  }

  // Login page renders without navbar
  if (page === "login" || page === "register") {
    return (
      <div style={{ fontFamily: "'Barlow', sans-serif" }}>
        <Suspense fallback={null}>
          <LoginPage onLogin={handleAuthenticated} onNav={setPage} initialView={page === "register" ? "register" : "login"} demoAccounts={DEMO_ACCOUNTS} veAreas={VE_AREAS} docTypes={DOC_TYPES} logoUrl={customLogoUrl} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Barlow', sans-serif" }}>
      <Navbar
        cartCount={cartCount}
        onNav={setPage}
        page={page}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        onLogout={() => { void handleLogout(); }}
        onCategorySelect={handleCategorySelect}
        cartItems={cartItems}
        onUpdateCartQuantity={updateQuantity}
        onRemoveFromCart={(id) => setCartItems(prev => prev.filter(i => i.product.id !== id))}
        hasActiveOrder={hasActiveOrder}
        appNotifs={appNotifs}
        setAppNotifs={setAppNotifs}
        selectedSede={displaySede}
        onSedeChange={setDisplaySede}
        products={products}
        branches={branches}
        categories={CATS}
        brandSynonyms={BRAND_SYNONYMS}
        logoUrl={customLogoUrl}
      />
      <main>
        <Suspense fallback={null}>
          {page === "home" && <HomePage products={products} onProductClick={goToProduct} onAddToCart={addToCart} onNav={setPage} cartItems={cartItems} onUpdateQuantity={updateQuantity} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} slides={slides} selectedSede={displaySede} isAuthenticated={Boolean(user)} onAuthRequired={() => setPage("login")} />}
          {page === "banners" && <BannerManagementPage slides={slides} setSlides={setSlides} onNav={setPage} />}
          {page === "catalog" && <CatalogPage products={products} searchQuery={searchQuery} onProductClick={goToProduct} onAddToCart={addToCart} cartItems={cartItems} onUpdateQuantity={updateQuantity} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} preselectedCategory={preselectedCategory} isAuthenticated={Boolean(user)} onAuthRequired={() => setPage("login")} />}
          {page === "favorites" && <FavoritesPage products={products} favoriteIds={favoriteIds} onProductClick={goToProduct} onAddToCart={addToCart} onToggleFavorite={toggleFavorite} cartItems={cartItems} onUpdateQuantity={updateQuantity} onNav={setPage} />}
          {page === "product" && selectedProduct && (
            <ProductDetailPage
              product={selectedProduct}
              products={products}
              onAddToCart={addToCart}
              onBack={() => setPage("catalog")}
              onProductClick={goToProduct}
              onNav={setPage}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
              cartItems={cartItems}
              onUpdateQuantity={updateQuantity}
              selectedSede={displaySede}
              isAuthenticated={Boolean(user)}
              onAuthRequired={() => setPage("login")}
            />
          )}
          {page === "cart" && <CartPage cartItems={cartItems} setCartItems={setCartItems} onNav={setPage} discountApplied={cartDiscountApplied} discountCode={cartDiscountCode} setDiscountApplied={setCartDiscountApplied} setDiscountCode={setCartDiscountCode} user={user} hasActiveOrder={hasActiveOrder} selectedSede={checkoutSede} products={products} discountCodes={DISCOUNT_CODES} />}
          {page === "deliverySelect" && <DeliverySelectPage cartItems={cartItems} onNav={setPage} deliveryMode={checkoutDeliveryMode} setDeliveryMode={setCheckoutDeliveryMode} selectedSede={checkoutSede} setSelectedSede={setCheckoutSede} deliveryAddress={checkoutAddress} setDeliveryAddress={setCheckoutAddress} discountApplied={cartDiscountApplied} discountCode={cartDiscountCode} setDiscountApplied={setCartDiscountApplied} setDiscountCode={setCartDiscountCode} user={user} onConfirmOrder={handleCreateOrder} sedes={branches} discountCodes={DISCOUNT_CODES} demoContact={DEMO_CONTACT} veAreas={VE_AREAS} />}
          {page === "preCheckout" && <PreCheckoutMedicalPage cartItems={activeOrderItems.length > 0 ? activeOrderItems : cartItems} onNav={setPage} orderId={activeRemoteOrder?.id_pedido ?? null} orderDetails={activeOrderDetails} />}
          {page === "checkout" && <CheckoutPage cartItems={activeOrderItems.length > 0 ? activeOrderItems : cartItems} onNav={setPage} discountApplied={cartDiscountApplied} deliveryMode={checkoutDeliveryMode} selectedSede={checkoutSede} user={user} remoteOrder={activeRemoteOrder} onPaymentConfirmed={(order) => { setActiveRemoteOrder(order); }} onClearCart={() => { if (activeOrderItems.length === 0) { setActiveOrderItems(cartItems); setHasActiveOrder(true); setCartItems([]); } }} veAreas={VE_AREAS} docTypes={DOC_TYPES} veBanks={VE_BANKS} />}
          {page === "tracking" && (
            <TrackingPage
              onNav={setPage}
              orderItems={activeOrderItems.length > 0 ? activeOrderItems : []}
              deliveryMode={checkoutDeliveryMode}
              discountPct={cartDiscountApplied}
              onOrderComplete={() => { setHasActiveOrder(false); }}
              onOrderExpired={() => {
                setHasActiveOrder(false);
                setActiveRemoteOrder(null);
                setActiveOrderDetails([]);
                setActiveOrderItems([]);
              }}
              remoteOrder={activeRemoteOrder}
              onRemoteOrderChange={setActiveRemoteOrder}
            />
          )}
          {page === "profile" && user && <ProfilePage user={user} onNav={setPage} onLogout={() => { void handleLogout(); }} onUpdateUser={setUser} demoContact={DEMO_CONTACT} veAreas={VE_AREAS} docTypes={DOC_TYPES} />}
          {page === "delivery" && <DeliveryPanel onNav={setPage} userSede={staffSede} />}
          {page === "admin" && user && <AdminPanel user={user} onNav={setPage} products={products} setProducts={setProducts} slides={slides} setSlides={setSlides} customLogoUrl={customLogoUrl} onLogoChange={setCustomLogoUrl} />}
          {page === "notifications" && <NotificationsPage onNav={setPage} notifs={appNotifs} setNotifs={setAppNotifs} />}
        </Suspense>
      </main>
      <Footer onNav={setPage} logoUrl={customLogoUrl} />
      <Toaster position="top-right" />
    </div>
  );
}
