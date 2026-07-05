import React, { useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { LoginPage } from "../features/auth";
import { ProfilePage } from "../features/profile";
import { HomePage, CatalogPage } from "../features/catalog";
import { ProductDetailPage } from "../features/product-detail";
import { CartPage } from "../features/cart";
import { DeliverySelectPage } from "../features/checkout";
import { CheckoutPage } from "../features/payment";
import { PreCheckoutMedicalPage } from "../features/recipes";
import { AdminPanel, BannerManagementPage } from "../features/admin";
import { DeliveryPanel } from "../features/delivery";
import { FavoritesPage } from "../features/favorites";
import { NotificationsPage, INITIAL_NOTIFICATIONS, type AppNotification } from "../features/notifications";
import { TrackingPage } from "../features/orders";
import { Footer, Navbar } from "../components/layout";
import {
  BRAND_SYNONYMS,
  CATS,
  DEFAULT_SLIDES,
  DEMO_ACCOUNTS,
  DEMO_CONTACT,
  DEMO_ORDERS,
  DISCOUNT_CODES,
  PRODUCTS,
  SEDES,
} from "./data";
import type { AuthUser, CartItem, Page, Product, Slide } from "./types";

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
  const [displaySede, setDisplaySede] = useState("principal");
  // Shared notifications state — lifted so Navbar badge and NotificationsPage share it
  const [appNotifs, setAppNotifs] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [cartDiscountCode, setCartDiscountCode] = useState("");
  // Shared checkout delivery state lifted to App so it persists across checkout screens
  const [checkoutDeliveryMode, setCheckoutDeliveryMode] = useState<"delivery"|"pickup">("delivery");
  const [checkoutSede, setCheckoutSede] = useState("principal");
  const [checkoutAddress, setCheckoutAddress] = useState("");

  const setPage = (p: Page) => { window.scrollTo({ top: 0 }); setPageRaw(p); };
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  // Resolve the sede assigned to the logged-in staff member (for DeliveryPanel / AdminPanel filtering)
  const STAFF_SEDES: Record<string, string> = {
    "auxiliar@fhec.com": "principal",
    "repartidor@fhec.com": "principal",
    "auditor@fhec.com": "clinica",
    "admin@fhec.com": "Todas",
  };
  const staffSede = user ? (STAFF_SEDES[user.email] ?? "principal") : undefined;

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

  const selectedProduct = PRODUCTS.find(p => p.id === selectedProductId);

  // Login page renders without navbar
  if (page === "login" || page === "register") {
    return (
      <div style={{ fontFamily: "'Barlow', sans-serif" }}>
        <LoginPage onLogin={(u) => { setUser(u); setCartItems([]); }} onNav={setPage} initialView={page === "register" ? "register" : "login"} demoAccounts={DEMO_ACCOUNTS} veAreas={VE_AREAS} docTypes={DOC_TYPES} />
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
        onLogout={() => { setUser(null); setCartItems([]); setHasActiveOrder(false); setActiveOrderItems([]); setPage("home"); }}
        onCategorySelect={handleCategorySelect}
        cartItems={cartItems}
        onUpdateCartQuantity={updateQuantity}
        onRemoveFromCart={(id) => setCartItems(prev => prev.filter(i => i.product.id !== id))}
        hasActiveOrder={hasActiveOrder}
        appNotifs={appNotifs}
        setAppNotifs={setAppNotifs}
        selectedSede={displaySede}
        onSedeChange={setDisplaySede}
        products={PRODUCTS}
        categories={CATS}
        brandSynonyms={BRAND_SYNONYMS}
      />
      <main>
        {page === "home" && <HomePage products={PRODUCTS} onProductClick={goToProduct} onAddToCart={addToCart} onNav={setPage} cartItems={cartItems} onUpdateQuantity={updateQuantity} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} slides={slides} selectedSede={displaySede} />}
        {page === "banners" && <BannerManagementPage slides={slides} setSlides={setSlides} onNav={setPage} />}
        {page === "catalog" && <CatalogPage products={PRODUCTS} searchQuery={searchQuery} onProductClick={goToProduct} onAddToCart={addToCart} cartItems={cartItems} onUpdateQuantity={updateQuantity} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} preselectedCategory={preselectedCategory} />}
        {page === "favorites" && <FavoritesPage products={PRODUCTS} favoriteIds={favoriteIds} onProductClick={goToProduct} onAddToCart={addToCart} onToggleFavorite={toggleFavorite} cartItems={cartItems} onUpdateQuantity={updateQuantity} onNav={setPage} />}
        {page === "product" && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            products={PRODUCTS}
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
        {page === "cart" && <CartPage cartItems={cartItems} setCartItems={setCartItems} onNav={setPage} discountApplied={cartDiscountApplied} discountCode={cartDiscountCode} setDiscountApplied={setCartDiscountApplied} setDiscountCode={setCartDiscountCode} user={user} hasActiveOrder={hasActiveOrder} selectedSede={checkoutSede} products={PRODUCTS} discountCodes={DISCOUNT_CODES} />}
        {page === "deliverySelect" && <DeliverySelectPage cartItems={cartItems} onNav={setPage} deliveryMode={checkoutDeliveryMode} setDeliveryMode={setCheckoutDeliveryMode} selectedSede={checkoutSede} setSelectedSede={setCheckoutSede} deliveryAddress={checkoutAddress} setDeliveryAddress={setCheckoutAddress} discountApplied={cartDiscountApplied} discountCode={cartDiscountCode} setDiscountApplied={setCartDiscountApplied} setDiscountCode={setCartDiscountCode} user={user} onConfirmOrder={() => { setActiveOrderItems(cartItems); setHasActiveOrder(true); setCartItems([]); }} sedes={SEDES} discountCodes={DISCOUNT_CODES} demoContact={DEMO_CONTACT} veAreas={VE_AREAS} />}
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
        {page === "profile" && user && <ProfilePage user={user} onNav={setPage} onLogout={() => { setUser(null); setCartItems([]); setPage("home"); }} demoOrders={DEMO_ORDERS} demoContact={DEMO_CONTACT} veAreas={VE_AREAS} docTypes={DOC_TYPES} />}
        {page === "delivery" && <DeliveryPanel onNav={setPage} userSede={staffSede} />}
        {page === "admin" && user && <AdminPanel user={user} onNav={setPage} products={PRODUCTS} setProducts={() => {}} slides={slides} setSlides={setSlides} />}
        {page === "notifications" && <NotificationsPage onNav={setPage} notifs={appNotifs} setNotifs={setAppNotifs} />}
      </main>
      <Footer onNav={setPage} />
      <Toaster position="top-right" />
    </div>
  );
}
