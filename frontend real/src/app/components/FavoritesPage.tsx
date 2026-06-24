import React from "react";
import { ShoppingCart, Info } from "lucide-react";
import { Page, Product, CartItem, H9, H7 } from "../shared";
import { ProductCard } from "./ProductCard";

export function FavoritesPage({ products, favoriteIds, onProductClick, onAddToCart, onToggleFavorite, cartItems, onUpdateQuantity, onNav }: {
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
