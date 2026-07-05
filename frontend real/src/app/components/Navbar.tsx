import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart, Search, User, ChevronDown, Bell, X, Clock,
  LogOut, Heart, Bike, Settings, ClipboardList, FileText,
} from "lucide-react";
import logoFarmahumana from "../../imports/logo-farmahumana.png";
import { Page, AuthUser, H9, H7, fmtUSD, effectivePrice, BRAND_SYNONYMS, PRODUCTS, CATS } from "../shared";
import { ProductBox } from "./ProductCard";

// ─── SmartSearch ──────────────────────────────────────────────────────────────
function SmartSearch({ searchQuery, setSearchQuery, onNav }: {
  searchQuery: string; setSearchQuery: (q: string) => void; onNav: (p: Page) => void;
}) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("fhec_search_history") || "[]"); } catch { return []; }
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const saveHistory = (q: string) => {
    const next = [q, ...history.filter(h => h !== q)].slice(0, 5);
    setHistory(next);
    localStorage.setItem("fhec_search_history", JSON.stringify(next));
  };

  const doSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim()) saveHistory(q.trim());
    setOpen(false);
    onNav("catalog");
  };

  const q = searchQuery.toLowerCase().trim();

  // Brand synonym matches
  const synonymHit = q ? Object.entries(BRAND_SYNONYMS).find(([brand]) => brand.includes(q) || q.includes(brand)) : null;

  // Product matches
  const productMatches = q
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.activeIngredient.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  // Category matches
  const catMatches = q ? CATS.filter(c => c.name.toLowerCase().includes(q)).slice(0, 3) : [];

  const showDropdown = open && (q.length > 0 || history.length > 0);

  return (
    <div className="relative flex-1 max-w-2xl mx-2 lg:mx-6" ref={ref}>
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nombre, principio activo, marca comercial…"
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => { if (e.key === "Enter" && searchQuery.trim()) doSearch(searchQuery.trim()); if (e.key === "Escape") setOpen(false); }}
          className="w-full pl-10 pr-4 py-2.5 bg-[#f0fdf7] border border-transparent rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#179150] focus:bg-white focus:shadow-[0_0_0_3px_rgba(23,145,80,0.15)] transition-all"
        />
        {searchQuery && (
          <button onClick={() => { setSearchQuery(""); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-border rounded-2xl shadow-2xl z-[60] overflow-hidden max-h-[480px] overflow-y-auto">

          {/* Synonym alert */}
          {synonymHit && (
            <div className="px-4 py-3 bg-[#e0f5eb] border-b border-[#a7f3d0]">
              <div className="text-[10px] text-[#006064] font-black uppercase tracking-wider mb-1">Principio activo equivalente</div>
              <button
                onClick={() => doSearch(synonymHit[1][0])}
                className="flex items-center gap-2 text-sm text-[#0d1f3c] hover:text-[#179150] transition-colors"
              >
                <span className="text-[#179150]">→</span>
                <span>¿Buscas <strong>{synonymHit[1][0]}</strong>? (principio activo de <em>{synonymHit[0]}</em>)</span>
              </button>
            </div>
          )}

          {/* Recent history */}
          {!q && history.length > 0 && (
            <div className="px-4 pt-3 pb-2">
              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-2">Búsquedas recientes</div>
              <div className="flex flex-wrap gap-1.5">
                {history.map(h => (
                  <button key={h} onClick={() => doSearch(h)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-muted hover:bg-[#e0f5eb] border border-border hover:border-[#179150] rounded-full text-xs text-foreground transition-all">
                    <Clock size={10} className="text-muted-foreground" />{h}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category quick filters */}
          {q && catMatches.length > 0 && (
            <div className="px-4 pt-3 pb-2 border-b border-border">
              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-2">Categorías</div>
              <div className="flex flex-wrap gap-1.5">
                {catMatches.map(c => (
                  <button key={c.name} onClick={() => doSearch(c.name)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:shadow-sm"
                    style={{ borderColor: c.color + "40", backgroundColor: c.color + "12", color: c.color }}>
                    <span>{c.emoji}</span>{c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category quick filters when no query */}
          {!q && (
            <div className="px-4 pt-3 pb-2 border-b border-border">
              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-2">Filtros rápidos por categoría</div>
              <div className="flex flex-wrap gap-1.5">
                {CATS.map(c => (
                  <button key={c.name} onClick={() => doSearch(c.name)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:shadow-sm"
                    style={{ borderColor: c.color + "40", backgroundColor: c.color + "12", color: c.color }}>
                    <span>{c.emoji}</span>{c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product results */}
          {productMatches.length > 0 && (
            <div className="px-2 py-2">
              <div className="px-2 text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">Productos</div>
              {productMatches.map(p => (
                <button key={p.id} onClick={() => doSearch(p.name)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-xl transition-colors text-left">
                  <div className="w-9 h-11 rounded-lg overflow-hidden flex-shrink-0">
                    <ProductBox product={p} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black uppercase truncate" style={H9}>{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.brand} · {p.activeIngredient}</div>
                  </div>
                  <div className="text-sm font-semibold text-[#179150] flex-shrink-0">{fmtUSD(effectivePrice(p))}</div>
                </button>
              ))}
            </div>
          )}

          {q && productMatches.length === 0 && !synonymHit && catMatches.length === 0 && (
            <div className="px-4 py-5 text-center text-sm text-muted-foreground">
              No se encontraron resultados para <strong>"{searchQuery}"</strong>
            </div>
          )}

          {q && (
            <button onClick={() => doSearch(q)}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-[#006064] bg-[#e0f5eb] hover:bg-[#d1f5e8] transition-colors border-t border-[#a7f3d0]">
              <Search size={13} />Ver todos los resultados para "{searchQuery}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const btnClass = navStyle === "gradient"
    ? `flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-black whitespace-nowrap transition-colors my-1 ${active ? "bg-white/25 text-white" : "text-white/85 hover:text-white hover:bg-white/15"}`
    : `flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${active ? "bg-[#179150]/20 text-[#006064]" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setOpen(true)}
        className={btnClass}
        style={navStyle === "gradient" ? H7 : {}}
      >
        {label}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden min-w-[200px]"
          onMouseLeave={() => setOpen(false)}
        >
          {items.map(item => (
            <button
              key={item.label}
              onClick={() => {
                onNav(item.page);
                if (onCategorySelect) {
                  onCategorySelect(item.label);
                }
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left"
            >
              {item.emoji && <span className="text-base">{item.emoji}</span>}
              <span className="text-foreground font-semibold" style={item.color ? { color: item.color } : {}}>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar({ cartCount, onNav, page, searchQuery, setSearchQuery, user, onLogout, onCategorySelect }: {
  cartCount: number; onNav: (p: Page) => void; page: Page;
  searchQuery: string; setSearchQuery: (q: string) => void;
  user: AuthUser | null; onLogout: () => void;
  onCategorySelect?: (category: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isInternal = user && ["auxiliar", "auditor", "superadmin"].includes(user.role);
  const isDelivery = user?.role === "repartidor";

  const catalogItems = [
    { label: "Ver todo el catálogo", page: "catalog" as Page },
    ...CATS.map(c => ({ label: c.name, emoji: c.emoji, color: c.color, page: "catalog" as Page })),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="h-1 bg-[#179150]" />
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <button onClick={() => onNav("home")} className="flex items-center gap-2.5 flex-shrink-0 group">
            <img src={logoFarmahumana} alt="Farmahumana FHEC" className="w-10 h-10 object-contain" />
            <div className="hidden sm:block">
              <div className="text-[#179150] text-xl leading-none uppercase" style={H9}>FARMAHUMANA</div>
              <div className="text-[#50e9f8] text-sm font-black tracking-[0.25em] leading-none mt-0.5" style={H9}>FHEC</div>
            </div>
          </button>

          {/* Smart Search */}
          <SmartSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} onNav={onNav} />

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onNav("notifications")}
              className="p-2 rounded-xl hover:bg-muted transition-colors hidden sm:flex"
              title="Notificaciones"
            >
              <Bell size={19} className="text-muted-foreground" />
            </button>
            <button
              onClick={() => onNav("favorites")}
              className="p-2 rounded-xl hover:bg-muted transition-colors hidden sm:flex"
              title="Mis favoritos"
            >
              <Heart size={19} className="text-muted-foreground" />
            </button>

            {/* Auth area */}
            {user ? (
              <div className="relative" ref={menuRef}>
                {isDelivery && (
                  <button
                    onClick={() => { onNav("delivery"); setMenuOpen(false); }}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#50e9f8] text-[#006064] rounded-xl text-xs mr-1 hover:bg-[#2dd8e8] transition-colors" style={H7}>
                    <Bike size={14} />Panel de Repartos
                  </button>
                )}
                {isInternal && (
                  <button
                    onClick={() => { onNav("admin"); setMenuOpen(false); }}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#006064] text-white rounded-xl text-xs mr-1 hover:bg-[#004d52] transition-colors" style={H7}>
                    <Settings size={14} />Panel Admin
                  </button>
                )}

                <button
                  onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors border border-border"
                >
                  <div className="w-7 h-7 rounded-full bg-[#179150] flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-foreground max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown size={13} className={`text-muted-foreground transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border bg-muted/40">
                      <div className="text-sm font-black text-foreground" style={H9}>{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                      <span className={`inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full
                        ${user.role === "superadmin" ? "bg-[#006064] text-white" :
                          user.role === "repartidor" ? "bg-[#50e9f8] text-[#006064]" :
                          user.role === "cliente" ? "bg-green-100 text-[#179150]" :
                          "bg-amber-100 text-amber-800"}`} style={H9}>
                        {user.role}
                      </span>
                    </div>
                    <div className="py-1">
                      <MenuBtn icon={<User size={14} />} label="Mi Perfil" onClick={() => { onNav("profile"); setMenuOpen(false); }} />
                      {user.role === "cliente" && (<>
                        <MenuBtn icon={<ClipboardList size={14} />} label="Mis Pedidos" onClick={() => { onNav("tracking"); setMenuOpen(false); }} />
                        <MenuBtn icon={<Heart size={14} />} label="Favoritos" onClick={() => { onNav("favorites"); setMenuOpen(false); }} />
                      </>)}
                      {isDelivery && <MenuBtn icon={<Bike size={14} />} label="Panel de Repartos" highlight onClick={() => { onNav("delivery"); setMenuOpen(false); }} />}
                      {isInternal && (<>
                        <MenuBtn icon={<Settings size={14} />} label="Panel de Administración" highlight onClick={() => { onNav("admin"); setMenuOpen(false); }} />
                      </>)}
                    </div>
                    <div className="border-t border-border py-1">
                      <button onClick={() => { onLogout(); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={14} /><span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => onNav("login")}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#179150] text-white rounded-xl text-sm hover:bg-green-700 transition-colors" style={H7}>
                <User size={15} />
                <span className="hidden sm:block">Iniciar Sesión</span>
              </button>
            )}

            <button onClick={() => onNav("cart")} className="relative p-2 rounded-xl hover:bg-muted transition-colors ml-1">
              <ShoppingCart size={20} className="text-[#006064]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#50e9f8] text-[#006064] text-[10px] font-black rounded-full flex items-center justify-center leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Nav with dropdowns — gradient strip */}
        <nav
          className="flex items-center gap-0.5 -mx-4 lg:-mx-8 px-4 lg:px-8 overflow-x-auto"
          style={{ scrollbarWidth: "none", background: "linear-gradient(90deg, #179150 0%, #50e9f8 50%, #179150 100%)" }}
        >
          <button onClick={() => onNav("home")}
            className={`px-3 py-2 rounded-lg text-xs font-black whitespace-nowrap transition-colors my-1
              ${page === "home" ? "bg-white/25 text-white" : "text-white/85 hover:text-white hover:bg-white/15"}`}
            style={H7}>
            Inicio
          </button>

          <NavDropdown
            label="Salud y Bienestar"
            items={[
              { label: "Diabetes", emoji: "💉", color: "#179150", page: "catalog" },
              { label: "Cardiovascular", emoji: "🫀", color: "#c62828", page: "catalog" },
              { label: "Vitaminas", emoji: "⚡", color: "#f9a825", page: "catalog" },
              { label: "Antibióticos", emoji: "💊", color: "#e65100", page: "catalog" },
              { label: "Gastrointestinal", emoji: "🔬", color: "#179150", page: "catalog" },
              { label: "Analgésicos", emoji: "🩺", color: "#1565c0", page: "catalog" },
              { label: "Sistema Nervioso", emoji: "🧠", color: "#283593", page: "catalog" },
            ]}
            onNav={onNav}
            active={false}
            navStyle="gradient"
            onCategorySelect={onCategorySelect}
          />

          <NavDropdown
            label="Equipos Médicos"
            items={[
              { label: "Descartables", emoji: "🧤", color: "#37474f", page: "catalog" },
            ]}
            onNav={onNav}
            active={false}
            navStyle="gradient"
            onCategorySelect={onCategorySelect}
          />

          <button onClick={() => onNav("tracking")}
            className={`px-3 py-2 rounded-lg text-xs font-black whitespace-nowrap transition-colors my-1
              ${page === "tracking" ? "bg-white/25 text-white" : "text-white/85 hover:text-white hover:bg-white/15"}`}
            style={H7}>
            Mi Pedido
          </button>
        </nav>
      </div>
    </header>
  );
}

export function MenuBtn({ icon, label, onClick, highlight = false }: { icon: React.ReactNode; label: string; onClick: () => void; highlight?: boolean }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors
        ${highlight ? "text-[#006064] font-black hover:bg-[#e0f5eb]" : "text-foreground hover:bg-muted"}`}>
      <span className={highlight ? "text-[#179150]" : "text-muted-foreground"}>{icon}</span>
      {label}
    </button>
  );
}
