import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
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

// ─── Stars ───────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={11} className={s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
      ))}
    </div>
  );
}

// ─── ProductBox ───────────────────────────────────────────────────────────────
function ProductBox({ product, size = "md" }: { product: Product; size?: "sm" | "md" | "lg" }) {
  const h = size === "sm" ? "h-20" : size === "lg" ? "h-72" : "h-48";

  return (
    <div
      className={`relative w-full ${h} flex items-center justify-center overflow-hidden`}
      style={{ background: `linear-gradient(145deg, ${product.bgColor} 0%, #f8fafc 100%)` }}
    >
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 px-3 text-center select-none">
          <Package
            size={size === "sm" ? 22 : size === "lg" ? 56 : 36}
            style={{ color: product.accentColor }}
            strokeWidth={1.5}
          />
          {size !== "sm" && (
            <>
              <div className={`font-black uppercase leading-tight ${size === "lg" ? "text-base" : "text-xs"}`}
                style={{ color: product.accentColor, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}>
                {product.name}
              </div>
              <div className="text-[10px] text-muted-foreground font-semibold">{product.brand}</div>
            </>
          )}
        </div>
      )}

      {product.needsRecipe && !product.controlledSubstance && size !== "sm" && size !== "lg" && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
          <AlertTriangle size={10} />
          Récipe
        </div>
      )}

      {product.controlledSubstance && size !== "sm" && size !== "lg" && (
        <div className="absolute top-2 right-2 bg-purple-700 text-white text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
          <Shield size={10} />
          Uso Controlado
        </div>
      )}

      {product.stock === 0 && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
          <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Agotado</span>
        </div>
      )}
    </div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ product, onProductClick, onAddToCart, cartQuantity = 0, onUpdateQuantity, isFavorite = false, onToggleFavorite, selectedSede = "principal" }: {
  product: Product;
  onProductClick: (id: number) => void;
  onAddToCart: (p: Product) => void;
  cartQuantity?: number;
  onUpdateQuantity?: (productId: number, delta: number) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: number) => void;
  selectedSede?: string;
}) {
  const [showCardRecipeModal, setShowCardRecipeModal] = useState(false);
  // Stock según la sede seleccionada globalmente
  const sedeStock = product.stockSedes
    ? (product.stockSedes[selectedSede as keyof typeof product.stockSedes] ?? product.stock)
    : product.stock;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock === 0) return;
    if (product.needsRecipe) { setShowCardRecipeModal(true); return; }
    onAddToCart(product);
  };

  const confirmCardAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCardRecipeModal(false);
    onAddToCart(product);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateQuantity) {
      onUpdateQuantity(product.id, 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateQuantity) {
      onUpdateQuantity(product.id, -1);
    }
  };

  const isInCart = cartQuantity > 0;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(product.id);
    }
  };

  return (
    <>
    {showCardRecipeModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[350] flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
        <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${product.controlledSubstance ? "bg-purple-100" : "bg-red-100"}`}>
            <AlertTriangle size={30} className={product.controlledSubstance ? "text-purple-700" : "text-red-600"} />
          </div>
          <h2 className="text-xl uppercase text-foreground mb-3" style={H9}>
            {product.controlledSubstance ? "Requiere récipe digital y físico" : "Requiere récipe digital"}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {product.controlledSubstance
              ? "Deberás cargar el récipe digital durante el proceso del pedido y además presentar el récipe físico original al retirar en farmacia. El récipe debe ser legible, coincidir con el producto solicitado y contener la información médica necesaria. Este producto es pickup obligatorio y no está disponible para delivery."
              : "Deberás cargar el récipe digital durante el proceso del pedido para poder continuar con la revisión médica. El récipe debe ser legible, coincidir con el producto solicitado y contener la información médica necesaria."}
          </p>
          <button
            onClick={confirmCardAdd}
            className="w-full py-3 bg-[#179150] text-white rounded-xl font-black uppercase hover:bg-green-700 transition-colors"
            style={H7}
          >
            Aceptar
          </button>
          <button onClick={e => { e.stopPropagation(); setShowCardRecipeModal(false); }} className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors w-full py-1">
            Cancelar
          </button>
        </div>
      </div>
    )}
    <div
      className="bg-card rounded-2xl border border-border overflow-hidden cursor-pointer group hover:border-[#179150] hover:shadow-[0_4px_28px_rgba(23,145,80,0.14)] transition-all duration-200 relative flex flex-col"
      onClick={() => onProductClick(product.id)}
    >
      <ProductBox product={product} />

      {/* Discount ribbon */}
      {product.discount && (
        <div className="absolute top-2 right-2 bg-amber-400 text-[#006064] text-sm font-black px-2.5 py-1 rounded-full shadow-md z-10" style={H9}>
          -{product.discount}% OFF
        </div>
      )}

      {/* Favorite button */}
      <button
        onClick={handleToggleFavorite}
        className="absolute top-2 left-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all z-10"
      >
        <svg viewBox="0 0 24 24" fill={isFavorite ? "#c62828" : "none"} stroke={isFavorite ? "#c62828" : "currentColor"} strokeWidth="2" className={`w-4 h-4 ${isFavorite ? "text-red-600" : "text-gray-400"}`}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* card body — flex col so button sticks to bottom */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{product.brand}</span>
        </div>

        <h3 className="text-foreground text-base leading-tight uppercase" style={H9}>
          {product.name}
        </h3>
        <div className="text-[11px] text-muted-foreground mb-1.5">
          {product.packSize} unidades
        </div>

        <div className="mb-3">
          {product.discount ? (
            <>
              <div className="text-[#179150] text-2xl leading-none" style={H9}>{fmtUSD(effectivePrice(product))} USD</div>
              <div className="text-muted-foreground text-xs line-through mt-0.5">{fmtUSD(product.priceUSD)} USD</div>
              <div className="text-muted-foreground text-xs mt-0.5">{fmtVES(effectivePrice(product))}</div>
            </>
          ) : (
            <>
              <div className="text-[#179150] text-2xl leading-none" style={H9}>{fmtUSD(product.priceUSD)} USD</div>
              <div className="text-muted-foreground text-xs mt-0.5">{fmtVES(product.priceUSD)}</div>
            </>
          )}
        </div>

        {/* Stock según sede seleccionada */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sedeStock > 0 ? "bg-[#179150]" : "bg-gray-400"}`} />
          <span className={`text-xs font-semibold ${sedeStock > 0 ? "text-[#179150]" : "text-gray-500"}`}>
            {sedeStock > 0 ? `${sedeStock} disponibles` : "Sin stock"}
          </span>
        </div>

        {/* Button pushed to bottom */}
        <div className="mt-auto">
          {isInCart ? (
            <div className="flex items-center justify-between border-2 border-[#50e9f8] rounded-xl overflow-hidden bg-[#e0f8fd]">
              <button
                onClick={handleDecrement}
                className="w-10 h-10 flex items-center justify-center hover:bg-[#50e9f8]/20 transition-colors text-[#006064]"
              >
                <Minus size={14} />
              </button>
              <div className="flex-1 text-center">
                <div className="text-xs text-[#006064]/70">En carrito</div>
                <div className="text-base font-black text-[#006064]" style={H9}>{cartQuantity}</div>
              </div>
              <button
                onClick={handleIncrement}
                disabled={cartQuantity >= product.stock}
                className="w-10 h-10 flex items-center justify-center hover:bg-[#50e9f8]/20 transition-colors text-[#006064] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className={`w-full py-2.5 rounded-xl text-sm uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-2
                ${product.stock === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#50e9f8] text-[#006064] hover:bg-[#2dd8e8]"
                }`}
              style={H7}
            >
              {product.stock === 0 ? "Sin Disponibilidad" : (<><ShoppingCart size={14} />Añadir al Carrito</>)}
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

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

  // Product matches — out-of-stock only shown when brand/name is the search term
  const productMatches = q
    ? PRODUCTS.filter(p => {
        const brandMatch = p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
        const otherMatch = p.activeIngredient.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        if (p.stock === 0 && !brandMatch) return false;
        return brandMatch || otherMatch;
      }).slice(0, 4)
    : [];

  // Category matches
  const catMatches = q ? CATS.filter(c => c.name.toLowerCase().includes(q)).slice(0, 3) : [];

  const showDropdown = open && (q.length > 0 || history.length > 0);

  return (
    <div className="relative flex-1 mx-2 lg:mx-6" ref={ref}>
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nombre, principio activo, marca comercial…"
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => { if (e.key === "Enter" && searchQuery.trim()) doSearch(searchQuery.trim()); if (e.key === "Escape") setOpen(false); }}
          className="w-full pl-10 pr-8 py-2.5 bg-[#f0fdf7] border border-transparent rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#179150] focus:bg-white focus:shadow-[0_0_0_3px_rgba(23,145,80,0.15)] transition-all"
        />
        {searchQuery && (
          <button onClick={() => { setSearchQuery(""); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="hidden sm:block absolute top-full left-0 right-0 mt-1.5 bg-white border border-border rounded-2xl shadow-2xl z-[60] overflow-hidden max-h-[480px] overflow-y-auto">

          {/* Synonym alert */}
          {synonymHit && (
            <div className="px-4 py-3 bg-[#e0f5eb] border-b border-[#a7f3d0]">
              <div className="text-[10px] text-[#006064] font-black uppercase tracking-wider mb-1">Principio activo equivalente</div>
              <button
                onClick={() => doSearch(synonymHit[1][0])}
                className="flex items-center gap-2 text-sm text-[#006064] hover:text-[#179150] transition-colors"
              >
                <span className="text-[#006064]">→</span>
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
                    {c.name}
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
                    {c.name}
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
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-[#006064] bg-[#e0f5eb] hover:bg-[#e0f5eb] transition-colors border-t border-[#a7f3d0]">
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
  cartItems, onUpdateCartQuantity, onRemoveFromCart, hasActiveOrder = false, appNotifs, setAppNotifs, selectedSede, onSedeChange }: {
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
          <SmartSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} onNav={onNav} />

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

// ─── HomePage ─────────────────────────────────────────────────────────────────
function HomePage({ products, onProductClick, onAddToCart, onNav, cartItems, onUpdateQuantity, favoriteIds, onToggleFavorite, slides, selectedSede = "principal" }: {
  products: Product[]; onProductClick: (id: number) => void;
  onAddToCart: (p: Product) => void; onNav: (p: Page) => void;
  cartItems: CartItem[]; onUpdateQuantity: (productId: number, delta: number) => void;
  favoriteIds: Set<number>; onToggleFavorite: (productId: number) => void;
  slides: Slide[];
  selectedSede?: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(a => Math.min(a, slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    const t = setInterval(() => setActive(s => (s + 1) % Math.max(1, slides.length)), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  const sl = slides[active] ?? slides[0];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-16">
      {/* Carousel */}
      <div className="relative mt-6 rounded-2xl overflow-hidden" style={{ height: 340 }}>
        {slides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700 bg-black"
            style={{ opacity: i === active ? 1 : 0 }}
          >
            <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />
            {/* subtle dark overlay so text stays readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
          </div>
        ))}

        <div className="relative h-full flex flex-col justify-center px-8 lg:px-14 max-w-xl">
          <span className="inline-flex items-center bg-[#50e9f8] text-[#006064] text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 w-fit" style={H9}>
            {sl.badge}
          </span>
          <h1 className="text-white text-5xl lg:text-6xl leading-none uppercase mb-3" style={H9}>
            {sl.title}
          </h1>
          <p className="text-white/75 text-sm lg:text-base mb-7 leading-relaxed">{sl.subtitle}</p>
          <button
            onClick={() => onNav("catalog")}
            className="bg-[#50e9f8] text-[#006064] px-6 py-2.5 rounded-xl hover:bg-white transition-colors w-fit text-base"
            style={H7}
          >
            {sl.cta}
          </button>
        </div>

        <button onClick={() => setActive(s => (s - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/15 hover:bg-white/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => setActive(s => (s + 1) % slides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/15 hover:bg-white/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors">
          <ChevronRight size={18} />
        </button>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} className={`rounded-full transition-all duration-300 ${i === active ? "w-7 h-2 bg-[#50e9f8]" : "w-2 h-2 bg-white/40"}`} />
          ))}
        </div>
      </div>

      {/* Featured products */}
      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-5">
          <h2 className="text-foreground text-2xl uppercase" style={H9}>Productos Destacados</h2>
          <button onClick={() => onNav("catalog")} className="text-sm text-[#179150] font-semibold flex items-center gap-1 hover:gap-2 transition-all self-start">Catálogo completo <ChevronRight size={14} /></button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products
            .filter(p => {
              // Filtrar por stock de la sede seleccionada
              const sedeStock = p.stockSedes
                ? (p.stockSedes[selectedSede as keyof typeof p.stockSedes] ?? p.stock)
                : p.stock;
              return sedeStock > 0;
            })
            .map(p => {
              const cartItem = cartItems.find(ci => ci.product.id === p.id);
              return (
                <ProductCard
                  key={p.id}
                  product={p}
                  onProductClick={onProductClick}
                  onAddToCart={onAddToCart}
                  cartQuantity={cartItem?.quantity || 0}
                  onUpdateQuantity={onUpdateQuantity}
                  isFavorite={favoriteIds.has(p.id)}
                  onToggleFavorite={onToggleFavorite}
                  selectedSede={selectedSede}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ─── CatalogPage ──────────────────────────────────────────────────────────────
function CatalogPage({ products, searchQuery, onProductClick, onAddToCart, cartItems, onUpdateQuantity, favoriteIds, onToggleFavorite, preselectedCategory }: {
  products: Product[]; searchQuery: string;
  onProductClick: (id: number) => void; onAddToCart: (p: Product) => void;
  cartItems: CartItem[]; onUpdateQuantity: (productId: number, delta: number) => void;
  favoriteIds: Set<number>; onToggleFavorite: (productId: number) => void;
  preselectedCategory?: string;
}) {
  const [openSection, setOpenSection] = useState<string | null>("Categoría");
  const [selCats, setSelCats] = useState<Set<string>>(preselectedCategory ? new Set([preselectedCategory]) : new Set());
  const [selBrands, setSelBrands] = useState<Set<string>>(new Set());
  const [selPres, setSelPres] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("relevancia");
  const [showFilters, setShowFilters] = useState(false);

  // Update selected categories if preselected category changes
  useEffect(() => {
    if (preselectedCategory) {
      setSelCats(new Set([preselectedCategory]));
    }
  }, [preselectedCategory]);

  const allCats = [...new Set(products.map(p => p.category))];
  const allBrands = [...new Set(products.map(p => p.brand))];
  const allPres = [...new Set(products.map(p => p.presentation))];

  const toggle = (set: Set<string>, val: string, setFn: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setFn(next);
  };

  let filtered = products.filter(p => {
    if (selCats.size > 0 && !selCats.has(p.category)) return false;
    if (selBrands.size > 0 && !selBrands.has(p.brand)) return false;
    if (selPres.size > 0 && !selPres.has(p.presentation)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches =
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.activeIngredient.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  if (sortBy === "precio_asc") filtered = [...filtered].sort((a, b) => effectivePrice(a) - effectivePrice(b));
  else if (sortBy === "precio_desc") filtered = [...filtered].sort((a, b) => effectivePrice(b) - effectivePrice(a));
  else filtered = [...filtered].sort((a, b) => b.reviews - a.reviews);

  const FilterSection = ({ title, items, selected, setSelected }: { title: string; items: string[]; selected: Set<string>; setSelected: (s: Set<string>) => void }) => (
    <div className="border-b border-border pb-4 mb-4">
      <button className="flex items-center justify-between w-full mb-3" onClick={() => setOpenSection(openSection === title ? null : title)}>
        <span className="text-foreground text-sm font-black uppercase" style={H7}>{title}</span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${openSection === title ? "rotate-180" : ""}`} />
      </button>
      {openSection === title && (
        <div className="space-y-2">
          {items.map(item => (
            <label key={item} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded flex-shrink-0 border transition-all flex items-center justify-center
                  ${selected.has(item) ? "bg-[#179150] border-[#179150]" : "border-border bg-white group-hover:border-[#179150]"}`}
                onClick={() => toggle(selected, item, setSelected)}
              >
                {selected.has(item) && <Check size={10} className="text-[#006064]" />}
              </div>
              <span className="text-sm text-foreground cursor-pointer" onClick={() => toggle(selected, item, setSelected)}>{item}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  const SidebarContent = () => (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <span className="text-foreground text-lg uppercase" style={H9}>Filtros</span>
        {(selCats.size + selBrands.size + selPres.size) > 0 && (
          <button onClick={() => { setSelCats(new Set()); setSelBrands(new Set()); setSelPres(new Set()); }} className="text-xs text-[#179150] font-semibold hover:underline">
            Limpiar todo
          </button>
        )}
      </div>
      <FilterSection title="Categoría" items={allCats} selected={selCats} setSelected={setSelCats} />
      <FilterSection title="Forma farmacéutica" items={allPres} selected={selPres} setSelected={setSelPres} />
      <FilterSection title="Marca" items={allBrands} selected={selBrands} setSelected={setSelBrands} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-16 mt-6">
      <div className="flex gap-6">
        {/* Sidebar — desktop */}
        <aside className="w-60 flex-shrink-0 hidden lg:block">
          <div className="bg-card rounded-2xl border border-border sticky top-28">
            <SidebarContent />
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm font-semibold">
                <SlidersHorizontal size={14} /> Filtros
                {(selCats.size + selBrands.size + selPres.size) > 0 && (
                  <span className="w-4 h-4 bg-[#50e9f8] text-[#006064] text-[10px] font-black rounded-full flex items-center justify-center">{selCats.size + selBrands.size + selPres.size}</span>
                )}
              </button>
              <span className="hidden sm:inline text-muted-foreground text-sm">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:block">Ordenar:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm border border-border rounded-xl px-3 py-1.5 bg-card focus:outline-none focus:border-[#179150] cursor-pointer">
                <option value="relevancia">Relevancia (más vendidos)</option>
                <option value="precio_asc">Precio (menor a mayor)</option>
                <option value="precio_desc">Precio (mayor a menor)</option>
              </select>
            </div>
          </div>

          {/* Mobile filters */}
          {showFilters && (
            <div className="lg:hidden bg-card rounded-2xl border border-border mb-5">
              <SidebarContent />
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No se encontraron productos</p>
              <p className="text-sm mt-1">Intenta con otros filtros o términos de búsqueda</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(p => {
                  const cartItem = cartItems.find(ci => ci.product.id === p.id);
                  return (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onProductClick={onProductClick}
                      onAddToCart={onAddToCart}
                      cartQuantity={cartItem?.quantity || 0}
                      onUpdateQuantity={onUpdateQuantity}
                      isFavorite={favoriteIds.has(p.id)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  );
                })}
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ProductDetailPage ─────────────────────────────────────────────────────────
function ProductDetailPage({ product, products, onAddToCart, onBack, onProductClick, onNav, favoriteIds, onToggleFavorite, cartItems, onUpdateQuantity, selectedSede = "principal" }: {
  product: Product; products: Product[]; onAddToCart: (p: Product, qty: number) => void;
  onBack: () => void; onProductClick: (id: number) => void; onNav: (p: Page) => void;
  favoriteIds: Set<number>; onToggleFavorite: (id: number) => void;
  cartItems: CartItem[]; onUpdateQuantity: (productId: number, delta: number) => void;
  selectedSede?: string;
}) {
  const cartEntry = cartItems.find(i => i.product.id === product.id);
  const cartQty = cartEntry?.quantity ?? 0;
  const [carouselQty, setCarouselQty] = useState<Record<number, number>>({});
  const isFav = favoriteIds.has(product.id);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  // Stock para la sede seleccionada
  const sedeStock = product.stockSedes
    ? (product.stockSedes[selectedSede as keyof typeof product.stockSedes] ?? product.stock)
    : product.stock;

  const getCarouselQty = (id: number) => carouselQty[id] || 1;
  const updateCarouselQty = (id: number, qty: number) => setCarouselQty(p => ({ ...p, [id]: qty }));

  const handleAdd = () => {
    if (sedeStock === 0) return;
    if (product.needsRecipe) { setShowRecipeModal(true); return; }
    onAddToCart(product, 1);
  };

  const confirmAddToCart = () => {
    setShowRecipeModal(false);
    onAddToCart(product, 1);
  };

  // Helper: mini carousel card
  const CarouselCard = ({ p }: { p: Product }) => (
    <div className="flex-shrink-0 w-56">
      <ProductCard
        product={p}
        onProductClick={onProductClick}
        onAddToCart={onAddToCart}
        cartQuantity={cartItems.find(i => i.product.id === p.id)?.quantity ?? 0}
        onUpdateQuantity={onUpdateQuantity}
        isFavorite={favoriteIds.has(p.id)}
        onToggleFavorite={onToggleFavorite}
        selectedSede={selectedSede}
      />
    </div>
  );

  // Recipe alert modal content
  const recipeModalTitle = product.controlledSubstance
    ? "Requiere récipe digital y físico"
    : "Requiere récipe digital";
  const recipeModalBody = product.controlledSubstance
    ? "Este producto es de uso controlado. Deberás cargar tu récipe médico digital al procesar el pedido, y además presentar el récipe original físico al momento del retiro en farmacia. Solo está disponible para retiro en tienda (pickup obligatorio)."
    : "Este producto requiere récipe médico digital. Podrás cargarlo en el siguiente paso del proceso de compra antes de confirmar tu pedido.";

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-10">
      {/* Recipe modal alert */}
      {showRecipeModal && (
        <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${product.controlledSubstance ? "bg-purple-100" : "bg-red-100"}`}>
              <AlertTriangle size={30} className={product.controlledSubstance ? "text-purple-700" : "text-red-600"} />
            </div>
            <h2 className="text-xl uppercase text-foreground mb-3" style={H9}>{recipeModalTitle}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{recipeModalBody}</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={confirmAddToCart}
                className="w-full py-3 bg-[#179150] text-white rounded-xl font-black uppercase hover:bg-green-700 transition-colors"
                style={H7}
              >
                Aceptar
              </button>
              <button onClick={() => setShowRecipeModal(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb only — no back button */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 mb-4 min-w-0">
        <button onClick={() => onNav("home")} className="hover:text-foreground transition-colors hidden sm:block">Inicio</button>
        <ChevronRight size={13} className="hidden sm:block flex-shrink-0" />
        <button onClick={onBack} className="hover:text-foreground transition-colors">Catálogo</button>
        <ChevronRight size={13} className="flex-shrink-0" />
        <span className="text-foreground font-semibold truncate">{product.name}</span>
      </div>

      {/* Alert banners */}
      {product.needsRecipe && !product.controlledSubstance && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-300 rounded-xl px-4 py-2.5 mb-4">
          <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">Este producto <strong>requiere récipe digital</strong> para proceder al pago. Podrás cargarlo en el siguiente paso.</p>
        </div>
      )}
      {product.controlledSubstance && (
        <div className="flex items-start gap-3 bg-purple-50 border border-purple-300 rounded-xl px-4 py-3 mb-4">
          <AlertTriangle size={18} className="text-purple-700 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-purple-900 font-bold text-sm uppercase mb-1" style={H9}>Requiere récipe digital y físico — Pickup Obligatorio</div>
            <p className="text-purple-800 text-xs leading-relaxed">
              Este producto <strong>requiere récipe médico digital</strong> al procesar el pedido, y además debes
              <strong> presentar el récipe original físico</strong> al momento del retiro.
              Solo está disponible para retiro en farmacia (delivery no disponible).
            </p>
          </div>
        </div>
      )}

      {/* Main 2-col layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: image (2 cols) */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <ProductBox product={product} size="lg" />
          </div>
        </div>

        {/* Right: all info (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Name + brand */}
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">{product.brand}</div>
            <h1 className="text-foreground text-3xl lg:text-4xl uppercase leading-none" style={H9}>{product.name}</h1>
          </div>

          {/* Price */}
          <div className="bg-muted rounded-xl px-4 py-3">
            {product.discount ? (
              <div className="flex items-center flex-wrap gap-2">
                <div className="text-[#179150] text-3xl leading-none" style={H9}>{fmtUSD(effectivePrice(product))} USD</div>
                <span className="bg-amber-400 text-[#006064] text-xs font-black px-2 py-0.5 rounded-full" style={H9}>-{product.discount}%</span>
                <div className="w-full text-muted-foreground text-sm line-through">{fmtUSD(product.priceUSD)} USD</div>
                <div className="text-muted-foreground text-sm">{fmtVES(effectivePrice(product))}</div>
              </div>
            ) : (
              <div>
                <div className="text-[#179150] text-3xl leading-none" style={H9}>{fmtUSD(product.priceUSD)} USD</div>
                <div className="text-muted-foreground text-sm mt-0.5">{fmtVES(product.priceUSD)}</div>
              </div>
            )}
          </div>

          {/* Stock de la sede seleccionada */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sedeStock > 0 ? "bg-[#179150]" : "bg-gray-400"}`} />
            <span className={`text-sm font-semibold ${sedeStock > 0 ? "text-[#179150]" : "text-gray-500"}`}>
              {sedeStock > 0 ? `${sedeStock} unidades disponibles` : "Sin stock en esta sede"}
            </span>
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            {sedeStock === 0 ? (
              <div className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-400 text-base uppercase flex items-center justify-center" style={H7}>Sin Disponibilidad</div>
            ) : cartQty > 0 ? (
              <div className="flex-1 flex items-center justify-between border-2 border-[#50e9f8] rounded-xl overflow-hidden bg-[#e0f8fd]">
                <button onClick={() => onUpdateQuantity(product.id, -1)} className="w-14 h-12 flex items-center justify-center hover:bg-[#50e9f8]/20 transition-colors text-[#006064]"><Minus size={18} /></button>
                <div className="text-center">
                  <div className="text-xs text-[#006064]/70 font-semibold">En carrito</div>
                  <div className="text-xl font-black text-[#006064] leading-none" style={H9}>{cartQty}</div>
                </div>
                <button onClick={() => onUpdateQuantity(product.id, 1)} disabled={cartQty >= sedeStock} className="w-14 h-12 flex items-center justify-center hover:bg-[#50e9f8]/20 transition-colors text-[#006064] disabled:opacity-30"><Plus size={18} /></button>
              </div>
            ) : (
              <button onClick={handleAdd}
                className="flex-1 py-3 rounded-xl text-base uppercase flex items-center justify-center gap-2 transition-all bg-[#50e9f8] text-[#006064] hover:bg-[#2dd8e8]"
                style={H7}>
                <ShoppingCart size={16} />Añadir al Carrito
              </button>
            )}
            <button onClick={() => onToggleFavorite(product.id)}
              className={`w-12 h-12 border rounded-xl flex items-center justify-center transition-colors ${isFav ? "bg-red-50 border-red-300" : "border-border hover:bg-red-50 hover:border-red-200"}`}>
              <svg viewBox="0 0 24 24" fill={isFav ? "#c62828" : "none"} stroke={isFav ? "#c62828" : "currentColor"} strokeWidth="2" className="w-5 h-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            </button>
          </div>

        </div>
      </div>

      {/* Description card — full width below the 2-col grid */}
      <div className="mt-5 bg-card border border-border rounded-xl p-4 space-y-3">
        <div>
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Principio activo</div>
          <div className="text-sm font-semibold text-foreground">{product.activeIngredient}</div>
        </div>
        {(product.concentration || product.packSize) && (
          <div className="flex flex-wrap gap-4">
            {product.concentration && (
              <div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Concentración</div>
                <div className="text-sm font-semibold text-foreground">{product.concentration} {product.concentrationUnit ?? ""}</div>
              </div>
            )}
            {product.packSize && (
              <div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Unidades</div>
                <div className="text-sm font-semibold text-foreground">{product.packSize} unidades</div>
              </div>
            )}
          </div>
        )}
        <div>
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Descripción</div>
          <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
        </div>
      </div>

      {/* Productos similares — mismo principio activo */}
      {(() => {
        const similares = products
          .filter(p => p.activeIngredient === product.activeIngredient && p.id !== product.id)
          .sort((a, b) => effectivePrice(a) - effectivePrice(b));
        if (similares.length === 0) return null;
        return (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-foreground text-xl uppercase" style={H9}>Productos Similares</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {similares.map(p => <CarouselCard key={p.id} p={p} />)}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── CartPage ─────────────────────────────────────────────────────────────────
function CartPage({ cartItems, setCartItems, onNav, discountApplied, discountCode, setDiscountApplied, setDiscountCode, user, hasActiveOrder = false, selectedSede = "principal" }: {
  cartItems: CartItem[]; setCartItems: (items: CartItem[]) => void; onNav: (p: Page) => void;
  discountApplied: number; discountCode: string;
  setDiscountApplied: (n: number) => void; setDiscountCode: (s: string) => void;
  user: AuthUser | null;
  hasActiveOrder?: boolean;
  selectedSede?: string;
}) {
  const [discountInput, setDiscountInput] = useState(discountCode);
  const [discountError, setDiscountError] = useState("");
  const [discountSuccess, setDiscountSuccess] = useState(discountApplied > 0 ? `¡Código aplicado! ${discountApplied}% de descuento` : "");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [stockModal, setStockModal] = useState<{ product: Product; available: number; similar: Product[] } | null>(null);

  const getSedeStock = (p: Product) =>
    p.stockSedes ? (p.stockSedes[selectedSede as keyof typeof p.stockSedes] ?? p.stock) : p.stock;

  const clampCartToSede = () => {
    setCartItems(cartItems.map(i => {
      const avail = getSedeStock(i.product);
      return { ...i, quantity: Math.min(i.quantity, Math.max(0, avail)) };
    }).filter(i => i.quantity > 0));
  };

  const applyDiscount = () => {
    const pct = DISCOUNT_CODES[discountInput.trim().toUpperCase()];
    if (pct) {
      setDiscountApplied(pct);
      setDiscountCode(discountInput.trim().toUpperCase());
      setDiscountSuccess(`¡Código aplicado! ${pct}% de descuento`);
      setDiscountError("");
    } else {
      setDiscountError("Código no válido o expirado.");
      setDiscountSuccess("");
      setDiscountApplied(0);
    }
  };

  const handleProcesar = () => {
    if (hasActiveOrder) { onNav("tracking"); return; }
    if (!user) { setShowLoginModal(true); return; }
    for (const item of cartItems) {
      const avail = getSedeStock(item.product);
      if (item.quantity > avail) {
        const similar = PRODUCTS.filter(p =>
          p.category === item.product.category && p.id !== item.product.id && getSedeStock(p) > 0
        ).slice(0, 4);
        setStockModal({ product: item.product, available: avail, similar });
        return;
      }
    }
    onNav("deliverySelect");
  };

  const updateQty = (id: number, delta: number) => {
    setCartItems(cartItems.map(i => i.product.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };
  const remove = (id: number) => setCartItems(cartItems.filter(i => i.product.id !== id));
  const subtotal = cartItems.reduce((s, i) => s + effectivePrice(i.product) * i.quantity, 0);
  const IVA_RATE = 0.16;
  const ivaAmount = subtotal * IVA_RATE;
  const discountAmount = subtotal * discountApplied / 100;
  const total = subtotal + ivaAmount - discountAmount;
  const hasRecipe = cartItems.some(i => i.product.needsRecipe);
  const hasControlledSubstance = cartItems.some(i => i.product.controlledSubstance);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-20 text-center">
        <ShoppingCart size={56} className="mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl uppercase text-foreground mb-2" style={H9}>Tu carrito está vacío</h2>
        <p className="text-muted-foreground text-sm mb-6">Agrega medicamentos desde el catálogo para comenzar tu pedido.</p>
        <button onClick={() => onNav("catalog")} className="bg-[#50e9f8] text-[#006064] px-6 py-3 rounded-xl font-black uppercase tracking-wide" style={H7}>
          Ir al Catálogo
        </button>
      </div>
    );
  }

  const clearCart = () => {
    setCartItems([]);
    toast.success("Carrito vaciado", { description: "Todos los productos han sido eliminados del carrito.", icon: "🛒" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-16 mt-6">
      {/* Active order blocking banner */}
      {hasActiveOrder && (
        <div className="mb-5 flex items-start gap-3 bg-amber-50 border-2 border-amber-300 rounded-2xl p-4">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-amber-900 font-black text-sm uppercase mb-0.5" style={H9}>Ya tienes un pedido activo</div>
            <p className="text-amber-700 text-xs mb-2">Solo puede existir un pedido en proceso a la vez. Debes esperar a que tu pedido actual sea entregado y dejar tu valoración antes de hacer uno nuevo.</p>
            <button onClick={() => onNav("tracking")} className="inline-flex items-center gap-1.5 bg-[#179150] text-white px-3 py-1.5 rounded-xl text-xs font-black uppercase hover:bg-green-700 transition-colors" style={H7}>
              <Package size={11} /> Ver mi pedido activo
            </button>
          </div>
        </div>
      )}
      {/* Login required modal */}
      {showLoginModal && (
        <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <User size={28} className="text-amber-600" />
            </div>
            <h2 className="text-2xl uppercase text-foreground mb-2" style={H9}>Inicia Sesión para Continuar</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Necesitas iniciar sesión o crear una cuenta para procesar tu compra. Esto nos permite hacer seguimiento de tu pedido y mantenerte informado.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setShowLoginModal(false); onNav("login"); }}
                className="w-full py-3 bg-[#179150] text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <User size={16} /> Iniciar Sesión
              </button>
              <button
                onClick={() => { setShowLoginModal(false); onNav("register"); }}
                className="w-full py-3 border-2 border-[#179150] text-[#179150] rounded-xl font-semibold hover:bg-[#e0f5eb] transition-colors"
              >
                Crear una cuenta
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock insufficient modal */}
      {stockModal && (
        <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={26} className="text-amber-600" />
            </div>
            <h2 className="text-xl uppercase text-foreground text-center mb-1" style={H9}>Stock insuficiente en esta sede</h2>
            <p className="text-sm text-muted-foreground text-center mb-1">
              No hay suficientes unidades disponibles de{" "}
              <strong className="text-foreground">{stockModal.product.name}</strong>.
            </p>
            {stockModal.available > 0 && (
              <p className="text-xs text-[#179150] font-semibold text-center mb-3">
                Solo {stockModal.available} unidad{stockModal.available !== 1 ? "es" : ""} disponible{stockModal.available !== 1 ? "s" : ""} en esta sede.
              </p>
            )}
            {stockModal.similar.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground text-center mb-3">
                  Recomendamos reemplazar las unidades restantes con los siguientes productos:
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                  {stockModal.similar.map(p => (
                    <div key={p.id} className="flex-shrink-0 w-36 bg-muted rounded-xl overflow-hidden border border-border">
                      <div className="h-24 overflow-hidden">
                        <ProductBox product={p} size="sm" />
                      </div>
                      <div className="p-2">
                        <div className="text-[10px] font-black uppercase truncate" style={H9}>{p.name}</div>
                        <div className="text-[10px] text-muted-foreground">{p.brand}</div>
                        <div className="text-xs font-black text-[#179150] mt-1" style={H9}>{fmtUSD(effectivePrice(p))}</div>
                        <div className="text-[9px] text-muted-foreground">{getSedeStock(p)} disp.</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { clampCartToSede(); setStockModal(null); onNav("catalog"); }}
                className="w-full py-2.5 bg-[#50e9f8] text-[#006064] rounded-xl text-sm font-black uppercase hover:bg-[#2dd8e8] transition-colors"
                style={H7}
              >
                Ver productos similares
              </button>
              <button
                onClick={() => { clampCartToSede(); setStockModal(null); }}
                className="w-full py-2.5 border-2 border-border text-foreground rounded-xl text-sm font-black uppercase hover:bg-muted transition-colors"
                style={H7}
              >
                Seguir en el carrito
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-3xl uppercase text-foreground" style={H9}>Mi Carrito ({cartItems.length} ítem{cartItems.length !== 1 ? "s" : ""})</h1>
        </div>
        <button
          onClick={clearCart}
          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-semibold flex-shrink-0"
        >
          <Trash2 size={14} />
          <span className="hidden sm:inline">Vaciar carrito</span>
          <span className="sm:hidden">Vaciar</span>
        </button>
      </div>

      {hasRecipe && !hasControlledSubstance && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
          <AlertTriangle size={22} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-800 font-black text-base uppercase" style={H9}>Récipe Médico Requerido en este Pedido</div>
            <p className="text-red-700 text-sm mt-1 leading-relaxed">
              Uno o más productos requieren récipe. Podrás cargarlo en el siguiente paso del checkout.
            </p>
          </div>
        </div>
      )}

      {hasControlledSubstance && (
        <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-xl p-5 mb-6">
          <Shield size={22} className="text-purple-700 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-purple-900 font-black text-base uppercase" style={H9}>Sustancia Controlada - Solo Pickup</div>
            <p className="text-purple-800 text-sm mt-1 leading-relaxed">
              Tu carrito incluye productos psicotrópicos. Por regulación del MPPS, este pedido solo está disponible para retiro en tienda con récipe médico original en físico. El delivery no estará disponible.
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map(item => (
            <div key={item.product.id} className="bg-card border border-border rounded-2xl p-4 flex gap-4">
              {/* Thumbnail */}
              <div className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <ProductBox product={item.product} size="sm" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.product.brand}</div>
                    <div className="text-foreground text-base uppercase leading-tight" style={H9}>{item.product.name}</div>
                    <div className="text-xs text-muted-foreground">{item.product.presentation} {item.product.packSize}</div>
                  </div>
                  <button onClick={() => remove(item.product.id)} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-muted-foreground flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>

                {item.product.controlledSubstance ? (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Shield size={10} className="text-purple-700" />
                    <span className="text-[10px] text-purple-800 font-semibold">Uso Controlado</span>
                  </div>
                ) : item.product.needsRecipe ? (
                  <div className="flex items-center gap-1 mt-1.5">
                    <AlertTriangle size={10} className="text-red-500" />
                    <span className="text-[10px] text-red-600 font-semibold">Requiere Récipe</span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between mt-3">
                  {/* Qty controls */}
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button onClick={() => updateQty(item.product.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="w-9 text-center text-sm font-black" style={H9}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                  {/* Subtotal */}
                  <div className="text-right">
                    <div className="text-[#179150] text-lg leading-none" style={H9}>{fmtUSD(effectivePrice(item.product) * item.quantity)}</div>
                    {item.product.discount && item.product.discount > 0 && (
                      <div className="text-muted-foreground text-xs line-through">{fmtUSD(item.product.priceUSD * item.quantity)}</div>
                    )}
                    {!(item.product.discount && item.product.discount > 0) && (
                      <div className="text-muted-foreground text-xs">{fmtVES(effectivePrice(item.product) * item.quantity)}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-card border border-border rounded-2xl p-5 sticky top-28">
            <h3 className="text-foreground text-xl uppercase mb-4" style={H9}>Resumen del Pedido</h3>

            {/* Discount code */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  value={discountInput}
                  onChange={e => { setDiscountInput(e.target.value); setDiscountError(""); setDiscountSuccess(""); }}
                  onKeyDown={e => e.key === "Enter" && applyDiscount()}
                  placeholder="Código de descuento"
                  className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white uppercase"
                />
                <button onClick={applyDiscount}
                  className="px-4 py-2 bg-[#50e9f8] text-[#006064] rounded-xl text-sm font-black uppercase hover:bg-[#2dd8e8] transition-colors flex-shrink-0"
                  style={H7}>
                  Aplicar
                </button>
              </div>
              {discountError && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><X size={10} />{discountError}</p>}
              {discountSuccess && <p className="text-[#179150] text-xs mt-1 flex items-center gap-1"><Check size={10} />{discountSuccess}</p>}
              {!discountApplied && !discountError && (
                <p className="text-muted-foreground text-[10px] mt-1">Prueba: FHEC10 · SALUD15 · BIENVENIDO · FHEC2024</p>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold">{fmtUSD(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (16%)</span>
                <span className="font-semibold">{fmtUSD(ivaAmount)}</span>
              </div>
              {discountApplied > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-amber-600 font-semibold">Descuento ({discountApplied}%)</span>
                  <span className="text-amber-600 font-semibold">−{fmtUSD(discountAmount)}</span>
                </div>
              )}
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between">
                <span className="text-foreground font-black text-lg uppercase" style={H9}>Total</span>
                <div className="text-right">
                  <div className="text-[#179150] text-xl" style={H9}>{fmtUSD(total)}</div>
                  <div className="text-xs text-muted-foreground">{fmtVES(total)}</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleProcesar}
              className="w-full bg-[#50e9f8] text-[#006064] py-3 rounded-xl uppercase text-base flex items-center justify-center gap-2 hover:bg-[#2dd8e8] transition-colors"
              style={H7}
            >
              Procesar Compra <ChevronRight size={16} />
            </button>

            <button onClick={() => onNav("catalog")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-3 py-2">
              Seguir comprando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DeliverySelectPage ───────────────────────────────────────────────────────
function DeliverySelectPage({ cartItems, onNav, deliveryMode, setDeliveryMode, selectedSede, setSelectedSede, deliveryAddress, setDeliveryAddress, discountApplied, discountCode, setDiscountApplied, setDiscountCode, user, onConfirmOrder }: {
  cartItems: CartItem[]; onNav: (p: Page) => void;
  deliveryMode: "delivery"|"pickup"; setDeliveryMode: (m: "delivery"|"pickup") => void;
  selectedSede: string; setSelectedSede: (s: string) => void;
  deliveryAddress: string; setDeliveryAddress: (a: string) => void;
  discountApplied: number; discountCode: string;
  setDiscountApplied: (n: number) => void; setDiscountCode: (s: string) => void;
  user?: AuthUser | null;
  onConfirmOrder?: () => void;
}) {
  const hasControlled = cartItems.some(i => i.product.controlledSubstance);
  const hasRecipe     = cartItems.some(i => i.product.needsRecipe || i.product.controlledSubstance);
  const subtotal      = cartItems.reduce((s, i) => s + effectivePrice(i.product) * i.quantity, 0);
  const deliveryFee   = deliveryMode === "delivery" && !hasControlled ? 2.50 : 0;
  const discountAmt   = subtotal * discountApplied / 100;
  const ivaAmt        = subtotal * 0.16;
  const total         = subtotal + ivaAmt + deliveryFee - discountAmt;
  const activeSede    = SEDES.find(s => s.id === selectedSede) ?? SEDES[0];

  // Receiver data — autocomplete from user profile
  const userContact = user ? (DEMO_CONTACT[user.email] ?? { phone: "", address: "" }) : { phone: "", address: "" };
  const [receiverName,      setReceiverName]      = useState(user?.name ?? "");
  const [receiverPhone,     setReceiverPhone]     = useState(userContact.phone);
  const [receiverPhoneArea, setReceiverPhoneArea] = useState("0414");

  const [discInput, setDiscInput] = useState(discountCode);
  const [discErr,   setDiscErr]   = useState("");
  const [discOk,    setDiscOk]    = useState(discountApplied > 0 ? `${discountApplied}% aplicado` : "");

  const applyDisc = () => {
    const pct = DISCOUNT_CODES[discInput.trim().toUpperCase()];
    if (pct) { setDiscountApplied(pct); setDiscountCode(discInput.trim().toUpperCase()); setDiscOk(`¡${pct}% de descuento aplicado!`); setDiscErr(""); }
    else      { setDiscErr("Código no válido."); setDiscOk(""); setDiscountApplied(0); }
  };

  // Force pickup for psychotropics
  useEffect(() => {
    if (hasControlled && deliveryMode === "delivery") setDeliveryMode("pickup");
  }, [hasControlled, deliveryMode, setDeliveryMode]);

  const canPay = receiverName.trim().length > 0 &&
    (deliveryMode === "pickup" || (deliveryMode === "delivery" && deliveryAddress.trim().length > 0));

  // Google Maps embed URL for the selected sede
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(activeSede.address)}&output=embed&hl=es&zoom=16`;

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 pb-16 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNav("cart")} className="p-2 rounded-xl hover:bg-muted transition-colors"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-3xl uppercase text-foreground" style={H9}>Método de Entrega</h1>
          <p className="text-sm text-muted-foreground">Selecciona cómo recibirás tu pedido</p>
        </div>
      </div>

      {hasControlled && (
        <div className="flex items-start gap-3 bg-red-50 border-2 border-red-400 rounded-2xl p-4 mb-5">
          <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-800 font-bold text-sm uppercase mb-1" style={H9}>Obligatorio — Récipe Físico Original</div>
            <p className="text-red-700 text-sm leading-relaxed">Debe presentar el <strong>récipe médico físico original</strong> al momento de retirar. No se aceptan copias ni fotos.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left col: delivery options (3 cols) */}
        <div className="lg:col-span-3 space-y-5">

          {/* Modo de entrega */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="text-base uppercase mb-4" style={H9}>Tipo de Entrega</h3>
            <div className="grid grid-cols-2 gap-3">
              {(["delivery","pickup"] as const).map(mode => {
                const locked = mode === "delivery" && hasControlled;
                return (
                  <button key={mode} onClick={() => !locked && setDeliveryMode(mode)} disabled={locked}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                      ${locked ? "border-border bg-gray-50 opacity-40 cursor-not-allowed"
                        : deliveryMode === mode ? "border-[#179150] bg-[#e0f5eb]"
                        : "border-border hover:border-[#179150]/40"}`}>
                    {mode === "delivery"
                      ? <Bike size={22} className={deliveryMode === mode ? "text-[#006064]" : "text-muted-foreground"} />
                      : <Store size={22} className={deliveryMode === mode ? "text-[#006064]" : "text-muted-foreground"} />}
                    <span className={`text-sm font-black uppercase ${deliveryMode === mode ? "text-[#006064]" : "text-muted-foreground"}`} style={H9}>
                      {mode === "delivery" ? "Delivery" : "Pickup"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {mode === "delivery" ? (locked ? "No disponible — psicotrópico" : "$2.50 · 2–4 hrs") : "Gratis · Retiro en tienda"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── PICKUP: sede ya seleccionada + mapa ── */}
          {deliveryMode === "pickup" && (
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="p-5 pb-3">
                <h3 className="text-base uppercase mb-3" style={H9}>Sede de Retiro</h3>
                <div className="flex items-start gap-3 bg-[#f0fdf7] border border-[#a7f3d0] rounded-xl p-4">
                  <Store size={18} className="text-[#179150] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground" style={H9}>{activeSede.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{activeSede.address}</div>
                    <div className="text-xs text-[#179150] font-semibold mt-1">{activeSede.hours}</div>
                  </div>
                  {deliveryMode !== "pickup" && (
                  <a href={activeSede.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-[#179150] text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0 hover:bg-green-700 transition-colors">
                    <MapPin size={11} /> Ver en Maps
                  </a>
                  )}
                </div>
              </div>
              {/* Google Maps embed */}
              <div className="border-t border-border">
                <iframe
                  title={`Mapa ${activeSede.name}`}
                  src={mapsEmbedUrl}
                  width="100%" height="220"
                  style={{ border: 0, display: "block" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          )}

          {/* ── DELIVERY: dirección + mapa interactivo ── */}
          {deliveryMode === "delivery" && (
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="p-5 pb-3">
                <h3 className="text-base uppercase mb-3" style={H9}>Dirección de Entrega</h3>
                <div className="relative mb-3">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={deliveryAddress} onChange={e => {
                    setDeliveryAddress(e.target.value);
                    const a = e.target.value.toLowerCase();
                    setSelectedSede(a.includes("clinica") || a.includes("gumilla") ? "clinica" : "principal");
                  }}
                    placeholder="Ej: Calle 07, Manzana 04, Ciudad Guayana"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white" />
                </div>
                {deliveryAddress && (
                  <div className="bg-[#e0f5eb] border border-[#a7f3d0] rounded-xl p-3 text-xs mb-3">
                    <span className="font-semibold text-[#006064]">Sede asignada: </span>
                    <span className="text-muted-foreground">{activeSede.name}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin size={11} />Ajusta el pin en el mapa para indicar la ubicación exacta
                </p>
              </div>
              {/* Interactive map */}
              <div className="border-t border-border">
                <GpsMapWidget address={deliveryAddress || "Ciudad Guayana, Bolívar"} orderId="delivery-select" />
              </div>
            </div>
          )}

          {/* ── DATOS DE LA PERSONA RECEPTORA — siempre visible ── */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="text-base uppercase mb-1" style={H9}>Datos del Receptor</h3>
            <p className="text-xs text-muted-foreground mb-4">Persona que recibirá o retirará el pedido. Puedes cambiarlo si es otra persona.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Nombre completo</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={receiverName} onChange={e => setReceiverName(e.target.value)}
                    placeholder="Nombre de quien recibe el pedido"
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Número de teléfono</label>
                <div className="flex gap-2">
                  <select value={receiverPhoneArea} onChange={e => setReceiverPhoneArea(e.target.value)}
                    className="px-2 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white">
                    {VE_AREAS.map(a => <option key={a}>{a}</option>)}
                  </select>
                  <input value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)}
                    placeholder="000-0000"
                    className="flex-1 px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: discount + summary + CTA (2 cols) */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-2xl p-5 sticky top-24 space-y-4">
            <h3 className="text-lg uppercase" style={H9}>Resumen del pedido</h3>

            {/* Discount */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Código de Descuento</label>
              <div className="flex gap-2">
                <input value={discInput} onChange={e => { setDiscInput(e.target.value); setDiscErr(""); setDiscOk(""); }}
                  onKeyDown={e => e.key === "Enter" && applyDisc()}
                  placeholder="Ej: FHEC10"
                  className="flex-1 px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:border-[#179150] uppercase" />
                <button onClick={applyDisc}
                  className="px-3 py-2 bg-[#50e9f8] text-[#006064] rounded-xl text-xs font-black uppercase hover:bg-[#2dd8e8] transition-colors" style={H7}>
                  Aplicar
                </button>
              </div>
              {discErr && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><X size={10} />{discErr}</p>}
              {discOk  && <p className="text-[#179150] text-xs mt-1 flex items-center gap-1"><Check size={10} />{discOk}</p>}
              {!discountApplied && !discErr && <p className="text-[10px] text-muted-foreground mt-1">Prueba: FHEC10 · SALUD15</p>}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-border pt-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{fmtUSD(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">IVA (16%)</span><span>{fmtUSD(ivaAmt)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Entrega</span><span>{deliveryFee > 0 ? fmtUSD(deliveryFee) : "Gratis"}</span></div>
              {discountApplied > 0 && <div className="flex justify-between text-sm"><span className="text-amber-600 font-semibold">Descuento ({discountApplied}%)</span><span className="text-amber-600">−{fmtUSD(discountAmt)}</span></div>}
              <div className="flex justify-between font-black text-lg border-t border-border pt-2" style={H9}>
                <span>Total</span>
                <div className="text-right">
                  <div className="text-[#179150]">{fmtUSD(total)}</div>
                  <div className="text-[10px] text-muted-foreground font-normal">{fmtVES(total)}</div>
                </div>
              </div>
            </div>

            {!receiverName.trim() && (
              <p className="text-xs text-amber-600 flex items-center gap-1.5">
                <AlertTriangle size={12} />Completa el nombre del receptor para continuar
              </p>
            )}

            <button onClick={() => { onConfirmOrder?.(); onNav(hasRecipe ? "preCheckout" : "tracking"); }}
              disabled={!canPay}
              className="w-full py-3.5 bg-[#179150] text-white rounded-xl font-black uppercase flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={H7}>
              <Package size={16} /> Confirmar Pedido
            </button>
            {hasRecipe && <p className="text-[10px] text-muted-foreground text-center">Se solicitará validación médica antes del pago.</p>}
            <p className="text-[10px] text-muted-foreground text-center">Podrás completar el pago desde "Mi Pedido".</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PreCheckoutMedicalPage ───────────────────────────────────────────────────
// Step 2A (conditional): recipe upload + 3-min validation timer
function PreCheckoutMedicalPage({ cartItems, onNav }: { cartItems: CartItem[]; onNav: (p: Page) => void }) {
  const regulatedItems  = cartItems.filter(i => i.product.needsRecipe || i.product.controlledSubstance);
  const hasControlled   = cartItems.some(i => i.product.controlledSubstance);
  const [files, setFiles]   = useState<Record<number, File|null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(180); // 3 min
  const approved = countdown <= 0;

  useEffect(() => {
    if (regulatedItems.length === 0) { onNav("checkout"); }
  }, [regulatedItems.length, onNav]);

  useEffect(() => {
    if (!submitted || approved) return;
    const t = setInterval(() => setCountdown(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [submitted, approved]);

  const allUploaded = regulatedItems.every(i => i.product.controlledSubstance || files[i.product.id]);
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  // Submitted state: timer screen
  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 pb-16 mt-12 text-center">
        {/* Psychotropic persistent banner */}
        {hasControlled && (
          <div className="flex items-start gap-3 bg-red-50 border-2 border-red-400 rounded-2xl p-4 mb-6 text-left">
            <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm leading-relaxed">
              <strong className="font-black uppercase text-red-800" style={H9}>Obligatorio: </strong>
              Debe presentar el <strong>récipe médico físico original</strong> al momento de retirar su pedido en la farmacia.
            </p>
          </div>
        )}

        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${approved ? "bg-[#179150]" : "bg-amber-400"}`}>
          {approved ? <CheckCircle size={40} className="text-white" /> : <Clock size={38} className="text-white" />}
        </div>
        <h1 className="text-4xl uppercase text-foreground mb-2" style={H9}>
          {approved ? "Récipe Aprobado" : "Validando Récipe"}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          {approved
            ? "Nuestro equipo farmacéutico aprobó tu récipe. Puedes proceder al pago."
            : "Nuestro equipo farmacéutico está verificando tu récipe médico."}
        </p>
        {!approved && (
          <div className="bg-[#e0f5eb] border border-[#a7f3d0] rounded-xl px-4 py-3 mb-4 text-left">
            <div className="flex items-center gap-2 mb-1">
              <Bell size={14} className="text-[#179150]" />
              <span className="text-[#179150] font-bold text-sm">Serás notificado automáticamente</span>
            </div>
            <p className="text-gray-700 text-xs leading-relaxed">
              Recibirás un aviso en tu <strong>correo electrónico</strong> y por <strong>WhatsApp</strong> cuando tu récipe sea aprobado y puedas proceder al pago.
            </p>
          </div>
        )}

        {!approved && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <div className="text-amber-700 text-xs mb-2">Tiempo estimado de revisión</div>
            <div className="text-5xl font-black text-amber-600 tracking-widest mb-3" style={H9}>{fmt(countdown)}</div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${((180-countdown)/180)*100}%` }} />
            </div>
          </div>
        )}

        <button onClick={() => onNav("checkout")} disabled={!approved}
          className={`w-full py-3.5 rounded-xl font-black uppercase flex items-center justify-center gap-2 transition-all mb-3 ${approved ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          style={H7}>
          <CreditCard size={16} /> {approved ? "Proceder al Pago" : "Esperando aprobación…"}
        </button>
        <button onClick={() => onNav("home")} className="w-full border border-border py-2.5 rounded-xl text-sm font-semibold hover:bg-muted transition-colors">
          Volver al inicio
        </button>
      </div>
    );
  }

  // Upload form
  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 mt-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => onNav("deliverySelect")} className="p-2 rounded-xl hover:bg-muted transition-colors"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-2xl uppercase text-foreground" style={H9}>Validación Médica</h1>
          <p className="text-sm text-muted-foreground">Carga tu récipe digital para continuar</p>
        </div>
      </div>

      {/* Psychotropic banner — always visible */}
      {hasControlled && (
        <div className="flex items-start gap-3 bg-red-50 border-2 border-red-400 rounded-2xl p-4 mb-5">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-800 font-black text-sm uppercase mb-1" style={H9}>Obligatorio — Récipe Físico Original</div>
            <p className="text-red-700 text-sm leading-relaxed">Debe presentar el <strong>récipe médico físico original</strong> al momento de retirar su pedido en la farmacia. No se aceptan copias ni fotografías.</p>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {regulatedItems.map(item => {
          const isControlled = item.product.controlledSubstance;
          const uploaded = !!files[item.product.id]; // always require upload, even for controlled
          return (
            <div key={item.product.id} className={`bg-white border-2 rounded-2xl p-5 ${uploaded ? "border-[#179150]" : "border-border"}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-black text-sm uppercase" style={H9}>{item.product.name}</div>
                  <div className="text-xs text-muted-foreground">{item.product.brand}</div>
                </div>
                {uploaded
                  ? <span className="bg-[#179150] text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1" style={H9}><Check size={10} />OK</span>
                  : <span className="bg-red-100 text-red-700 text-xs font-black px-3 py-1 rounded-full uppercase" style={H9}>Requerido</span>
                }
              </div>

              {isControlled ? (
                <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={13} className="text-purple-700" />
                    <span className="text-purple-800 text-xs font-black uppercase" style={H9}>Psicotrópico Controlado</span>
                  </div>
                  <p className="text-purple-700 text-xs leading-relaxed">El récipe físico original se presentará en farmacia al momento del retiro. Carga aquí la foto del récipe como referencia.</p>
                </div>
              ) : (
                <div className="bg-[#f0fdf7] border border-[#a7f3d0] rounded-xl px-4 py-3">
                  <p className="text-[#006064] text-xs mb-3">Sube una foto o PDF del récipe médico. Debe ser legible y estar vigente (no mayor a 30 días).</p>
                </div>
              )}

              <label className={`mt-3 flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-3 cursor-pointer transition-all
                ${uploaded ? "border-[#179150] bg-[#e0f5eb]" : "border-border hover:border-[#179150]/40 bg-muted/20"}`}>
                <input type="file" accept="image/*,.pdf" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setFiles(p => ({ ...p, [item.product.id]: f })); }} />
                <Upload size={14} className={uploaded ? "text-[#179150]" : "text-muted-foreground"} />
                <span className={`text-xs font-black uppercase ${uploaded ? "text-[#179150]" : "text-muted-foreground"}`} style={H9}>
                  {files[item.product.id] ? files[item.product.id]!.name : (isControlled ? "Subir foto del récipe (referencia)" : "Subir Récipe Digital")}
                </span>
              </label>
            </div>
          );
        })}
      </div>

      <button onClick={() => { if (allUploaded) onNav("tracking"); }} disabled={!allUploaded}
        className={`w-full py-4 rounded-xl font-black uppercase flex items-center justify-center gap-2 transition-all ${allUploaded ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        style={H7}>
        <FileText size={18} /> Enviar a Auditoría Médica
      </button>
    </div>
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

function CheckoutPage({ cartItems, onNav, discountApplied = 0, deliveryMode = "delivery", selectedSede = "principal", onClearCart = () => {}, user = null }: {
  cartItems: CartItem[]; onNav: (p: Page) => void;
  discountApplied?: number; deliveryMode?: "delivery"|"pickup"; selectedSede?: string;
  onClearCart?: () => void;
  user?: AuthUser | null;
}) {
  const hasControlled = cartItems.some(i => i.product.controlledSubstance);
  const subtotal   = cartItems.reduce((s, i) => s + effectivePrice(i.product) * i.quantity, 0);
  const deliveryFee = deliveryMode === "delivery" && !hasControlled ? 2.50 : 0;
  const discAmt    = subtotal * discountApplied / 100;
  const ivaAmt     = +(subtotal * 0.16).toFixed(2);
  const total      = +(subtotal + ivaAmt + deliveryFee - discAmt).toFixed(2);

  type PayMethod = "pago_movil" | "transferencia";
  const [payMethod,     setPayMethod]     = useState<PayMethod>("pago_movil");
  const [payRef,        setPayRef]        = useState("");
  const [payPhone,      setPayPhone]      = useState("");
  const [payPhoneArea,  setPayPhoneArea]  = useState("0412");
  const [payBank,       setPayBank]       = useState(""); // banco emisor
  const [payAmt,        setPayAmt]        = useState("");
  const [copied,        setCopied]        = useState(false);
  const [timeLeft,      setTimeLeft]      = useState(900);
  const [timeExpired,   setTimeExpired]   = useState(false);

  // Billing — auto-filled from profile
  const [billName,      setBillName]      = useState(user?.name ?? "");
  const [billCedula,    setBillCedula]    = useState(user?.cedula ?? "");
  const [billDocType,   setBillDocType]   = useState("V");
  const [billPhone,     setBillPhone]     = useState("");
  const [billPhoneArea, setBillPhoneArea] = useState("0412");
  const [billAddress,   setBillAddress]   = useState("");

  // Validation error
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => {
      if (p <= 1) { setTimeExpired(true); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  const handleConfirm = () => {
    setConfirmError("");
    if (!payBank) { setConfirmError("El banco emisor es obligatorio."); return; }
    if (!payAmt)  { setConfirmError("Ingresa el monto transferido."); return; }
    if (!payRef)  { setConfirmError("Ingresa el número de referencia."); return; }

    const paidBs  = parseFloat(payAmt.replace(/,/g, ".")) || 0;
    const paidUSD = +(paidBs / VES_RATE).toFixed(2);
    const diff    = Math.abs(+(paidUSD - total).toFixed(2));
    const THRESH  = 0.10;

    if (paidUSD <= 0) { setConfirmError("Monto inválido."); return; }
    if (diff > THRESH) {
      setConfirmError(`El monto reportado (${fmtUSD(paidUSD)}) no coincide con el total del pedido (${fmtUSD(total)}). Debes transferir el monto exacto.`);
      return;
    }
    onClearCart();
    onNav("tracking");
  };

  // Timer expired screen
  if (timeExpired) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={38} className="text-red-500" />
        </div>
        <h2 className="text-3xl uppercase text-foreground mb-2" style={H9}>Tiempo Agotado</h2>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          El tiempo para completar el pago expiró. Tu pedido fue <strong>cancelado</strong> automáticamente.
        </p>
        <button onClick={() => onNav("home")} className="w-full bg-[#179150] text-white py-3.5 rounded-xl uppercase hover:bg-green-700 transition-colors" style={H7}>
          Volver al Inicio
        </button>
      </div>
    );
  }

  const inp  = "w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]";
  const inpL = "w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]";
  const lbl  = "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block";

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 pb-16 mt-6">
      <div className="flex items-center gap-3 mb-6">
        {/* Back → Mi Pedido because the order was already created before payment */}
        <button onClick={() => onNav("tracking")} className="p-2 rounded-xl hover:bg-muted transition-colors"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-3xl uppercase text-foreground" style={H9}>Método de Pago</h1>
          <p className="text-sm text-muted-foreground">Completa el pago para confirmar tu pedido</p>
        </div>
      </div>

      {hasControlled && (
        <div className="flex items-start gap-3 bg-red-50 border-2 border-red-400 rounded-2xl p-4 mb-5">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-800 font-black text-sm uppercase mb-1" style={H9}>Obligatorio — Récipe Físico Original</div>
            <p className="text-red-700 text-sm leading-relaxed">Recuerda presentar el <strong>récipe médico físico original</strong> al retirar en farmacia.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left — payment form */}
        <div className="lg:col-span-3 space-y-5">

          {/* Method selector — only digital methods */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="text-base uppercase mb-4" style={H9}>Selecciona el Método</h3>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: "pago_movil" as const,    label: "Pago Móvil",    icon: <Phone size={18} /> },
                { id: "transferencia" as const, label: "Transferencia", icon: <Building2 size={18} /> },
              ]).map(m => (
                <button key={m.id} onClick={() => { setPayMethod(m.id); setPayBank(""); setConfirmError(""); }}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                    ${payMethod===m.id ? "border-[#50e9f8] bg-[#e0f8fd]" : "border-border hover:border-[#179150]/40"}`}>
                  <span className={payMethod===m.id ? "text-[#006064]" : "text-muted-foreground"}>{m.icon}</span>
                  <span className={`text-xs font-black uppercase ${payMethod===m.id ? "text-[#006064]" : "text-muted-foreground"}`} style={H9}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold border
            ${timeLeft <= 120 ? "bg-red-50 border-red-200 text-red-800" : "bg-amber-50 border-amber-200 text-amber-900"}`}>
            <Clock size={14} className="flex-shrink-0" />
            Tiempo restante para completar el pago: <strong className="tabular-nums">{fmt(timeLeft)}</strong>
          </div>

          {/* Pago Móvil details */}
          {payMethod === "pago_movil" && (
            <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
              <h3 className="text-sm uppercase text-foreground mb-1" style={H9}>Datos para Pago Móvil</h3>
              <div className="bg-muted rounded-xl p-3 space-y-1.5">
                {[["Banco","Banesco"],["Teléfono","0424-100-2024"],["Cédula FHEC","J-12345678-9"]].map(([k,v])=>(
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-semibold">{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <label className={lbl}>Banco emisor <span className="text-red-500">*</span></label>
                <select value={payBank} onChange={e=>{setPayBank(e.target.value);setConfirmError("");}} className={inp+" bg-white"}>
                  <option value="">Seleccionar banco</option>
                  {VE_BANKS.map(b=><option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Teléfono emisor</label>
                <div className="flex gap-2">
                  <select value={payPhoneArea} onChange={e=>setPayPhoneArea(e.target.value)} className="px-2 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white">
                    {VE_AREAS.map(a=><option key={a}>{a}</option>)}
                  </select>
                  <input value={payPhone} onChange={e=>setPayPhone(e.target.value)} placeholder="000-0000" className={inp+" flex-1"}/>
                </div>
              </div>
              <div>
                <label className={lbl}>Monto (Bs.) <span className="text-red-500">*</span></label>
                <input value={payAmt} onChange={e=>{setPayAmt(e.target.value);setConfirmError("");}} placeholder={fmtVES(total).replace("Bs.S ","")} className={inp}/>
              </div>
              <div>
                <label className={lbl}>N° de referencia <span className="text-red-500">*</span></label>
                <input value={payRef} onChange={e=>{setPayRef(e.target.value);setConfirmError("");}} placeholder="Ej: 00291847362" className={inp}/>
              </div>
            </div>
          )}

          {/* Transferencia details */}
          {payMethod === "transferencia" && (
            <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
              <h3 className="text-sm uppercase text-foreground mb-1" style={H9}>Datos para Transferencia</h3>
              <div className="bg-muted rounded-xl p-4 space-y-2">
                {[["Banco","Banesco Universal, C.A."],["N° de cuenta","0134-0001-23-0001234567"],["RIF","J-12345678-9"],["Beneficiario","Farmahumana FHEC, C.A."]].map(([k,v])=>(
                  <div key={k} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{k}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{v}</span>
                      {k==="N° de cuenta"&&<button onClick={()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)}}>
                        {copied?<Check size={11} className="text-[#179150]"/>:<Copy size={11}/>}
                      </button>}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className={lbl}>Banco emisor <span className="text-red-500">*</span></label>
                <select value={payBank} onChange={e=>{setPayBank(e.target.value);setConfirmError("");}} className={inp+" bg-white"}>
                  <option value="">Seleccionar banco</option>
                  {VE_BANKS.map(b=><option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Monto transferido (Bs.) <span className="text-red-500">*</span></label>
                <input value={payAmt} onChange={e=>{setPayAmt(e.target.value);setConfirmError("");}} placeholder={fmtVES(total).replace("Bs.S ","")} className={inp}/>
              </div>
              <div>
                <label className={lbl}>N° de referencia <span className="text-red-500">*</span></label>
                <input value={payRef} onChange={e=>{setPayRef(e.target.value);setConfirmError("");}} placeholder="Ej: 00298374618" className={inp}/>
              </div>
            </div>
          )}

          {/* Billing card */}
          <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-base uppercase" style={H9}>Datos de Facturación</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Verifica o actualiza tus datos fiscales.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={lbl}>Nombre completo</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                  <input value={billName} onChange={e=>setBillName(e.target.value)} placeholder="Nombre completo" className={inpL}/>
                </div>
              </div>
              <div>
                <label className={lbl}>Tipo y N° de documento</label>
                <div className="flex gap-2">
                  <select value={billDocType} onChange={e=>setBillDocType(e.target.value)} className="px-2 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white">
                    {DOC_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                  <input value={billCedula} onChange={e=>setBillCedula(e.target.value)} placeholder="12345678" className={inp+" flex-1"}/>
                </div>
              </div>
              <div>
                <label className={lbl}>Número de teléfono</label>
                <div className="flex gap-2">
                  <select value={billPhoneArea} onChange={e=>setBillPhoneArea(e.target.value)} className="px-2 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white">
                    {VE_AREAS.map(a=><option key={a}>{a}</option>)}
                  </select>
                  <input value={billPhone} onChange={e=>setBillPhone(e.target.value)} placeholder="000-0000" className={inp+" flex-1"}/>
                </div>
              </div>
              <div className="col-span-2">
                <label className={lbl}>Dirección fiscal</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                  <input value={billAddress} onChange={e=>setBillAddress(e.target.value)} placeholder="Calle, N°, Ciudad" className={inpL}/>
                </div>
              </div>
            </div>
          </div>

          {confirmError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertTriangle size={14} />{confirmError}
            </div>
          )}

          <button onClick={handleConfirm}
            className="w-full py-4 bg-[#179150] text-white rounded-xl uppercase flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
            style={H7}>
            <CheckCircle size={18} /> Confirmar Pago
          </button>
        </div>

        {/* Right — order summary */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-2xl p-5 sticky top-24">
            <h3 className="text-base uppercase mb-3" style={H9}>Resumen del Pedido</h3>
            <div className="space-y-2.5 mb-4">
              {cartItems.map(item => (
                <div key={item.product.id} className="flex items-center gap-2.5">
                  <div className="w-9 h-11 rounded-lg overflow-hidden flex-shrink-0"><ProductBox product={item.product} size="sm"/></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black uppercase truncate" style={H9}>{item.product.name}</div>
                    <div className="text-[10px] text-muted-foreground">×{item.quantity}</div>
                  </div>
                  <div className="text-xs font-semibold text-[#179150]">{fmtUSD(effectivePrice(item.product)*item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{fmtUSD(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">IVA (16%)</span><span>{fmtUSD(ivaAmt)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{deliveryMode==="delivery"?"Delivery":"Pickup"}</span><span>{deliveryFee>0?fmtUSD(deliveryFee):"Gratis"}</span></div>
              {discountApplied>0&&<div className="flex justify-between text-sm"><span className="text-amber-600">Descuento</span><span className="text-amber-600">−{fmtUSD(discAmt)}</span></div>}
              <div className="flex justify-between font-black text-base border-t border-border pt-2" style={H9}>
                <span>Total del pedido</span>
                <div className="text-right">
                  <div className="text-[#179150]">{fmtUSD(total)}</div>
                  <div className="text-[10px] text-muted-foreground font-normal">{fmtVES(total)}</div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <AlertTriangle size={10} className="text-amber-500 flex-shrink-0" />
                El monto transferido debe coincidir exactamente con el total.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
function GpsMapWidget({ address, blocked, orderId, initialPin }: { address: string; blocked?: boolean; orderId: string; initialPin?: { x: number; y: number } }) {
  const [pinPos, setPinPos] = useState(initialPin ?? { x: 50, y: 42 });
  const [dragging, setDragging] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (blocked) return;
    setDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !mapRef.current || blocked) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    setPinPos({ x, y });
  };

  const handleMouseUp = () => setDragging(false);

  const mapZones = [
    { x: 0, y: 0, w: 100, h: 100, color: "#e8f4e8" },
    { x: 10, y: 15, w: 30, h: 8, color: "#d0e8d0", label: "Av. Principal" },
    { x: 40, y: 25, w: 45, h: 6, color: "#d0e8d0", label: "Calle 07" },
    { x: 15, y: 35, w: 20, h: 40, color: "#c8e0c8", label: "Zona Residencial" },
    { x: 55, y: 40, w: 30, h: 35, color: "#b8d4b8" },
    { x: 25, y: 60, w: 15, h: 15, color: "#a0c8a0" },
    { x: 70, y: 10, w: 20, h: 25, color: "#c0d8c0" },
    { x: 5, y: 70, w: 35, h: 12, color: "#d8e8d8" },
  ];

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      {blocked ? (
        <div className="bg-purple-50 border-b border-purple-200 px-3 py-2 flex items-center gap-2">
          <Lock size={13} className="text-purple-600 flex-shrink-0" />
          <span className="text-xs text-purple-800 font-semibold">Mapa bloqueado — psicotrópico controlado. Solo retiro presencial.</span>
        </div>
      ) : null}
      <div
        ref={mapRef}
        className={`relative w-full select-none ${blocked ? "opacity-40 pointer-events-none grayscale" : "cursor-crosshair"}`}
        style={{ height: 200 }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
          <rect width="100" height="100" fill="#e8f5e8" />
          <rect x="0" y="48" width="100" height="6" fill="#d4e8d4" />
          <rect x="30" y="0" width="6" height="100" fill="#d4e8d4" />
          <rect x="65" y="0" width="5" height="100" fill="#d4e8d4" />
          <rect x="0" y="75" width="100" height="5" fill="#d4e8d4" />
          <rect x="10" y="20" width="18" height="18" rx="1" fill="#c8dfc8" />
          <rect x="38" y="10" width="22" height="15" rx="1" fill="#c0d8c0" />
          <rect x="72" y="30" width="20" height="22" rx="1" fill="#c8dfc8" />
          <rect x="8" y="58" width="20" height="14" rx="1" fill="#c0d8c0" />
          <rect x="38" y="56" width="25" height="16" rx="1" fill="#c8dfc8" />
          <rect x="72" y="60" width="18" height="13" rx="1" fill="#c0d8c0" />
          <rect x="12" y="82" width="14" height="12" rx="1" fill="#c8dfc8" />
          <rect x="50" y="82" width="18" height="12" rx="1" fill="#c0d8c0" />
          <text x="2" y="52" fontSize="3" fill="#8aab8a" fontFamily="sans-serif">Av. Las Américas</text>
          <text x="31" y="47" fontSize="2.5" fill="#8aab8a" fontFamily="sans-serif" transform="rotate(90 34 40)">Calle 07</text>
          <text x="15" y="35" fontSize="2.5" fill="#7a9a7a" fontFamily="sans-serif">FHEC Principal</text>
        </svg>
        <div
          className="absolute z-10 transform -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing"
          style={{ left: `${pinPos.x}%`, top: `${pinPos.y}%` }}
          onMouseDown={handleMouseDown}
        >
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-red-500 border-3 border-white shadow-lg flex items-center justify-center text-white">
              <MapPin size={16} fill="white" />
            </div>
            <div className="w-2 h-2 bg-red-500 rounded-full mt-0.5 shadow" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 flex flex-col gap-1">
          <button className="w-7 h-7 bg-white border border-border rounded shadow text-foreground flex items-center justify-center text-sm font-bold hover:bg-gray-50">+</button>
          <button className="w-7 h-7 bg-white border border-border rounded shadow text-foreground flex items-center justify-center text-sm font-bold hover:bg-gray-50">−</button>
        </div>
      </div>
      {!blocked && (
        <div className="bg-white border-t border-border px-3 py-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex-1 truncate">{address}</span>
          <span className="text-[10px] text-[#006064] font-black bg-[#e0f5eb] px-2 py-0.5 rounded-full" style={H9}>
            {pinPos.x.toFixed(1)}°N, {pinPos.y.toFixed(1)}°W
          </span>
        </div>
      )}
    </div>
  );
}

// Deterministic pin position from address string
function addressToPin(addr: string): { x: number; y: number } {
  let h = 5381;
  for (let i = 0; i < addr.length; i++) h = ((h << 5) + h) + addr.charCodeAt(i);
  h = Math.abs(h);
  return { x: 15 + (h % 65), y: 15 + ((h >> 8) % 55) };
}

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

// ─── LoginPage ────────────────────────────────────────────────────────────────
function OtpInput({ length = 6, value, onChange }: { length?: number; value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, "").split("").slice(0, length);

  const handle = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.map((v, idx) => idx === i ? d : v).join("");
    onChange(next);
    if (d && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="flex gap-2.5 justify-center my-4">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handle(i, e)}
          onKeyDown={e => handleKey(i, e)}
          className={`w-12 h-14 text-center border-2 rounded-xl text-xl font-black transition-all focus:outline-none
            ${d ? "border-[#179150] bg-[#179150]/5 text-[#179150]" : "border-border bg-white text-foreground"}
            focus:border-[#179150] focus:shadow-[0_0_0_3px_rgba(23,145,80,0.15)]`}
          style={H9}
        />
      ))}
    </div>
  );
}

function LoginPage({ onLogin, onNav, initialView = "login" }: { onLogin: (u: AuthUser) => void; onNav: (p: Page) => void; initialView?: "login" | "register" }) {
  type View = "login" | "register";
  const [view, setView] = useState<View>(initialView);

  // ── Login state ──
  const [loginCred, setLoginCred] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);

  // ── Forgot password flow ──
  type FpStep = "idle" | "sendCode" | "enterCode" | "newPass" | "done";
  const [fpStep, setFpStep] = useState<FpStep>("idle");
  const [fpCred, setFpCred] = useState("");
  const [fpMode, setFpMode] = useState<"email" | "phone">("email");
  const [fpPhone, setFpPhone] = useState("");
  const [fpPhoneArea, setFpPhoneArea] = useState("0412");
  const [fpCode, setFpCode] = useState("");
  const [fpNewPass, setFpNewPass] = useState("");
  const [fpConfirmPass, setFpConfirmPass] = useState("");
  const [showFpPass, setShowFpPass] = useState(false);

  // ── Register state ──
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone,     setRegPhone]     = useState("");
  const [regPhoneArea, setRegPhoneArea] = useState("0412");
  const [regCedula,    setRegCedula]    = useState("");
  const [regDocType,   setRegDocType]   = useState("V");
  const [regAddress, setRegAddress] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirmPass, setRegConfirmPass] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptNotifications, setAcceptNotifications] = useState(false);

  // ── OTP flow: null=off, "email"=verifying email, "phone"=verifying phone ──
  type OtpPhase = null | "email" | "phone";
  const [otpPhase, setOtpPhase] = useState<OtpPhase>(null);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const DEMO_OTP = "123456";

  const hasContact = regEmail.trim() !== "";
  const canSubmitReg = acceptTerms && regName.trim() !== "" && hasContact && regPass.length > 0 && regPass === regConfirmPass;

  const handleLogin = () => {
    const found = DEMO_ACCOUNTS.find(a => (a.email === loginCred || a.cedula === loginCred) && a.password === loginPass);
    if (!found) { setLoginError("Credencial o contraseña incorrectos."); return; }
    setLoginError("");
    const { password: _, ...user } = found;
    onLogin(user);
    if (["auditor", "auxiliar", "superadmin"].includes(user.role)) {
      onNav("admin");
    } else if (user.role === "repartidor") {
      onNav("delivery");
    } else {
      onNav("home");
    }
  };

  const handleRegisterSubmit = () => {
    if (!canSubmitReg) return;
    setOtpValue("");
    setOtpError("");
    setOtpPhase("email");
  };

  const handleOtpVerify = () => {
    if (otpValue.replace(/ /g,"") !== DEMO_OTP) { setOtpError("Código incorrecto. Prueba: 123456"); return; }
    setOtpError("");
    setOtpPhase(null);
    setRegSuccess(true);
    setTimeout(() => {
      onLogin({ name: regName || "Nuevo Usuario", email: regEmail, role: "cliente", cedula: regCedula || "—" });
      onNav("home");
    }, 1500);
  };

  const fpCanSend = fpMode === "email" ? fpCred.trim().length > 0 : fpPhone.trim().length > 0;
  const fpCodeComplete = fpCode.length === 6;
  const fpPassMatch = fpNewPass.length >= 8 && fpNewPass === fpConfirmPass;

  const sharedInput = "w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] focus:shadow-[0_0_0_3px_rgba(80,233,248,0.12)] transition-all";
  const label = "text-sm font-semibold text-foreground mb-1.5 block";
  const linkBtn = "w-full text-center text-sm text-[#179150] hover:underline transition-colors";

  const otpTarget = otpPhase === "email" ? regEmail : regPhone;
  const otpChannelLabel = otpPhase === "email" ? "correo electrónico" : "número de teléfono";
  const otpChannelIcon = otpPhase === "email"
    ? <Mail size={26} className="text-[#179150]" />
    : <Phone size={26} className="text-[#179150]" />;

  return (
    <div className="min-h-screen bg-[#f0fdf7]">
      {/* ── OTP modal (registro) ── */}
      {otpPhase !== null && (
        <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#50e9f8]/15 flex items-center justify-center mx-auto mb-4">
              {otpChannelIcon}
            </div>
            <h3 className="text-2xl uppercase text-foreground text-center mb-1" style={H9}>
              Verifica tu {otpPhase === "email" ? "correo" : "teléfono"}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-1 leading-relaxed">
              Enviamos un código de 6 dígitos a:
            </p>
            <p className="text-sm font-black text-[#179150] text-center mb-5 truncate">{otpTarget}</p>

            {/* PIN inputs inline */}
            <div className="flex gap-2 justify-center mb-2">
              {[0,1,2,3,4,5].map(i => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otpValue[i] ?? ""}
                  onChange={e => {
                    const d = e.target.value.replace(/\D/g,"").slice(-1);
                    const arr = otpValue.padEnd(6," ").split("");
                    arr[i] = d;
                    const next = arr.join("").trimEnd();
                    setOtpValue(next);
                    if (d) { const el = document.querySelector<HTMLInputElement>(`#reg-otp-${i+1}`); el?.focus(); }
                  }}
                  onKeyDown={e => {
                    if (e.key === "Backspace" && !otpValue[i] && i > 0) {
                      document.querySelector<HTMLInputElement>(`#reg-otp-${i-1}`)?.focus();
                    }
                  }}
                  id={`reg-otp-${i}`}
                  className={`w-11 h-14 text-center text-xl font-black border-2 rounded-xl focus:outline-none transition-all
                    ${otpValue[i] ? "border-[#179150] bg-[#179150]/5 text-[#179150]" : "border-gray-300 bg-white text-foreground"}
                    focus:border-[#179150] focus:shadow-[0_0_0_3px_rgba(80,233,248,0.15)]`}
                  style={H9}
                />
              ))}
            </div>

            {otpError && (
              <p className="text-red-600 text-xs text-center mb-3 flex items-center justify-center gap-1">
                <AlertTriangle size={11}/>{otpError}
              </p>
            )}

            <button
              onClick={handleOtpVerify}
              disabled={otpValue.replace(/ /g,"").length < 6}
              className={`w-full py-3 rounded-xl uppercase transition-colors mb-3 mt-2
                ${otpValue.replace(/ /g,"").length >= 6 ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
              style={H7}
            >
              Verificar código
            </button>
            <button onClick={() => setOtpPhase(null)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancelar
            </button>
            <p className="text-xs text-muted-foreground text-center mt-3">Demo: el código es <strong>123456</strong></p>
          </div>
        </div>
      )}

      {/* Forgot password modal */}
      {fpStep !== "idle" && (
        <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
            {fpStep === "sendCode" && (
              <>
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Lock size={26} className="text-amber-600" />
                </div>
                <h3 className="text-2xl uppercase text-foreground text-center mb-2" style={H9}>Recuperar Contraseña</h3>
                <p className="text-sm text-muted-foreground text-center mb-5 leading-relaxed">
                  {fpMode === "email"
                    ? "Ingresa tu correo electrónico registrado. Te enviaremos un código de verificación."
                    : "Ingresa tu número telefónico registrado. Te enviaremos un código de verificación."}
                </p>

                {fpMode === "email" ? (
                  <div className="mb-2">
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={fpCred}
                        onChange={e => setFpCred(e.target.value)}
                        placeholder="tu@correo.com"
                        type="email"
                        className={sharedInput}
                      />
                    </div>
                    <button
                      onClick={() => { setFpMode("phone"); setFpCred(""); }}
                      className="mt-2 text-xs text-[#179150] hover:underline transition-colors w-full text-left"
                    >
                      Ingresar número de teléfono
                    </button>
                  </div>
                ) : (
                  <div className="mb-2">
                    <div className="flex gap-2">
                      <select value={fpPhoneArea} onChange={e => setFpPhoneArea(e.target.value)} className="px-2 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white">
                        {VE_AREAS.map(a => <option key={a}>{a}</option>)}
                      </select>
                      <input
                        value={fpPhone}
                        onChange={e => setFpPhone(e.target.value)}
                        placeholder="000-0000"
                        type="tel"
                        className={sharedInput + " flex-1"}
                      />
                    </div>
                    <button
                      onClick={() => { setFpMode("email"); setFpPhone(""); }}
                      className="mt-2 text-xs text-[#179150] hover:underline transition-colors w-full text-left"
                    >
                      Usar correo electrónico
                    </button>
                  </div>
                )}

                <button
                  onClick={() => { if (fpCanSend) setFpStep("enterCode"); }}
                  disabled={!fpCanSend}
                  className={`w-full py-3 rounded-xl uppercase mb-3 mt-2 transition-colors
                    ${fpCanSend ? "bg-[#50e9f8] text-[#006064] hover:bg-[#2dd8e8]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                  style={H7}
                >
                  Enviar Código
                </button>
                <button onClick={() => { setFpStep("idle"); setFpMode("email"); }} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
              </>
            )}

            {fpStep === "enterCode" && (
              <>
                <div className="w-14 h-14 rounded-full bg-[#50e9f8]/15 flex items-center justify-center mx-auto mb-4">
                  <Bell size={26} className="text-[#179150]" />
                </div>
                <h3 className="text-2xl uppercase text-foreground text-center mb-2" style={H9}>Ingresa el Código</h3>
                <p className="text-sm text-muted-foreground text-center mb-1 leading-relaxed">
                  Código enviado a <strong className="text-foreground">{fpMode === "email" ? fpCred : `${fpPhoneArea}-${fpPhone}`}</strong>
                </p>

                {/* PIN inputs inline */}
                <div className="flex gap-2 justify-center my-5">
                  {[0,1,2,3,4,5].map(i => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={fpCode[i] ?? ""}
                      onChange={e => {
                        const d = e.target.value.replace(/\D/g,"").slice(-1);
                        const arr = fpCode.padEnd(6," ").split("");
                        arr[i] = d;
                        setFpCode(arr.join("").trimEnd());
                        if (d) { document.querySelector<HTMLInputElement>(`#fp-otp-${i+1}`)?.focus(); }
                      }}
                      onKeyDown={e => {
                        if (e.key === "Backspace" && !fpCode[i] && i > 0) {
                          document.querySelector<HTMLInputElement>(`#fp-otp-${i-1}`)?.focus();
                        }
                      }}
                      id={`fp-otp-${i}`}
                      className={`w-11 h-14 text-center text-xl font-black border-2 rounded-xl focus:outline-none transition-all
                        ${fpCode[i] && fpCode[i] !== " " ? "border-[#179150] bg-[#179150]/5 text-[#179150]" : "border-gray-300 bg-white text-foreground"}
                        focus:border-[#179150] focus:shadow-[0_0_0_3px_rgba(80,233,248,0.15)]`}
                      style={H9}
                    />
                  ))}
                </div>

                <button
                  onClick={() => { if (fpCode.replace(/ /g,"").length === 6) setFpStep("newPass"); }}
                  disabled={fpCode.replace(/ /g,"").length < 6}
                  className={`w-full py-3 rounded-xl uppercase mb-3 transition-colors
                    ${fpCode.replace(/ /g,"").length === 6 ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                  style={H7}
                >
                  Verificar
                </button>
                <button onClick={() => setFpStep("sendCode")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft size={11} className="inline mr-1" />Volver
                </button>
                <p className="text-xs text-muted-foreground text-center mt-2">Demo: usa cualquier 6 dígitos</p>
              </>
            )}

            {fpStep === "newPass" && (
              <>
                <div className="w-14 h-14 rounded-full bg-[#179150]/10 flex items-center justify-center mx-auto mb-4">
                  <Shield size={26} className="text-[#179150]" />
                </div>
                <h3 className="text-2xl uppercase text-foreground text-center mb-4" style={H9}>Nueva Contraseña</h3>
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showFpPass ? "text" : "password"}
                      value={fpNewPass}
                      onChange={e => setFpNewPass(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full pl-10 pr-10 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]"
                    />
                    <button type="button" onClick={() => setShowFpPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showFpPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showFpPass ? "text" : "password"}
                      value={fpConfirmPass}
                      onChange={e => setFpConfirmPass(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]"
                    />
                  </div>
                  {fpNewPass && fpConfirmPass && !fpPassMatch && (
                    <p className="text-red-500 text-xs">Las contraseñas no coinciden o son muy cortas.</p>
                  )}
                </div>
                <button
                  onClick={() => { if (fpPassMatch) setFpStep("done"); }}
                  disabled={!fpPassMatch}
                  className={`w-full py-3 rounded-xl uppercase mb-3 transition-colors
                    ${fpPassMatch ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                  style={H7}
                >
                  Guardar Contraseña
                </button>
              </>
            )}

            {fpStep === "done" && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-[#179150] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-white" />
                </div>
                <h3 className="text-2xl uppercase text-foreground mb-2" style={H9}>¡Listo!</h3>
                <p className="text-sm text-muted-foreground mb-6">Tu contraseña fue actualizada exitosamente.</p>
                <button
                  onClick={() => { setFpStep("idle"); setFpCred(""); setFpCode(""); setFpNewPass(""); setFpConfirmPass(""); }}
                  className="w-full py-3 bg-[#50e9f8] text-[#006064] rounded-xl uppercase hover:bg-[#2dd8e8] transition-colors"
                  style={H7}
                >
                  Ir a Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden px-8 py-8" style={{ background: "linear-gradient(135deg, #50e9f8 0%, #179150 100%)" }}>
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <img src={logoFarmahumana} alt="Farmahumana" className="w-14 h-14 object-contain drop-shadow-lg" />
          <div>
            <div className="text-white text-4xl leading-none uppercase" style={H9}>Farmahumana</div>
            <div className="text-white/80 text-sm mt-1">Tu salud, nuestra prioridad</div>
          </div>
        </div>
        <button onClick={() => onNav("home")} className="absolute top-4 right-5 text-white/70 hover:text-white text-xs flex items-center gap-1 transition-colors">
          <ArrowLeft size={13} /> Volver a la tienda
        </button>
      </div>

      <div className="max-w-md mx-auto px-4 py-10">

        {/* ══ LOGIN VIEW ══ */}
        {view === "login" && (
          <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
            <h2 className="text-2xl text-foreground mb-1" style={H9}>Iniciar Sesión</h2>
            <p className="text-sm text-muted-foreground mb-6">Ingresa tu correo electrónico y contraseña.</p>

            <div className="space-y-4">
              <div>
                <label className={label}>Correo electrónico</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={loginCred}
                    onChange={e => { setLoginCred(e.target.value); setLoginError(""); }}
                    placeholder="tu@correo.com"
                    type="email"
                    className={sharedInput}
                  />
                </div>
              </div>
              <div>
                <label className={label}>Contraseña</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showLoginPass ? "text" : "password"}
                    value={loginPass}
                    onChange={e => { setLoginPass(e.target.value); setLoginError(""); }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] focus:shadow-[0_0_0_3px_rgba(80,233,248,0.12)] transition-all"
                  />
                  <button type="button" onClick={() => setShowLoginPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showLoginPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <AlertTriangle size={14} />{loginError}
                </div>
              )}

              <button onClick={handleLogin} className="w-full py-3 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors" style={H7}>
                Ingresar
              </button>

              {/* Crear una cuenta — identical style to ¿Olvidaste tu contraseña? */}
              <button onClick={() => setView("register")} className={linkBtn}>
                Crear una cuenta
              </button>

              <button onClick={() => setFpStep("sendCode")} className={linkBtn}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Demo hint */}
            <div className="mt-6 bg-[#e0f5eb] border border-[#a7f3d0] rounded-xl p-4">
              <div className="text-xs font-black uppercase text-[#006064] mb-2" style={H9}>Cuentas demo</div>
              <div className="space-y-1">
                {DEMO_ACCOUNTS.map(a => (
                  <button
                    key={a.email}
                    onClick={() => { setLoginCred(a.email); setLoginPass(a.password); setLoginError(""); }}
                    className="w-full text-left flex items-center justify-between text-xs px-2 py-1.5 rounded-lg hover:bg-[#e0f5eb] transition-colors"
                  >
                    <span className="text-foreground font-semibold">{a.name}</span>
                    <span className={`font-black uppercase px-2 py-0.5 rounded-full text-[10px]
                      ${a.role === "superadmin" ? "bg-[#006064] text-white" :
                        a.role === "repartidor" ? "bg-[#50e9f8] text-[#006064]" :
                        a.role === "cliente" ? "bg-green-100 text-[#179150]" :
                        a.role === "auditor" ? "bg-gray-200 text-gray-700" :
                        "bg-amber-100 text-amber-800"}`} style={H9}>
                      {a.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ REGISTER VIEW ══ */}
        {view === "register" && (
          <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
            <h2 className="text-2xl text-foreground mb-1" style={H9}>Registrar Cuenta</h2>
            <p className="text-sm text-muted-foreground mb-6">Crea tu cuenta en segundos.</p>

            {regSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-16 h-16 bg-[#179150] rounded-full flex items-center justify-center">
                  <CheckCircle size={30} className="text-white" />
                </div>
                <div className="text-xl uppercase text-foreground" style={H9}>¡Registro exitoso!</div>
                <div className="text-sm text-muted-foreground text-center">Redirigiendo a la tienda…</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className={label}>Nombre Completo <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Ej: María González" className={sharedInput} />
                  </div>
                </div>

                <div>
                  <label className={label}>Correo Electrónico <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="tu@correo.com" type="email" className={sharedInput} />
                  </div>
                </div>

                <div>
                  <label className={label}>
                    Cédula de Identidad
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Opcional</span>
                  </label>
                  <div className="flex gap-2">
                    <select value={regDocType} onChange={e => setRegDocType(e.target.value)} className="px-2 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-background">
                      {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <input value={regCedula} onChange={e => setRegCedula(e.target.value)} placeholder="12345678" className={sharedInput + " flex-1"} />
                  </div>
                </div>

                <div>
                  <label className={label}>
                    Dirección Fiscal
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Opcional</span>
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={regAddress} onChange={e => setRegAddress(e.target.value)} placeholder="Calle, N°, Ciudad" className={sharedInput} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={label}>Contraseña <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type={showRegPass ? "text" : "password"}
                        value={regPass}
                        onChange={e => setRegPass(e.target.value)}
                        placeholder="Mín. 8 car."
                        className="w-full pl-10 pr-10 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]"
                      />
                      <button type="button" onClick={() => setShowRegPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showRegPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={label}>Confirmar <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type={showRegConfirm ? "text" : "password"}
                        value={regConfirmPass}
                        onChange={e => setRegConfirmPass(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:outline-none transition-all
                          ${regConfirmPass && regConfirmPass !== regPass ? "border-red-400 focus:border-red-400" : "border-border focus:border-[#179150]"}`}
                      />
                      <button type="button" onClick={() => setShowRegConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showRegConfirm ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                  </div>
                </div>
                {regConfirmPass && regConfirmPass !== regPass && (
                  <p className="text-red-500 text-xs -mt-1">Las contraseñas no coinciden.</p>
                )}

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <div
                    onClick={() => setAcceptTerms(v => !v)}
                    className={`w-4 h-4 mt-0.5 rounded flex-shrink-0 border transition-all flex items-center justify-center cursor-pointer
                      ${acceptTerms ? "bg-[#179150] border-[#179150]" : "border-border bg-white hover:border-[#179150]"}`}
                  >
                    {acceptTerms && <Check size={10} className="text-white" />}
                  </div>
                  <span className="text-sm text-foreground">
                    Acepto los <span className="text-[#179150] hover:underline cursor-pointer">términos y condiciones</span> y la <span className="text-[#179150] hover:underline cursor-pointer">política de privacidad</span> <span className="text-red-500">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <div
                    onClick={() => setAcceptNotifications(v => !v)}
                    className={`w-4 h-4 mt-0.5 rounded flex-shrink-0 border transition-all flex items-center justify-center cursor-pointer
                      ${acceptNotifications ? "bg-[#179150] border-[#179150]" : "border-border bg-white hover:border-[#179150]"}`}
                  >
                    {acceptNotifications && <Check size={10} className="text-white" />}
                  </div>
                  <span className="text-sm text-foreground">
                    Suscripción voluntaria a notificaciones promocionales <span className="text-muted-foreground">(SMS/Correo)</span>
                    <span className="ml-1.5 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Opcional</span>
                  </span>
                </label>

                <button
                  onClick={handleRegisterSubmit}
                  disabled={!canSubmitReg}
                  className={`w-full py-3 rounded-xl transition-colors
                    ${canSubmitReg ? "bg-[#50e9f8] text-[#006064] hover:bg-[#2dd8e8]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                  style={H7}
                >
                  Crear Cuenta
                </button>

                <button onClick={() => setView("login")} className={linkBtn}>
                  ¿Ya tienes cuenta? Iniciar sesión
                </button>
              </div>
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

// ─── ProfilePage ─────────────────────────────────────────────────────────────
const DEMO_ORDERS = getLegacyOrderHistoryViewModels();

// Per-account demo contact data keyed by email
const DEMO_CONTACT: Record<string, { phone: string; address: string }> = {
  "cliente@fhec.com":    { phone: "+58 414-1234567", address: "Av. Las Américas, Edif. Torre Pte., Piso 3, Pto. Ordaz" },
  "repartidor@fhec.com": { phone: "+58 416-8765432", address: "Urb. Villa Asia, Calle 15, Casa 8, Pto. Ordaz" },
  "auxiliar@fhec.com":   { phone: "+58 412-1122334", address: "Calle Caroní, Res. La Llovizna, Apto 2B, Pto. Ordaz" },
  "auditor@fhec.com":    { phone: "+58 414-3344556", address: "Av. Guayana, Centro Cívico, Piso 7, Pto. Ordaz" },
  "admin@fhec.com":      { phone: "+58 424-5566778", address: "Urb. Chilemex, Calle Principal, Casa 1, Pto. Ordaz" },
};

interface RefundRequest {
  id: string; method: string; bank: string; reference: string; amount: string; status: "Pendiente" | "En revisión" | "Aprobado" | "Rechazado";
}

function ProfilePage({ user, onNav, onLogout }: { user: AuthUser; onNav: (p: Page) => void; onLogout: () => void }) {
  const defaultContact = DEMO_CONTACT[user.email] ?? { phone: "+58 412-0000000", address: "Ciudad Guayana, Bolívar" };

  // ── Personal info (no OTP needed) ──
  const [editingInfo, setEditingInfo] = useState(false);
  const [name,       setName]       = useState(user.name);
  const [cedula,     setCedula]     = useState(user.cedula.replace(/^[A-Z]-?/, ""));
  const [profDocType, setProfDocType] = useState(user.cedula.split("-")[0] || "V");
  const [address,    setAddress]    = useState(defaultContact.address);
  const [savedMsg,   setSavedMsg]   = useState(false);

  const handleSaveInfo = () => {
    setEditingInfo(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  // ── Email change with inline OTP ──
  const [editingEmail,   setEditingEmail]   = useState(false);
  const [currentEmail,   setCurrentEmail]   = useState(user.email);
  const [newEmail,       setNewEmail]       = useState("");
  const [emailOtpSent,   setEmailOtpSent]   = useState(false);
  const [emailOtpValue,  setEmailOtpValue]  = useState("");
  const [emailOtpError,  setEmailOtpError]  = useState("");

  const handleSendEmailOtp = () => { setEmailOtpSent(true); setEmailOtpValue(""); setEmailOtpError(""); };
  const handleVerifyEmailOtp = () => {
    if (emailOtpValue.replace(/ /g,"") !== "123456") { setEmailOtpError("Código incorrecto. Prueba: 123456"); return; }
    setCurrentEmail(newEmail);
    setEditingEmail(false); setEmailOtpSent(false); setNewEmail(""); setEmailOtpValue(""); setEmailOtpError("");
    setSavedMsg(true); setTimeout(() => setSavedMsg(false), 2500);
  };

  // ── Phone change with inline OTP ──
  const [editingPhone,   setEditingPhone]   = useState(false);
  const [currentPhone,   setCurrentPhone]   = useState(defaultContact.phone);
  const [newPhoneArea,   setNewPhoneArea]   = useState("0414");
  const [newPhoneNum,    setNewPhoneNum]    = useState("");
  const [phoneOtpSent,   setPhoneOtpSent]   = useState(false);
  const [phoneOtpValue,  setPhoneOtpValue]  = useState("");
  const [phoneOtpError,  setPhoneOtpError]  = useState("");

  const handleSendPhoneOtp = () => { setPhoneOtpSent(true); setPhoneOtpValue(""); setPhoneOtpError(""); };
  const handleVerifyPhoneOtp = () => {
    if (phoneOtpValue.replace(/ /g,"") !== "123456") { setPhoneOtpError("Código incorrecto. Prueba: 123456"); return; }
    setCurrentPhone(`${newPhoneArea}-${newPhoneNum}`);
    setEditingPhone(false); setPhoneOtpSent(false); setNewPhoneNum(""); setPhoneOtpValue(""); setPhoneOtpError("");
    setSavedMsg(true); setTimeout(() => setSavedMsg(false), 2500);
  };

  // ── Notifications ──
  const [notifPromo,       setNotifPromo]       = useState(true);
  const [notifPromoSms,    setNotifPromoSms]    = useState(false);
  const [notifPromoEmail,  setNotifPromoEmail]  = useState(true);
  const [notifOrders,      setNotifOrders]      = useState(true);
  const [notifOrdersSms,   setNotifOrdersSms]   = useState(true);
  const [notifOrdersEmail, setNotifOrdersEmail] = useState(true);

  // ── Change password ──
  const [curPass,     setCurPass]     = useState("");
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCur,     setShowCur]     = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [passMsg,     setPassMsg]     = useState<{type:"ok"|"err"; text:string} | null>(null);

  const handlePassChange = () => {
    if (!curPass || newPass.length < 8 || newPass !== confirmPass) {
      setPassMsg({ type: "err", text: "Verifica los campos: la nueva contraseña debe tener al menos 8 caracteres y coincidir." });
      return;
    }
    setPassMsg({ type: "ok", text: "Contraseña actualizada correctamente." });
    setCurPass(""); setNewPass(""); setConfirmPass("");
    setTimeout(() => setPassMsg(null), 3000);
  };

  // ── Order history ──
  const [orderPage, setOrderPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const ordersPerPage = 5;
  const totalPages = Math.ceil(DEMO_ORDERS.length / ordersPerPage);
  const paginatedOrders = DEMO_ORDERS.slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage);

  const statusColor = (s: string) => {
    if (s === "Entregado") return "bg-[#179150] text-white";
    if (s === "Cancelado") return "bg-red-500 text-white";
    if (s === "En camino") return "bg-[#50e9f8] text-[#006064]";
    return "bg-amber-400 text-[#006064]";
  };

  const fieldClass = `w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-all focus:outline-none
    ${editingInfo ? "border-[#50e9f8] bg-white focus:shadow-[0_0_0_3px_rgba(80,233,248,0.12)]" : "border-border bg-[#f8fafc] text-foreground cursor-default"}`;

  const userQrData = `FHEC-USER-${user.cedula}`;
  const [showQrModal, setShowQrModal] = useState(false);

  const isCliente = user.role === "cliente";
  const [profileTab, setProfileTab] = useState<"info" | "notifications" | "security" | "orders" | "refunds" | "coupons">("info");

  // Datos mock de cupones del cliente (solo lectura)
  const USER_COUPONS = getLegacyProfileCouponViewModels();

  // ── Refund requests ──
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>(getLegacyProfileRefundViewModels());
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundStep, setRefundStep]   = useState<1 | 2>(1);

  // Refund form — Paso 1 (transacción)
  const [rfMethod, setRfMethod]       = useState("Pago Móvil");
  const [rfBank, setRfBank]           = useState("");
  const [rfAreaCode, setRfAreaCode]   = useState("0414");
  const [rfPhone, setRfPhone]         = useState("");
  const [rfRef, setRfRef]             = useState("");
  const [rfAmount, setRfAmount]       = useState("");
  const [rfDate, setRfDate]           = useState("");

  // Refund form — Paso 2 (datos de reembolso)
  const [rbMethod, setRbMethod]       = useState("Pago Móvil");
  const [rbBank, setRbBank]           = useState("");
  const [rbAreaCode, setRbAreaCode]   = useState("0414");
  const [rbPhone, setRbPhone]         = useState("");
  const [rbDocType, setRbDocType]     = useState("V");
  const [rbDoc, setRbDoc]             = useState("");
  const [rbHolder, setRbHolder]       = useState("");
  const [rbAccount, setRbAccount]     = useState("");

  const openRefundModal = () => { setRefundStep(1); setShowRefundModal(true); };
  const closeRefundModal = () => { setShowRefundModal(false); setRefundStep(1); };

  const VENEZUELA_BANKS = [
    "Banco de Venezuela", "Banesco", "Mercantil", "BBVA Provincial", "Banco del Tesoro",
    "BNC", "Banplus", "Bicentenario", "Bancamiga", "Banco Exterior", "Otro",
  ];

  const handleSubmitRefund = () => {
    const newReq: RefundRequest = {
      id: `REM-${String(refundRequests.length + 1).padStart(3, "0")}`,
      method: rfMethod, bank: rfBank, reference: rfRef,
      amount: rfAmount ? `$${rfAmount}` : "—", status: "Pendiente",
    };
    setRefundRequests(prev => [newReq, ...prev]);
    closeRefundModal();
    setRfMethod("Pago Móvil"); setRfBank(""); setRfAreaCode("0414"); setRfPhone("");
    setRfRef(""); setRfAmount(""); setRfDate("");
    setRbMethod("Pago Móvil"); setRbBank(""); setRbAreaCode("0414"); setRbPhone("");
    setRbDocType("V"); setRbDoc(""); setRbHolder(""); setRbAccount("");
    toast.success("Solicitud enviada", { description: "Tu solicitud de reembolso fue enviada correctamente." });
  };

  const refundStatusColor = (s: string) => {
    if (s === "Aprobado") return "bg-[#179150] text-white";
    if (s === "Rechazado") return "bg-red-500 text-white";
    if (s === "En revisión") return "bg-[#50e9f8] text-[#006064]";
    return "bg-amber-400 text-[#006064]";
  };

  return (
    <div className="min-h-screen bg-[#f0fdf7]">
      {/* Dashboard header */}
      <div className="px-4 lg:px-8 py-5" style={{ background: "linear-gradient(135deg, #006064 0%, #179150 100%)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#50e9f8] flex items-center justify-center flex-shrink-0 shadow-lg">
              <User size={26} className="text-[#006064]" />
            </div>
            <div>
              <div className="text-white/60 text-[10px] uppercase tracking-widest font-semibold">Mi Perfil</div>
              <div className="text-white text-2xl uppercase leading-none" style={H9}>{user.name}</div>
              <div className="text-white/60 text-xs mt-0.5">{user.email} · {user.cedula}</div>
            </div>
          </div>
          <button onClick={() => onNav("home")} className="hidden sm:flex items-center gap-1.5 text-white/60 hover:text-white text-xs transition-colors"><ArrowLeft size={13} /> Inicio</button>
        </div>
      </div>



      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {savedMsg && (
          <div className="flex items-center gap-2 bg-[#179150]/10 border border-[#179150]/30 rounded-xl px-4 py-3 text-[#179150] text-sm font-semibold mb-4">
            <CheckCircle size={15} /> Información guardada correctamente.
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* QR fullscreen modal */}
            {showQrModal && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-6" onClick={() => setShowQrModal(false)}>
                <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center max-w-sm w-full" onClick={e => e.stopPropagation()}>
                  <div className="text-xs font-black uppercase text-muted-foreground mb-4" style={H9}>Código QR · ID de Usuario</div>
                  <div className="bg-white border-4 border-[#50e9f8] rounded-2xl p-4 shadow-md mb-4">
                    <img src={codigoQrUsuario} alt="Código QR" className="w-64 h-64 object-contain" />
                  </div>
                  <div className="text-base font-black text-foreground text-center mb-1" style={H9}>{userQrData}</div>
                  <div className="text-xs text-muted-foreground text-center mb-5">Presenta este QR en farmacia para identificarte</div>
                  <button onClick={() => setShowQrModal(false)} className="w-full py-3 bg-[#006064] text-white rounded-xl font-black uppercase hover:bg-[#004d52] transition-colors" style={H7}>Cerrar</button>
                </div>
              </div>
            )}

            {/* QR Card */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-5 flex flex-col items-center">
              <div className="text-xs font-black uppercase text-muted-foreground mb-3" style={H9}>Código QR · ID de Usuario</div>
              <button onClick={() => setShowQrModal(true)} className="bg-white border-4 border-[#50e9f8] rounded-2xl p-3 shadow-md mb-3 hover:border-[#179150] transition-colors cursor-zoom-in" title="Clic para ampliar">
                <img src={codigoQrUsuario} alt="Código QR de usuario" className="w-52 h-52 object-contain" />
              </button>
              <div className="text-sm font-black text-foreground text-center" style={H9}>{userQrData}</div>
              <div className="text-xs text-muted-foreground mt-1 text-center">Toca para ampliar · Presenta en farmacia</div>
            </div>

            {/* Nav tabs */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              {([
                { id: "info",          label: "Información Personal",   icon: <User size={15} />,          show: true },
                { id: "notifications", label: "Notificaciones",         icon: <Bell size={15} />,           show: true },
                { id: "security",      label: "Seguridad",              icon: <Shield size={15} />,        show: true },
                { id: "orders",        label: "Historial de Pedidos",   icon: <ClipboardList size={15} />, show: true },
                { id: "refunds",       label: "Solicitudes de Reembolso", icon: <CreditCard size={15} />,  show: true },
                { id: "coupons",       label: "Cupones",                  icon: <Star size={15} />,          show: true },
              ] as const).filter(tab => tab.show).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setProfileTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-colors border-b border-border last:border-0
                    ${profileTab === tab.id ? "bg-[#e0f5eb] text-[#006064] font-black" : "text-muted-foreground hover:bg-muted"}`}
                  style={H9}
                >
                  <span className={profileTab === tab.id ? "text-[#006064]" : "text-muted-foreground"}>{tab.icon}</span>
                  {tab.label}
                  {profileTab === tab.id && <ChevronRight size={13} className="ml-auto text-[#006064]" />}
                </button>
              ))}
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                onLogout();
                toast.success("Sesión cerrada", { description: "Has salido de tu cuenta correctamente.", icon: "👋" });
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl hover:bg-red-100 transition-colors text-sm font-black uppercase"
              style={H7}
            >
              <LogOut size={15} /> Cerrar Sesión
            </button>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-2 min-w-0">
            {/* Personal Info tab */}
            {profileTab === "info" && (
              <div className="space-y-4">

                {/* ── Personal data card ── */}
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg uppercase text-foreground" style={H9}>Datos Personales</h2>
                    {editingInfo ? (
                      <div className="flex gap-2">
                        <button onClick={() => setEditingInfo(false)} className="px-3 py-1.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors">Cancelar</button>
                        <button onClick={handleSaveInfo} className="px-3 py-1.5 bg-[#179150] text-white rounded-xl text-xs font-black uppercase hover:bg-green-700 transition-colors flex items-center gap-1.5" style={H7}><Check size={12} /> Guardar</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingInfo(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#50e9f8] text-[#006064] bg-[#e0f5eb] rounded-xl text-xs font-black uppercase hover:bg-[#50e9f8]/20 transition-colors" style={H9}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Editar
                      </button>
                    )}
                  </div>
                  <div className="p-6 grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Nombre Completo</label>
                      <div className="relative"><User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={name} onChange={e => setName(e.target.value)} readOnly={!editingInfo} className={fieldClass} /></div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Tipo de documento</label>
                      <select value={profDocType} onChange={e => setProfDocType(e.target.value)} disabled={!editingInfo} className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-[#179150] ${editingInfo ? "border-[#50e9f8] bg-white" : "border-border bg-[#f8fafc] opacity-70"}`}>
                        {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Número de documento</label>
                      <div className="relative"><FileText size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={cedula} onChange={e => setCedula(e.target.value)} readOnly={!editingInfo} placeholder="12345678" className={fieldClass} /></div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Dirección Fiscal</label>
                      <div className="relative"><MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={address} onChange={e => setAddress(e.target.value)} readOnly={!editingInfo} className={fieldClass} /></div>
                    </div>
                  </div>
                </div>

                {/* ── Email OTP modal ── */}
                {emailOtpSent && (
                  <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
                      <div className="w-14 h-14 rounded-full bg-[#50e9f8]/15 flex items-center justify-center mx-auto mb-4">
                        <Mail size={26} className="text-[#179150]" />
                      </div>
                      <h3 className="text-2xl uppercase text-foreground text-center mb-1" style={H9}>Verifica tu correo</h3>
                      <p className="text-sm text-muted-foreground text-center mb-1 leading-relaxed">Enviamos un código de 6 dígitos a:</p>
                      <p className="text-sm font-black text-[#179150] text-center mb-5 truncate">{newEmail}</p>
                      <div className="flex gap-2 justify-center mb-2">
                        {[0,1,2,3,4,5].map(i => (
                          <input key={i} type="text" inputMode="numeric" maxLength={1}
                            value={emailOtpValue[i] ?? ""}
                            id={`prof-email-otp-${i}`}
                            onChange={e => {
                              const d = e.target.value.replace(/\D/g,"").slice(-1);
                              const arr = emailOtpValue.padEnd(6," ").split(""); arr[i] = d;
                              setEmailOtpValue(arr.join("").trimEnd());
                              if (d) document.querySelector<HTMLInputElement>(`#prof-email-otp-${i+1}`)?.focus();
                            }}
                            onKeyDown={e => { if (e.key==="Backspace" && !emailOtpValue[i] && i>0) document.querySelector<HTMLInputElement>(`#prof-email-otp-${i-1}`)?.focus(); }}
                            className={`w-11 h-14 text-center text-xl font-black border-2 rounded-xl focus:outline-none transition-all
                              ${emailOtpValue[i] ? "border-[#179150] bg-[#179150]/5 text-[#179150]" : "border-gray-300 bg-white"}
                              focus:border-[#179150] focus:shadow-[0_0_0_3px_rgba(80,233,248,0.15)]`} style={H9} />
                        ))}
                      </div>
                      {emailOtpError && <p className="text-red-600 text-xs text-center mb-2 flex items-center justify-center gap-1"><AlertTriangle size={11}/>{emailOtpError}</p>}
                      <button onClick={handleVerifyEmailOtp} disabled={emailOtpValue.replace(/ /g,"").length < 6}
                        className={`w-full py-3 rounded-xl uppercase transition-colors mb-3 mt-3 ${emailOtpValue.replace(/ /g,"").length >= 6 ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`} style={H7}>
                        Verificar código
                      </button>
                      <button onClick={() => { setEditingEmail(false); setEmailOtpSent(false); setEmailOtpValue(""); }} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
                      <p className="text-xs text-muted-foreground text-center mt-3">Demo: el código es <strong>123456</strong></p>
                    </div>
                  </div>
                )}

                {/* ── Phone OTP modal ── */}
                {phoneOtpSent && (
                  <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
                      <div className="w-14 h-14 rounded-full bg-[#50e9f8]/15 flex items-center justify-center mx-auto mb-4">
                        <Phone size={26} className="text-[#179150]" />
                      </div>
                      <h3 className="text-2xl uppercase text-foreground text-center mb-1" style={H9}>Verifica tu teléfono</h3>
                      <p className="text-sm text-muted-foreground text-center mb-1 leading-relaxed">Enviamos un código de 6 dígitos a:</p>
                      <p className="text-sm font-black text-[#179150] text-center mb-5">{newPhoneArea}-{newPhoneNum}</p>
                      <div className="flex gap-2 justify-center mb-2">
                        {[0,1,2,3,4,5].map(i => (
                          <input key={i} type="text" inputMode="numeric" maxLength={1}
                            value={phoneOtpValue[i] ?? ""}
                            id={`prof-phone-otp-${i}`}
                            onChange={e => {
                              const d = e.target.value.replace(/\D/g,"").slice(-1);
                              const arr = phoneOtpValue.padEnd(6," ").split(""); arr[i] = d;
                              setPhoneOtpValue(arr.join("").trimEnd());
                              if (d) document.querySelector<HTMLInputElement>(`#prof-phone-otp-${i+1}`)?.focus();
                            }}
                            onKeyDown={e => { if (e.key==="Backspace" && !phoneOtpValue[i] && i>0) document.querySelector<HTMLInputElement>(`#prof-phone-otp-${i-1}`)?.focus(); }}
                            className={`w-11 h-14 text-center text-xl font-black border-2 rounded-xl focus:outline-none transition-all
                              ${phoneOtpValue[i] ? "border-[#179150] bg-[#179150]/5 text-[#179150]" : "border-gray-300 bg-white"}
                              focus:border-[#179150] focus:shadow-[0_0_0_3px_rgba(80,233,248,0.15)]`} style={H9} />
                        ))}
                      </div>
                      {phoneOtpError && <p className="text-red-600 text-xs text-center mb-2 flex items-center justify-center gap-1"><AlertTriangle size={11}/>{phoneOtpError}</p>}
                      <button onClick={handleVerifyPhoneOtp} disabled={phoneOtpValue.replace(/ /g,"").length < 6}
                        className={`w-full py-3 rounded-xl uppercase transition-colors mb-3 mt-3 ${phoneOtpValue.replace(/ /g,"").length >= 6 ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`} style={H7}>
                        Verificar código
                      </button>
                      <button onClick={() => { setEditingPhone(false); setPhoneOtpSent(false); setPhoneOtpValue(""); }} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
                      <p className="text-xs text-muted-foreground text-center mt-3">Demo: el código es <strong>123456</strong></p>
                    </div>
                  </div>
                )}

                {/* ── Email card — editable field style ── */}
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-[#179150]" />
                      <h2 className="text-lg uppercase text-foreground" style={H9}>Correo Electrónico</h2>
                    </div>
                    {editingEmail ? (
                      <div className="flex gap-2">
                        <button onClick={() => setEditingEmail(false)} className="px-3 py-1.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors">Cancelar</button>
                        <button onClick={handleSendEmailOtp} disabled={!newEmail.includes("@")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-colors flex items-center gap-1.5 ${newEmail.includes("@") ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`} style={H7}>
                          <Check size={12} /> Guardar
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingEmail(true); setNewEmail(currentEmail); setEmailOtpValue(""); setEmailOtpError(""); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#50e9f8] text-[#006064] bg-[#e0f5eb] rounded-xl text-xs font-black uppercase hover:bg-[#50e9f8]/20 transition-colors" style={H9}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Editar
                      </button>
                    )}
                  </div>
                  <div className="p-6">
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Correo electrónico</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input value={editingEmail ? newEmail : currentEmail} onChange={e => setNewEmail(e.target.value)} type="email" readOnly={!editingEmail}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-all focus:outline-none
                            ${editingEmail ? "border-[#50e9f8] bg-white focus:shadow-[0_0_0_3px_rgba(80,233,248,0.12)]" : "border-border bg-[#f8fafc] text-foreground cursor-default"}`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Phone card — editable field style ── */}
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-[#179150]" />
                      <h2 className="text-lg uppercase text-foreground" style={H9}>Número de Teléfono</h2>
                    </div>
                    {editingPhone ? (
                      <div className="flex gap-2">
                        <button onClick={() => setEditingPhone(false)} className="px-3 py-1.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors">Cancelar</button>
                        <button onClick={handleSendPhoneOtp} disabled={newPhoneNum.length < 7}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-colors flex items-center gap-1.5 ${newPhoneNum.length >= 7 ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`} style={H7}>
                          <Check size={12} /> Guardar
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingPhone(true); setPhoneOtpValue(""); setPhoneOtpError(""); const parts = currentPhone.replace(/^\+58\s?/,"").split("-"); setNewPhoneArea(VE_AREAS.find(a => a === parts[0]) ?? "0414"); setNewPhoneNum(parts.slice(1).join("-")); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#50e9f8] text-[#006064] bg-[#e0f5eb] rounded-xl text-xs font-black uppercase hover:bg-[#50e9f8]/20 transition-colors" style={H9}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Editar
                      </button>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-3 items-end">
                      <div>
                        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Cód. área</label>
                        <select value={editingPhone ? newPhoneArea : currentPhone.split("-")[0]?.replace(/^\+58\s?/,"") || "0414"}
                          onChange={e => setNewPhoneArea(e.target.value)} disabled={!editingPhone}
                          className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none ${editingPhone ? "border-[#50e9f8] bg-white focus:border-[#179150]" : "border-border bg-[#f8fafc] opacity-70"}`}>
                          {VE_AREAS.map(a => <option key={a}>{a}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Número telefónico</label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input value={editingPhone ? newPhoneNum : currentPhone.split("-").slice(1).join("-")} onChange={e => setNewPhoneNum(e.target.value)}
                            type="tel" placeholder="000-0000" readOnly={!editingPhone}
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-all focus:outline-none
                              ${editingPhone ? "border-[#50e9f8] bg-white focus:shadow-[0_0_0_3px_rgba(80,233,248,0.12)]" : "border-border bg-[#f8fafc] text-foreground cursor-default"}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Notifications tab */}
            {profileTab === "notifications" && (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-lg uppercase text-foreground" style={H9}>Notificaciones</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Administra cómo y cuándo quieres recibir notificaciones.</p>
                </div>
                <div className="p-6 space-y-6">

                  {/* Promocionales */}
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-[#006064] mb-3" style={H9}>Notificaciones Promocionales</div>
                    <div className="space-y-3">
                      {([
                        { label: "Activar notificaciones promocionales", sub: "Recibe alertas sobre ofertas y descuentos", value: notifPromo, set: setNotifPromo },
                        { label: "Promociones por SMS", sub: "Mensajes de texto con ofertas especiales", value: notifPromoSms, set: setNotifPromoSms },
                        { label: "Promociones por correo", sub: "Boletín de ofertas enviado a tu email", value: notifPromoEmail, set: setNotifPromoEmail },
                      ] as { label: string; sub: string; value: boolean; set: (v: boolean) => void }[]).map(item => (
                        <div key={item.label} className="flex items-center justify-between gap-4 bg-muted rounded-xl px-4 py-3">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-foreground">{item.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{item.sub}</div>
                          </div>
                          <button
                            onClick={() => item.set(!item.value)}
                            className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${item.value ? "bg-[#179150]" : "bg-gray-300"}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${item.value ? "translate-x-5" : "translate-x-0"}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Generales */}
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-[#006064] mb-3" style={H9}>Notificaciones Generales de Pedidos</div>
                    <div className="space-y-3">
                      {([
                        { label: "Activar notificaciones de pedidos", sub: "Estado de tu pedido en tiempo real", value: notifOrders, set: setNotifOrders },
                        { label: "Notificaciones de pedidos por SMS", sub: "Alertas de pedido por mensaje de texto", value: notifOrdersSms, set: setNotifOrdersSms },
                        { label: "Notificaciones de pedidos por correo", sub: "Confirmaciones y actualizaciones por email", value: notifOrdersEmail, set: setNotifOrdersEmail },
                      ] as { label: string; sub: string; value: boolean; set: (v: boolean) => void }[]).map(item => (
                        <div key={item.label} className="flex items-center justify-between gap-4 bg-muted rounded-xl px-4 py-3">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-foreground">{item.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{item.sub}</div>
                          </div>
                          <button
                            onClick={() => item.set(!item.value)}
                            className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${item.value ? "bg-[#179150]" : "bg-gray-300"}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${item.value ? "translate-x-5" : "translate-x-0"}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Security tab */}
            {profileTab === "security" && (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                  <div className="w-8 h-8 rounded-full bg-[#179150]/10 flex items-center justify-center flex-shrink-0"><Shield size={15} className="text-[#179150]" /></div>
                  <h2 className="text-lg uppercase text-foreground" style={H9}>Cambiar Contraseña</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Contraseña Actual</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type={showCur ? "text" : "password"} value={curPass} onChange={e => setCurPass(e.target.value)} placeholder="Ingresa tu contraseña actual" className="w-full pl-10 pr-10 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white" />
                      <button type="button" onClick={() => setShowCur(v=>!v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">{showCur ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Nueva Contraseña</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input type={showNew ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Mínimo 8 caracteres" className="w-full pl-10 pr-10 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white" />
                        <button type="button" onClick={() => setShowNew(v=>!v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">{showNew ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Confirmar Nueva</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input type={showNew ? "text" : "password"} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Repite la nueva contraseña" className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none bg-white ${confirmPass && confirmPass !== newPass ? "border-red-400" : "border-border focus:border-[#179150]"}`} />
                      </div>
                    </div>
                  </div>
                  {passMsg && (
                    <div className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-xl border ${passMsg.type === "ok" ? "text-[#179150] bg-[#179150]/8 border-[#179150]/25" : "text-red-600 bg-red-50 border-red-200"}`}>
                      {passMsg.type === "ok" ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}{passMsg.text}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button onClick={handlePassChange} className="flex items-center gap-2 bg-[#179150] text-white px-6 py-2.5 rounded-xl uppercase font-black hover:bg-green-700 transition-colors" style={H7}><Shield size={14} /> Actualizar Contraseña</button>
                  </div>
                </div>
              </div>
            )}

            {/* Orders tab */}
            {profileTab === "orders" && (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-lg uppercase text-foreground" style={H9}>Historial de Pedidos</h2>
                  <span className="text-xs text-muted-foreground">Pág. {orderPage}/{totalPages}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        {["ID Pedido", "Fecha", "Estado", "Ítems", "Total", ""].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap" style={H9}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map((order, i) => (
                        <React.Fragment key={order.id}>
                          <tr className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                            <td className="px-4 py-3 text-[#179150] font-black text-xs whitespace-nowrap" style={H9}>{order.id}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{order.date}</td>
                            <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusColor(order.status)}`} style={H9}>{order.status}</span></td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">{order.items}</td>
                            <td className="px-4 py-3">
                              <div className="text-foreground text-xs font-semibold">Bs. {order.totalBs.toFixed(2)}</div>
                              <div className="text-muted-foreground text-[10px]">${order.totalUsd.toFixed(2)}</div>
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} className="text-[#179150] text-xs font-semibold flex items-center gap-1 hover:underline">
                                {expandedOrder === order.id ? "Ocultar" : "Detalles"}
                                <ChevronDown size={11} className={`transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`} />
                              </button>
                            </td>
                          </tr>
                          {expandedOrder === order.id && (
                            <tr className="bg-[#f8fafc] border-b border-border">
                              <td colSpan={6} className="px-4 py-3">
                                <div className="space-y-1 mb-2">
                                  {order.products.map((prod, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-foreground">
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#179150]" />{prod}
                                    </div>
                                  ))}
                                </div>
                                {order.status === "En curso" && (
                                  <button onClick={() => onNav("tracking")} className="px-3 py-1.5 bg-[#50e9f8] text-[#006064] rounded-lg text-xs uppercase hover:bg-[#2dd8e8] transition-colors flex items-center gap-1">
                                    <Package size={11} /> Ver seguimiento
                                  </button>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="px-6 py-3 border-t border-border flex items-center justify-between">
                    <button onClick={() => setOrderPage(p => Math.max(1, p-1))} disabled={orderPage===1} className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-30"><ChevronLeft size={12} /> Anterior</button>
                    <span className="text-xs text-muted-foreground">Página {orderPage} de {totalPages}</span>
                    <button onClick={() => setOrderPage(p => Math.min(totalPages, p+1))} disabled={orderPage===totalPages} className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-30">Siguiente <ChevronRight size={12} /></button>
                  </div>
                )}
              </div>
            )}
            {/* Refunds tab */}
            {profileTab === "refunds" && (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-lg uppercase text-foreground" style={H9}>Solicitudes de Reembolso</h2>
                  <button
                    onClick={openRefundModal}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#179150] text-white rounded-xl text-xs font-black uppercase hover:bg-green-700 transition-colors"
                    style={H7}
                  >
                    <Plus size={13} /> Nueva solicitud de reembolso
                  </button>
                </div>
                {refundRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <CreditCard size={36} className="mb-3 opacity-30" />
                    <p className="text-sm">No tienes solicitudes de reembolso aún.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          {["Método", "Banco emisor", "Referencia", "Monto", "Estado"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap" style={H9}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {refundRequests.map((req, i) => (
                          <tr key={req.id} className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                            <td className="px-4 py-3 text-foreground text-xs font-semibold whitespace-nowrap">{req.method}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{req.bank}</td>
                            <td className="px-4 py-3 text-[#179150] font-black text-xs whitespace-nowrap" style={H9}>{req.reference}</td>
                            <td className="px-4 py-3 text-foreground text-xs font-semibold whitespace-nowrap">{req.amount}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${refundStatusColor(req.status)}`} style={H9}>{req.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Cupones tab */}
            {profileTab === "coupons" && (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-lg uppercase text-foreground" style={H9}>Mis Cupones</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Cupones disponibles y utilizados en tus pedidos.</p>
                </div>
                {USER_COUPONS.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Star size={36} className="mb-3 opacity-30" />
                    <p className="text-sm">No tienes cupones asignados aún.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          {["Código", "Descuento", "Creado", "Vence", "Pedido", "Estado"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground" style={H9}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {USER_COUPONS.map((c, i) => (
                          <tr key={c.code} className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                            <td className="px-4 py-3">
                              <span className="font-mono text-xs font-black text-[#006064] bg-[#e0f5eb] px-2 py-0.5 rounded-lg tracking-widest" style={H9}>{c.code}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700" style={H9}>{c.discount}% OFF</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{c.createdAt}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{c.expiresAt}</td>
                            <td className="px-4 py-3 text-xs">
                              {c.usedOnOrder
                                ? <span className="text-[#179150] font-black" style={H9}>{c.usedOnOrder}</span>
                                : <span className="text-muted-foreground">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                c.status === "vigente" ? "bg-[#e0f5eb] text-[#179150]" :
                                c.status === "usado"   ? "bg-[#50e9f8]/20 text-[#006064]" :
                                "bg-gray-100 text-gray-500"
                              }`} style={H9}>
                                {c.status === "vigente" ? "Vigente" : c.status === "usado" ? "Usado" : "Vencido"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Refund Modal ── */}
      {showRefundModal && (() => {
        const fld = "w-full px-3 py-2.5 border border-[#50e9f8] bg-white rounded-xl text-sm focus:outline-none focus:border-[#179150]";
        const fld2 = "w-full px-3 py-2.5 border border-[#90caf9] bg-white rounded-xl text-sm focus:outline-none focus:border-[#006064]";
        const lbl = "text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block";
        const step1Valid = rfBank && rfRef && rfAmount;
        const step2Valid = rbBank && (rbMethod === "Pago Móvil" ? rbPhone && rbDoc : rbAccount && rbDoc);
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400] flex items-center justify-center p-4" onClick={closeRefundModal}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

              {/* Header fijo */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10 rounded-t-3xl">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#179150]" style={H9}>Farmahumana · FHEC</div>
                  <h2 className="text-lg uppercase text-foreground leading-none mt-0.5" style={H9}>Solicitud de Reembolso</h2>
                </div>
                <button onClick={closeRefundModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">
                  <X size={16} />
                </button>
              </div>

              {/* Indicador de pasos */}
              <div className="flex items-center gap-2 px-6 pt-5 pb-1">
                {[1, 2].map(n => (
                  <React.Fragment key={n}>
                    <div className={`flex items-center gap-1.5 ${refundStep >= n ? "text-[#179150]" : "text-muted-foreground"}`}>
                      <div className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${refundStep > n ? "bg-[#179150] text-white" : refundStep === n ? "bg-[#179150] text-white" : "bg-muted text-muted-foreground"}`} style={H9}>
                        {refundStep > n ? <Check size={12} /> : n}
                      </div>
                      <span className="text-xs font-semibold hidden sm:block">
                        {n === 1 ? "Transacción realizada" : "Datos para reembolso"}
                      </span>
                    </div>
                    {n < 2 && <div className={`flex-1 h-0.5 rounded-full ${refundStep > 1 ? "bg-[#179150]" : "bg-muted"}`} />}
                  </React.Fragment>
                ))}
              </div>

              <div className="p-6 space-y-4">

                {/* ─── PASO 1 ─── */}
                {refundStep === 1 && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-[#179150] text-white text-[10px] font-black flex items-center justify-center" style={H9}>1</div>
                      <h3 className="text-sm uppercase text-[#006064] font-black" style={H9}>Datos de la transacción realizada</h3>
                    </div>

                    {/* Selector de método — visual tipo radio */}
                    <div>
                      <label className={lbl}>Método de pago realizado</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Pago Móvil", "Transferencia"].map(m => (
                          <button key={m} type="button" onClick={() => setRfMethod(m)}
                            className={`py-2.5 rounded-xl border-2 text-sm font-black uppercase transition-all ${rfMethod === m ? "border-[#179150] bg-[#e0f5eb] text-[#006064]" : "border-border text-muted-foreground hover:border-[#179150]/50"}`}
                            style={H9}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Banco emisor — siempre */}
                    <div>
                      <label className={lbl}>Banco emisor</label>
                      <select value={rfBank} onChange={e => setRfBank(e.target.value)} className={fld}>
                        <option value="">Seleccionar banco…</option>
                        {VENEZUELA_BANKS.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>

                    {/* Campos condicionales según método */}
                    {rfMethod === "Pago Móvil" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={lbl}>Código de área</label>
                          <select value={rfAreaCode} onChange={e => setRfAreaCode(e.target.value)} className={fld}>
                            {VE_AREAS.map(a => <option key={a}>{a}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={lbl}>Número telefónico</label>
                          <input value={rfPhone} onChange={e => setRfPhone(e.target.value)} type="tel" placeholder="000-0000" className={fld} />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={lbl}>Monto ($)</label>
                        <input value={rfAmount} onChange={e => setRfAmount(e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" className={fld} />
                      </div>
                      <div>
                        <label className={lbl}>Referencia bancaria</label>
                        <input value={rfRef} onChange={e => setRfRef(e.target.value)} placeholder="Nº referencia" className={fld} />
                      </div>
                    </div>

                    <div className="max-w-[200px] sm:max-w-full">
                      <label className={lbl}>Fecha de la transacción</label>
                      <input value={rfDate} onChange={e => setRfDate(e.target.value)} type="date" className={fld} />
                    </div>

                    <button
                      onClick={() => { if (step1Valid) setRefundStep(2); }}
                      disabled={!step1Valid}
                      className={`w-full py-3 rounded-xl text-sm font-black uppercase transition-colors mt-2 ${step1Valid ? "bg-[#50e9f8] text-[#006064] hover:bg-[#2dd8e8]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                      style={H7}
                    >
                      Continuar →
                    </button>
                  </>
                )}

                {/* ─── PASO 2 ─── */}
                {refundStep === 2 && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-[#006064] text-white text-[10px] font-black flex items-center justify-center" style={H9}>2</div>
                      <h3 className="text-sm uppercase text-[#006064] font-black" style={H9}>Datos bancarios para el reembolso</h3>
                    </div>

                    {/* Resumen paso 1 */}
                    <div className="bg-[#f0fdf7] border border-[#a7f3d0] rounded-xl px-4 py-3 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{rfMethod}</span> · {rfBank} · <span className="font-semibold text-[#179150]">${rfAmount}</span>
                      </div>
                      <button onClick={() => setRefundStep(1)} className="text-xs text-[#179150] hover:underline font-semibold flex items-center gap-1">
                        <ArrowLeft size={11} /> Editar
                      </button>
                    </div>

                    {/* Selector de método de reembolso */}
                    <div>
                      <label className={lbl}>Método de reembolso</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Pago Móvil", "Transferencia"].map(m => (
                          <button key={m} type="button" onClick={() => setRbMethod(m)}
                            className={`py-2.5 rounded-xl border-2 text-sm font-black uppercase transition-all ${rbMethod === m ? "border-[#006064] bg-[#e3f2fd] text-[#006064]" : "border-border text-muted-foreground hover:border-[#006064]/50"}`}
                            style={H9}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Banco receptor — siempre */}
                    <div>
                      <label className={lbl}>Banco receptor</label>
                      <select value={rbBank} onChange={e => setRbBank(e.target.value)} className={fld2}>
                        <option value="">Seleccionar banco…</option>
                        {VENEZUELA_BANKS.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>

                    {/* Pago Móvil */}
                    {rbMethod === "Pago Móvil" && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={lbl}>Código de área</label>
                            <select value={rbAreaCode} onChange={e => setRbAreaCode(e.target.value)} className={fld2}>
                              {VE_AREAS.map(a => <option key={a}>{a}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={lbl}>Número telefónico</label>
                            <input value={rbPhone} onChange={e => setRbPhone(e.target.value)} type="tel" placeholder="000-0000" className={fld2} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={lbl}>Tipo de documento</label>
                            <select value={rbDocType} onChange={e => setRbDocType(e.target.value)} className={fld2}>
                              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={lbl}>Número de documento</label>
                            <input value={rbDoc} onChange={e => setRbDoc(e.target.value)} placeholder="12345678" className={fld2} />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Transferencia */}
                    {rbMethod === "Transferencia" && (
                      <>
                        <div>
                          <label className={lbl}>Número de cuenta</label>
                          <input value={rbAccount} onChange={e => setRbAccount(e.target.value)} placeholder="0000-0000-00-0000000000" className={fld2} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={lbl}>Tipo de documento</label>
                            <select value={rbDocType} onChange={e => setRbDocType(e.target.value)} className={fld2}>
                              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={lbl}>Número de documento</label>
                            <input value={rbDoc} onChange={e => setRbDoc(e.target.value)} placeholder="12345678" className={fld2} />
                          </div>
                        </div>
                        <div>
                          <label className={lbl}>Nombre del beneficiario</label>
                          <input value={rbHolder} onChange={e => setRbHolder(e.target.value)} placeholder="Nombre completo" className={fld2} />
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setRefundStep(1)}
                        className="flex items-center gap-1 px-4 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                        style={H7}>
                        <ArrowLeft size={13} /> Volver
                      </button>
                      <button
                        onClick={handleSubmitRefund}
                        disabled={!step2Valid}
                        className={`flex-1 py-3 rounded-xl text-sm font-black uppercase transition-colors flex items-center justify-center gap-2 ${step2Valid ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                        style={H7}
                      >
                        <CreditCard size={14} /> Enviar solicitud
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

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
        <LoginPage onLogin={(u) => { setUser(u); setCartItems([]); }} onNav={setPage} initialView={page === "register" ? "register" : "login"} />
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
        {page === "cart" && <CartPage cartItems={cartItems} setCartItems={setCartItems} onNav={setPage} discountApplied={cartDiscountApplied} discountCode={cartDiscountCode} setDiscountApplied={setCartDiscountApplied} setDiscountCode={setCartDiscountCode} user={user} hasActiveOrder={hasActiveOrder} selectedSede={checkoutSede} />}
        {page === "deliverySelect" && <DeliverySelectPage cartItems={cartItems} onNav={setPage} deliveryMode={checkoutDeliveryMode} setDeliveryMode={setCheckoutDeliveryMode} selectedSede={checkoutSede} setSelectedSede={setCheckoutSede} deliveryAddress={checkoutAddress} setDeliveryAddress={setCheckoutAddress} discountApplied={cartDiscountApplied} discountCode={cartDiscountCode} setDiscountApplied={setCartDiscountApplied} setDiscountCode={setCartDiscountCode} user={user} onConfirmOrder={() => { setActiveOrderItems(cartItems); setHasActiveOrder(true); setCartItems([]); }} />}
        {page === "preCheckout" && <PreCheckoutMedicalPage cartItems={activeOrderItems.length > 0 ? activeOrderItems : cartItems} onNav={setPage} />}
        {page === "checkout" && <CheckoutPage cartItems={activeOrderItems.length > 0 ? activeOrderItems : cartItems} onNav={setPage} discountApplied={cartDiscountApplied} deliveryMode={checkoutDeliveryMode} selectedSede={checkoutSede} user={user} onClearCart={() => { if (activeOrderItems.length === 0) { setActiveOrderItems(cartItems); setHasActiveOrder(true); setCartItems([]); } }} />}
        {page === "tracking" && (
          <TrackingPage
            onNav={setPage}
            orderItems={activeOrderItems.length > 0 ? activeOrderItems : []}
            deliveryMode={checkoutDeliveryMode}
            discountPct={cartDiscountApplied}
            onOrderComplete={() => { setHasActiveOrder(false); }}
          />
        )}
        {page === "profile" && user && <ProfilePage user={user} onNav={setPage} onLogout={() => { setUser(null); setCartItems([]); setPage("home"); }} />}
        {page === "delivery" && <DeliveryPanel onNav={setPage} userSede={staffSede} />}
        {page === "admin" && user && <AdminPanel user={user} onNav={setPage} products={PRODUCTS} setProducts={() => {}} slides={slides} setSlides={setSlides} />}
        {page === "notifications" && <NotificationsPage onNav={setPage} notifs={appNotifs} setNotifs={setAppNotifs} />}
      </main>
      <Footer onNav={setPage} />
      <Toaster position="top-right" />
    </div>
  );
}
