import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { LoginPage } from "../features/auth";
import { ProfilePage } from "../features/profile";
import { HomePage, CatalogPage } from "../features/catalog";
import { ProductDetailPage } from "../features/product-detail";
import { SmartSearch } from "../features/search";
import { ProductBox, ProductCard } from "../components/product";
import { GpsMapWidget, addressToPin } from "../components/order";
import { CartPage } from "../features/cart";
import { DeliverySelectPage } from "../features/checkout";
import { CheckoutPage } from "../features/payment";
import { PreCheckoutMedicalPage } from "../features/recipes";
import {
  ShoppingCart, Search, User, ChevronRight, ChevronLeft, Plus, Minus, X,
  Upload, MapPin, Truck, Store, Clock, Package, AlertTriangle, Star,
  Trash2, ArrowLeft, Shield, CreditCard, Phone, Building2, FileText,
  ChevronDown, Bell, Check, Copy, SlidersHorizontal, CheckCircle, Info,
  LogOut, Heart, Lock, Mail, Eye, EyeOff, Bike, Settings, ClipboardList,
  Instagram, Facebook,
} from "lucide-react";
import logoFarmahumana from "../imports/logo-farmahumana.png";
import codigoQrUsuario from "../imports/codigoqr-usuario.jpg";
import {
  getAppProductViewModels,
  getBannersLegacy,
  getCategoriasParaFiltro,
  getCouponApplyCodeMap,
  getLegacyAdminMonitorOrderViewModels,
  getLegacyAdminOrderViewModels,
  getLegacyAdminRefundViewModels,
  getLegacyDeliveryAvailableOrderViewModels,
  getLegacyDeliveryCompletedTripViewModels,
  getLegacyNotificationViewModels,
  getLegacyOrderHistoryViewModels,
  getLegacyProfileRefundViewModels,
  getLegacyRecipeAuditViewModels,
  getLegacyAdminCouponViewModels,
  getLegacyProfileCouponViewModels,
  getSedesLegacy,
  getSedesListLegacy,
} from "../services";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const VES_RATE = 40.50;
const fmtVES = (u: number) =>
  `Bs.S ${(u * VES_RATE).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtUSD = (u: number) => `$${u.toFixed(2)}`;
const H9: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 };
const H7: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 };
const effectivePrice = (p: Product) => p.discount ? p.priceUSD * (1 - p.discount / 100) : p.priceUSD;

// Brand synonyms for smart search
const BRAND_SYNONYMS: Record<string, string[]> = {
  "atamel": ["Paracetamol (Acetaminofén)", "Analgésicos"],
  "tylenol": ["Paracetamol (Acetaminofén)", "Analgésicos"],
  "panadol": ["Paracetamol (Acetaminofén)", "Analgésicos"],
  "calpol": ["Paracetamol (Acetaminofén)", "Analgésicos"],
  "lipitor": ["Atorvastatina Cálcica", "Cardiovascular"],
  "sortis": ["Atorvastatina Cálcica", "Cardiovascular"],
  "glucophage": ["Clorhidrato de Metformina", "Diabetes"],
  "stagid": ["Clorhidrato de Metformina", "Diabetes"],
  "omepral": ["Omeprazol", "Gastrointestinal"],
  "losec": ["Omeprazol", "Gastrointestinal"],
  "prilosec": ["Omeprazol", "Gastrointestinal"],
  "cozaar": ["Losartán Potásico", "Cardiovascular"],
  "hyzaar": ["Losartán Potásico", "Cardiovascular"],
  "augmentin": ["Amoxicilina Trihidrato", "Antibióticos"],
  "amoxil": ["Amoxicilina Trihidrato", "Antibióticos"],
  "rivotril": ["Clonazepam", "Sistema Nervioso"],
  "cebion": ["Ácido Ascórbico", "Vitaminas"],
  "redoxon": ["Ácido Ascórbico", "Vitaminas"],
  "ce-vi-cal": ["Ácido Ascórbico", "Vitaminas"],
};

// ─── Types ───────────────────────────────────────────────────────────────────
type Page = "home" | "catalog" | "product" | "cart" | "deliverySelect" | "preCheckout" | "checkout" | "orderComplete" | "tracking" | "favorites" | "login" | "register" | "banners" | "profile" | "delivery" | "admin" | "notifications";
interface Slide { title: string; subtitle: string; badge: string; from: string; via: string; to: string; img: string; cta: string; ctaLink?: string; }
type UserRole = "cliente" | "repartidor" | "auxiliar" | "auditor" | "superadmin";
interface AuthUser { name: string; email: string; role: UserRole; cedula: string; }

// Frequently bought together data
const FREQUENTLY_BOUGHT_TOGETHER: Record<number, number[]> = {
  1: [4, 7], // Metformina -> Vitamina C, Paracetamol
  2: [5, 7], // Losartán -> Atorvastatina, Paracetamol
  3: [7, 4], // Amoxicilina -> Paracetamol, Vitamina C
  4: [1, 7], // Vitamina C -> Metformina, Paracetamol
  5: [2, 6], // Atorvastatina -> Losartán, Omeprazol
  6: [7, 4], // Omeprazol -> Paracetamol, Vitamina C
  7: [4, 6], // Paracetamol -> Vitamina C, Omeprazol
  8: [7, 4], // Clonazepam -> Paracetamol, Vitamina C
};

// Demo accounts
const DEMO_ACCOUNTS: (AuthUser & { password: string })[] = [
  { name: "María González", email: "cliente@fhec.com", password: "123", role: "cliente", cedula: "V-12345678" },
  { name: "José Ramos", email: "repartidor@fhec.com", password: "123", role: "repartidor", cedula: "V-87654321" },
  { name: "Ana Torres", email: "auxiliar@fhec.com", password: "123", role: "auxiliar", cedula: "V-11223344" },
  { name: "Carlos Vega", email: "auditor@fhec.com", password: "123", role: "auditor", cedula: "V-33445566" },
  { name: "Luis Medina", email: "admin@fhec.com", password: "123", role: "superadmin", cedula: "V-55667788" },
];

interface Product {
  id: number; name: string; brand: string; category: string;
  presentation: string; packSize: string; priceUSD: number;
  stock: number; needsRecipe: boolean; rating: number; reviews: number;
  bgColor: string; accentColor: string; imageUrl?: string; description: string;
  activeIngredient: string; contraindications: string;
  posology: string;
  discount?: number;
  controlledSubstance?: boolean;
  stockSedes?: { principal: number; clinica: number };
  concentration?: string;
  concentrationUnit?: string;
  enabled?: boolean;
}

interface CartItem { product: Product; quantity: number; }

// ─── Data ────────────────────────────────────────────────────────────────────
const PRODUCTS: Product[] = getAppProductViewModels();

const DEFAULT_SLIDES: Slide[] = getBannersLegacy();

const CATS = getCategoriasParaFiltro();

// ─── NavDropdown ───────────────────────────────────────────────────────────────
function NavDropdown({ label, items, onNav, active, navStyle = "default", onCategorySelect }: {
  label: string;
  items: { label: string; emoji?: string; color?: string; page: Page; }[];
  onNav: (p: Page) => void;
  active: boolean;
  navStyle?: "default" | "gradient";
  onCategorySelect?: (category: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const openDropdown = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 6, left: r.left });
    }
    setOpen(true);
  };

  const btnClass = navStyle === "gradient"
    ? `flex items-center gap-1 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all my-1 ${active ? "bg-white/25 text-[#006064] font-bold" : "text-[#006064]/80 hover:text-[#006064] hover:bg-white/15 hover:font-semibold"}`
    : `flex items-center gap-1 px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${active ? "bg-[#50e9f8]/20 text-[#006064] font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`;

  const panel = open && (
    <div
      className="bg-white border border-border rounded-2xl shadow-xl overflow-hidden min-w-[200px] max-h-[70vh] overflow-y-auto"
      style={navStyle === "gradient" && dropPos
        ? { position: "fixed", top: dropPos.top, left: dropPos.left, zIndex: 9999 }
        : { position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 50 }}
      onMouseLeave={() => setOpen(false)}
    >
      {items.map(item => (
        <button
          key={item.label}
          onClick={() => {
            onNav(item.page);
            if (onCategorySelect) onCategorySelect(item.label);
            setOpen(false);
          }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left"
        >
          {item.emoji && <span className="text-base">{item.emoji}</span>}
          <span className="text-foreground font-semibold" style={item.color ? { color: item.color } : {}}>{item.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        ref={btnRef}
        onClick={openDropdown}
        onMouseEnter={openDropdown}
        className={btnClass}
        style={navStyle === "gradient" ? H7 : {}}
      >
        {label}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {navStyle === "gradient" ? panel : (
        open && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden min-w-[200px]"
            onMouseLeave={() => setOpen(false)}>
            {items.map(item => (
              <button key={item.label}
                onClick={() => { onNav(item.page); if (onCategorySelect) onCategorySelect(item.label); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left">
                {item.emoji && <span className="text-base">{item.emoji}</span>}
                <span className="text-foreground font-semibold" style={item.color ? { color: item.color } : {}}>{item.label}</span>
              </button>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── CatNavButton ─────────────────────────────────────────────────────────────
function CatNavButton({ page, onNav, onCategorySelect }: {
  page: Page; onNav: (p: Page) => void; onCategorySelect?: (c: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = page === "catalog";

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all my-1
          ${active || open ? "bg-white/25 text-[#006064] font-bold" : "text-[#006064]/80 hover:text-[#006064] hover:bg-white/15 hover:font-semibold"}`}>
        Categorías <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-border rounded-2xl shadow-2xl z-[60] overflow-hidden w-52">
          <div className="py-1">
            {CATS.map(c => (
              <button key={c.name}
                onClick={() => { if (onCategorySelect) onCategorySelect(c.name); onNav("catalog"); setOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                {c.name}
              </button>
            ))}
          </div>
          <div className="border-t border-border">
            <button onClick={() => { onNav("catalog"); setOpen(false); }}
              className="w-full py-2 px-4 text-xs text-[#179150] font-semibold hover:bg-muted transition-colors text-left">
              Ver todo el catálogo →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SedeSelector ─────────────────────────────────────────────────────────────
const SEDES_LIST = getSedesListLegacy();
function SedeSelector({ selectedSede, onSedeChange }: { selectedSede: string; onSedeChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SEDES_LIST.find(s => s.id === selectedSede) ?? SEDES_LIST[0];
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative ml-auto">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 my-1 rounded-lg text-xs text-[#006064]/80 hover:bg-white/15 transition-all whitespace-nowrap">
        <MapPin size={11} />
        <span className="hidden sm:inline">{current.name}</span>
        <span className="sm:hidden">Sede</span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-2xl shadow-2xl z-[60] overflow-hidden min-w-[200px]">
          <div className="px-4 py-2 border-b border-border bg-muted/40">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Ciudad Guayana</p>
          </div>
          {SEDES_LIST.map(s => (
            <button key={s.id} onClick={() => { onSedeChange(s.id); setOpen(false); }}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${selectedSede === s.id ? "bg-[#f0fdf7]" : ""}`}>
              <MapPin size={13} className={`flex-shrink-0 mt-0.5 ${selectedSede === s.id ? "text-[#179150]" : "text-muted-foreground"}`} />
              <div>
                <div className={`text-sm font-semibold ${selectedSede === s.id ? "text-[#179150]" : "text-foreground"}`}>{s.name}</div>
                <div className="text-[11px] text-muted-foreground">{s.address}</div>
              </div>
              {selectedSede === s.id && <Check size={13} className="text-[#179150] ml-auto flex-shrink-0 mt-0.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MobileUserMenu ───────────────────────────────────────────────────────────
function MobileUserMenu({ userName, unreadCount, cartCount, onNav }: {
  userName: string; unreadCount: number; cartCount: number; onNav: (p: Page) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const items = [
    { label: "Notificaciones", icon: <Bell size={14} />, page: "notifications" as Page, badge: unreadCount > 0 ? unreadCount : null },
    { label: "Favoritos",      icon: <Heart size={14} />, page: "favorites" as Page, badge: null },
    { label: "Mi carrito",     icon: <ShoppingCart size={14} />, page: "cart" as Page, badge: cartCount > 0 ? cartCount : null },
    { label: "Mi perfil",      icon: <User size={14} />, page: "profile" as Page, badge: null },
  ];
  return (
    <div className="relative sm:hidden" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2.5 py-2 rounded-xl hover:bg-muted transition-colors border border-border"
      >
        <div className="w-5 h-5 rounded-full bg-[#50e9f8] flex items-center justify-center flex-shrink-0">
          <User size={11} className="text-[#006064]" />
        </div>
        <ChevronDown size={12} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-border rounded-2xl shadow-2xl z-[70] overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/30">
            <div className="text-[10px] text-muted-foreground font-semibold uppercase truncate">{userName}</div>
          </div>
          {items.map(item => (
            <button
              key={item.label}
              onClick={() => { setOpen(false); onNav(item.page); }}
              className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-muted transition-colors border-b border-border/40 last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-muted-foreground">{item.icon}</span>
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              {item.badge && (
                <span className="w-5 h-5 bg-[#179150] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ cartCount, onNav, page, searchQuery, setSearchQuery, user, onLogout, onCategorySelect,
  cartItems, onUpdateCartQuantity, onRemoveFromCart, hasActiveOrder = false, appNotifs, setAppNotifs, selectedSede, onSedeChange, products, categories, brandSynonyms }: {
  cartCount: number; onNav: (p: Page) => void; page: Page;
  searchQuery: string; setSearchQuery: (q: string) => void;
  user: AuthUser | null; onLogout: () => void;
  onCategorySelect?: (category: string) => void;
  cartItems: CartItem[];
  onUpdateCartQuantity: (id: number, delta: number) => void;
  onRemoveFromCart: (id: number) => void;
  hasActiveOrder?: boolean;
  appNotifs: typeof NOTIF_DATA;
  setAppNotifs: React.Dispatch<React.SetStateAction<typeof NOTIF_DATA>>;
  selectedSede: string;
  onSedeChange: (id: string) => void;
  products: Product[];
  categories: typeof CATS;
  brandSynonyms: typeof BRAND_SYNONYMS;
}) {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [cartOpen,  setCartOpen]  = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const cartRef  = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (cartRef.current  && !cartRef.current.contains(e.target as Node))  setCartOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (menuRef.current  && !menuRef.current.contains(e.target as Node))  setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const isInternal = user && ["auxiliar", "auditor", "superadmin"].includes(user.role);
  const isDelivery = user?.role === "repartidor";
  const unreadCount = appNotifs.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="h-1 bg-[#179150]" />
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <button onClick={() => onNav("home")} className="flex items-center gap-2.5 flex-shrink-0">
            <img src={logoFarmahumana} alt="Farmahumana FHEC" className="w-10 h-10 object-contain" />
            <div className="hidden sm:block">
              <div className="text-[#179150] text-xl leading-none uppercase" style={H9}>FARMAHUMANA</div>
              <div className="text-[#179150] text-sm font-black tracking-[0.25em] leading-none mt-0.5" style={H9}>FHEC</div>
            </div>
          </button>

          {/* Smart Search */}
          <SmartSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} onNav={onNav} products={products} categories={categories} brandSynonyms={brandSynonyms} />

          {/* Actions — order: Notif → Fav → Cart → Profile */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* Menú compacto móvil — solo visible en pantallas pequeñas y cuando hay sesión */}
            {user && (
              <MobileUserMenu
                userName={user.name}
                unreadCount={unreadCount}
                cartCount={cartCount}
                onNav={onNav}
              />
            )}

            {/* 1. Notificaciones — solo si hay sesión iniciada */}
            {user && (
            <div className="relative hidden sm:block" ref={notifRef}>
              <button onClick={() => setNotifOpen(o => !o)} className="relative p-2 rounded-xl hover:bg-muted transition-colors">
                <Bell size={19} className="text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-border rounded-2xl shadow-2xl z-[60] overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground" style={H9}>Notificaciones</h3>
                    <button onClick={() => setNotifOpen(false)} className="w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center">
                      <X size={13} className="text-muted-foreground" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-border" style={{ scrollbarWidth: "thin" }}>
                    {appNotifs.slice(0, 5).map(n => (
                      <button key={n.id} onClick={() => setAppNotifs(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))}
                        className={`w-full flex items-start gap-3 px-4 py-3 transition-colors text-left hover:bg-muted/40 ${!n.read ? "bg-[#f0fdf7]" : ""}`}>
                        <div className="text-xl flex-shrink-0 mt-0.5">{n.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-gray-900 truncate">{n.title}</div>
                          <p className="text-[11px] text-gray-700 line-clamp-2 mt-0.5">{n.body}</p>
                          <span className="text-[10px] text-gray-400">{n.time}</span>
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-[#179150] flex-shrink-0 mt-1" />}
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-border">
                    <button onClick={() => { setNotifOpen(false); onNav("notifications"); }}
                      className="w-full py-2 bg-[#179150] text-white rounded-xl text-xs hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                      <Bell size={12} /> Ver todas las notificaciones
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* 2. Favoritos — solo si hay sesión iniciada */}
            {user && (
            <button onClick={() => onNav("favorites")} className="p-2 rounded-xl hover:bg-muted transition-colors hidden sm:flex" title="Mis favoritos">
              <Heart size={19} className="text-muted-foreground" />
            </button>
            )}

            {/* 3. Carrito — en móvil con sesión activa lo cubre MobileUserMenu */}
            <div className={`relative ${user ? "hidden sm:block" : ""}`} ref={cartRef}>
              <button onClick={() => setCartOpen(o => !o)} className="relative p-2 rounded-xl hover:bg-muted transition-colors">
                <ShoppingCart size={20} className="text-[#006064]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#50e9f8] text-[#006064] text-[10px] font-black rounded-full flex items-center justify-center leading-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
              {cartOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-border rounded-2xl shadow-2xl z-[60] overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground" style={H9}>Mi Carrito ({cartCount})</h3>
                    <button onClick={() => setCartOpen(false)} className="w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center">
                      <X size={13} className="text-muted-foreground" />
                    </button>
                  </div>
                  {cartItems.length === 0 ? (
                    <div className="px-4 py-8 text-center text-muted-foreground text-sm">Tu carrito está vacío</div>
                  ) : (
                    <>
                      <div className="max-h-64 overflow-y-auto divide-y divide-border" style={{ scrollbarWidth: "thin" }}>
                        {cartItems.map(item => (
                          <div key={item.product.id} className="flex items-center gap-2.5 px-4 py-2.5">
                            <div className="w-8 h-10 rounded-lg overflow-hidden flex-shrink-0">
                              <ProductBox product={item.product} size="sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-foreground truncate">{item.product.name}</div>
                              <div className="text-[10px] text-[#179150] font-semibold">
                                {fmtUSD(effectivePrice(item.product) * item.quantity)}
                                {item.product.discount && item.product.discount > 0 && (
                                  <span className="line-through text-muted-foreground ml-1">{fmtUSD(item.product.priceUSD * item.quantity)}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => item.quantity > 1 ? onUpdateCartQuantity(item.product.id, -1) : onRemoveFromCart(item.product.id)}
                                className="w-6 h-6 rounded-lg bg-muted hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors text-muted-foreground">
                                <Minus size={10} />
                              </button>
                              <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                              <button onClick={() => onUpdateCartQuantity(item.product.id, 1)}
                                disabled={item.quantity >= item.product.stock}
                                className="w-6 h-6 rounded-lg bg-muted hover:bg-[#e0f5eb] hover:text-[#179150] flex items-center justify-center transition-colors text-muted-foreground disabled:opacity-30">
                                <Plus size={10} />
                              </button>
                              <button onClick={() => onRemoveFromCart(item.product.id)}
                                className="w-6 h-6 rounded-lg bg-muted hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors text-muted-foreground ml-0.5">
                                <X size={10} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-3 border-t border-border bg-muted/20">
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-muted-foreground">Total</span>
                          <span className="font-bold text-[#179150]" style={H9}>
                            {fmtUSD(cartItems.reduce((s, i) => s + effectivePrice(i.product) * i.quantity, 0))}
                          </span>
                        </div>
                        <button onClick={() => { setCartOpen(false); onNav("cart"); }}
                          className="w-full py-2.5 bg-[#179150] text-white rounded-xl text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                          <ShoppingCart size={14} /> Ver carrito
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 4. Perfil / Iniciar Sesión */}
            {user ? (
              <button onClick={() => onNav("profile")}
                className="hidden sm:flex p-2 rounded-xl hover:bg-muted transition-colors ml-1"
                title={`Mi Perfil — ${user.name}`}>
                <div className="w-7 h-7 rounded-full bg-[#50e9f8] flex items-center justify-center">
                  <User size={14} className="text-[#006064]" />
                </div>
              </button>
            ) : (
              <button onClick={() => onNav("login")}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#179150] text-white rounded-xl text-sm hover:bg-green-700 transition-colors ml-1">
                <User size={15} />
                <span className="hidden sm:block">Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Segunda barra — gradiente verde */}
      <nav className="w-full" style={{ background: "linear-gradient(90deg, #50e9f8 0%, #179150 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center">
            {/* Opciones principales — pueden bajar a segunda línea en móvil */}
            <div className="flex items-center flex-wrap flex-1 min-w-0">
              {/* Inicio */}
              <button onClick={() => onNav("home")}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all my-1
                  ${page === "home" ? "bg-white/25 text-[#006064] font-bold" : "text-[#006064]/80 hover:text-[#006064] hover:bg-white/15 hover:font-semibold"}`}>
                Inicio
              </button>

              {/* Categorías */}
              <CatNavButton page={page} onNav={onNav} onCategorySelect={onCategorySelect} />

              {/* Mi Pedido — solo cuando hay pedido activo */}
              {hasActiveOrder && (
                <button onClick={() => onNav("tracking")}
                  className={`relative px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all my-1
                    ${page === "tracking" ? "bg-white/25 text-[#006064] font-bold" : "text-[#006064]/80 hover:text-[#006064] hover:bg-white/15 hover:font-semibold"}`}>
                  Mi Pedido
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                </button>
              )}

              {/* Delivery — solo repartidor */}
              {isDelivery && (
                <button onClick={() => onNav("delivery")}
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all my-1
                    ${page === "delivery" ? "bg-white/25 text-[#006064] font-bold" : "text-[#006064]/80 hover:text-[#006064] hover:bg-white/15 hover:font-semibold"}`}>
                  Delivery
                </button>
              )}

              {/* Administración — auxiliar, auditor, superadmin */}
              {isInternal && (
                <button onClick={() => onNav("admin")}
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all my-1
                    ${page === "admin" ? "bg-white/25 text-[#006064] font-bold" : "text-[#006064]/80 hover:text-[#006064] hover:bg-white/15 hover:font-semibold"}`}>
                  Administración
                </button>
              )}
            </div>

            {/* Selector de sede — siempre a la derecha, no baja */}
            <div className="flex-shrink-0 pl-2">
              <SedeSelector selectedSede={selectedSede} onSedeChange={onSedeChange} />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

function MenuBtn({ icon, label, onClick, highlight = false }: { icon: React.ReactNode; label: string; onClick: () => void; highlight?: boolean }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors
        ${highlight ? "text-[#006064] font-black hover:bg-[#e0f5eb]" : "text-foreground hover:bg-muted"}`}>
      <span className={highlight ? "text-[#006064]" : "text-muted-foreground"}>{icon}</span>
      {label}
    </button>
  );
}

// ─── Shared form constants ────────────────────────────────────────────────────
const VE_AREAS = ["0412", "0414", "0416", "0424", "0426"];
const DOC_TYPES = ["V", "E", "J", "G", "P"];

// ─── Shared payment constants ─────────────────────────────────────────────────
const VE_BANKS = [
  "Banesco", "Banco de Venezuela", "Mercantil", "BBVA Provincial",
  "Bicentenario", "BNC", "Banco Exterior", "Banplus",
  "Venezolano de Crédito", "Del Sur", "Banco Activo", "100% Banco",
];

function RefundForm({ amountUSD, onSubmit }: { amountUSD: number; onSubmit: () => void }) {
  type RM = "transferencia" | "pago_movil";
  const [method, setMethod]   = useState<RM>("transferencia");
  const [bank,      setBank]      = useState("");
  const [account,   setAccount]   = useState("");
  const [cedula,    setCedula]    = useState("");
  const [cedType,   setCedType]   = useState("V");
  const [nombre,    setNombre]    = useState("");
  const [phone,     setPhone]     = useState("");
  const [phoneArea, setPhoneArea] = useState("0412");
  const ok = method === "transferencia"
    ? !!(bank && account && cedula && nombre)
    : !!(cedula && phone && bank);
  const inp = "w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]";
  const lbl = "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block";
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
        Reembolso de <strong>{fmtUSD(amountUSD)}</strong> ({fmtVES(amountUSD)}). Indica cómo deseas recibirlo.
      </div>
      <div className="flex gap-2">
        {(["transferencia","pago_movil"] as RM[]).map(m => (
          <button key={m} onClick={() => setMethod(m)}
            className={`flex-1 py-2 rounded-xl border-2 text-xs font-black uppercase transition-all ${method===m?"border-[#50e9f8] bg-[#e0f8fd] text-[#006064]":"border-border text-muted-foreground"}`}
            style={H7}>{m==="pago_movil"?"Pago Móvil":"Transferencia"}</button>
        ))}
      </div>
      <div>
        <label className={lbl}>Banco <span className="text-red-500">*</span></label>
        <select value={bank} onChange={e=>setBank(e.target.value)} className={inp+" bg-white"}>
          <option value="">Seleccionar banco</option>
          {VE_BANKS.map(b=><option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      {method==="transferencia" && <>
        <div><label className={lbl}>N° de cuenta <span className="text-red-500">*</span></label>
          <input value={account} onChange={e=>setAccount(e.target.value)} placeholder="XXXX-XXXX-XX-XXXXXXXXXX" className={inp}/></div>
        <div>
          <label className={lbl}>Tipo y N° de documento <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <select value={cedType} onChange={e=>setCedType(e.target.value)} className="px-2 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white">
              {DOC_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
            <input value={cedula} onChange={e=>setCedula(e.target.value)} placeholder="12345678" className={inp+" flex-1"}/>
          </div>
        </div>
        <div><label className={lbl}>Nombre del beneficiario <span className="text-red-500">*</span></label>
          <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre completo" className={inp}/></div>
      </>}
      {method==="pago_movil" && <>
        <div>
          <label className={lbl}>Tipo y N° de documento <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <select value={cedType} onChange={e=>setCedType(e.target.value)} className="px-2 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white">
              {DOC_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
            <input value={cedula} onChange={e=>setCedula(e.target.value)} placeholder="12345678" className={inp+" flex-1"}/>
          </div>
        </div>
        <div>
          <label className={lbl}>Teléfono <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <select value={phoneArea} onChange={e=>setPhoneArea(e.target.value)} className="px-2 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white">
              {VE_AREAS.map(a=><option key={a}>{a}</option>)}
            </select>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="000-0000" className={inp+" flex-1"}/>
          </div>
        </div>
      </>}
      <button onClick={onSubmit} disabled={!ok}
        className={`w-full py-3 rounded-xl font-black uppercase transition-colors ${ok?"bg-[#179150] text-white hover:bg-green-700":"bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        style={H7}>
        Confirmar Datos de Reembolso
      </button>
    </div>
  );
}

// ─── CheckoutPage — Payment ───────────────────────────────────────────────────
const SEDES = getSedesLegacy();
const DISCOUNT_CODES: Record<string,number> = getCouponApplyCodeMap();

// ─── TrackingPage ─────────────────────────────────────────────────────────────
function TrackingPage({
  onNav,
  orderItems = [],
  deliveryMode: initialDeliveryMode = "delivery",
  discountPct = 0,
  onOrderComplete,
}: {
  onNav: (p: Page) => void;
  orderItems?: CartItem[];
  deliveryMode?: "delivery" | "pickup";
  discountPct?: number;
  onOrderComplete?: () => void;
}) {
  // ── Demo controls ──
  const [demoDeliveryMode, setDemoDeliveryMode] = useState<"delivery" | "pickup">(initialDeliveryMode);
  const [demoHasRecipe, setDemoHasRecipe] = useState(orderItems.some(i => i.product.needsRecipe || i.product.controlledSubstance));

  const [orderCancelled, setOrderCancelled] = useState(false);

  // ── Steps computed from demo options ──
  type Step = { id: string; icon: React.ReactNode; label: string; desc: string };
  const steps: Step[] = [
    ...(demoHasRecipe ? [{
      id: "medical",
      icon: <FileText size={18} />,
      label: "En Revisión Médica",
      desc: "Nuestro equipo farmacéutico está validando los récipes médicos.",
    }] : []),
    {
      id: "payment",
      icon: <CreditCard size={18} />,
      label: "Pendiente por Pago",
      desc: "Procede con el pago para continuar con la preparación de tu pedido.",
    },
    {
      id: "preparation",
      icon: <Package size={18} />,
      label: "En Preparación",
      desc: "Tu pedido está siendo preparado y empacado.",
    },
    ...(demoDeliveryMode === "delivery" ? [
      {
        id: "ready",
        icon: <Truck size={18} />,
        label: "Listo para Delivery",
        desc: "Tu pedido está siendo asignado a un repartidor para su entrega.",
      },
      {
        id: "transit",
        icon: <Bike size={18} />,
        label: "En Camino",
        desc: "El repartidor está en camino a tu dirección. Mantén tu PIN listo.",
      },
    ] : [{
      id: "ready",
      icon: <Store size={18} />,
      label: "Por Retirar",
      desc: "Tu pedido está listo. Preséntate en la sede con tu PIN y cédula.",
    }]),
    {
      id: "delivered",
      icon: <CheckCircle size={18} />,
      label: "Entregado",
      desc: "Pedido entregado exitosamente. ¡Gracias por confiar en Farmahumana!",
    },
  ];

  const [status, setStatus] = useState(0);
  // Clamp status when steps shrink (e.g. switching delivery mode changes step count)
  const safeStatus = Math.min(status, steps.length - 1);
  const prepIndex = steps.findIndex(s => s.id === "preparation");
  const lastIndex = steps.length - 1;
  // PIN only visible once "En Preparación" is reached (client has paid)
  const pinVisible = safeStatus >= prepIndex && prepIndex >= 0;

  // ── Recipe rejection ──
  const [recipeRejected, setRecipeRejected] = useState(false);
  const [reuploadedRecipes, setReuploadedRecipes] = useState<Set<number>>(new Set());
  const rejectedProducts = [
    { id: 2, name: "Losartán 50mg", reason: "El récipe no tiene sello del médico visible" },
    { id: 3, name: "Amoxicilina 500mg", reason: "Récipe fuera de vigencia (más de 30 días)" },
  ];

  // ── Rating ──
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showThanksPopup, setShowThanksPopup] = useState(false);

  // ── Timers ──
  const [timeLeft, setTimeLeft] = useState({ medicalReview: 180, payment: 900, delivery: 2700 });
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => ({
      medicalReview: Math.max(0, p.medicalReview - 1),
      payment: Math.max(0, p.payment - 1),
      delivery: Math.max(0, p.delivery - 1),
    })), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (s: number) => s >= 3600
    ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
    : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ── Financial summary ──
  const demoItems = orderItems.length > 0
    ? orderItems
    : PRODUCTS.slice(0, 3).map(p => ({ product: p, quantity: 1 }));
  const subtotal = demoItems.reduce((s, i) => s + effectivePrice(i.product) * i.quantity, 0);
  const deliveryFee = demoDeliveryMode === "delivery" ? 2.50 : 0;
  const discountAmt = subtotal * discountPct / 100;
  const ivaAmt = +(subtotal * 0.16).toFixed(2);
  const total = +(subtotal + ivaAmt + deliveryFee - discountAmt).toFixed(2);

  const orderPin = "1234";

  const handleSubmitReview = () => {
    if (rating > 0) {
      setReviewSubmitted(true);
      setShowThanksPopup(true);
      onOrderComplete?.();
    }
  };

  const medicalIdx = steps.findIndex(s => s.id === "medical");
  const paymentIdx = steps.findIndex(s => s.id === "payment");
  const transitIdx = steps.findIndex(s => s.id === "transit");

  return (
    <div className="min-h-screen bg-[#f0fdf7]">


      {/* ── Order cancelled screen ── */}
      {orderCancelled && (
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <X size={38} className="text-red-500" />
          </div>
          <h2 className="text-3xl uppercase text-foreground mb-2" style={H9}>Pedido Cancelado</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Tu pedido fue cancelado. El reembolso será procesado en los próximos días hábiles.
          </p>
          <button onClick={() => onNav("home")} className="w-full bg-[#179150] text-white py-3.5 rounded-xl uppercase hover:bg-green-700 transition-colors" style={H7}>
            Volver al Inicio
          </button>
        </div>
      )}

      {!orderCancelled && <>
      {/* ── Thanks popup ── */}
      {showThanksPopup && (
        <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-10 shadow-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-[#179150] flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h2 className="text-3xl uppercase text-foreground mb-2" style={H9}>¡Gracias por tu valoración!</h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Compartiste <strong>{rating} estrella{rating !== 1 ? "s" : ""}</strong>. ¡Ya puedes hacer un nuevo pedido!
            </p>
            <div className="flex gap-1.5 justify-center mb-6">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={28} className={s <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
              ))}
            </div>
            <button onClick={() => setShowThanksPopup(false)}
              className="w-full bg-[#179150] text-white py-3.5 rounded-xl font-black uppercase hover:bg-green-700 transition-colors"
              style={H7}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-[#006064] text-white px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-white/50 text-[10px] uppercase tracking-widest font-semibold mb-0.5">Mi Pedido</div>
            <div className="text-2xl uppercase leading-none" style={H9}>#FHEC-20241204-8471</div>
            <div className="text-white/50 text-xs mt-1">
              Carlos A. Rodríguez · 4 dic. 2024 · {demoDeliveryMode === "delivery" ? "Delivery" : "Pickup"} · Ciudad Guayana
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => document.getElementById("tracking-timeline")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase cursor-pointer hover:opacity-90 transition-opacity
                ${safeStatus === lastIndex ? "bg-[#179150] text-white" : "bg-[#50e9f8] text-[#006064]"}`}
              style={H9}
            >
              <span className="relative flex w-1.5 h-1.5">
                {safeStatus < lastIndex && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "currentColor" }} />}
                <span className="relative inline-flex rounded-full w-1.5 h-1.5" style={{ backgroundColor: "currentColor" }} />
              </span>
              {steps[safeStatus]?.label}
            </button>
            <button onClick={() => onNav("home")} className="text-white/60 hover:text-white text-xs flex items-center gap-1 transition-colors">
              <ArrowLeft size={13} /> Inicio
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-1 flex flex-col gap-4">

            {/* PIN Card — only after "En Preparación" (client has paid) */}
            {pinVisible ? (
              <div className="bg-gradient-to-br from-[#006064] to-[#1a3a5c] rounded-2xl p-5 text-center border-2 border-[#50e9f8] shadow-lg">
                <div className="text-[#50e9f8] text-[10px] font-black uppercase tracking-widest mb-0.5" style={H9}>
                  PIN de {demoDeliveryMode === "pickup" ? "Retiro" : "Recepción"}
                </div>
                <div className="text-white tracking-[0.4em]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 60 }}>
                  {orderPin}
                </div>
                <p className="text-white/50 text-[10px] leading-relaxed mt-1">
                  {demoDeliveryMode === "pickup" ? "Preséntalo con tu cédula en farmacia" : "Entrégalo al motorizado al recibir"}
                </p>
              </div>
            ) : (
              <div className="bg-muted rounded-2xl p-4 text-center border-2 border-dashed border-border">
                <Lock size={20} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  El PIN de {demoDeliveryMode === "pickup" ? "retiro" : "recepción"} se mostrará una vez que tu pedido esté en preparación.
                </p>
              </div>
            )}

            {/* Contextual alerts */}
            {safeStatus === medicalIdx && medicalIdx >= 0 && !recipeRejected && (
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <Clock size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-blue-900 font-black text-xs uppercase mb-0.5" style={H9}>Revisión en Proceso</div>
                  <p className="text-blue-700 text-xs">Tiempo estimado: <strong>{fmt(timeLeft.medicalReview)}</strong></p>
                </div>
              </div>
            )}
            {safeStatus === paymentIdx && paymentIdx >= 0 && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-amber-900 font-black text-xs uppercase mb-0.5" style={H9}>Pago Pendiente</div>
                  <p className="text-amber-700 text-xs mb-2">Expira en: <strong>{fmt(timeLeft.payment)}</strong></p>
                  <button onClick={() => onNav("checkout")} className="w-full flex items-center justify-center gap-1.5 bg-[#179150] text-white px-3 py-2 rounded-xl text-xs font-black uppercase hover:bg-green-700 transition-colors" style={H7}>
                    <CreditCard size={11} /> Pagar Ahora
                  </button>
                </div>
              </div>
            )}
            {safeStatus === transitIdx && transitIdx >= 0 && (
              <div className="flex items-start gap-3 bg-[#e0f5eb] border border-[#a7f3d0] rounded-2xl p-4">
                <Bike size={16} className="text-[#006064] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[#006064] font-black text-xs uppercase mb-0.5" style={H9}>Motorizado en Camino</div>
                  <p className="text-[#003d45] text-xs">Llega en: <strong>{fmt(timeLeft.delivery)}</strong></p>
                </div>
              </div>
            )}
            {safeStatus === lastIndex && reviewSubmitted && (
              <div className="bg-[#179150]/10 border border-[#179150]/30 rounded-2xl p-4 text-center">
                <CheckCircle size={22} className="text-[#179150] mx-auto mb-1" />
                <div className="text-[#179150] font-black text-xs uppercase" style={H9}>¡Gracias por tu valoración!</div>
              </div>
            )}

            {/* Products + financial summary */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
              <div className="text-base font-black uppercase text-foreground mb-3" style={H9}>Productos del Pedido</div>
              <div className="space-y-2.5 mb-3">
                {demoItems.map(({ product: p, quantity }) => (
                  <div key={p.id} className="flex items-center gap-2.5">
                    <div className="w-9 h-11 rounded-lg overflow-hidden flex-shrink-0">
                      <ProductBox product={p} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black uppercase truncate" style={H9}>{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">{p.brand} · ×{quantity}</div>
                    </div>
                    <div className="text-xs font-semibold text-[#179150] flex-shrink-0">{fmtUSD(effectivePrice(p) * quantity)}</div>
                  </div>
                ))}
              </div>
              {/* Financial breakdown */}
              <div className="border-t border-border pt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span><span>{fmtUSD(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>IVA (16%)</span><span>{fmtUSD(ivaAmt)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Costo de envío</span>
                  <span>{deliveryFee > 0 ? fmtUSD(deliveryFee) : <span className="text-[#179150] font-semibold">Gratis</span>}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between text-xs text-[#179150]">
                    <span>Descuento ({discountPct}%)</span><span>−{fmtUSD(discountAmt)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-foreground pt-1.5 border-t border-border" style={H9}>
                  <span>Total</span>
                  <div className="text-right">
                    <div className="text-[#179150]">{fmtUSD(total)}</div>
                    <div className="text-[10px] font-normal text-muted-foreground">{fmtVES(total)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* "Nuevo Pedido" — only after review is submitted */}
            {safeStatus === lastIndex && reviewSubmitted && (
              <button
                onClick={() => onNav("catalog")}
                className="w-full bg-[#50e9f8] text-[#006064] py-3 rounded-xl font-black text-sm uppercase transition-colors hover:bg-[#2dd8e8]"
                style={H7}
              >
                + Nuevo Pedido
              </button>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Recipe rejected card */}
            {recipeRejected && safeStatus === medicalIdx && medicalIdx >= 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-red-900 font-black text-sm uppercase mb-1" style={H9}>Récipe Rechazado</div>
                    <p className="text-red-700 text-xs leading-relaxed">Carga nuevos récipes corregidos para los productos indicados.</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {rejectedProducts.map(product => {
                    const reuploaded = reuploadedRecipes.has(product.id);
                    return (
                      <div key={product.id} className="bg-white border border-red-200 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="text-xs font-black uppercase" style={H9}>{product.name}</div>
                          {reuploaded && <span className="bg-green-100 text-[#179150] text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1" style={H9}><CheckCircle size={9} /> OK</span>}
                        </div>
                        <div className="text-[10px] text-red-700 mb-2">{product.reason}</div>
                        {!reuploaded && (
                          <label className="flex items-center justify-center gap-1.5 border-2 border-dashed border-red-300 rounded-xl p-2 cursor-pointer hover:border-red-400 transition-all">
                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) setReuploadedRecipes(prev => new Set(prev).add(product.id)); }} />
                            <Upload size={12} className="text-red-600" />
                            <span className="text-[10px] font-black uppercase text-red-700" style={H9}>Cargar Récipe</span>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
                {reuploadedRecipes.size === rejectedProducts.length && (
                  <button onClick={() => { setRecipeRejected(false); setReuploadedRecipes(new Set()); }} className="w-full mt-4 bg-[#179150] text-white py-2.5 rounded-xl font-black uppercase hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm" style={H7}>
                    <CheckCircle size={14} /> Reenviar a Auditoría
                  </button>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6" id="tracking-timeline">
              <h3 className="text-2xl uppercase text-foreground mb-6" style={H9}>Línea de Tiempo</h3>
              {/* Mobile: vertical */}
              <div className="flex flex-col gap-0 sm:hidden">
                {steps.map((s, i) => {
                  const done = i < safeStatus;
                  const current = i === safeStatus;
                  return (
                    <div key={s.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-sm
                          ${done ? "bg-[#179150] text-white" : current ? "bg-[#50e9f8] text-[#006064] ring-4 ring-[#50e9f8]/20" : "bg-[#e0f5eb] text-[#179150]/40"}`}>
                          {done ? <Check size={18} /> : s.icon}
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`w-px flex-1 my-1 ${done ? "bg-[#179150]" : "border-l-2 border-dashed border-border"}`} style={{ minHeight: 32 }} />
                        )}
                      </div>
                      <div className="pb-6 pt-2 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs uppercase font-black ${current ? "text-[#006064]" : done ? "text-[#179150]" : "text-muted-foreground"}`} style={H9}>{i + 1}. {s.label}</span>
                          {current && <span className="w-2 h-2 bg-[#50e9f8] rounded-full animate-pulse flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Desktop: horizontal */}
              <div className="hidden sm:flex items-start">
                {steps.map((s, i) => {
                  const done = i < safeStatus;
                  const current = i === safeStatus;
                  return (
                    <React.Fragment key={s.id}>
                      <div className="flex flex-col items-center text-center flex-1 min-w-0">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all shadow-sm
                          ${done ? "bg-[#179150] text-white" : current ? "bg-[#50e9f8] text-[#006064] ring-4 ring-[#50e9f8]/20" : "bg-[#e0f5eb] text-[#179150]/50"}`}>
                          {done ? <Check size={22} /> : s.icon}
                        </div>
                        <div className={`text-xs uppercase font-black mb-1 leading-tight ${current ? "text-[#006064]" : done ? "text-[#179150]" : "text-muted-foreground/50"}`} style={H9}>
                          {i + 1}. {s.label}
                        </div>
                        <p className={`text-[11px] leading-relaxed px-1 ${current || done ? "text-muted-foreground" : "text-muted-foreground/40"}`}>{s.desc}</p>
                        {current && <span className="mt-1.5 text-[10px] text-[#179150] font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#50e9f8] rounded-full animate-pulse" />En curso</span>}
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`flex-shrink-0 w-8 mt-7 border-t-2 border-dashed ${done ? "border-[#179150]" : "border-border"}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Rating — only when delivered and not yet reviewed */}
            {safeStatus === lastIndex && !reviewSubmitted && (
              <div className="bg-white border border-border rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#179150]/10 flex items-center justify-center flex-shrink-0">
                    <Star size={20} className="text-[#179150]" />
                  </div>
                  <div>
                    <h3 className="text-base uppercase text-foreground" style={H9}>¿Cómo fue tu experiencia?</h3>
                    <p className="text-xs text-muted-foreground">Tu valoración habilita el botón de nuevo pedido</p>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => setRating(star)} className="transition-all hover:scale-110">
                      <Star size={34} className={`transition-colors ${star <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-300 hover:text-amber-300"}`} />
                    </button>
                  ))}
                </div>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Cuéntanos sobre tu experiencia..." className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] transition-all resize-none mb-3" rows={3} />
                <button onClick={handleSubmitReview} disabled={rating === 0} className={`w-full py-2.5 rounded-xl font-black uppercase transition-all flex items-center justify-center gap-2 text-sm ${rating > 0 ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`} style={H7}>
                  <CheckCircle size={15} /> Enviar Valoración
                </button>
              </div>
            )}

            {/* Demo controls */}
            <div className="bg-muted rounded-2xl p-4">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-3">Demo: Controles de Visualización</div>

              {/* Delivery type */}
              <div className="mb-3">
                <div className="text-[10px] text-muted-foreground mb-1.5 font-semibold">Tipo de Entrega</div>
                <div className="flex gap-1.5">
                  {(["delivery", "pickup"] as const).map(mode => (
                    <button key={mode} onClick={() => { setDemoDeliveryMode(mode); setStatus(0); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${demoDeliveryMode === mode ? "bg-[#50e9f8] text-[#006064]" : "bg-white border border-border text-muted-foreground hover:border-[#179150]"}`}
                      style={H7}>
                      {mode === "delivery" ? "🛵 Delivery" : "🏪 Pickup"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipe toggle */}
              <div className="mb-3">
                <div className="text-[10px] text-muted-foreground mb-1.5 font-semibold">Requiere Récipe Médico</div>
                <div className="flex gap-1.5">
                  {([true, false] as const).map(v => (
                    <button key={String(v)} onClick={() => { setDemoHasRecipe(v); setStatus(0); setRecipeRejected(false); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${demoHasRecipe === v ? "bg-[#50e9f8] text-[#006064]" : "bg-white border border-border text-muted-foreground hover:border-[#179150]"}`}
                      style={H7}>
                      {v ? "Con Récipe" : "Sin Récipe"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step selector */}
              <div className="mb-3">
                <div className="text-[10px] text-muted-foreground mb-1.5 font-semibold">Estado Actual</div>
                <div className="flex flex-wrap gap-1.5">
                  {steps.map((s, i) => (
                    <button key={s.id} onClick={() => setStatus(i)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${safeStatus === i ? "bg-[#50e9f8] text-[#006064]" : "bg-white border border-border text-muted-foreground hover:border-[#179150]"}`}
                      style={H7}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipe rejection toggle */}
              {demoHasRecipe && (
                <div className="flex gap-1.5 pt-2 border-t border-border">
                  {!recipeRejected
                    ? <button onClick={() => setRecipeRejected(true)} className="px-2.5 py-1 bg-red-100 border border-red-200 text-red-700 rounded-lg text-[10px] font-bold hover:bg-red-200 transition-colors">Caso Récipe Rechazado</button>
                    : <button onClick={() => { setRecipeRejected(false); setReuploadedRecipes(new Set()); }} className="px-2.5 py-1 bg-green-100 border border-green-300 text-[#179150] rounded-lg text-[10px] font-bold hover:bg-green-200 transition-colors">Caso Récipe Aprobado</button>
                  }
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      </>}
    </div>
  );
}

// ─── FavoritesPage ────────────────────────────────────────────────────────────
function FavoritesPage({ products, favoriteIds, onProductClick, onAddToCart, onToggleFavorite, cartItems, onUpdateQuantity, onNav }: {
  products: Product[]; favoriteIds: Set<number>;
  onProductClick: (id: number) => void; onAddToCart: (p: Product) => void;
  onToggleFavorite: (productId: number) => void;
  cartItems: CartItem[]; onUpdateQuantity: (productId: number, delta: number) => void;
  onNav: (p: Page) => void;
}) {
  const favoriteProducts = products.filter(p => favoriteIds.has(p.id));

  if (favoriteProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-20 text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <h2 className="text-2xl uppercase text-foreground mb-2" style={H9}>No tienes favoritos</h2>
        <p className="text-muted-foreground text-sm mb-6">Agrega productos a favoritos para verlos aquí</p>
        <button onClick={() => onNav("catalog")} className="bg-[#50e9f8] text-[#006064] px-6 py-3 rounded-xl font-black uppercase tracking-wide" style={H7}>
          Explorar Catálogo
        </button>
      </div>
    );
  }

  const handleAddAllToCart = () => {
    favoriteProducts.forEach(p => {
      if (p.stock > 0) onAddToCart(p);
    });
  };

  const availableFavorites = favoriteProducts.filter(p => p.stock > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-16 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl uppercase text-foreground" style={H9}>Mis Favoritos ({favoriteProducts.length})</h1>
        {availableFavorites.length > 0 && (
          <button
            onClick={handleAddAllToCart}
            className="flex items-center gap-2 bg-[#179150] text-white px-6 py-3 rounded-xl font-black uppercase hover:bg-green-700 transition-colors"
            style={H7}
          >
            <ShoppingCart size={16} />
            Añadir Todo al Carrito ({availableFavorites.length})
          </button>
        )}
      </div>

      {availableFavorites.length < favoriteProducts.length && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm">
            {favoriteProducts.length - availableFavorites.length} producto(s) en tus favoritos no tienen stock disponible.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {favoriteProducts.map(p => {
          const cartItem = cartItems.find(ci => ci.product.id === p.id);
          return (
            <ProductCard
              key={p.id}
              product={p}
              onProductClick={onProductClick}
              onAddToCart={onAddToCart}
              cartQuantity={cartItem?.quantity || 0}
              onUpdateQuantity={onUpdateQuantity}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── BannerManagementPage ─────────────────────────────────────────────────────
function BannerManagementPage({ slides, setSlides, onNav }: { slides: Slide[]; setSlides: (s: Slide[]) => void; onNav: (p: Page) => void }) {
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Slide | null>(null);

  const startEdit = (i: number) => { setEditing(i); setDraft({ ...slides[i] }); };
  const save = () => {
    if (editing === null || !draft) return;
    const next = [...slides];
    next[editing] = draft;
    setSlides(next);
    setEditing(null); setDraft(null);
  };
  const remove = (i: number) => setSlides(slides.filter((_, idx) => idx !== i));
  const addNew = () => {
    const blank: Slide = { title: "Nuevo Banner", subtitle: "Descripción del banner", badge: "NUEVO", from: "#031b24", via: "#00546a", to: "#50e9f8", img: "https://images.unsplash.com/photo-1550572017-efe56097ef4a?w=900&h=500&fit=crop&auto=format", cta: "Ver más →" };
    setSlides([...slides, blank]);
    setEditing(slides.length); setDraft(blank);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 pb-16 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNav("home")} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-3xl uppercase text-foreground" style={H9}>Gestión de Banners</h1>
          <p className="text-sm text-muted-foreground">Administra los banners del carrusel principal · Solo Superadmin</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {slides.map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Preview */}
            <div className="relative h-24" style={{ background: `linear-gradient(135deg, ${s.from}, ${s.via}, ${s.to})` }}>
              <div className="absolute inset-0 flex items-center px-6 gap-4">
                <div className="flex-1">
                  <div className="inline-block bg-[#50e9f8] text-[#006064] text-[9px] font-black px-2 py-0.5 rounded-full mb-1 uppercase" style={H9}>{s.badge}</div>
                  <div className="text-white text-xl uppercase leading-tight" style={H9}>{s.title}</div>
                  <div className="text-white/70 text-xs mt-0.5 line-clamp-1">{s.subtitle}</div>
                </div>
                <div className="text-xs font-semibold text-white/80 bg-white/10 px-3 py-1 rounded-lg border border-white/20">{s.cta}</div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1.5">
                <span className="text-[10px] bg-black/30 text-white px-2 py-0.5 rounded-full font-semibold">Banner {i + 1}</span>
              </div>
            </div>
            {/* Controls */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
              <div className="text-sm text-muted-foreground truncate max-w-xs">{s.img}</div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(i)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-xl hover:bg-muted transition-colors">
                  <Settings size={12} />Editar
                </button>
                <button onClick={() => remove(i)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors">
                  <Trash2 size={12} />Eliminar
                </button>
              </div>
            </div>

            {/* Edit form */}
            {editing === i && draft && (
              <div className="border-t border-border p-5 grid sm:grid-cols-2 gap-4 bg-white">
                {([
                  ["Título", "title"],
                  ["Subtítulo", "subtitle"],
                  ["Badge / Etiqueta", "badge"],
                  ["Texto del botón (CTA)", "cta"],
                  ["URL de imagen", "img"],
                  ["Color inicio (from)", "from"],
                  ["Color medio (via)", "via"],
                  ["Color fin (to)", "to"],
                ] as [string, keyof Slide][]).map(([label, key]) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
                    <div className="flex items-center gap-2">
                      {["from", "via", "to"].includes(key) && (
                        <input type="color" value={draft[key] as string} onChange={e => setDraft({ ...draft, [key]: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-border cursor-pointer p-0.5" />
                      )}
                      <input value={draft[key] as string} onChange={e => setDraft({ ...draft, [key]: e.target.value })}
                        className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" />
                    </div>
                  </div>
                ))}
                <div className="sm:col-span-2 flex gap-2 pt-2">
                  <button onClick={save} className="flex-1 bg-[#179150] text-white py-2.5 rounded-xl text-sm font-black uppercase hover:bg-green-700 transition-colors" style={H7}>
                    <Check size={14} className="inline mr-1.5" />Guardar cambios
                  </button>
                  <button onClick={() => { setEditing(null); setDraft(null); }} className="px-4 border border-border rounded-xl text-sm hover:bg-muted transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={addNew} className="w-full py-3.5 border-2 border-dashed border-[#50e9f8] rounded-2xl text-[#006064] font-black uppercase text-sm hover:bg-[#e0f5eb] transition-colors flex items-center justify-center gap-2" style={H7}>
        <Plus size={16} />Agregar nuevo banner
      </button>
    </div>
  );
}

// ─── DeliveryPanel ────────────────────────────────────────────────────────────
// Format phone to WhatsApp link (Venezuelan numbers)
function toWaLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const num = digits.startsWith("0") ? "58" + digits.slice(1) : digits;
  return `https://wa.me/${num}`;
}

const COMPLETED_TRIPS_DEMO = getLegacyDeliveryCompletedTripViewModels();

function DeliveryPanel({ onNav, userSede }: { onNav: (p: Page) => void; userSede?: string }) {
  const [activeTab, setActiveTab] = useState<"available" | "myTrips" | "completed">("available");
  // If userSede is set (not "Todas"), lock to that sede; otherwise allow switching
  const hasAllSedes = !userSede || userSede === "Todas";
  const [selectedSede, setSelectedSede] = useState(hasAllSedes ? "principal" : (userSede ?? "principal"));
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [myTrips, setMyTrips] = useState<string[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showMaxTripsModal, setShowMaxTripsModal] = useState(false);

  // Completed trips filters
  const [ctDateFrom, setCtDateFrom] = useState("");
  const [ctDateTo, setCtDateTo] = useState("");
  const [ctSede, setCtSede] = useState("todas");

  const DEMO_OTP = "1234";

  const ALL_ORDERS = getLegacyDeliveryAvailableOrderViewModels();

  const availableOrders = ALL_ORDERS.filter(o => o.sede === selectedSede && !myTrips.includes(o.id));
  const myTripOrders = ALL_ORDERS.filter(o => myTrips.includes(o.id));

  const handleAssignOrder = (orderId: string) => {
    if (myTrips.length >= 3) { setShowMaxTripsModal(true); return; }
    setMyTrips(prev => [...prev, orderId]);
  };

  const handleDelivery = (orderId: string) => {
    setSelectedOrder(orderId);
    setShowPinModal(true);
    setPinInput("");
  };

  const verifyPin = () => {
    if (pinInput === DEMO_OTP) {
      setShowPinModal(false);
      setMyTrips(prev => prev.filter(id => id !== selectedOrder));
      setSelectedOrder(null);
      setPinInput("");
    }
  };

  const handlePinKeyPress = (key: string) => {
    if (key === "del") {
      setPinInput(p => p.slice(0, -1));
    } else if (pinInput.length < 4) {
      setPinInput(p => p + key);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0fdf7]">
      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#50e9f8]/15 flex items-center justify-center mx-auto mb-4">
              <Lock size={26} className="text-[#179150]" />
            </div>
            <h3 className="text-2xl uppercase text-foreground text-center mb-2" style={H9}>Confirmar Entrega</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
              Ingresa el PIN de 4 dígitos proporcionado por el cliente
            </p>

            {/* PIN Display */}
            <div className="flex gap-2 justify-center mb-6">
              {[0,1,2,3].map(i => (
                <div
                  key={i}
                  className={`w-14 h-16 border-2 rounded-xl flex items-center justify-center text-2xl font-black transition-all
                    ${pinInput[i] ? "border-[#179150] bg-[#179150]/5 text-[#179150]" : "border-border bg-white"}`}
                  style={H9}
                >
                  {pinInput[i] || ""}
                </div>
              ))}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button
                  key={n}
                  onClick={() => handlePinKeyPress(String(n))}
                  className="h-14 bg-muted hover:bg-[#e0f5eb] border border-border rounded-xl text-lg font-black transition-colors"
                  style={H9}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => handlePinKeyPress("del")}
                className="h-14 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-red-600" />
              </button>
              <button
                onClick={() => handlePinKeyPress("0")}
                className="h-14 bg-muted hover:bg-[#e0f5eb] border border-border rounded-xl text-lg font-black transition-colors"
                style={H9}
              >
                0
              </button>
              <button
                onClick={verifyPin}
                disabled={pinInput.length !== 4}
                className={`h-14 rounded-xl flex items-center justify-center transition-colors
                  ${pinInput.length === 4 ? "bg-[#179150] hover:bg-green-700 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
              >
                <Check size={20} />
              </button>
            </div>

            <button
              onClick={() => setShowPinModal(false)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <p className="text-xs text-muted-foreground text-center mt-3">Demo: el PIN es <strong>1234</strong></p>
          </div>
        </div>
      )}

      {/* Max trips warning modal */}
      {showMaxTripsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4" onClick={() => setShowMaxTripsModal(false)}>
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-amber-500" />
            </div>
            <h3 className="text-xl uppercase text-foreground mb-2" style={H9}>Límite de pedidos activos</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              No puedes seleccionar más de <strong>3 pedidos activos</strong> al mismo tiempo. Completa o entrega uno de tus viajes actuales antes de asignarte un nuevo pedido.
            </p>
            <button
              onClick={() => setShowMaxTripsModal(false)}
              className="w-full py-3 bg-[#179150] text-white rounded-xl font-black uppercase hover:bg-green-700 transition-colors"
              style={H7}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative px-6 py-6" style={{ background: "linear-gradient(135deg, #50e9f8 0%, #179150 100%)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white text-3xl leading-none uppercase" style={H9}>Panel de Reparto</h1>
            <p className="text-white/75 text-sm mt-1">Gestión de entregas y rutas</p>
            {userSede && (
              <span className="inline-flex items-center gap-1 mt-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
                Sede asignada: {userSede}
              </span>
            )}
          </div>
          <button
            onClick={() => onNav("home")}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-black uppercase transition-colors border border-white/30"
            style={H9}
          >
            <ArrowLeft size={14} /> Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-6 py-3 text-sm font-black uppercase transition-all relative
              ${activeTab === "available" ? "text-[#179150]" : "text-muted-foreground hover:text-foreground"}`}
            style={H9}
          >
            Pedidos Disponibles
            {activeTab === "available" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#179150]" />}
          </button>
          <button
            onClick={() => setActiveTab("myTrips")}
            className={`px-6 py-3 text-sm font-black uppercase transition-all relative
              ${activeTab === "myTrips" ? "text-[#179150]" : "text-muted-foreground hover:text-foreground"}`}
            style={H9}
          >
            Mis Viajes ({myTrips.length})
            {activeTab === "myTrips" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#179150]" />}
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-3 text-sm font-black uppercase transition-all relative
              ${activeTab === "completed" ? "text-[#179150]" : "text-muted-foreground hover:text-foreground"}`}
            style={H9}
          >
            Viajes Completados
            {activeTab === "completed" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#179150]" />}
          </button>
        </div>

        {/* Available Orders Tab */}
        {activeTab === "available" && (
          <div>
            {/* Sede Filter — solo visible si el repartidor tiene acceso a todas las sedes */}
            {hasAllSedes ? (
              <div className="mb-6">
                <label className="text-sm font-semibold text-foreground uppercase mb-2 block" style={H9}>Filtrar por Sede</label>
                <div className="grid grid-cols-2 gap-3">
                  {SEDES.map(sede => (
                    <button
                      key={sede.id}
                      onClick={() => setSelectedSede(sede.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left
                        ${selectedSede === sede.id ? "border-[#50e9f8] bg-[#e0f5eb]" : "border-border hover:border-[#179150]/40"}`}
                    >
                      <div className="text-sm font-black uppercase text-foreground mb-1" style={H9}>{sede.name}</div>
                      <div className="text-xs text-muted-foreground">{sede.address}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6 flex items-center gap-2 bg-[#e0f5eb] border border-[#a7f3d0] rounded-xl px-4 py-3">
                <MapPin size={14} className="text-[#179150] flex-shrink-0" />
                <span className="text-sm font-semibold text-[#006064]">
                  Sede asignada: {SEDES.find(s => s.id === selectedSede)?.name ?? selectedSede}
                </span>
              </div>
            )}

            {/* Orders List */}
            <div className="space-y-4">
              {availableOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No hay pedidos disponibles en esta sede</p>
                </div>
              ) : (
                availableOrders.map(order => {
                  const isExpanded = expandedOrder === order.id;
                  return (
                    <div key={order.id} className={`bg-white border rounded-2xl overflow-hidden transition-all ${isExpanded ? "border-[#179150] shadow-md" : "border-border hover:border-[#179150]/50"}`}>
                      {/* Card header */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-[#179150] text-base font-black uppercase" style={H9}>{order.id}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{order.items} productos · <strong>${order.total.toFixed(2)}</strong> · 📍 {order.distance}</div>
                          </div>
                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            className="flex items-center gap-1.5 border border-border text-muted-foreground px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-muted transition-colors"
                          >
                            {isExpanded ? "Ocultar" : "Ver detalles"}
                            <ChevronDown size={12} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User size={13} className="text-[#179150] flex-shrink-0" />
                            <span className="font-semibold text-foreground">{order.customer}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={13} className="text-[#179150] flex-shrink-0" />
                            <span className="text-muted-foreground">{order.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={13} className="text-[#179150] flex-shrink-0" />
                            <span className="text-muted-foreground truncate">{order.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded detail panel */}
                      {isExpanded && (
                        <div className="border-t border-border bg-[#f9fdfe] px-5 py-4 space-y-4">
                          {/* Products */}
                          <div>
                            <div className="text-xs font-black uppercase text-muted-foreground mb-2" style={H9}>Productos del pedido</div>
                            <div className="space-y-1.5">
                              {order.products.map((p, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#179150] flex-shrink-0" />
                                  <span>{p}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Map preview */}
                          <div>
                            <div className="text-xs font-black uppercase text-muted-foreground mb-2" style={H9}>Dirección de entrega</div>
                            <GpsMapWidget address={order.address} orderId={order.id} />
                          </div>

                          {/* Notes */}
                          {order.notes && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                              <div className="text-xs font-black text-amber-700 uppercase mb-1" style={H9}>Nota del pedido</div>
                              <p className="text-xs text-amber-800">{order.notes}</p>
                            </div>
                          )}

                          <button
                            onClick={() => { handleAssignOrder(order.id); setExpandedOrder(null); }}
                            className="w-full flex items-center justify-center gap-2 bg-[#179150] text-white py-2.5 rounded-xl font-black uppercase hover:bg-green-700 transition-colors text-sm"
                            style={H7}
                          >
                            <Bike size={15} /> Asignarme a este pedido
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Completed Trips Tab */}
        {activeTab === "completed" && (() => {
          const filtered = COMPLETED_TRIPS_DEMO.filter(t => {
            const matchSede = ctSede === "todas" || t.sede === ctSede;
            const matchFrom = !ctDateFrom || t.date >= ctDateFrom;
            const matchTo   = !ctDateTo   || t.date <= ctDateTo;
            return matchSede && matchFrom && matchTo;
          });
          const totalCost = filtered.reduce((s, t) => s + t.shippingCost, 0);
          return (
            <div>
              {/* Filters */}
              <div className="bg-white rounded-2xl border border-border shadow-sm p-5 mb-5">
                <div className="text-xs font-black uppercase text-muted-foreground mb-3" style={H9}>Filtros</div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Fecha desde</label>
                    <input type="date" value={ctDateFrom} onChange={e => setCtDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Fecha hasta</label>
                    <input type="date" value={ctDateTo} onChange={e => setCtDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Sede</label>
                    <select value={ctSede} onChange={e => setCtSede(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]">
                      <option value="todas">Todas</option>
                      {SEDES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-base uppercase text-foreground" style={H9}>Viajes Completados</h2>
                  <span className="text-xs text-muted-foreground">{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</span>
                </div>
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No hay viajes con los filtros seleccionados</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          {["Nº Pedido", "Fecha", "Cliente", "Sede", "Costo de envío"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground" style={H9}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((t, i) => (
                          <tr key={t.id} className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                            <td className="px-4 py-3 text-[#179150] font-black text-xs" style={H9}>{t.id}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">{t.date}</td>
                            <td className="px-4 py-3 text-foreground text-xs font-semibold">{t.customer}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs capitalize">{t.sede === "principal" ? "Sede Principal" : "Clínica Humana"}</td>
                            <td className="px-4 py-3 text-foreground text-xs font-semibold">${t.shippingCost.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="px-5 py-4 border-t border-border bg-[#f0fdf7] flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" style={H9}>Total acumulado (costos de envío)</span>
                  <span className="text-xl font-black text-[#179150]" style={H9}>${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* My Trips Tab */}
        {activeTab === "myTrips" && (
          <div className="space-y-4">
            {myTripOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bike size={40} className="mx-auto mb-3 opacity-30" />
                <p>No tienes viajes asignados</p>
              </div>
            ) : (
              myTripOrders.map(order => (
                <div key={order.id} className="bg-white border border-[#179150] rounded-2xl overflow-hidden shadow-md">
                  {/* Trip header */}
                  <div className="bg-gradient-to-r from-[#179150] to-[#006064] px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-white text-base font-black uppercase" style={H9}>{order.id}</div>
                      <div className="text-white/70 text-xs mt-0.5">{order.items} productos · ${order.total.toFixed(2)} · 📍 {order.distance}</div>
                    </div>
                    <span className="bg-[#50e9f8] text-[#006064] text-xs font-black px-3 py-1 rounded-full uppercase" style={H9}>En ruta</span>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Client info + action buttons */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <User size={14} className="text-[#179150] flex-shrink-0" />
                          <span className="font-black text-foreground">{order.customer}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-[#179150] flex-shrink-0" />
                          <span className="text-muted-foreground">{order.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={14} className="text-[#179150] flex-shrink-0" />
                          <span className="text-muted-foreground text-xs">{order.address}</span>
                        </div>
                      </div>
                      {/* Contact buttons */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <a href={`tel:${order.phone}`}
                          className="flex items-center gap-1.5 bg-[#179150] text-white px-3 py-2 rounded-xl text-xs font-black uppercase hover:bg-green-700 transition-colors">
                          <Phone size={13} /> Llamar
                        </a>
                        <a href={toWaLink(order.phone)} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-white px-3 py-2 rounded-xl text-xs font-black uppercase transition-colors"
                          style={{ backgroundColor: "#25D366" }}>
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a3.6 3.6 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374A9.86 9.86 0 012.1 11.892C2.1 6.442 6.535 2.008 11.987 2.008c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0011.987 0C5.432 0 .096 5.335.093 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          WhatsApp
                        </a>
                      </div>
                    </div>

                    {/* Products summary */}
                    <div className="bg-[#f0fdf7] rounded-xl px-4 py-3">
                      <div className="text-xs font-black text-muted-foreground uppercase mb-2" style={H9}>Productos a entregar</div>
                      <div className="space-y-1">
                        {order.products.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#179150] flex-shrink-0" />
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                        <div className="text-xs font-black text-amber-700 uppercase mb-1" style={H9}>Nota</div>
                        <p className="text-xs text-amber-800">{order.notes}</p>
                      </div>
                    )}

                    {/* Map preloaded with address */}
                    <div>
                      <div className="text-xs font-black text-muted-foreground uppercase mb-2" style={H9}>Mapa de entrega</div>
                      <GpsMapWidget address={order.address} orderId={order.id} initialPin={addressToPin(order.address)} />
                    </div>

                    <button
                      onClick={() => handleDelivery(order.id)}
                      className="w-full flex items-center justify-center gap-2 bg-[#179150] text-white py-3.5 rounded-xl font-black uppercase hover:bg-green-700 transition-colors"
                      style={H7}
                    >
                      <CheckCircle size={16} /> Confirmar Entrega
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SuperadminModules ────────────────────────────────────────────────────────
type SuperTab = "contenido" | "catalogo" | "personal" | "monitor" | "inventario" | "cupones";

// payRef only present when the order has been paid
const DEMO_GLOBAL_ORDERS = getLegacyAdminMonitorOrderViewModels();

const STATUS_COLORS: Record<string, string> = {
  "En validación médica": "bg-amber-100 text-amber-800",
  "Pendiente pago": "bg-blue-100 text-blue-800",
  "Por preparar": "bg-orange-100 text-orange-800",
  "Por retirar": "bg-purple-100 text-purple-800",
  "Listo para delivery": "bg-cyan-100 text-cyan-800",
  "En tránsito": "bg-indigo-100 text-indigo-800",
  "Entregado": "bg-green-100 text-green-800",
  "Cancelado": "bg-red-100 text-red-800",
};

function InventarioTab({ products, setCatalogProducts }: { products: Product[]; setCatalogProducts: React.Dispatch<React.SetStateAction<Product[]>> }) {
  const [sede, setSede] = useState<"principal" | "clinica">("principal");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState(0);

  const getStock = (p: Product) => (sede === "principal" ? p.stockSedes?.principal : p.stockSedes?.clinica) ?? p.stock;

  const startEdit = (p: Product) => { setEditingId(p.id); setEditStock(getStock(p)); };
  const cancelEdit = () => setEditingId(null);

  const saveEdit = (id: number) => {
    setCatalogProducts(prev => prev.map(p => p.id === id ? {
      ...p,
      stock: editStock,
      stockSedes: { ...(p.stockSedes ?? { principal: p.stock, clinica: 0 }), [sede]: editStock },
    } : p));
    setEditingId(null);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const inp = "w-full px-2 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:border-[#179150]";
  const editingProduct = products.find(p => p.id === editingId);

  return (
    <div className="space-y-4">
      {/* Edit modal — stock only */}
      {editingId !== null && editingProduct && (
        <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl uppercase text-foreground" style={H9}>Ajustar Stock</h3>
                <p className="text-sm font-semibold text-foreground">{editingProduct.name}</p>
                <p className="text-xs text-muted-foreground">{editingProduct.brand} · {editingProduct.presentation}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Sede: {sede === "principal" ? "Sede Principal" : "Clínica Humana"}</p>
              </div>
              <button onClick={cancelEdit} className="p-2 hover:bg-muted rounded-xl transition-colors"><X size={18} /></button>
            </div>

            {/* Read-only info */}
            <div className="bg-muted/40 rounded-xl px-4 py-3 mb-4 space-y-1">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Categoría</span><span className="font-semibold text-foreground">{editingProduct.category}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Forma farmacéutica</span><span className="font-semibold text-foreground">{editingProduct.presentation}</span></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Sede</label>
                <select value={sede} onChange={e => { setSede(e.target.value as "principal" | "clinica"); setEditStock(getStock({ ...editingProduct, stockSedes: editingProduct.stockSedes })); }} className={inp}>
                  <option value="principal">Sede Principal</option>
                  <option value="clinica">Clínica Humana</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Stock disponible</label>
                <input type="number" min={0} className={inp} value={editStock}
                  onChange={e => setEditStock(parseInt(e.target.value) || 0)} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => saveEdit(editingId)}
                className="flex-1 py-3 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors font-black uppercase" style={H7}>
                Guardar
              </button>
              <button onClick={cancelEdit}
                className="px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors" style={H7}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl uppercase text-foreground" style={H9}>Inventario por Sede</h3>
          <p className="text-sm text-muted-foreground">Control exclusivo de stock disponible por sede.</p>
        </div>
        <select
          value={sede}
          onChange={e => { setSede(e.target.value as "principal" | "clinica"); setEditingId(null); }}
          className="px-4 py-2 border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-[#179150] bg-white min-w-[180px]"
        >
          <option value="principal">Sede Principal</option>
          <option value="clinica">Clínica Humana</option>
        </select>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o marca..."
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" />
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f0fdf7] border-b border-border">
              {["Producto / Marca", "Categoría", "Forma farmacéutica", "Stock disponible", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase text-muted-foreground whitespace-nowrap" style={H9}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const stock = getStock(p);
              return (
                <tr key={p.id} className="border-b border-border/50 hover:bg-[#f9fdfe] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground text-xs">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">{p.brand}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.presentation}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${stock === 0 ? "bg-red-100 text-red-700" : stock < 10 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`} style={H9}>
                      {stock === 0 ? "Agotado" : stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => startEdit(p)}
                      className="p-1.5 hover:bg-[#50e9f8]/10 rounded-lg text-[#006064] transition-colors"
                      title="Ajustar stock">
                      <Settings size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">Sin resultados para "{search}"</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function SuperadminModules({ onNav, products, setProducts, slides, setSlides, forcedTab }: {
  onNav: (p: Page) => void;
  products: Product[];
  setProducts: (p: Product[]) => void;
  slides: Slide[];
  setSlides: (s: Slide[]) => void;
  forcedTab?: SuperTab;
}) {
  const [superTab, setSuperTab] = useState<SuperTab>(forcedTab ?? "contenido");
  React.useEffect(() => { if (forcedTab) setSuperTab(forcedTab); }, [forcedTab]);

  // ── Gestor Contenido state ──
  const [slideEditing, setSlideEditing] = useState<number | null>(null);
  const [slideDraft, setSlideDraft] = useState<Slide | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startEditSlide = (i: number) => { setSlideEditing(i); setSlideDraft({ ...slides[i] }); };
  const saveSlide = () => {
    if (slideEditing === null || !slideDraft) return;
    const next = [...slides]; next[slideEditing] = slideDraft;
    setSlides(next); setSlideEditing(null); setSlideDraft(null);
  };
  const removeSlide = (i: number) => setSlides(slides.filter((_, idx) => idx !== i));
  const addNewSlide = () => {
    const blank: Slide = { title: "Nuevo Banner", subtitle: "Descripción del banner", badge: "NUEVO", from: "#031b24", via: "#00546a", to: "#50e9f8", img: "https://images.unsplash.com/photo-1550572017-efe56097ef4a?w=900&h=500&fit=crop&auto=format", cta: "Ver más →" };
    setSlides([...slides, blank]);
    setSlideEditing(slides.length); setSlideDraft(blank);
  };

  // ── Gestor Catálogo state ──
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(products.length ? products : PRODUCTS);
  const [catSearch, setCatSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todos");
  const [editProd, setEditProd] = useState<Product | null>(null);
  const [showProdForm, setShowProdForm] = useState(false);
  const [prodForm, setProdForm] = useState<Partial<Product>>({});
  const isProdEnabled = (p: Product) => p.enabled !== false;

  // ── Gestor Personal state ──
  const [staff, setStaff] = useState([
    { id: 1, name: "Ana Torres",   email: "auxiliar@fhec.com",   cedula: "V-11223344", roles: ["auxiliar"] as string[],                        sede: "principal", active: true,  createdAt: "2024-01-15" },
    { id: 2, name: "José Ramos",   email: "repartidor@fhec.com", cedula: "V-87654321", roles: ["repartidor"] as string[],                       sede: "principal", active: true,  createdAt: "2024-02-03" },
    { id: 3, name: "Carlos Vega",  email: "auditor@fhec.com",    cedula: "V-33445566", roles: ["auditor"] as string[],                          sede: "clinica",   active: true,  createdAt: "2024-03-10" },
    { id: 4, name: "Luis Medina",  email: "admin@fhec.com",      cedula: "V-55667788", roles: ["superadmin", "auditor", "auxiliar"] as string[], sede: "Todas",     active: true,  createdAt: "2024-01-01" },
    { id: 5, name: "Carmen López", email: "carmen@fhec.com",     cedula: "V-22334455", roles: ["auxiliar"] as string[],                         sede: "clinica",   active: false, createdAt: "2024-04-20" },
  ]);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({ email: "", role: "auxiliar", sede: "principal" });
  const [staffFormError, setStaffFormError] = useState("");
  const [editStaffId, setEditStaffId] = useState<number | null>(null);
  const ROLE_OPTIONS = ["auxiliar", "repartidor", "auditor", "superadmin"];

  // ── Monitor Global state ──
  const [monitorOrders] = useState(DEMO_GLOBAL_ORDERS);
  const [monitorDateFrom, setMonitorDateFrom] = useState("");
  const [monitorDateTo, setMonitorDateTo] = useState("");
  const [monitorStatus, setMonitorStatus] = useState("Todos");
  const [monitorSede, setMonitorSede] = useState("Todas");

  const kpiData = [
    { label: "En validación médica", count: monitorOrders.filter(o => o.status === "En validación médica").length, color: "bg-amber-500" },
    { label: "Pendiente pago", count: monitorOrders.filter(o => o.status === "Pendiente pago").length, color: "bg-blue-500" },
    { label: "Por preparar", count: monitorOrders.filter(o => o.status === "Por preparar").length, color: "bg-orange-500" },
    { label: "Por retirar", count: monitorOrders.filter(o => o.status === "Por retirar").length, color: "bg-purple-500" },
    { label: "Listo para delivery", count: monitorOrders.filter(o => o.status === "Listo para delivery").length, color: "bg-cyan-500" },
    { label: "En tránsito", count: monitorOrders.filter(o => o.status === "En tránsito").length, color: "bg-indigo-500" },
    { label: "Entregado", count: monitorOrders.filter(o => o.status === "Entregado").length, color: "bg-green-500" },
    { label: "Cancelado", count: monitorOrders.filter(o => o.status === "Cancelado").length, color: "bg-red-500" },
  ];

  const filteredMonitor = monitorOrders.filter(o => {
    const matchStatus = monitorStatus === "Todos" || o.status === monitorStatus;
    const matchSede = monitorSede === "Todas" || o.sede === monitorSede;
    return matchStatus && matchSede;
  });

  // ── Cupones state ──
  interface Coupon { id: number; code: string; discount: number; startDate: string; endDate: string; userEmail?: string; }
  const [coupons, setCoupons] = useState<Coupon[]>(getLegacyAdminCouponViewModels());
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editCouponId, setEditCouponId] = useState<number | null>(null);
  const [couponForm, setCouponForm] = useState({ code: "", discount: 0, startDate: "", endDate: "", userEmail: "" });
  const [couponError, setCouponError] = useState("");
  const [couponFilter, setCouponFilter] = useState<"all" | "general" | "user">("all");

  const openNewCoupon = () => {
    setEditCouponId(null);
    setCouponForm({ code: "", discount: 0, startDate: "", endDate: "", userEmail: "" });
    setCouponError("");
    setShowCouponForm(true);
  };
  const openEditCoupon = (c: Coupon) => {
    setEditCouponId(c.id);
    setCouponForm({ code: c.code, discount: c.discount, startDate: c.startDate, endDate: c.endDate, userEmail: c.userEmail ?? "" });
    setCouponError("");
    setShowCouponForm(true);
  };
  const saveCoupon = () => {
    if (!couponForm.code.trim()) return;
    const today = new Date().toISOString().split("T")[0];
    const duplicateVigente = coupons.some(c =>
      c.code.toUpperCase() === couponForm.code.trim().toUpperCase() &&
      c.id !== editCouponId &&
      (!c.endDate || c.endDate >= today)
    );
    if (duplicateVigente) {
      setCouponError("Ya existe un cupón vigente con este código.");
      return;
    }
    setCouponError("");
    const payload: Coupon = {
      id: editCouponId ?? Math.max(...coupons.map(c => c.id), 0) + 1,
      code: couponForm.code.trim(),
      discount: couponForm.discount,
      startDate: couponForm.startDate,
      endDate: couponForm.endDate,
      ...(couponForm.userEmail.trim() ? { userEmail: couponForm.userEmail.trim() } : {}),
    };
    if (editCouponId !== null) {
      setCoupons(prev => prev.map(c => c.id === editCouponId ? payload : c));
    } else {
      setCoupons(prev => [...prev, payload]);
    }
    setShowCouponForm(false);
  };

  const filteredCoupons = coupons.filter(c => {
    if (couponFilter === "general") return !c.userEmail;
    if (couponFilter === "user")    return !!c.userEmail;
    return true;
  });

  const [catSort, setCatSort] = useState<"relevancia" | "precio" | "descuento">("relevancia");

  const filteredCat = catalogProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(catSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(catSearch.toLowerCase());
    const matchCat = catFilter === "Todos" || p.category === catFilter;
    return matchSearch && matchCat;
  }).sort((a, b) => {
    if (catSort === "precio") return a.priceUSD - b.priceUSD;
    if (catSort === "descuento") return (b.discount ?? 0) - (a.discount ?? 0);
    return b.rating - a.rating; // relevancia
  });

  const controlLevel = (p: Partial<Product>) =>
    p.controlledSubstance ? "fisico" : p.needsRecipe ? "digital" : "ninguno";

  const applyControlLevel = (level: string) => ({
    needsRecipe: level !== "ninguno",
    controlledSubstance: level === "fisico",
  });

  const openEditProd = (p: Product) => {
    setEditProd(p);
    setProdForm({ ...p });
    setShowProdForm(true);
  };

  const openNewProd = () => {
    setEditProd(null);
    setProdForm({ name: "", brand: "", category: "Diabetes", presentation: "", packSize: "", priceUSD: 0, stock: 0, discount: 0, needsRecipe: false, rating: 5, reviews: 0, bgColor: "#e8f5e9", accentColor: "#179150", description: "", activeIngredient: "", contraindications: "", posology: "", concentration: "", concentrationUnit: "mg" });
    setShowProdForm(true);
  };

  const saveProd = () => {
    if (!prodForm.name?.trim() || !prodForm.brand?.trim()) return;
    if (editProd) {
      setCatalogProducts(prev => prev.map(p => p.id === editProd.id ? { ...p, ...prodForm } as Product : p));
    } else {
      const newId = Math.max(...catalogProducts.map(p => p.id), 0) + 1;
      setCatalogProducts(prev => [...prev, { ...prodForm, id: newId } as Product]);
    }
    setShowProdForm(false);
  };

  const toggleProdEnabled = (id: number) => {
    setCatalogProducts(prev => prev.map(p => p.id === id ? { ...p, enabled: p.enabled === false ? true : false } : p));
  };

  const toggleStaffEnabled = (id: number) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const saveStaff = () => {
    setStaffFormError("");
    if (!staffForm.email.trim()) {
      setStaffFormError("El correo electrónico es obligatorio.");
      return;
    }
    // Look up user data from existing accounts (demo)
    const knownAccount = DEMO_ACCOUNTS.find(a => a.email === staffForm.email);
    const resolvedName  = knownAccount?.name  ?? staffForm.email;
    const resolvedCedula = knownAccount?.cedula ?? "—";
    if (editStaffId !== null) {
      setStaff(prev => prev.map(m => m.id === editStaffId ? { ...m, roles: [staffForm.role], sede: staffForm.sede } : m));
    } else {
      const newId = Math.max(...staff.map(s => s.id), 0) + 1;
      setStaff(prev => [...prev, { id: newId, name: resolvedName, email: staffForm.email, cedula: resolvedCedula, roles: [staffForm.role], sede: staffForm.sede, active: true, createdAt: new Date().toISOString().split("T")[0] }]);
    }
    setStaffForm({ email: "", role: "auxiliar", sede: "principal" });
    setEditStaffId(null);
    setShowStaffForm(false);
  };

  const SUPER_TABS: { key: SuperTab; label: string; icon: React.ReactNode }[] = [
    { key: "contenido", label: "Contenido",          icon: <FileText size={14} /> },
    { key: "catalogo",  label: "Catálogo",           icon: <Package size={14} /> },
    { key: "personal",  label: "Personal Operativo", icon: <User size={14} /> },
    { key: "monitor", label: "Monitor Global", icon: <ClipboardList size={14} /> },
    { key: "inventario", label: "Inventario", icon: <SlidersHorizontal size={14} /> },
    { key: "cupones",    label: "Cupones Promocionales", icon: <CreditCard size={14} /> },
  ];

  const inp = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-[#179150] transition-all";
  const lbl = "text-xs font-semibold text-foreground mb-1 block uppercase tracking-wide";

  return (
    <div className="space-y-6">
      {/* ── RF-ADM-09: Gestor de Contenido ── */}
      {superTab === "contenido" && (
        <div className="space-y-6">
          {/* Logo personalizado */}
          <div className="bg-white border border-border rounded-2xl p-6">
            <h3 className="text-xl uppercase text-foreground mb-1" style={H9}>Logotipo de Inicio</h3>
            <p className="text-sm text-muted-foreground mb-4">Carga una imagen JPG/PNG para reemplazar el logo principal de la plataforma.</p>
            <div className="flex items-center gap-6">
              <div className="w-32 h-16 border-2 border-dashed border-border rounded-xl flex items-center justify-center bg-[#f0fdf7] overflow-hidden">
                {logoPreview
                  ? <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                  : <span className="text-xs text-muted-foreground text-center px-2">Vista previa</span>
                }
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) setLogoPreview(URL.createObjectURL(f));
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#50e9f8] text-[#006064] rounded-xl text-sm hover:bg-[#2dd8e8] transition-colors"
                  style={H7}
                >
                  <Upload size={14} />
                  Subir imagen
                </button>
                <p className="text-xs text-muted-foreground mt-2">Formatos: JPG, PNG. Tamaño recomendado: 240×80 px.</p>
              </div>
              {logoPreview && (
                <button
                  onClick={() => { setLogoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50 transition-colors"
                  style={H7}
                >
                  Restaurar original
                </button>
              )}
            </div>
          </div>

          {/* Gestión de Banners del Carrusel */}
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="mb-4">
              <h3 className="text-xl uppercase text-foreground" style={H9}>Banners del Carrusel Principal</h3>
              <p className="text-sm text-muted-foreground">Edita título, gradiente, imagen y texto de cada banner. Los cambios se reflejan en tiempo real.</p>
            </div>
            <div className="space-y-4 mb-4">
              {slides.map((s, i) => (
                <div key={i} className="border border-border rounded-2xl overflow-hidden">
                  {/* Preview */}
                  <div className="relative h-24 overflow-hidden" style={{ background: `linear-gradient(135deg, ${s.from}, ${s.via}, ${s.to})` }}>
                    {s.img && (
                      <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute inset-0 flex items-center px-6 gap-4">
                      <div className="flex-1">
                        <div className="inline-block bg-[#50e9f8] text-[#006064] text-[9px] font-black px-2 py-0.5 rounded-full mb-1 uppercase" style={H9}>{s.badge}</div>
                        <div className="text-white text-xl uppercase leading-tight" style={H9}>{s.title}</div>
                        <div className="text-white/70 text-xs mt-0.5 line-clamp-1">{s.subtitle}</div>
                      </div>
                      <div className="text-xs font-semibold text-white/80 bg-white/10 px-3 py-1 rounded-lg border border-white/20">{s.cta}</div>
                    </div>
                    <span className="absolute top-2 right-2 text-[10px] bg-black/30 text-white px-2 py-0.5 rounded-full font-semibold">Banner {i + 1}</span>
                  </div>
                  {/* Controls */}
                  <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{s.img}</div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditSlide(i)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-xl hover:bg-muted transition-colors">
                        <Settings size={12} />Editar
                      </button>
                      <button onClick={() => removeSlide(i)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors">
                        <Trash2 size={12} />Eliminar
                      </button>
                    </div>
                  </div>
                  {/* Inline edit form */}
                  {slideEditing === i && slideDraft && (
                    <div className="border-t border-border p-5 grid sm:grid-cols-2 gap-4 bg-[#f9fdfe]">
                      {([
                        ["Título", "title"],
                        ["Subtítulo", "subtitle"],
                        ["Badge / Etiqueta", "badge"],
                        ["Texto del botón (CTA)", "cta"],
                        ["URL de destino del botón (CTA)", "ctaLink"],
                      ] as [string, keyof Slide][]).map(([label, key]) => (
                        <div key={key}>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
                          <input value={slideDraft[key] as string}
                            onChange={e => setSlideDraft({ ...slideDraft, [key]: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" />
                        </div>
                      ))}
                      {/* Imagen del banner */}
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Imagen del banner</label>
                        <div className="flex items-center gap-4">
                          {slideDraft.img && (
                            <img src={slideDraft.img} alt="Preview" className="w-24 h-14 object-cover rounded-xl border border-border flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors w-fit text-sm font-semibold">
                              <Upload size={14} /> Subir imagen del banner
                              <input type="file" accept="image/*" className="hidden"
                                onChange={e => {
                                  const f = e.target.files?.[0];
                                  if (f) setSlideDraft({ ...slideDraft, img: URL.createObjectURL(f) });
                                }} />
                            </label>
                            <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG, WEBP. Recomendado: 900×500 px.</p>
                          </div>
                        </div>
                      </div>
                      <div className="sm:col-span-2 flex gap-2 pt-2">
                        <button onClick={saveSlide}
                          className="flex-1 bg-[#179150] text-white py-2.5 rounded-xl text-sm font-black uppercase hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          style={H7}>
                          <Check size={14} />Guardar cambios
                        </button>
                        <button onClick={() => { setSlideEditing(null); setSlideDraft(null); }}
                          className="px-4 border border-border rounded-xl text-sm hover:bg-muted transition-colors">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addNewSlide}
              className="w-full py-3.5 border-2 border-dashed border-[#50e9f8] rounded-2xl text-[#006064] font-black uppercase text-sm hover:bg-[#e0f5eb] transition-colors flex items-center justify-center gap-2"
              style={H7}>
              <Plus size={16} />Agregar nuevo banner
            </button>
          </div>
        </div>
      )}

      {/* ── RF-ADM-10: Gestor de Catálogo ── */}
      {superTab === "catalogo" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div>
              <h3 className="text-xl uppercase text-foreground" style={H9}>Catálogo de Productos</h3>
              <p className="text-sm text-muted-foreground">{catalogProducts.length} productos registrados</p>
            </div>
            <button
              onClick={openNewProd}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors"
              style={H7}
            >
              <Plus size={16} />
              Nuevo Producto
            </button>
          </div>

          {/* Filters + sort */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input className="w-full pl-9 pr-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] transition-all" placeholder="Buscar por nombre o marca…" value={catSearch} onChange={e => setCatSearch(e.target.value)} />
            </div>
            <select className="px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] transition-all" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="Todos">Todas las categorías</option>
              {[...new Set(catalogProducts.map(p => p.category))].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] transition-all" value={catSort} onChange={e => setCatSort(e.target.value as typeof catSort)}>
              <option value="relevancia">Ordenar: Relevancia</option>
              <option value="precio">Ordenar: Precio</option>
              <option value="descuento">Ordenar: Descuento</option>
            </select>
          </div>

          {/* Products table */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f0fdf7] border-b border-border">
                    {["Nombre / Marca", "Categoría", "Forma farmacéutica", "Nivel de control", "Estado", "Relevancia", "Precio", "Descuento", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase text-muted-foreground whitespace-nowrap" style={H9}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCat.map(p => {
                    const enabled = isProdEnabled(p);
                    return (
                      <tr key={p.id} className={`border-b border-border/50 transition-colors ${enabled ? "hover:bg-[#f9fdfe]" : "bg-gray-50/60 opacity-60"}`}>
                        <td className="px-4 py-3">
                          <div className={`font-semibold text-sm ${enabled ? "text-foreground" : "text-muted-foreground"}`}>{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.brand}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground">{p.category}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{p.presentation || "—"}</td>
                        <td className="px-4 py-3">
                          {p.controlledSubstance
                            ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-800" style={H9}>Récipe físico</span>
                            : p.needsRecipe
                            ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700" style={H9}>Récipe digital</span>
                            : <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-500" style={H9}>Ninguno</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${enabled ? "bg-[#e0f5eb] text-[#179150]" : "bg-gray-100 text-gray-500"}`} style={H9}>
                            {enabled ? "Habilitado" : "Inhabilitado"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground">{p.rating.toFixed(1)}</td>
                        <td className="px-4 py-3 text-xs font-black text-[#179150]" style={H9}>{fmtUSD(p.priceUSD)}</td>
                        <td className="px-4 py-3">
                          {p.discount && p.discount > 0
                            ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700" style={H9}>{p.discount}% OFF</span>
                            : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => openEditProd(p)} className="p-1.5 hover:bg-[#50e9f8]/10 rounded-lg text-[#006064] transition-colors" title="Editar producto">
                              <Settings size={14} />
                            </button>
                            <button
                              onClick={() => toggleProdEnabled(p.id)}
                              className={`p-1.5 rounded-lg transition-colors ${enabled ? "hover:bg-amber-50 text-amber-600" : "hover:bg-[#e0f5eb] text-[#179150]"}`}
                              title={enabled ? "Inhabilitar producto" : "Habilitar producto"}
                            >
                              {enabled ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredCat.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">No se encontraron productos.</div>
              )}
            </div>
          </div>

          {/* Product form modal */}
          {showProdForm && (
            <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[200] overflow-y-auto p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl my-4 mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl uppercase text-foreground" style={H9}>{editProd ? "Editar Producto" : "Nuevo Producto"}</h3>
                  <button onClick={() => setShowProdForm(false)} className="p-2 hover:bg-[#f0fdf7] rounded-xl"><X size={18} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div className="sm:col-span-2">
                    <label className={lbl}>Nombre del producto *</label>
                    <input className={inp} value={prodForm.name ?? ""} onChange={e => setProdForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Metformina 500mg" />
                  </div>
                  {/* Marca */}
                  <div>
                    <label className={lbl}>Marca comercial *</label>
                    <input className={inp} value={prodForm.brand ?? ""} onChange={e => setProdForm(f => ({ ...f, brand: e.target.value }))} />
                  </div>
                  {/* Categoría */}
                  <div>
                    <label className={lbl}>Categoría</label>
                    <select className={inp} value={prodForm.category ?? "Diabetes"} onChange={e => setProdForm(f => ({ ...f, category: e.target.value }))}>
                      {CATS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  {/* Principio activo */}
                  <div className="sm:col-span-2">
                    <label className={lbl}>Principio activo</label>
                    <input className={inp} value={prodForm.activeIngredient ?? ""} onChange={e => setProdForm(f => ({ ...f, activeIngredient: e.target.value }))} placeholder="Ej: Clorhidrato de Metformina" />
                  </div>
                  {/* Forma farmacéutica */}
                  <div>
                    <label className={lbl}>Forma farmacéutica</label>
                    <select className={inp} value={prodForm.presentation ?? ""} onChange={e => setProdForm(f => ({ ...f, presentation: e.target.value }))}>
                      <option value="">Seleccionar…</option>
                      {["Tabletas", "Comprimidos", "Cápsulas", "Comprimidos efervescentes", "Solución oral", "Jarabe", "Suspensión", "Inyectable", "Crema", "Gel", "Ungüento", "Parche", "Supositorio", "Gotas"].map(ff => <option key={ff} value={ff}>{ff}</option>)}
                    </select>
                  </div>
                  {/* Concentración */}
                  <div>
                    <label className={lbl}>Concentración</label>
                    <input className={inp} value={prodForm.concentration ?? ""} onChange={e => setProdForm(f => ({ ...f, concentration: e.target.value }))} placeholder="Ej: 500" type="text" />
                  </div>
                  {/* Unidad de concentración */}
                  <div>
                    <label className={lbl}>Unidad de concentración</label>
                    <select className={inp} value={prodForm.concentrationUnit ?? "mg"} onChange={e => setProdForm(f => ({ ...f, concentrationUnit: e.target.value }))}>
                      {["mg", "g", "mcg", "UI", "ml", "%", "mEq", "mmol"].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  {/* Unidades */}
                  <div>
                    <label className={lbl}>Unidades</label>
                    <input className={inp} value={prodForm.packSize ?? ""} onChange={e => setProdForm(f => ({ ...f, packSize: e.target.value }))} placeholder="Ej: 30, 20, 14" type="text" />
                  </div>
                  {/* Descripción */}
                  <div className="sm:col-span-2">
                    <label className={lbl}>Descripción</label>
                    <textarea rows={3} className={`${inp} resize-none`} value={prodForm.description ?? ""} onChange={e => setProdForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  {/* Imagen */}
                  <div className="sm:col-span-2">
                    <label className={lbl}>Imagen del producto</label>
                    <div className="flex items-center gap-4">
                      {prodForm.imageUrl ? (
                        <img src={prodForm.imageUrl} alt="Producto" className="w-20 h-20 object-cover rounded-xl border border-border flex-shrink-0" />
                      ) : (
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center flex-shrink-0 bg-muted/30">
                          <Package size={24} className="text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="flex-1">
                        <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors w-fit">
                          <Upload size={14} />
                          <span className="text-sm font-semibold">Cargar imagen</span>
                          <input type="file" accept="image/*" className="hidden"
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (f) setProdForm(prev => ({ ...prev, imageUrl: URL.createObjectURL(f) }));
                            }} />
                        </label>
                        {prodForm.imageUrl && (
                          <button onClick={() => setProdForm(prev => ({ ...prev, imageUrl: undefined }))} className="mt-2 text-xs text-red-500 hover:underline">Quitar imagen</button>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG, WEBP. Recomendado: 400×400 px.</p>
                      </div>
                    </div>
                  </div>
                  {/* Nivel de control */}
                  <div className="sm:col-span-2">
                    <label className={lbl}>Nivel de control</label>
                    <select className={inp}
                      value={controlLevel(prodForm)}
                      onChange={e => setProdForm(f => ({ ...f, ...applyControlLevel(e.target.value) }))}>
                      <option value="ninguno">Ninguno</option>
                      <option value="digital">Requiere récipe digital</option>
                      <option value="fisico">Requiere récipe en físico</option>
                    </select>
                  </div>
                  {/* Precio */}
                  <div>
                    <label className={lbl}>Precio (USD)</label>
                    <input className={inp} type="number" min={0} step={0.01} value={prodForm.priceUSD ?? 0} onChange={e => setProdForm(f => ({ ...f, priceUSD: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  {/* Descuento */}
                  <div>
                    <label className={lbl}>Descuento (%)</label>
                    <input className={inp} type="number" min={0} max={100} value={prodForm.discount ?? 0} onChange={e => setProdForm(f => ({ ...f, discount: parseInt(e.target.value) || 0 }))} />
                  </div>
                  {/* Relevancia */}
                  <div>
                    <label className={lbl}>Relevancia (1.0 – 5.0)</label>
                    <input className={inp} type="number" min={1} max={5} step={0.1} value={prodForm.rating ?? 5} onChange={e => setProdForm(f => ({ ...f, rating: parseFloat(e.target.value) || 5 }))} />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={saveProd} className="flex-1 py-3 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors" style={H7}>
                    {editProd ? "Guardar cambios" : "Crear producto"}
                  </button>
                  <button onClick={() => setShowProdForm(false)} className="px-6 py-3 border border-border rounded-xl hover:bg-[#f0fdf7] transition-colors" style={H7}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Personal Operativo ── */}
      {superTab === "personal" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl uppercase text-foreground" style={H9}>Personal Operativo</h3>
              <p className="text-sm text-muted-foreground">{staff.length} personas · {staff.filter(s => s.active).length} activas</p>
            </div>
            <button
              onClick={() => { setStaffForm({ email: "", role: "auxiliar", sede: "principal" }); setEditStaffId(null); setStaffFormError(""); setShowStaffForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors"
              style={H7}
            >
              <Plus size={16} />
              Asignar personal operativo
            </button>
          </div>

          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f0fdf7] border-b border-border">
                    {["Nombre completo", "Correo", "Documento de identidad", "Rol", "Sede", "Estado", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase text-muted-foreground whitespace-nowrap" style={H9}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staff.map(s => {
                    const roleBadge = (r: string) => ({
                      superadmin: "bg-[#006064] text-white",
                      auditor:    "bg-amber-100 text-amber-800",
                      auxiliar:   "bg-[#50e9f8]/20 text-[#006064]",
                      repartidor: "bg-purple-100 text-purple-800",
                    }[r] ?? "bg-green-100 text-green-800");
                    const sedeLabel = s.sede === "principal" ? "Sede Principal" : s.sede === "clinica" ? "Clínica Humana" : "Todas las sedes";
                    return (
                      <tr key={s.id} className={`border-b border-border/50 transition-colors ${s.active ? "hover:bg-[#f9fdfe]" : "bg-gray-50/60 opacity-60"}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 ${s.active ? "bg-gradient-to-br from-[#50e9f8] to-[#179150]" : "bg-gray-300"}`} style={H9}>
                              {s.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </div>
                            <span className={`font-semibold text-sm ${s.active ? "text-foreground" : "text-muted-foreground"}`}>{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{s.email}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{s.cedula}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.active ? roleBadge(s.roles[0]) : "bg-gray-100 text-gray-400"}`} style={H9}>{s.roles[0]}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{sedeLabel}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.active ? "bg-[#e0f5eb] text-[#179150]" : "bg-gray-100 text-gray-500"}`} style={H9}>
                            {s.active ? "Habilitado" : "Inhabilitado"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => { setEditStaffId(s.id); setStaffForm({ email: s.email, role: s.roles[0] ?? "auxiliar", sede: s.sede }); setShowStaffForm(true); }}
                              className="p-1.5 hover:bg-[#50e9f8]/10 rounded-lg text-[#006064] transition-colors"
                              title="Editar asignación"
                            >
                              <Settings size={14} />
                            </button>
                            <button
                              onClick={() => toggleStaffEnabled(s.id)}
                              className={`p-1.5 rounded-lg transition-colors ${s.active ? "hover:bg-amber-50 text-amber-600" : "hover:bg-[#e0f5eb] text-[#179150]"}`}
                              title={s.active ? "Inhabilitar" : "Habilitar"}
                            >
                              {s.active ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Staff assignment modal */}
          {showStaffForm && (
            <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl uppercase text-foreground" style={H9}>{editStaffId ? "Editar asignación" : "Asignar personal operativo"}</h3>
                  <button onClick={() => { setShowStaffForm(false); setEditStaffId(null); }} className="p-2 hover:bg-[#f0fdf7] rounded-xl"><X size={18} /></button>
                </div>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  El usuario debe tener una cuenta registrada previamente. Solo se asigna su rol operativo y sede.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className={lbl}>Correo electrónico del usuario *</label>
                    <input type="email" className={inp} value={staffForm.email} onChange={e => setStaffForm(f => ({ ...f, email: e.target.value }))} placeholder="usuario@fhec.com" disabled={editStaffId !== null} />
                    {editStaffId !== null && <p className="text-[10px] text-muted-foreground mt-1">El correo no puede modificarse.</p>}
                  </div>
                  <div>
                    <label className={lbl}>Rol operativo *</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {ROLE_OPTIONS.map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setStaffForm(f => ({ ...f, role }))}
                          className={`px-3 py-2.5 rounded-xl border-2 text-sm font-black uppercase text-left transition-all ${staffForm.role === role ? "border-[#179150] bg-[#e0f5eb] text-[#006064]" : "border-border text-muted-foreground hover:border-[#179150]/50"}`}
                          style={H9}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Sede asignada</label>
                    <select className={inp} value={staffForm.sede} onChange={e => setStaffForm(f => ({ ...f, sede: e.target.value }))}>
                      <option value="principal">Sede Principal</option>
                      <option value="clinica">Clínica Humana</option>
                      <option value="Todas">Todas las sedes</option>
                    </select>
                  </div>
                  {staffFormError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
                      <AlertTriangle size={14} />{staffFormError}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={saveStaff} className="flex-1 py-3 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors font-black uppercase" style={H7}>
                    {editStaffId ? "Guardar cambios" : "Asignar"}
                  </button>
                  <button onClick={() => { setShowStaffForm(false); setEditStaffId(null); }} className="px-6 py-3 border border-border rounded-xl hover:bg-[#f0fdf7] transition-colors" style={H7}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RF-ADM-12: Monitor Global ── */}
      {superTab === "monitor" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl uppercase text-foreground" style={H9}>Monitor Global</h3>
            <p className="text-sm text-muted-foreground">Historial completo de transacciones con trazabilidad de auditoría.</p>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {kpiData.map(k => (
              <div key={k.label} className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${k.color} flex items-center justify-center text-white text-xl font-black flex-shrink-0`} style={H9}>
                  {k.count}
                </div>
                <div className="text-xs font-semibold text-muted-foreground leading-tight">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 bg-white border border-border rounded-2xl p-4">
            <div>
              <label className={`${lbl} mb-0.5`}>Desde</label>
              <input type="date" className={inp} value={monitorDateFrom} onChange={e => setMonitorDateFrom(e.target.value)} />
            </div>
            <div>
              <label className={`${lbl} mb-0.5`}>Hasta</label>
              <input type="date" className={inp} value={monitorDateTo} onChange={e => setMonitorDateTo(e.target.value)} />
            </div>
            <div>
              <label className={`${lbl} mb-0.5`}>Estado</label>
              <select className={inp} value={monitorStatus} onChange={e => setMonitorStatus(e.target.value)}>
                <option value="Todos">Todos los estados</option>
                {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={`${lbl} mb-0.5`}>Sede</label>
              <select className={inp} value={monitorSede} onChange={e => setMonitorSede(e.target.value)}>
                <option value="Todas">Todas las sedes</option>
                {[...new Set(monitorOrders.map(o => o.sede))].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Master table */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f0fdf7] border-b border-border">
                    {["# Pedido", "Fecha", "Cliente", "Sede", "Total", "Costo envío", "Ref. Pago", "Estado", "Aprobó", "Preparó", "Despachó"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase text-muted-foreground whitespace-nowrap" style={H9}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMonitor.map(o => (
                    <tr key={o.id} className="border-b border-border/50 hover:bg-[#f9fdfe] transition-colors">
                      <td className="px-4 py-3 text-sm font-black text-[#006064] whitespace-nowrap" style={H9}>{o.id}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{o.date}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{o.client}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{o.sede}</td>
                      <td className="px-4 py-3 text-sm font-black text-[#179150]" style={H9}>{fmtUSD(o.total)}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-foreground">
                        {o.shippingCost > 0 ? fmtUSD(o.shippingCost) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {(o as any).payRef
                          ? <span className="font-mono text-[#006064] font-semibold">{(o as any).payRef}</span>
                          : <span className="text-muted-foreground/50">—</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-600"}`} style={H9}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{o.approvedBy}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{o.preparedBy}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{o.dispatchedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredMonitor.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">No hay pedidos que coincidan con los filtros.</div>
              )}
            </div>
            <div className="px-6 py-5 border-t border-border bg-[#f0fdf7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground font-semibold">
                {filteredMonitor.length} de {monitorOrders.length} transacciones
              </div>
              <div className="flex gap-8">
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Total ventas filtrado</div>
                  <div className="text-3xl font-black text-[#179150] leading-none" style={H9}>
                    {fmtUSD(filteredMonitor.reduce((sum, o) => sum + o.total, 0))}
                  </div>
                </div>
                <div className="text-right border-l border-border pl-8">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Total costo de envío filtrado</div>
                  <div className="text-3xl font-black text-[#006064] leading-none" style={H9}>
                    {fmtUSD(filteredMonitor.reduce((sum, o) => sum + (o.shippingCost ?? 0), 0))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {superTab === "inventario" && (
        <InventarioTab products={catalogProducts} setCatalogProducts={setCatalogProducts} />
      )}

      {/* ── Cupones Promocionales ── */}
      {superTab === "cupones" && (
        <div className="space-y-4">
          {/* Header + button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl uppercase text-foreground" style={H9}>Cupones Promocionales</h3>
              <p className="text-sm text-muted-foreground">{coupons.length} cupón{coupons.length !== 1 ? "es" : ""} registrado{coupons.length !== 1 ? "s" : ""}</p>
            </div>
            <button onClick={openNewCoupon} className="flex items-center gap-2 px-5 py-2.5 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors" style={H7}>
              <Plus size={16} /> Añadir cupón
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            {([ ["all","Todos"], ["general","Generales"], ["user","Asignados a usuario"] ] as const).map(([val, label]) => (
              <button key={val} onClick={() => setCouponFilter(val)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${couponFilter === val ? "bg-[#179150] text-white" : "bg-white border border-border text-muted-foreground hover:border-[#179150]/50"}`}
                style={H9}>
                {label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f0fdf7] border-b border-border">
                    {["Código del cupón", "Descuento", "Usuario", "Fecha de inicio", "Fecha de fin", "Estado", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase text-muted-foreground whitespace-nowrap" style={H9}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((c, i) => {
                    const today = new Date().toISOString().split("T")[0];
                    const vigente = !c.endDate || c.endDate >= today;
                    return (
                      <tr key={c.id} className={`border-b border-border/50 hover:bg-[#f9fdfe] transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-black text-[#006064] bg-[#e0f5eb] px-2.5 py-1 rounded-lg tracking-widest" style={H9}>{c.code}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-red-100 text-red-700 whitespace-nowrap" style={H9}>{c.discount}% OFF</span>
                        </td>
                        <td className="px-4 py-3">
                          {c.userEmail
                            ? <span className="text-xs text-[#006064] font-semibold">{c.userEmail}</span>
                            : <span className="text-xs text-muted-foreground italic">General</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{c.startDate || "—"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{c.endDate || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${vigente ? "bg-[#e0f5eb] text-[#179150]" : "bg-gray-100 text-gray-500"}`} style={H9}>
                            {vigente ? "Vigente" : "Vencido"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => openEditCoupon(c)} className="p-1.5 hover:bg-[#50e9f8]/10 rounded-lg text-[#006064] transition-colors" title="Editar cupón">
                            <Settings size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCoupons.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">No hay cupones con este filtro.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Coupon form modal */}
          {showCouponForm && (
            <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl uppercase text-foreground" style={H9}>{editCouponId ? "Editar cupón" : "Nuevo cupón"}</h3>
                  <button onClick={() => setShowCouponForm(false)} className="p-2 hover:bg-[#f0fdf7] rounded-xl"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  {/* Código */}
                  <div>
                    <label className={lbl}>Código del cupón *</label>
                    <input
                      className={`${inp} uppercase font-mono tracking-widest ${couponError ? "border-red-400 focus:border-red-500" : ""}`}
                      value={couponForm.code}
                      onChange={e => { setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() })); setCouponError(""); }}
                      placeholder="Ej: FARMA10"
                    />
                    {couponError && (
                      <div className="flex items-center gap-1.5 mt-2 text-red-600 text-xs font-semibold">
                        <AlertTriangle size={12} /> {couponError}
                      </div>
                    )}
                  </div>
                  {/* Descuento */}
                  <div>
                    <label className={lbl}>Descuento aplicado (%)</label>
                    <input type="number" min={1} max={100} className={inp} value={couponForm.discount} onChange={e => setCouponForm(f => ({ ...f, discount: parseInt(e.target.value) || 0 }))} placeholder="Ej: 10" />
                  </div>
                  {/* Fechas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Fecha de inicio</label>
                      <input type="date" className={inp} value={couponForm.startDate} onChange={e => setCouponForm(f => ({ ...f, startDate: e.target.value }))} />
                    </div>
                    <div>
                      <label className={lbl}>Fecha de fin</label>
                      <input type="date" className={inp} value={couponForm.endDate} onChange={e => setCouponForm(f => ({ ...f, endDate: e.target.value }))} />
                    </div>
                  </div>
                  {/* Usuario (opcional) */}
                  <div>
                    <label className={lbl}>Correo del usuario <span className="text-muted-foreground normal-case font-normal">(opcional — dejar vacío para cupón general)</span></label>
                    <input
                      type="email"
                      className={inp}
                      value={couponForm.userEmail}
                      onChange={e => setCouponForm(f => ({ ...f, userEmail: e.target.value }))}
                      placeholder="usuario@correo.com"
                    />
                    {couponForm.userEmail.trim()
                      ? <p className="text-xs text-[#179150] mt-1 font-semibold">Cupón exclusivo para: {couponForm.userEmail.trim()}</p>
                      : <p className="text-xs text-muted-foreground mt-1">Sin usuario asignado — será un cupón general.</p>}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Para dejar de usar un cupón, edita su fecha de fin a una fecha pasada.
                  </p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={saveCoupon} disabled={!couponForm.code.trim()}
                    className={`flex-1 py-3 rounded-xl transition-colors font-black uppercase ${couponForm.code.trim() ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                    style={H7}>
                    {editCouponId ? "Guardar cambios" : "Crear cupón"}
                  </button>
                  <button onClick={() => setShowCouponForm(false)} className="px-6 py-3 border border-border rounded-xl hover:bg-[#f0fdf7] transition-colors" style={H7}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AdminPanel ───────────────────────────────────────────────────────────────
// Demo data for admin panel
const DEMO_RECIPES = getLegacyRecipeAuditViewModels();

const DEMO_ADMIN_ORDERS = getLegacyAdminOrderViewModels();

function AdminPanel({ user, onNav, products, setProducts, slides, setSlides }: {
  user: AuthUser;
  onNav: (p: Page) => void;
  products: Product[];
  setProducts: (p: Product[]) => void;
  slides: Slide[];
  setSlides: (s: Slide[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<"auditor" | "auxiliar" | "contenido" | "catalogo" | "personal" | "monitor" | "inventario" | "cupones" | "reembolsos">("auditor");

  // Auditor state
  const [recipes, setRecipes] = useState(DEMO_RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState<typeof DEMO_RECIPES[0] | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Set<string>>(new Set());
  const [rejectComment, setRejectComment] = useState("");

  // Resolve user's assigned sede
  const USER_SEDE_MAP: Record<string, string> = {
    "auxiliar@fhec.com": "principal",
    "repartidor@fhec.com": "principal",
    "auditor@fhec.com": "clinica",
    "admin@fhec.com": "Todas",
  };
  const userAssignedSede = USER_SEDE_MAP[user.email] ?? "Todas";
  const userHasAllSedes = userAssignedSede === "Todas";

  // Auxiliar state
  const [orders, setOrders] = useState(DEMO_ADMIN_ORDERS);
  const [sedeFilter, setSedeFilter] = useState(userHasAllSedes ? "todas" : userAssignedSede.toLowerCase());
  const [searchOrder, setSearchOrder] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<typeof DEMO_ADMIN_ORDERS[0] | null>(null);
  const [pinInput, setPinInput] = useState("");

  // Superadmin - Reembolsos
  const DEMO_REFUNDS = getLegacyAdminRefundViewModels();
  const [refunds, setRefunds] = useState(DEMO_REFUNDS);
  const [selectedRefund, setSelectedRefund] = useState<typeof DEMO_REFUNDS[0] | null>(null);

  // Superadmin - Product Management
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState(false);

  // Superadmin - Staff Management
  const [staff, setStaff] = useState([
    { id: 1, name: "Ana Torres", email: "auxiliar@fhec.com", roles: ["auxiliar"], active: true, cedula: "V-11223344" },
    { id: 2, name: "José Ramos", email: "repartidor@fhec.com", roles: ["repartidor"], active: true, cedula: "V-87654321" },
    { id: 3, name: "Luis Medina", email: "admin@fhec.com", roles: ["superadmin", "auditor", "auxiliar"], active: true, cedula: "V-55667788" },
  ]);
  const [newStaffModal, setNewStaffModal] = useState(false);

  // Determine available tabs based on role
  const isSuperadmin = user.role === "superadmin";
  const isAuditor   = user.role === "auditor";
  const isAuxiliar  = user.role === "auxiliar";

  // Auto-select first available tab
  React.useEffect(() => {
    if (isSuperadmin) setActiveTab("contenido");
    else if (isAuditor) setActiveTab("auditor");
    else if (isAuxiliar) setActiveTab("auxiliar");
  }, [isAuditor, isAuxiliar, isSuperadmin]);

  const handleApproveRecipe = (recipeId: number) => {
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, status: "approved" as const } : r));
    setSelectedRecipe(null);
    toast.success("Récipe aprobado", { description: "El cliente ha sido notificado para proceder al pago.", icon: "✅" });
  };

  const handleRejectRecipe = () => {
    if (!selectedRecipe || rejectReasons.size === 0) return;
    const reasons = Array.from(rejectReasons).join(", ");
    const fullReason = rejectComment ? `${reasons}. Nota: ${rejectComment}` : reasons;
    toast.error("Récipe rechazado", { description: `Motivo: ${fullReason}`, icon: "❌" });
    setRecipes(prev => prev.map(r => r.id === selectedRecipe.id ? { ...r, status: "rejected" as const } : r));
    setSelectedRecipe(null);
    setRejectReasons(new Set());
    setRejectComment("");
  };

  const toggleRejectReason = (reason: string) => {
    setRejectReasons(prev => {
      const next = new Set(prev);
      if (next.has(reason)) next.delete(reason);
      else next.add(reason);
      return next;
    });
  };

  const confirmarEmpacado = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const newStatus = o.deliveryAddress ? "Listo para delivery" : "Por retirar";
        return { ...o, status: newStatus };
      }
      return o;
    }));
    setSelectedOrder(null);
    toast.success("Empacado confirmado", { description: "El pedido fue actualizado al siguiente estado.", icon: "📦" });
  };

  const despacharPedido = () => {
    if (!selectedOrder) return;
    if (pinInput !== "1234") {
      toast.error("PIN incorrecto", { description: "El PIN correcto en modo demo es 1234.", icon: "🔐" });
      return;
    }
    toast.success(`Pedido ${selectedOrder.id} despachado`, { description: "El pedido fue entregado al repartidor.", icon: "🛵" });
    setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
    setSelectedOrder(null);
    setPinInput("");
  };

  const filteredOrders = orders.filter(o => {
    const matchesSede = sedeFilter === "todas" || o.sede === sedeFilter;
    const matchesSearch = o.id.toLowerCase().includes(searchOrder.toLowerCase()) ||
                          o.clientName.toLowerCase().includes(searchOrder.toLowerCase());
    return matchesSede && matchesSearch;
  });

  const ordersByStatus = {
    porPreparar: orders.filter(o => o.status === "Por preparar").length,
    porRetirar: orders.filter(o => o.status === "Por retirar").length,
    listoDelivery: orders.filter(o => o.status === "Listo para delivery").length,
  };

  return (
    <div className="min-h-screen bg-[#f0fdf7]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-[#006064] to-[#1a3060] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-white text-3xl uppercase leading-none" style={H9}>Panel de Administración</h1>
              <p className="text-white/70 text-sm mt-1">Sistema de gestión farmacéutica · {user.name}</p>
            </div>
          </div>

          {/* Tabs — flat: Auditoría, Operaciones, + superadmin subtabs */}
          <div className="flex flex-wrap gap-2">
            {([
              ...(isAuditor  ? [{ key: "auditor",   label: "Auditoría",           icon: <Shield size={14} /> }] : []),
              ...(isAuxiliar ? [{ key: "auxiliar",  label: "Operaciones",          icon: <Package size={14} /> }] : []),
              ...(isSuperadmin ? [
                { key: "contenido",  label: "Contenido",          icon: <FileText size={14} /> },
                { key: "catalogo",   label: "Catálogo",           icon: <Package size={14} /> },
                { key: "inventario", label: "Inventario",         icon: <SlidersHorizontal size={14} /> },
                { key: "personal",   label: "Personal Operativo", icon: <User size={14} /> },
                { key: "monitor",    label: "Monitor Global",     icon: <ClipboardList size={14} /> },
                { key: "cupones",    label: "Cupones",            icon: <CreditCard size={14} /> },
                { key: "reembolsos", label: "Reembolsos",         icon: <CreditCard size={14} /> },
              ] : []),
            ] as { key: typeof activeTab; label: string; icon: React.ReactNode }[]).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black uppercase transition-all ${
                  activeTab === t.key ? "bg-white text-[#006064]" : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                style={H7}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* AUDITOR MODULE */}
        {activeTab === "auditor" && isAuditor && (
          <div className="space-y-6">
            {/* Recipe detail modal */}
            {selectedRecipe && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 500, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  {/* Modal header */}
                  <div className="sticky top-0 bg-gradient-to-r from-[#006064] to-[#1a3060] px-6 py-5 border-b border-white/10 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl uppercase text-white" style={H9}>{selectedRecipe.orderId}</h3>
                        <p className="text-white/70 text-sm">{selectedRecipe.clientName} · Subido: {selectedRecipe.uploadDate}</p>
                      </div>
                      <button onClick={() => setSelectedRecipe(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* 2-col layout: data left, image right */}
                  <div className="p-6 grid lg:grid-cols-5 gap-6">
                    {/* LEFT — datos y acciones */}
                    <div className="lg:col-span-3 space-y-4">
                      {/* Estado */}
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase ${
                          selectedRecipe.status === "approved" ? "bg-[#179150] text-white" :
                          selectedRecipe.status === "rejected" ? "bg-red-500 text-white" :
                          "bg-amber-100 text-amber-800"}`} style={H9}>
                          {selectedRecipe.status === "approved" ? "Aprobado" : selectedRecipe.status === "rejected" ? "Rechazado" : "Pendiente"}
                        </span>
                        <span className="text-xs text-muted-foreground">{selectedRecipe.product}</span>
                      </div>

                      {/* Datos del medicamento */}
                      <div className="bg-[#f0fdf7] border border-[#a7f3d0] rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-[#179150] text-white text-xs font-black flex items-center justify-center" style={H9}>Rx</div>
                          <h4 className="text-sm uppercase text-[#006064] font-black" style={H9}>Datos del medicamento y pedido</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            ["Nº de pedido",           selectedRecipe.orderId],
                            ["Producto",               selectedRecipe.product],
                            ["Principio activo",       selectedRecipe.activeIngredient],
                            ["Concentración",          `${selectedRecipe.concentration} ${selectedRecipe.concentrationUnit}`],
                            ["Unidades por paquete",   `${selectedRecipe.packSize} unidades`],
                            ["Cantidad solicitada",    `${selectedRecipe.quantity} ${selectedRecipe.quantity === 1 ? "unidad" : "unidades"}`],
                          ].map(([label, value]) => (
                            <div key={label}>
                              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">{label}</div>
                              <div className="text-xs font-semibold text-foreground">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Acciones */}
                      {selectedRecipe.status === "pending" && (
                        <div className="space-y-3">
                          <button
                            onClick={() => handleApproveRecipe(selectedRecipe.id)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors font-black uppercase text-sm"
                            style={H7}
                          >
                            <CheckCircle size={15} /> Aprobar récipe
                          </button>
                          <details className="group">
                            <summary className="cursor-pointer list-none">
                              <div className="flex items-center justify-center gap-2 py-2.5 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-black uppercase text-sm" style={H7}>
                                <X size={15} /> Rechazar récipe
                                <ChevronDown size={13} className="group-open:rotate-180 transition-transform" />
                              </div>
                            </summary>
                            <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
                              <div className="text-xs font-black uppercase text-red-800" style={H9}>Motivos de rechazo</div>
                              {["Falta sello del médico", "No está en vigencia", "Datos borrosos o ilegibles", "Récipe incompleto", "Firma no visible"].map(reason => (
                                <label key={reason} className="flex items-start gap-2 cursor-pointer">
                                  <div onClick={() => toggleRejectReason(reason)}
                                    className={`w-4 h-4 mt-0.5 rounded flex-shrink-0 border-2 transition-all flex items-center justify-center cursor-pointer
                                      ${rejectReasons.has(reason) ? "bg-red-600 border-red-600" : "border-red-300 bg-white hover:border-red-600"}`}>
                                    {rejectReasons.has(reason) && <Check size={10} className="text-white" />}
                                  </div>
                                  <span className="text-xs text-red-800">{reason}</span>
                                </label>
                              ))}
                              <div>
                                <label className="text-xs font-semibold text-red-800 uppercase tracking-wider mb-1 block">Comentario (opcional)</label>
                                <textarea value={rejectComment} onChange={e => setRejectComment(e.target.value)}
                                  placeholder="Ej: El sello médico está cortado..." rows={2}
                                  className="w-full px-3 py-2 border border-red-200 rounded-xl text-xs focus:outline-none focus:border-red-400 bg-white resize-none" />
                              </div>
                              <button onClick={handleRejectRecipe} disabled={rejectReasons.size === 0}
                                className={`w-full py-2 rounded-xl text-xs font-black uppercase transition-colors ${rejectReasons.size > 0 ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                                style={H7}>
                                Confirmar rechazo
                              </button>
                            </div>
                          </details>
                        </div>
                      )}
                    </div>

                    {/* RIGHT — imagen / botones */}
                    <div className="lg:col-span-2 flex flex-col gap-3">
                      <div className="text-xs font-black uppercase text-muted-foreground" style={H9}>Récipe adjunto</div>
                      <div className="bg-gray-50 border border-border rounded-xl overflow-hidden">
                        <img src={selectedRecipe.imageUrl} alt="Récipe" className="w-full h-auto max-h-56 object-contain" />
                      </div>
                      <a href={selectedRecipe.imageUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-2 bg-[#50e9f8] text-[#006064] rounded-xl text-xs font-black uppercase hover:bg-[#2dd8e8] transition-colors"
                        style={H7}>
                        <Eye size={13} /> Ver imagen completa
                      </a>
                      <a href={selectedRecipe.imageUrl} download
                        className="flex items-center justify-center gap-2 py-2 border border-border text-muted-foreground rounded-xl text-xs font-semibold hover:bg-muted transition-colors">
                        <Copy size={13} /> Descargar imagen
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-xl uppercase text-foreground" style={H9}>Auditoría de Récipes</h2>
                  <p className="text-sm text-muted-foreground">{recipes.filter(r => r.status === "pending").length} pendiente{recipes.filter(r => r.status === "pending").length !== 1 ? "s" : ""} · {recipes.length} total</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {["Nº Orden", "Producto", "Cantidad", "Estado", "Acción"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground" style={H9}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recipes.map((recipe, i) => (
                      <tr key={recipe.id} className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                        <td className="px-4 py-3.5 text-[#179150] font-black text-xs" style={H9}>{recipe.orderId}</td>
                        <td className="px-4 py-3.5">
                          <div className="text-xs font-semibold text-foreground">{recipe.product}</div>
                          <div className="text-[10px] text-muted-foreground">{recipe.clientName}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">{recipe.quantity} {recipe.quantity === 1 ? "unidad" : "unidades"}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            recipe.status === "approved" ? "bg-[#179150] text-white" :
                            recipe.status === "rejected" ? "bg-red-500 text-white" :
                            "bg-amber-100 text-amber-800"}`} style={H9}>
                            {recipe.status === "approved" ? "Aprobado" : recipe.status === "rejected" ? "Rechazado" : "Pendiente"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => { setSelectedRecipe(recipe); setRejectReasons(new Set()); setRejectComment(""); }}
                            className="text-[#179150] text-xs font-semibold hover:underline"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                    {recipes.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No hay récipes registrados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AUXILIAR MODULE */}
        {activeTab === "auxiliar" && isAuxiliar && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock size={20} className="text-amber-600" />
                  </div>
                  <div className="text-xs font-black uppercase text-muted-foreground tracking-wider" style={H9}>Por Preparar</div>
                </div>
                <div className="text-4xl font-black text-amber-600" style={H9}>{ordersByStatus.porPreparar}</div>
              </div>

              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Store size={20} className="text-blue-600" />
                  </div>
                  <div className="text-xs font-black uppercase text-muted-foreground tracking-wider" style={H9}>Por Retirar</div>
                </div>
                <div className="text-4xl font-black text-blue-600" style={H9}>{ordersByStatus.porRetirar}</div>
              </div>

              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Truck size={20} className="text-[#179150]" />
                  </div>
                  <div className="text-xs font-black uppercase text-muted-foreground tracking-wider" style={H9}>Listo Delivery</div>
                </div>
                <div className="text-4xl font-black text-[#179150]" style={H9}>{ordersByStatus.listoDelivery}</div>
              </div>
            </div>

            {/* Orders list */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border">
                <h2 className="text-xl uppercase text-foreground mb-4" style={H9}>Gestión de Pedidos</h2>

                {/* Filters */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={searchOrder}
                      onChange={e => setSearchOrder(e.target.value)}
                      placeholder="Buscar por orden o cliente..."
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]"
                    />
                  </div>

                  {userHasAllSedes ? (
                  <select
                    value={sedeFilter}
                    onChange={e => setSedeFilter(e.target.value)}
                    className="px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white"
                  >
                    <option value="todas">Todas las sedes</option>
                    <option value="principal">Principal</option>
                    <option value="clinica">Clínica Humana</option>
                  </select>
                  ) : (
                    <div className="flex items-center gap-2 bg-[#e0f5eb] border border-[#a7f3d0] rounded-xl px-4 py-2.5">
                      <MapPin size={14} className="text-[#179150] flex-shrink-0" />
                      <span className="text-sm font-semibold text-[#006064]">
                        Sede asignada: {userAssignedSede === "principal" ? "Principal" : "Clínica Humana"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {["Orden", "Cliente", "Sede", "Estado", "Items", "Total", "Método Pago", "Acción"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground" style={H9}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, i) => (
                      <tr key={order.id} className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="px-4 py-3.5 text-[#179150] font-black text-xs" style={H9}>{order.id}</td>
                        <td className="px-4 py-3.5 text-foreground text-xs font-semibold">{order.clientName}</td>
                        <td className="px-4 py-3.5 text-muted-foreground text-xs capitalize">{order.sede}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            order.status === "Por preparar" ? "bg-amber-100 text-amber-800" :
                            order.status === "Por retirar" ? "bg-blue-100 text-blue-800" :
                            "bg-green-100 text-[#179150]"
                          }`} style={H9}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground text-xs">{order.items}</td>
                        <td className="px-4 py-3.5 text-foreground text-xs font-semibold">${order.total.toFixed(2)}</td>
                        <td className="px-4 py-3.5 text-muted-foreground text-xs">{order.paymentMethod}</td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-[#179150] text-xs font-semibold hover:underline"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="sticky top-0 bg-gradient-to-r from-[#006064] to-[#1a3060] px-6 py-5 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl uppercase text-white" style={H9}>{selectedOrder.id}</h3>
                        <p className="text-white/70 text-sm">{selectedOrder.clientName} · {selectedOrder.createdAt}</p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Order info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Estado</div>
                        <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-black uppercase ${
                          selectedOrder.status === "Por preparar" ? "bg-amber-100 text-amber-800" :
                          selectedOrder.status === "Por retirar" ? "bg-blue-100 text-blue-800" :
                          "bg-green-100 text-[#179150]"
                        }`} style={H9}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Sede</div>
                        <div className="text-sm font-black text-foreground capitalize" style={H9}>{selectedOrder.sede}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Total</div>
                        <div className="text-lg font-black text-[#179150]" style={H9}>${selectedOrder.total.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Método de Pago</div>
                        <div className="text-sm font-semibold text-foreground">{selectedOrder.paymentMethod}</div>
                      </div>
                    </div>

                    {/* Purchase Request (Packing List) */}
                    <div className="bg-[#f8fafc] border border-border rounded-xl p-4">
                      <div className="text-xs font-black uppercase text-muted-foreground mb-3 tracking-wider" style={H9}>Lista de Empacado</div>
                      <div className="space-y-2">
                        {selectedOrder.products.map((prod, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#179150]" />
                            {prod}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Controlled substance alert */}
                    {selectedOrder.controlled && (
                      <div className="bg-red-600 text-white p-6 rounded-xl border-4 border-red-700">
                        <div className="flex items-center gap-3 mb-3">
                          <Shield size={32} />
                          <div className="text-2xl font-black uppercase" style={H9}>¡ATENCIÓN!</div>
                        </div>
                        <p className="text-lg font-bold leading-tight">
                          EXIJA Y RETENGA EL RÉCIPE FÍSICO ORIGINAL
                        </p>
                        <p className="text-sm mt-2 text-red-100">
                          Este pedido contiene psicotrópicos controlados. NO DESPACHE sin verificar el récipe original.
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {selectedOrder.status === "Por preparar" && (
                      <button
                        onClick={() => confirmarEmpacado(selectedOrder.id)}
                        className="w-full py-3 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        style={H7}
                      >
                        <CheckCircle size={16} />
                        Confirmar Empacado
                      </button>
                    )}

                    {selectedOrder.status === "Listo para delivery" && (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 bg-[#e3f2fd] border border-[#90caf9] rounded-xl px-4 py-3">
                          <Bike size={18} className="text-[#006064] flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-[#006064] leading-relaxed">
                            El pedido está listo. Al confirmar, se registra la entrega del paquete preparado al repartidor. El PIN se solicitará después, al momento de la entrega al cliente.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            toast.success(`Pedido ${selectedOrder.id} entregado al repartidor`, { description: "El repartidor recibió el pedido para su despacho.", icon: "🛵" });
                            setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
                            setSelectedOrder(null);
                          }}
                          className="w-full py-3 bg-[#50e9f8] text-[#006064] rounded-xl hover:bg-[#2dd8e8] transition-colors flex items-center justify-center gap-2 font-black uppercase"
                          style={H7}
                        >
                          <Truck size={16} />
                          Confirmar entrega al repartidor
                        </button>
                      </div>
                    )}

                    {selectedOrder.status === "Por retirar" && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                            PIN del Cliente (4 dígitos)
                          </label>
                          <input
                            type="text"
                            value={pinInput}
                            onChange={e => setPinInput(e.target.value.slice(0, 4))}
                            placeholder="1234"
                            maxLength={4}
                            className="w-full px-4 py-3 border-2 border-border rounded-xl text-center text-2xl font-black tracking-widest focus:outline-none focus:border-[#179150]"
                            style={H9}
                          />
                          <p className="text-xs text-muted-foreground mt-2">Demo: El PIN correcto es <strong>1234</strong></p>
                        </div>
                        <button
                          onClick={despacharPedido}
                          disabled={pinInput.length !== 4}
                          className={`w-full py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                            pinInput.length === 4
                              ? "bg-[#50e9f8] text-[#006064] hover:bg-[#2dd8e8]"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                          style={H7}
                        >
                          <Truck size={16} />
                          Despachar Pedido
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REEMBOLSOS — superadmin only */}
        {activeTab === "reembolsos" && isSuperadmin && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-xl uppercase text-foreground" style={H9}>Solicitudes de Reembolso</h2>
                  <p className="text-sm text-muted-foreground">{refunds.filter(r => r.status === "Pendiente").length} pendiente{refunds.filter(r => r.status === "Pendiente").length !== 1 ? "s" : ""} de {refunds.length} totales</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {["Método reportado", "Banco emisor", "Referencia bancaria", "Monto", "Estado", ""].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground" style={H9}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {refunds.map((r, i) => (
                      <tr key={r.id} className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                        <td className="px-4 py-3.5 text-foreground text-xs font-semibold">{r.method}</td>
                        <td className="px-4 py-3.5 text-muted-foreground text-xs">{r.bank}</td>
                        <td className="px-4 py-3.5 text-[#179150] font-black text-xs" style={H9}>{r.reference}</td>
                        <td className="px-4 py-3.5 text-foreground text-xs font-semibold">{r.amount}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${r.status === "Realizada" ? "bg-[#179150] text-white" : "bg-amber-100 text-amber-800"}`} style={H9}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => setSelectedRefund(r)} className="text-[#179150] text-xs font-semibold hover:underline">
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Refund Detail Modal */}
            {selectedRefund && (
              <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  {/* Modal header — same gradient as operaciones */}
                  <div className="sticky top-0 bg-gradient-to-r from-[#006064] to-[#1a3060] px-6 py-5 border-b border-white/10 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl uppercase text-white" style={H9}>Solicitud {selectedRefund.id}</h3>
                        <p className="text-white/70 text-sm">Detalle del reembolso solicitado · {selectedRefund.date}</p>
                      </div>
                      <button onClick={() => setSelectedRefund(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Estado badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase ${selectedRefund.status === "Realizada" ? "bg-[#179150] text-white" : "bg-amber-100 text-amber-800"}`} style={H9}>
                        {selectedRefund.status}
                      </span>
                      <span className="text-xs text-muted-foreground">Ref. {selectedRefund.reference}</span>
                    </div>

                    {/* Bloque 1: Datos de la transacción reportada */}
                    <div className="bg-[#f0fdf7] border border-[#a7f3d0] rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-[#179150] text-white text-xs font-black flex items-center justify-center" style={H9}>1</div>
                        <h4 className="text-sm uppercase text-[#006064] font-black" style={H9}>Datos de la transacción reportada</h4>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(selectedRefund.method === "Pago Móvil"
                          ? [
                              ["Método de pago",      selectedRefund.method],
                              ["Banco emisor",         selectedRefund.bank],
                              ["Código de área",       selectedRefund.areaCode],
                              ["Número telefónico",    selectedRefund.phone],
                              ["Monto",                selectedRefund.amount],
                              ["Referencia bancaria",  selectedRefund.reference],
                              ["Fecha",                selectedRefund.date],
                            ]
                          : [
                              ["Método de pago",      selectedRefund.method],
                              ["Banco emisor",         selectedRefund.bank],
                              ["Monto",                selectedRefund.amount],
                              ["Referencia bancaria",  selectedRefund.reference],
                              ["Fecha",                selectedRefund.date],
                            ]
                        ).map(([label, value]) => (
                          <div key={label}>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">{label}</div>
                            <div className="text-sm font-semibold text-foreground">{value || "—"}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bloque 2: Datos bancarios para el reembolso */}
                    <div className="bg-[#e3f2fd] border border-[#90caf9] rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-[#006064] text-white text-xs font-black flex items-center justify-center" style={H9}>2</div>
                        <h4 className="text-sm uppercase text-[#006064] font-black" style={H9}>Datos bancarios para el reembolso</h4>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(selectedRefund.refundMethod === "Pago Móvil"
                          ? [
                              ["Método de reembolso",  selectedRefund.refundMethod],
                              ["Banco",                selectedRefund.refundBank],
                              ["Código de área",       selectedRefund.refundAreaCode],
                              ["Número telefónico",    selectedRefund.refundPhone],
                              ["Tipo de documento",    selectedRefund.refundDocType],
                              ["N° de documento",      selectedRefund.refundDoc],
                            ]
                          : [
                              ["Método de reembolso",  selectedRefund.refundMethod],
                              ["Banco",                selectedRefund.refundBank],
                              ["Número de cuenta",     selectedRefund.account],
                              ["Tipo de documento",    selectedRefund.refundDocType],
                              ["N° de documento",      selectedRefund.refundDoc],
                              ["Nombre del beneficiario", selectedRefund.holder],
                            ]
                        ).map(([label, value]) => (
                          <div key={label}>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">{label}</div>
                            <div className="text-sm font-semibold text-foreground">{value || "—"}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Confirmar reembolso */}
                    {selectedRefund.status === "Pendiente" ? (
                      <button
                        onClick={() => {
                          setRefunds(prev => prev.map(r => r.id === selectedRefund.id ? { ...r, status: "Realizada" } : r));
                          setSelectedRefund(prev => prev ? { ...prev, status: "Realizada" } : prev);
                        }}
                        className="w-full py-3.5 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-black uppercase"
                        style={H7}
                      >
                        <CheckCircle size={16} /> Confirmar reembolso
                      </button>
                    ) : (
                      <div className="w-full py-3.5 bg-[#e0f5eb] border border-[#a7f3d0] text-[#179150] rounded-xl flex items-center justify-center gap-2 font-black uppercase text-sm" style={H9}>
                        <CheckCircle size={16} /> Reembolso realizado
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INVENTARIO — superadmin only */}
        {activeTab === "inventario" && isSuperadmin && (
          <InventarioTab products={products.length ? products : PRODUCTS} setCatalogProducts={setProducts} />
        )}

        {/* SUPERADMIN MODULES — flat, one per tab */}
        {(["contenido","catalogo","personal","monitor","cupones"] as const).includes(activeTab as any) && isSuperadmin && (
          <SuperadminModules onNav={onNav} products={products} setProducts={setProducts} slides={slides} setSlides={setSlides} forcedTab={activeTab as "contenido"|"catalogo"|"personal"|"monitor"|"cupones"} />
        )}
      </div>
    </div>
  );
}

// ─── Profile data bridge ─────────────────────────────────────────────────────
const DEMO_ORDERS = getLegacyOrderHistoryViewModels();

// Per-account demo contact data keyed by email
const DEMO_CONTACT: Record<string, { phone: string; address: string }> = {
  "cliente@fhec.com":    { phone: "+58 414-1234567", address: "Av. Las Américas, Edif. Torre Pte., Piso 3, Pto. Ordaz" },
  "repartidor@fhec.com": { phone: "+58 416-8765432", address: "Urb. Villa Asia, Calle 15, Casa 8, Pto. Ordaz" },
  "auxiliar@fhec.com":   { phone: "+58 412-1122334", address: "Calle Caroní, Res. La Llovizna, Apto 2B, Pto. Ordaz" },
  "auditor@fhec.com":    { phone: "+58 414-3344556", address: "Av. Guayana, Centro Cívico, Piso 7, Pto. Ordaz" },
  "admin@fhec.com":      { phone: "+58 424-5566778", address: "Urb. Chilemex, Calle Principal, Casa 1, Pto. Ordaz" },
};

// ─── NotificationsPage ────────────────────────────────────────────────────────
const NOTIF_DATA = getLegacyNotificationViewModels();

function NotificationsPage({ onNav, notifs, setNotifs }: {
  onNav: (p: Page) => void;
  notifs: typeof NOTIF_DATA;
  setNotifs: React.Dispatch<React.SetStateAction<typeof NOTIF_DATA>>;
}) {
  const [selected, setSelected]   = useState<typeof NOTIF_DATA[0] | null>(null);
  const unread = notifs.filter(n => !n.read).length;

  const markRead    = (id: number) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = ()           => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const dismiss     = (id: number, e: React.MouseEvent) => { e.stopPropagation(); setNotifs(p => p.filter(n => n.id !== id)); };
  const open        = (n: typeof NOTIF_DATA[0]) => { markRead(n.id); setSelected(n); };

  const accent: Record<string, string> = {
    order:  "bg-[#e0f5eb] border-[#a7f3d0]",
    recipe: "bg-[#e0f5eb] border-[#a7f3d0]",
    promo:  "bg-amber-50 border-amber-200",
    info:   "bg-blue-50 border-blue-200",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 pb-16 mt-6">
      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#f0fdf7] flex items-center justify-center text-3xl">{selected.icon}</div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <h2 className="text-2xl uppercase text-gray-900 mb-2" style={H9}>{selected.title}</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{selected.body}</p>
            {selected.type === "recipe" && selected.title.toLowerCase().includes("aprobado") && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check size={14} className="text-[#179150]" />
                  <span className="text-[#179150] font-bold text-sm">Notificaciones enviadas</span>
                </div>
                <p className="text-gray-700 text-xs leading-relaxed">
                  Se envió una notificación a tu <strong>correo electrónico</strong> y a tu número de <strong>WhatsApp</strong> con los detalles del récipe aprobado y las instrucciones para proceder al pago.
                </p>
              </div>
            )}
            <div className="text-xs text-gray-400">{selected.time}</div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNav("home")} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl uppercase text-foreground" style={H9}>Notificaciones</h1>
          <p className="text-sm text-gray-500">{unread > 0 ? `${unread} sin leer` : "Todo al día"}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-xs text-[#179150] font-semibold hover:underline">
            Marcar todo como leído
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl uppercase text-foreground mb-2" style={H9}>Sin notificaciones</h3>
          <p className="text-sm text-gray-500">No tienes notificaciones por el momento.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n.id} onClick={() => open(n)}
              className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md hover:scale-[1.005]
                ${!n.read ? accent[n.type] ?? "bg-[#e0f5eb] border-[#a7f3d0]" : "bg-white border-border"}`}
            >
              {!n.read && <div className="absolute mt-1 ml-[-8px] w-2.5 h-2.5 rounded-full bg-[#179150] flex-shrink-0" />}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${!n.read ? "bg-white/70" : "bg-muted"}`}>
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-gray-900 leading-snug" style={H9}>{n.title}</h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.read && <span className="bg-[#179150] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Nuevo</span>}
                    <button onClick={e => dismiss(n.id, e)} className="w-6 h-6 rounded-full hover:bg-black/10 flex items-center justify-center">
                      <X size={11} className="text-gray-400" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">{n.body}</p>
                <span className="text-[11px] text-gray-400 mt-1.5 block">{n.time} · Toca para ver detalle</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ onNav }: { onNav: (p: Page) => void }) {
  return (
    <footer className="bg-[#004d52] text-white mt-16">
      <div className="h-0.5 bg-[#179150]" />
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">

        {/* Main grid — 5 cols like reference image */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-8">

          {/* Col 1: Brand + Social */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-2">
              <img src={logoFarmahumana} alt="FHEC" className="w-8 h-8 object-contain" />
              <div>
                <div className="text-white text-base font-bold leading-none uppercase">FARMAHUMANA</div>
                <div className="text-white/50 text-[9px] tracking-widest">FHEC</div>
              </div>
            </div>
            <p className="text-white/55 text-xs leading-relaxed mb-4">Tu farmacia de confianza en Ciudad Guayana.</p>
            <div className="flex gap-2">
              {[
                { href: "https://www.instagram.com/farmahumana?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==", icon: <Instagram size={14} />, title: "Instagram" },
                { href: "https://www.facebook.com/farmahumana", icon: <Facebook size={14} />, title: "Facebook" },
                { href: "https://wa.me/584249395837", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a3.6 3.6 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374A9.86 9.86 0 012.1 11.892C2.1 6.442 6.535 2.008 11.987 2.008c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0011.987 0C5.432 0 .096 5.335.093 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>, title: "WhatsApp" },
              ].map(s => (
                <a key={s.title} href={s.href} target="_blank" rel="noopener noreferrer" title={s.title}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors text-white">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Farmacia (categories) */}
          <div>
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-3">Farmacia</div>
            <ul className="space-y-2">
              {CATS.slice(0, 7).map(c => (
                <li key={c.name}>
                  <button onClick={() => onNav("catalog")} className="text-white/60 text-xs hover:text-white transition-colors text-left">{c.name}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Acerca de Nosotros */}
          <div>
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-3">Acerca de Nosotros</div>
            <ul className="space-y-2">
              {["Quiénes somos", "Misión y visión", "Nuestro equipo", "Certificaciones"].map(l => (
                <li key={l}><button className="text-white/60 text-xs hover:text-white transition-colors text-left">{l}</button></li>
              ))}
              <li><button className="text-white/60 text-xs hover:text-white transition-colors text-left">Contáctanos</button></li>
              <li><button className="text-white/60 text-xs hover:text-white transition-colors text-left">Trabaja con nosotros</button></li>
              <li className="pt-1">
                <div className="text-white/40 text-[10px] mb-1">Nuestras sedes</div>
                <div className="text-white/50 text-[10px] leading-relaxed">📍 Sede Principal — Calle 07, Ciudad Guayana</div>
                <div className="text-white/50 text-[10px] leading-relaxed mt-0.5">📍 Clínica Humana — Av. José Gumilla</div>
              </li>
            </ul>
          </div>

          {/* Col 4: Información */}
          <div>
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-3">Información</div>
            <ul className="space-y-2">
              {["Términos y condiciones", "Política de privacidad", "Política de devoluciones", "Preguntas frecuentes", "Blog de salud", "Regulación MPPS"].map(l => (
                <li key={l}><button className="text-white/60 text-xs hover:text-white transition-colors text-left">{l}</button></li>
              ))}
            </ul>
          </div>

          {/* Col 5: Métodos de Pago (like reference) */}
          <div>
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-3">Métodos de Pago</div>
            <p className="text-white/50 text-[11px] mb-3">Aceptamos múltiples métodos de pago para tu comodidad.</p>
            <div className="text-white/70 text-[10px] font-semibold uppercase tracking-wider mb-2">Aceptamos</div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Pago Móvil",    bg: "#179150", text: "#fff" },
                { label: "Transferencia", bg: "#fff",    text: "#333", border: "#e0e0e0" },
              ].map(m => (
                <div key={m.label}
                  className="px-2.5 py-1 rounded-md text-[10px] font-bold border"
                  style={{ backgroundColor: m.bg, color: m.text, borderColor: m.border ?? m.bg }}>
                  {m.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/35">
          <span>© {new Date().getFullYear()} Farmahumana FHEC, C.A. · Reg. MPPS N° FAR-0001-2024 · Todos los derechos reservados.</span>
          <div className="flex items-center gap-4">
            <button className="hover:text-white/60 transition-colors">Términos</button>
            <button className="hover:text-white/60 transition-colors">Privacidad</button>
            <span className="flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 bg-[#179150] rounded-full" />Ciudad Guayana, Venezuela</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

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
  const [appNotifs, setAppNotifs] = useState(NOTIF_DATA);
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
