import React, { useEffect, useRef, useState } from "react";
import { Clock, Search, X } from "lucide-react";
import type { Page, Product } from "../../../app/types";
import { effectivePrice, fmtUSD, H9 } from "../../../app/data";
import { ProductBox } from "../../../components/product";

interface SearchCategory {
  name: string;
  color: string;
}

// ─── SmartSearch ──────────────────────────────────────────────────────────────
export function SmartSearch({ searchQuery, setSearchQuery, onNav, products, categories, brandSynonyms }: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNav: (p: Page) => void;
  products: Product[];
  categories: SearchCategory[];
  brandSynonyms: Record<string, string[]>;
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
  const synonymHit = q ? Object.entries(brandSynonyms).find(([brand]) => brand.includes(q) || q.includes(brand)) : null;

  // Product matches — out-of-stock only shown when brand/name is the search term
  const productMatches = q
    ? products.filter(p => {
        const brandMatch = p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
        const otherMatch = p.activeIngredient.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        if (p.stock === 0 && !brandMatch) return false;
        return brandMatch || otherMatch;
      }).slice(0, 4)
    : [];

  // Category matches
  const catMatches = q ? categories.filter(c => c.name.toLowerCase().includes(q)).slice(0, 3) : [];

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
                {categories.map(c => (
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

