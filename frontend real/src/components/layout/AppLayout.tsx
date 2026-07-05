import React, { useEffect, useRef, useState } from "react";
import {
  Bell, Bike, Check, ChevronDown, Heart, Instagram, Facebook, LogOut, MapPin, Minus, Package,
  Shield, ShoppingCart, Truck, User, X, Plus,
} from "lucide-react";
import logoFarmahumana from "../../imports/logo-farmahumana.png";
import { CatNavButton } from "./CategoryDropdown";
import { MobileUserMenu } from "./MobileUserMenu";
import { SedeSelector } from "./SedeSelector";
import { CATS, H9, effectivePrice, fmtUSD } from "./layoutShared";
import { SmartSearch } from "../../features/search";
import { ProductBox } from "../product";
import type { AuthUser, CartItem, Page, Product } from "../../app/types";
import type { AppNotification } from "../../features/notifications";

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
