import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CartItem, Page, Product, Slide } from "../../../app/types";
import { H7, H9 } from "../../../app/data";
import { ProductCard } from "../../../components/product";

// ─── HomePage ─────────────────────────────────────────────────────────────────
export function HomePage({ products, onProductClick, onAddToCart, onNav, cartItems, onUpdateQuantity, favoriteIds, onToggleFavorite, slides, selectedSede = "principal", isAuthenticated, onAuthRequired }: {
  products: Product[]; onProductClick: (id: number) => void;
  onAddToCart: (p: Product) => void; onNav: (p: Page) => void;
  cartItems: CartItem[]; onUpdateQuantity: (productId: number, delta: number) => void;
  favoriteIds: Set<number>; onToggleFavorite: (productId: number) => void;
  slides: Slide[];
  selectedSede?: string;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
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
                  isAuthenticated={isAuthenticated}
                  onAuthRequired={onAuthRequired}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}

