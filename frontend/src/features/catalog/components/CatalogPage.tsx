import React, { useEffect, useState } from "react";
import { Check, ChevronDown, Package, SlidersHorizontal } from "lucide-react";
import type { CartItem, Product } from "../../../app/types";
import { effectivePrice, H7, H9 } from "../../../app/data";
import { ProductCard } from "../../../components/product";

// ─── CatalogPage ──────────────────────────────────────────────────────────────
export function CatalogPage({ products, searchQuery, onProductClick, onAddToCart, cartItems, onUpdateQuantity, favoriteIds, onToggleFavorite, preselectedCategory, isAuthenticated, onAuthRequired }: {
  products: Product[]; searchQuery: string;
  onProductClick: (id: number) => void; onAddToCart: (p: Product) => void;
  cartItems: CartItem[]; onUpdateQuantity: (productId: number, delta: number) => void;
  favoriteIds: Set<number>; onToggleFavorite: (productId: number) => void;
  preselectedCategory?: string;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
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
                {selected.has(item) && <Check size={12} className="text-white stroke-[3]" />}
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
                      isAuthenticated={isAuthenticated}
                      onAuthRequired={onAuthRequired}
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

