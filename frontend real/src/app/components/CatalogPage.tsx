import React, { useState, useEffect } from "react";
import { ChevronDown, Package, SlidersHorizontal, Check } from "lucide-react";
import { Page, Product, CartItem, H9, H7, fmtUSD, effectivePrice, CATS } from "../shared";
import { ProductCard, ProductBox } from "./ProductCard";

// ─── CatalogPage ──────────────────────────────────────────────────────────────
export function CatalogPage({ products, searchQuery, onProductClick, onAddToCart, cartItems, onUpdateQuantity, favoriteIds, onToggleFavorite, preselectedCategory }: {
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

  const allCats = CATS.map(c => c.name);
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
      const brandMatch = p.brand.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
      const otherMatch = p.activeIngredient.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      if (!brandMatch && !otherMatch) return false;
      // Out-of-stock products only shown when searching by brand/name
      if (p.stock === 0 && !brandMatch) return false;
    } else {
      // No search query: hide out-of-stock
      if (p.stock === 0) return false;
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
                {selected.has(item) && <Check size={10} className="text-white" />}
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
          <button onClick={() => { setSelCats(new Set()); setSelBrands(new Set()); setSelPres(new Set()); }} className="text-xs text-[#50e9f8] font-semibold hover:underline">
            Limpiar todo
          </button>
        )}
      </div>
      <FilterSection title="Categoría" items={allCats} selected={selCats} setSelected={setSelCats} />
      <FilterSection title="Presentación" items={allPres} selected={selPres} setSelected={setSelPres} />
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
              <span className="text-muted-foreground text-sm">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
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

              {/* Cross-suggestion carousel — same active ingredient */}
              {searchQuery && (() => {
                const matchedIngredients = [...new Set(filtered.map(p => p.activeIngredient))];
                const suggestions = products.filter(p =>
                  matchedIngredients.includes(p.activeIngredient) && !filtered.find(f => f.id === p.id)
                );
                if (suggestions.length === 0) return null;
                return (
                  <div className="mt-8 bg-[#e0f5eb] border border-[#a7f3d0] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">🔄</span>
                      <div>
                        <div className="text-sm font-black uppercase text-[#006064]" style={H9}>Sugerencias con mismo principio activo</div>
                        <div className="text-xs text-[#006064]">Productos equivalentes para: {matchedIngredients.join(", ")}</div>
                      </div>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
                      {suggestions.map(p => (
                        <div
                          key={p.id}
                          onClick={() => onProductClick(p.id)}
                          className="flex-shrink-0 w-40 bg-white border border-[#a7f3d0] rounded-xl overflow-hidden cursor-pointer hover:border-[#179150] hover:shadow-md transition-all"
                        >
                          <div className="h-24 overflow-hidden">
                            <ProductBox product={p} size="sm" />
                          </div>
                          <div className="p-2.5">
                            <div className="text-xs font-black uppercase leading-tight truncate" style={H9}>{p.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{p.brand}</div>
                            <div className="text-sm text-[#179150] font-black mt-1" style={H9}>{fmtUSD(effectivePrice(p))}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
