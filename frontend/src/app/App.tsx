import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { Footer, Navbar } from "../components/layout";
import { getLegacyNotificationViewModels } from "../viewModels/notificationViewModels";
import type { NotificationViewModel as AppNotification } from "../viewModels/notificationViewModels";
import {
  BRAND_SYNONYMS,
  CATS,
  DEFAULT_SLIDES,
  DEMO_ACCOUNTS,
  DEMO_CONTACT,
  DEMO_ORDERS,
  DISCOUNT_CODES,
} from "./data";
import type { AuthUser, Branch, CartItem, Page, Product, Slide } from "./types";
import { logout } from "../services/authService";
import { getAvailableBranches, getCatalogProducts } from "../services/backendService";
import { BRANCH_IDS } from "../config/api";

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
const INITIAL_NOTIFICATIONS = getLegacyNotificationViewModels();

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
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [preselectedCategory, setPreselectedCategory] = useState<string | undefined>(undefined);
  const [cartDiscountApplied, setCartDiscountApplied] = useState(0);
  const [activeOrderItems, setActiveOrderItems] = useState<CartItem[]>([]);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [displaySede, setDisplaySede] = useState(BRANCH_IDS.principal);
  // Shared notifications state — lifted so Navbar badge and NotificationsPage share it
  const [appNotifs, setAppNotifs] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [cartDiscountCode, setCartDiscountCode] = useState("");
  // Shared checkout delivery state lifted to App so it persists across checkout screens
  const [checkoutDeliveryMode, setCheckoutDeliveryMode] = useState<"delivery"|"pickup">("delivery");
  const [checkoutSede, setCheckoutSede] = useState(BRANCH_IDS.principal);
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

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

  const setPage = (p: Page) => { window.scrollTo({ top: 0 }); setPageRaw(p); };
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  // La tabla actual de usuarios no incluye una sede asignada.
  const staffSede = user?.role === "superadmin" ? "Todas" : undefined;

  const handleCategorySelect = (category: string) => {
    setPreselectedCategory(category);
  };

  const addToCart = (product: Product, qty = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { product, quantity: qty }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
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

  const toggleFavorite = (productId: number) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const goToProduct = (id: number) => {
    setSelectedProductId(id);
    setPage("product");
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Login page renders without navbar
  if (page === "login" || page === "register") {
    return (
      <div style={{ fontFamily: "'Barlow', sans-serif" }}>
        <Suspense fallback={null}>
          <LoginPage onLogin={(u) => { setUser(u); setCartItems([]); }} onNav={setPage} initialView={page === "register" ? "register" : "login"} demoAccounts={DEMO_ACCOUNTS} veAreas={VE_AREAS} docTypes={DOC_TYPES} />
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
        onLogout={() => { logout(); setUser(null); setCartItems([]); setHasActiveOrder(false); setActiveOrderItems([]); setPage("home"); }}
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
      />
      <main>
        <Suspense fallback={null}>
          {page === "home" && <HomePage products={products} onProductClick={goToProduct} onAddToCart={addToCart} onNav={setPage} cartItems={cartItems} onUpdateQuantity={updateQuantity} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} slides={slides} selectedSede={displaySede} />}
          {page === "banners" && <BannerManagementPage slides={slides} setSlides={setSlides} onNav={setPage} />}
          {page === "catalog" && <CatalogPage products={products} searchQuery={searchQuery} onProductClick={goToProduct} onAddToCart={addToCart} cartItems={cartItems} onUpdateQuantity={updateQuantity} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} preselectedCategory={preselectedCategory} />}
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
            />
          )}
          {page === "cart" && <CartPage cartItems={cartItems} setCartItems={setCartItems} onNav={setPage} discountApplied={cartDiscountApplied} discountCode={cartDiscountCode} setDiscountApplied={setCartDiscountApplied} setDiscountCode={setCartDiscountCode} user={user} hasActiveOrder={hasActiveOrder} selectedSede={checkoutSede} products={products} discountCodes={DISCOUNT_CODES} />}
          {page === "deliverySelect" && <DeliverySelectPage cartItems={cartItems} onNav={setPage} deliveryMode={checkoutDeliveryMode} setDeliveryMode={setCheckoutDeliveryMode} selectedSede={checkoutSede} setSelectedSede={setCheckoutSede} deliveryAddress={checkoutAddress} setDeliveryAddress={setCheckoutAddress} discountApplied={cartDiscountApplied} discountCode={cartDiscountCode} setDiscountApplied={setCartDiscountApplied} setDiscountCode={setCartDiscountCode} user={user} onConfirmOrder={() => { setActiveOrderItems(cartItems); setHasActiveOrder(true); setCartItems([]); }} sedes={branches} discountCodes={DISCOUNT_CODES} demoContact={DEMO_CONTACT} veAreas={VE_AREAS} />}
          {page === "preCheckout" && <PreCheckoutMedicalPage cartItems={activeOrderItems.length > 0 ? activeOrderItems : cartItems} onNav={setPage} />}
          {page === "checkout" && <CheckoutPage cartItems={activeOrderItems.length > 0 ? activeOrderItems : cartItems} onNav={setPage} discountApplied={cartDiscountApplied} deliveryMode={checkoutDeliveryMode} selectedSede={checkoutSede} user={user} onClearCart={() => { if (activeOrderItems.length === 0) { setActiveOrderItems(cartItems); setHasActiveOrder(true); setCartItems([]); } }} veAreas={VE_AREAS} docTypes={DOC_TYPES} veBanks={VE_BANKS} />}
          {page === "tracking" && (
            <TrackingPage
              onNav={setPage}
              orderItems={activeOrderItems.length > 0 ? activeOrderItems : []}
              deliveryMode={checkoutDeliveryMode}
              discountPct={cartDiscountApplied}
              onOrderComplete={() => { setHasActiveOrder(false); }}
            />
          )}
          {page === "profile" && user && <ProfilePage user={user} onNav={setPage} onLogout={() => { logout(); setUser(null); setCartItems([]); setPage("home"); }} onUpdateUser={setUser} demoOrders={DEMO_ORDERS} demoContact={DEMO_CONTACT} veAreas={VE_AREAS} docTypes={DOC_TYPES} />}
          {page === "delivery" && <DeliveryPanel onNav={setPage} userSede={staffSede} />}
          {page === "admin" && user && <AdminPanel user={user} onNav={setPage} products={products} setProducts={setProducts} slides={slides} setSlides={setSlides} />}
          {page === "notifications" && <NotificationsPage onNav={setPage} notifs={appNotifs} setNotifs={setAppNotifs} />}
        </Suspense>
      </main>
      <Footer onNav={setPage} />
      <Toaster position="top-right" />
    </div>
  );
}
