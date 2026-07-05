import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Page, Product, CartItem, Slide, H9, H7, CATS } from "../shared";
import { ProductCard } from "./ProductCard";

// ─── HomePage ─────────────────────────────────────────────────────────────────
export function HomePage({ products, onProductClick, onAddToCart, onNav, cartItems, onUpdateQuantity, favoriteIds, onToggleFavorite, slides }: {
  products: Product[]; onProductClick: (id: number) => void;
  onAddToCart: (p: Product) => void; onNav: (p: Page) => void;
  cartItems: CartItem[]; onUpdateQuantity: (productId: number, delta: number) => void;
  favoriteIds: Set<number>; onToggleFavorite: (productId: number) => void;
  slides: Slide[];
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
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === active ? 1 : 0, background: `linear-gradient(135deg, ${s.from} 0%, ${s.via} 55%, ${s.to} 100%)` }}
          >
            <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-luminosity" />
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

      {/* Categories */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground text-2xl uppercase" style={H9}>Categorías</h2>
          <button onClick={() => onNav("catalog")} className="text-sm text-[#50e9f8] font-semibold flex items-center gap-1 hover:gap-2 transition-all">Ver todas <ChevronRight size={14} /></button>
        </div>
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: "thin", scrollbarColor: "#179150 #e8ede8", msOverflowStyle: "auto" }}>
            {CATS.map(cat => (
              <button
                key={cat.name}
                onClick={() => onNav("catalog")}
                className="flex-shrink-0 flex flex-col items-center gap-3 py-5 px-6 bg-card rounded-2xl border border-border hover:border-[#179150] hover:shadow-[0_2px_16px_rgba(23,145,80,0.12)] transition-all min-w-[140px]"
              >
                <span className="text-4xl">{cat.emoji}</span>
                <span className="text-foreground text-base uppercase text-center leading-tight whitespace-nowrap" style={H9}>{cat.name}</span>
                <span className="text-xs text-muted-foreground">{cat.count} prod.</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured products */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-foreground text-2xl uppercase" style={H9}>Productos Destacados</h2>
          <button onClick={() => onNav("catalog")} className="text-sm text-[#50e9f8] font-semibold flex items-center gap-1 hover:gap-2 transition-all">Catálogo completo <ChevronRight size={14} /></button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map(p => {
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
      </div>
    </div>
  );
}
