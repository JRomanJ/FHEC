import React, { useState } from "react";
import { AlertTriangle, ChevronRight, Minus, Plus, ShoppingCart } from "lucide-react";
import type { CartItem, Page, Product } from "../../../app/types";
import { effectivePrice, fmtUSD, fmtVES, H7, H9 } from "../../../app/data";
import { ProductBox, ProductCard } from "../../../components/product";

// ─── ProductDetailPage ─────────────────────────────────────────────────────────
export function ProductDetailPage({ product, products, onAddToCart, onBack, onProductClick, onNav, favoriteIds, onToggleFavorite, cartItems, onUpdateQuantity, selectedSede = "principal", isAuthenticated, onAuthRequired }: {
  product: Product; products: Product[]; onAddToCart: (p: Product, qty: number) => void;
  onBack: () => void; onProductClick: (id: number) => void; onNav: (p: Page) => void;
  favoriteIds: Set<number>; onToggleFavorite: (id: number) => void;
  cartItems: CartItem[]; onUpdateQuantity: (productId: number, delta: number) => void;
  selectedSede?: string;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
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
    if (!isAuthenticated) { onAuthRequired(); return; }
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
        isAuthenticated={isAuthenticated}
        onAuthRequired={onAuthRequired}
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
                <button onClick={() => onUpdateQuantity(product.id, -1)} className="w-10 sm:w-14 h-12 flex-shrink-0 flex items-center justify-center hover:bg-[#50e9f8]/20 transition-colors text-[#006064]"><Minus size={18} /></button>
                <div className="flex-1 text-center flex flex-col justify-center items-center overflow-hidden">
                  <div className="text-[11px] sm:text-xs text-[#006064]/70 font-semibold whitespace-nowrap leading-tight">En carrito</div>
                  <div className="text-lg sm:text-xl font-black text-[#006064] leading-none" style={H9}>{cartQty}</div>
                </div>
                <button onClick={() => onUpdateQuantity(product.id, 1)} disabled={cartQty >= sedeStock} className="w-10 sm:w-14 h-12 flex-shrink-0 flex items-center justify-center hover:bg-[#50e9f8]/20 transition-colors text-[#006064] disabled:opacity-30"><Plus size={18} /></button>
              </div>
            ) : (
              <button onClick={handleAdd}
                className="flex-1 py-3 px-2 rounded-xl text-sm sm:text-base uppercase flex items-center justify-center gap-1.5 sm:gap-2 transition-all bg-[#50e9f8] text-[#006064] hover:bg-[#2dd8e8] whitespace-nowrap"
                style={H7}>
                <ShoppingCart size={16} className="flex-shrink-0" /><span>Añadir<span className="hidden min-[380px]:inline"> al Carrito</span></span>
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
        {(product.concentration || product.packSize || product.category || product.presentation || product.barcode) && (
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
                <div className="text-sm font-semibold text-foreground">{product.packSize}</div>
              </div>
            )}
            {product.category && <div><div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Categoría</div><div className="text-sm font-semibold text-foreground">{product.category}</div></div>}
            {product.presentation && <div><div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Forma farmacéutica</div><div className="text-sm font-semibold text-foreground">{product.presentation}</div></div>}
            {product.barcode && <div><div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Código de barras</div><div className="text-sm font-semibold text-foreground">{product.barcode}</div></div>}
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

