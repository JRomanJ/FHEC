import React, { useState, useEffect } from "react";
import {
  ShoppingCart, Plus, Minus, Trash2, ChevronRight, AlertTriangle, Shield,
  ArrowLeft, FileText, Upload, CheckCircle, Info, ClipboardList,
} from "lucide-react";
import { Page, CartItem, H9, H7, fmtUSD, fmtVES } from "../shared";
import { ProductBox } from "./ProductCard";

export function CartPage({ cartItems, setCartItems, onNav }: {
  cartItems: CartItem[]; setCartItems: (items: CartItem[]) => void; onNav: (p: Page) => void;
}) {
  const updateQty = (id: number, delta: number) => {
    setCartItems(cartItems.map(i => i.product.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };
  const remove = (id: number) => setCartItems(cartItems.filter(i => i.product.id !== id));
  const subtotal = cartItems.reduce((s, i) => s + i.product.priceUSD * i.quantity, 0);
  const delivery = subtotal > 0 ? 2.50 : 0;
  const total = subtotal + delivery;
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
    if (window.confirm("¿Estás seguro de que deseas vaciar el carrito?")) {
      setCartItems([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-16 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl uppercase text-foreground" style={H9}>Mi Carrito ({cartItems.length} ítem{cartItems.length !== 1 ? "s" : ""})</h1>
        <button
          onClick={clearCart}
          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-semibold"
        >
          <Trash2 size={14} />
          Vaciar carrito
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
                    <div className="text-[#179150] text-lg leading-none" style={H9}>{fmtUSD(item.product.priceUSD * item.quantity)}</div>
                    <div className="text-muted-foreground text-xs">{fmtVES(item.product.priceUSD * item.quantity)}</div>
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

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold">{fmtUSD(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span />
                <span>{fmtVES(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery estimado</span>
                <span className="font-semibold">{fmtUSD(delivery)}</span>
              </div>
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
              onClick={() => onNav("preCheckout")}
              className="w-full bg-[#50e9f8] text-[#006064] py-3 rounded-xl uppercase text-base flex items-center justify-center gap-2 hover:bg-[#2dd8e8] transition-colors"
              style={H7}
            >
              Proceder al Checkout <ChevronRight size={16} />
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

// ─── PreCheckoutMedicalPage ───────────────────────────────────────────────────
export function PreCheckoutMedicalPage({ cartItems, onNav }: { cartItems: CartItem[]; onNav: (p: Page) => void }) {
  const regulatedItems = cartItems.filter(i => i.product.needsRecipe || i.product.controlledSubstance);
  const hasControlled = cartItems.some(i => i.product.controlledSubstance);
  const [files, setFiles] = useState<Record<number, File | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showPsyPopup, setShowPsyPopup] = useState(false);
  const [psyAcknowledged, setPsyAcknowledged] = useState(false);

  useEffect(() => {
    if (regulatedItems.length === 0) { onNav("checkout"); return; }
    if (hasControlled && !psyAcknowledged) setShowPsyPopup(true);
  }, [hasControlled, psyAcknowledged, regulatedItems.length, onNav]);

  const allUploaded = regulatedItems.every(i => i.product.controlledSubstance || files[i.product.id]);

  const handleSubmit = () => {
    if (!allUploaded) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 pb-16 mt-16 text-center">
        <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <ClipboardList size={38} className="text-white" />
        </div>
        <h1 className="text-4xl uppercase text-foreground mb-2" style={H9}>Solicitud Enviada a Auditoría</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Tu pedido ha sido enviado a nuestro equipo de auditoría médica. El estado actual es <strong className="text-amber-600">En revisión médica</strong>. Recibirás una notificación en la página cuando sea aprobado.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 text-left">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-amber-900 font-black text-sm uppercase mb-1" style={H9}>Pedido bloqueado temporalmente</div>
              <p className="text-amber-800 text-xs leading-relaxed">No podrás proceder al pago hasta que un auditor médico apruebe tus récipes. Este proceso puede tardar aproximadamente 3 minutos en horario de atención.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={() => onNav("tracking")} className="w-full bg-[#50e9f8] text-[#006064] py-3 rounded-xl uppercase font-black" style={H7}>
            Seguir Estado del Pedido
          </button>
          <button onClick={() => onNav("home")} className="w-full border border-border py-3 rounded-xl text-sm font-semibold hover:bg-muted transition-colors">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 mt-6">
      {/* Psychotropic modal */}
      {showPsyPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Shield size={30} className="text-purple-700" />
            </div>
            <h2 className="text-2xl uppercase text-purple-900 text-center mb-3" style={H9}>Aviso: Psicotrópico Controlado</h2>
            <p className="text-purple-800 text-sm text-center leading-relaxed mb-5">
              Tu pedido contiene <strong>sustancias psicotrópicas controladas</strong> bajo regulación del MPPS. Esta transacción se procesará como una <strong className="text-purple-700">Reserva de Inventario</strong>. Por disposición legal:
            </p>
            <ul className="space-y-2 mb-6 text-sm text-purple-800">
              {[
                "El Delivery queda deshabilitado para este pedido.",
                "El Pago Electrónico no está disponible (solo Pago Presencial).",
                "Debes presentar el récipe médico original físico al momento del retiro.",
                "El personal verificará tu identidad con cédula de identidad original.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-700 flex-shrink-0 mt-1.5" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => { setPsyAcknowledged(true); setShowPsyPopup(false); }}
              className="w-full bg-purple-700 text-white py-3 rounded-xl uppercase font-black hover:bg-purple-800 transition-colors"
              style={H7}
            >
              Entendido, Continuar
            </button>
          </div>
        </div>
      )}

      {/* Back */}
      <button onClick={() => onNav("cart")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm font-semibold">
        <ArrowLeft size={16} /> Volver al carrito
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <FileText size={20} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl uppercase text-foreground leading-none" style={H9}>Validación Médica</h1>
            <p className="text-muted-foreground text-sm">Carga los récipes para continuar</p>
          </div>
        </div>
      </div>

      {hasControlled && (
        <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-5">
          <Shield size={18} className="text-purple-700 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-purple-900 font-black text-sm uppercase" style={H9}>Reserva de Inventario · Solo Pickup</div>
            <p className="text-purple-700 text-xs mt-1 leading-relaxed">Por regulación del MPPS, los psicotrópicos solo se pueden retirar en tienda con récipe físico original.</p>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-8">
        {regulatedItems.map(item => {
          const file = files[item.product.id];
          return (
            <div key={item.product.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-14 rounded-xl overflow-hidden flex-shrink-0">
                  <ProductBox product={item.product} size="sm" />
                </div>
                <div className="flex-1">
                  <div className="text-foreground font-black uppercase leading-tight" style={H9}>{item.product.name}</div>
                  <div className="text-xs text-muted-foreground">{item.product.brand} · {item.product.packSize} · ×{item.quantity}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {item.product.controlledSubstance ? (
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1" style={H9}>
                        <Shield size={9} /> Psicotrópico
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1" style={H9}>
                        <AlertTriangle size={9} /> Récipe Requerido
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {item.product.controlledSubstance ? (
                <div className="flex items-start gap-3 bg-orange-50 border-2 border-orange-300 rounded-xl p-4">
                  <AlertTriangle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-orange-900 font-black text-sm uppercase mb-1" style={H9}>Récipe Físico Obligatorio</div>
                    <p className="text-orange-800 text-xs leading-relaxed">
                      Tiene <strong>24 horas</strong> para presentar el récipe original físico, cancelar los productos y retirarlos. No se aceptan récipes digitales, fotografías ni copias para sustancias psicotrópicas.
                    </p>
                  </div>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all
                  ${file ? "border-[#179150] bg-[#179150]/5" : "border-border hover:border-[#179150] hover:bg-[#179150]/5"}`}>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0] ?? null;
                      setFiles(prev => ({ ...prev, [item.product.id]: f }));
                    }}
                  />
                  {file ? (
                    <div className="flex items-center gap-2 text-[#179150]">
                      <CheckCircle size={20} />
                      <div>
                        <div className="text-sm font-black" style={H9}>Récipe cargado</div>
                        <div className="text-xs text-[#179150]/70 truncate max-w-[200px]">{file.name}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload size={22} />
                      <div className="text-sm font-semibold">Cargar récipe médico</div>
                      <div className="text-xs">PDF o imagen (JPG, PNG)</div>
                    </div>
                  )}
                </label>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-xs leading-relaxed">
            Al enviar, un auditor médico certificado revisará tus récipes. Este proceso puede tardar aproximadamente 3 minutos en horario de atención. Recibirás una notificación en la página cuando esté aprobado.
          </p>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allUploaded}
        className={`w-full py-4 rounded-xl uppercase flex items-center justify-center gap-2 transition-all
          ${allUploaded ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        style={H7}
      >
        <ClipboardList size={18} />
        Enviar a Auditoría Médica
      </button>
    </div>
  );
}
