import React, { useState } from "react";
import { ShoppingCart, Plus, Minus, Star, Shield, Check, ClipboardList } from "lucide-react";
import { Product, H9, H7, fmtVES, fmtUSD, effectivePrice } from "../shared";

// ─── Stars ───────────────────────────────────────────────────────────────────
export function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={11} className={s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
      ))}
    </div>
  );
}

// ─── ProductBox ───────────────────────────────────────────────────────────────
export function ProductBox({ product, size = "md" }: { product: Product; size?: "sm" | "md" | "lg" }) {
  const h = size === "sm" ? "h-20" : size === "lg" ? "h-72" : "h-48";
  const boxW = size === "sm" ? "w-12 h-16" : size === "lg" ? "w-44 h-60" : "w-28 h-36";
  const nameSize = size === "sm" ? "text-[7px]" : size === "lg" ? "text-xl" : "text-sm";
  const doseSize = size === "sm" ? "text-xs" : size === "lg" ? "text-4xl" : "text-xl";

  return (
    <div
      className={`relative w-full ${h} flex items-center justify-center overflow-hidden`}
      style={{ background: `linear-gradient(145deg, ${product.bgColor} 0%, #fff 100%)` }}
    >
      <div
        className={`relative ${boxW} rounded-xl flex flex-col overflow-hidden shadow-xl`}
        style={{ backgroundColor: product.accentColor }}
      >
        <div className="bg-black/25 text-white text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 text-center truncate">
          {product.brand}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-2 text-center gap-0.5">
          <div className={`text-white font-black ${nameSize} uppercase leading-tight`} style={H9}>
            {product.name.split(" ")[0]}
          </div>
          <div className={`text-white font-black ${doseSize}`} style={H9}>
            {product.name.match(/[\d.]+mg|[\d.]+mcg|[\d.]+g|[\d.]+ml/i)?.[0] ?? ""}
          </div>
          <div className="text-white/70 text-[8px] uppercase tracking-wider">{product.presentation}</div>
        </div>
        <div className="bg-black/20 text-white/90 text-[7px] font-semibold text-center py-0.5">
          {product.packSize} unid.
        </div>
      </div>

      {product.needsRecipe && !product.controlledSubstance && size !== "sm" && (
        <div className="absolute top-2 right-2 bg-[#179150] text-white text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
          <ClipboardList size={10} />
          Récipe
        </div>
      )}

      {product.controlledSubstance && size !== "sm" && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
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
export function ProductCard({ product, onProductClick, onAddToCart, cartQuantity = 0, onUpdateQuantity, isFavorite = false, onToggleFavorite }: {
  product: Product;
  onProductClick: (id: number) => void;
  onAddToCart: (p: Product) => void;
  cartQuantity?: number;
  onUpdateQuantity?: (productId: number, delta: number) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: number) => void;
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock === 0) return;
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
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
    <div
      className="bg-card rounded-2xl border border-border overflow-hidden cursor-pointer group hover:border-[#179150] hover:shadow-[0_4px_28px_rgba(23,145,80,0.14)] transition-all duration-200 relative"
      onClick={() => onProductClick(product.id)}
    >
      <ProductBox product={product} />

      {/* Favorite button */}
      <button
        onClick={handleToggleFavorite}
        className="absolute top-2 left-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all z-10"
      >
        <svg viewBox="0 0 24 24" fill={isFavorite ? "#c62828" : "none"} stroke={isFavorite ? "#c62828" : "currentColor"} strokeWidth="2" className={`w-4 h-4 ${isFavorite ? "text-red-600" : "text-gray-400"}`}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{product.brand}</span>
        </div>

        <h3 className="text-foreground text-base leading-tight uppercase" style={H9}>
          {product.name}
        </h3>
        <div className="text-[11px] text-muted-foreground mb-1.5">
          Caja {product.packSize} {product.presentation}
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <Stars rating={product.rating} />
          <span className="text-[10px] text-muted-foreground">({product.reviews})</span>
        </div>

        <div className="mb-3">
          {product.discount ? (
            <>
              <div className="text-[#179150] text-2xl leading-none" style={H9}>{fmtUSD(effectivePrice(product))} USD</div>
              <div className="text-muted-foreground text-xs line-through mt-0.5">{fmtUSD(product.priceUSD)} USD</div>
              <div className="text-muted-foreground text-xs mt-0.5">{fmtVES(effectivePrice(product))}</div>
              <span className="inline-block mt-1.5 bg-amber-400 text-[#006064] text-xs font-black px-2 py-0.5 rounded-full" style={H9}>-{product.discount}% DCTO</span>
            </>
          ) : (
            <>
              <div className="text-[#179150] text-2xl leading-none" style={H9}>{fmtUSD(product.priceUSD)} USD</div>
              <div className="text-muted-foreground text-xs mt-0.5">{fmtVES(product.priceUSD)}</div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${product.stock > 0 ? "bg-[#179150]" : "bg-gray-400"}`} />
          <span className={`text-xs font-semibold ${product.stock > 0 ? "text-[#179150]" : "text-gray-500"}`}>
            {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
          </span>
        </div>

        {(product.controlledSubstance || product.needsRecipe) && (
          <div className={`flex items-center gap-1.5 mb-3 border rounded-lg px-3 py-2 ${product.controlledSubstance ? "bg-red-50 border-red-200" : "bg-red-50 border-red-200"}`}>
            <Shield size={13} className="text-red-700 flex-shrink-0" />
            <span className="text-red-800 text-xs font-black leading-tight" style={H9}>
              {product.controlledSubstance ? "Uso Controlado · Solo Pickup" : "Retiro por farmacia"}
              <br />
              <span className="font-semibold text-red-600">Requiere récipe</span>
            </span>
          </div>
        )}


        {isInCart ? (
          <div className="space-y-2">
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
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`w-full py-2.5 rounded-xl text-sm uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-2
              ${product.stock === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : added
                  ? "bg-[#179150] text-white"
                  : "bg-[#50e9f8] text-[#006064] hover:bg-[#2dd8e8]"
              }`}
            style={H7}
          >
            {added ? (<><Check size={14} />Añadido</>) : product.stock === 0 ? "Sin Disponibilidad" : (<><ShoppingCart size={14} />Añadir al Carrito</>)}
          </button>
        )}
      </div>
    </div>
  );
}
