import React, { useEffect, useRef, useState } from "react";
import {
  Bell, Bike, Check, ChevronDown, Heart, Instagram, Facebook, LogOut, MapPin, Minus, Package,
  Shield, ShoppingCart, Truck, User, X, Plus,
} from "lucide-react";
import logoFarmahumana from "../../imports/logo-farmahumana.png";
import { SmartSearch } from "../../features/search";
import { ProductBox } from "../product";
import { getCategoriasParaFiltro, getSedesListLegacy } from "../../services";
import type { AuthUser, CartItem, Page, Product } from "../../app/types";
import type { AppNotification } from "../../features/notifications";

const H9: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 };
const H7: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 };
const fmtUSD = (u: number) => "$" + u.toFixed(2);
const effectivePrice = (p: Product) => p.discount ? p.priceUSD * (1 - p.discount / 100) : p.priceUSD;
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
export function Navbar({ cartCount, onNav, page, searchQuery, setSearchQuery, user, onLogout, onCategorySelect,
  cartItems, onUpdateCartQuantity, onRemoveFromCart, hasActiveOrder = false, appNotifs, setAppNotifs, selectedSede, onSedeChange, products, categories, brandSynonyms }: {
  cartCount: number; onNav: (p: Page) => void; page: Page;
  searchQuery: string; setSearchQuery: (q: string) => void;
  user: AuthUser | null; onLogout: () => void;
  onCategorySelect?: (category: string) => void;
  cartItems: CartItem[];
  onUpdateCartQuantity: (id: number, delta: number) => void;
  onRemoveFromCart: (id: number) => void;
  hasActiveOrder?: boolean;
  appNotifs: AppNotification[];
  setAppNotifs: React.Dispatch<React.SetStateAction<AppNotification[]>>;
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

// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer({ onNav }: { onNav: (p: Page) => void }) {
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
