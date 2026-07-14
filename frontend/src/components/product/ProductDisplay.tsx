import React, { useState } from "react";
import { AlertTriangle, Minus, Package, Plus, Shield, ShoppingCart, Star } from "lucide-react";
import type { Product } from "../../app/types";
import { effectivePrice, fmtUSD, fmtVES, H7, H9 } from "../../app/data";

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
export function ProductCard({ product, onProductClick, onAddToCart, cartQuantity = 0, onUpdateQuantity, isFavorite = false, onToggleFavorite, selectedSede = "principal" }: {
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

