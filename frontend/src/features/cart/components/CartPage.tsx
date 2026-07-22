import React, { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, ChevronRight, Minus, Package, Plus, Shield, ShoppingCart, Trash2, User, X } from "lucide-react";
import type { AuthUser, CartItem, Page, Product } from "../../../app/types";
import { effectivePrice, fmtUSD, fmtVES, H7, H9 } from "../../../app/data";
import { ProductBox } from "../../../components/product";
import {
  firstError,
  normalizeCouponCode,
  validateCartCanContinue,
  validateCartItemQuantity,
  validateCouponCodeInput,
} from "../../../validation";

// ─── CartPage ─────────────────────────────────────────────────────────────────
export function CartPage({ cartItems, setCartItems, onNav, discountApplied, discountCode, setDiscountApplied, setDiscountCode, user, hasActiveOrder = false, selectedSede = "principal", products, discountCodes }: {
  cartItems: CartItem[]; setCartItems: (items: CartItem[]) => void; onNav: (p: Page) => void;
  discountApplied: number; discountCode: string;
  setDiscountApplied: (n: number) => void; setDiscountCode: (s: string) => void;
  user: AuthUser | null;
  hasActiveOrder?: boolean;
  selectedSede?: string;
  products: Product[];
  discountCodes: Record<string, number>;
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
    const codeValidation = validateCouponCodeInput(discountInput);
    if (!codeValidation.valid) {
      setDiscountError(firstError(codeValidation));
      setDiscountSuccess("");
      setDiscountApplied(0);
      return;
    }
    const normalizedCode = normalizeCouponCode(discountInput);
    const pct = discountCodes[normalizedCode];
    if (pct) {
      setDiscountApplied(pct);
      setDiscountCode(normalizedCode);
      setDiscountSuccess(`¡Código aplicado! ${pct}% de descuento`);
      setDiscountError("");
    } else {
      setDiscountError("El cupón no existe o no está vigente.");
      setDiscountSuccess("");
      setDiscountApplied(0);
    }
  };

  const handleProcesar = () => {
    const cartValidation = validateCartCanContinue({ itemCount: cartItems.length });
    if (!cartValidation.valid) {
      toast.error(firstError(cartValidation));
      return;
    }
    if (hasActiveOrder) { onNav("tracking"); return; }
    if (!user) { setShowLoginModal(true); return; }
    for (const item of cartItems) {
      const avail = getSedeStock(item.product);
      const itemValidation = validateCartItemQuantity({ quantity: item.quantity, stock: avail });
      if (!itemValidation.valid && item.quantity <= 0) {
        toast.error(firstError(itemValidation));
        return;
      }
      if (item.quantity > avail) {
        const similar = products.filter(p =>
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
          <h1 className="text-xl sm:text-3xl uppercase text-foreground mb-1" style={H9}>Mi Carrito</h1>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Package size={14} />
            <span className="text-sm font-semibold lowercase">{cartItems.length} ítem{cartItems.length !== 1 ? "s" : ""}</span>
          </div>
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
