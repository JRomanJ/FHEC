import React, { useEffect, useState } from "react";
import {
  AlertTriangle, ArrowLeft, Bike, Check, CheckCircle, Clock, CreditCard, FileText, Lock,
  Package, Star, Store, Truck, Upload, X,
} from "lucide-react";
import { ProductBox } from "../../../components/product";
import { getAppProductViewModels } from "../../../services";
import type { CartItem, Page, Product } from "../../../app/types";

const VES_RATE = 40.50;
const fmtVES = (u: number) => "Bs.S " + (u * VES_RATE).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtUSD = (u: number) => "$" + u.toFixed(2);
const H9: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 };
const H7: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 };
const effectivePrice = (p: Product) => p.discount ? p.priceUSD * (1 - p.discount / 100) : p.priceUSD;
const PRODUCTS: Product[] = getAppProductViewModels();

// ─── TrackingPage ─────────────────────────────────────────────────────────────
export function TrackingPage({
  onNav,
  orderItems = [],
  deliveryMode: initialDeliveryMode = "delivery",
  discountPct = 0,
  onOrderComplete,
}: {
  onNav: (p: Page) => void;
  orderItems?: CartItem[];
  deliveryMode?: "delivery" | "pickup";
  discountPct?: number;
  onOrderComplete?: () => void;
}) {
  // ── Demo controls ──
  const [demoDeliveryMode, setDemoDeliveryMode] = useState<"delivery" | "pickup">(initialDeliveryMode);
  const [demoHasRecipe, setDemoHasRecipe] = useState(orderItems.some(i => i.product.needsRecipe || i.product.controlledSubstance));

  const [orderCancelled, setOrderCancelled] = useState(false);

  // ── Steps computed from demo options ──
  type Step = { id: string; icon: React.ReactNode; label: string; desc: string };
  const steps: Step[] = [
    ...(demoHasRecipe ? [{
      id: "medical",
      icon: <FileText size={18} />,
      label: "En Revisión Médica",
      desc: "Nuestro equipo farmacéutico está validando los récipes médicos.",
    }] : []),
    {
      id: "payment",
      icon: <CreditCard size={18} />,
      label: "Pendiente por Pago",
      desc: "Procede con el pago para continuar con la preparación de tu pedido.",
    },
    {
      id: "preparation",
      icon: <Package size={18} />,
      label: "En Preparación",
      desc: "Tu pedido está siendo preparado y empacado.",
    },
    ...(demoDeliveryMode === "delivery" ? [
      {
        id: "ready",
        icon: <Truck size={18} />,
        label: "Listo para Delivery",
        desc: "Tu pedido está siendo asignado a un repartidor para su entrega.",
      },
      {
        id: "transit",
        icon: <Bike size={18} />,
        label: "En Camino",
        desc: "El repartidor está en camino a tu dirección. Mantén tu PIN listo.",
      },
    ] : [{
      id: "ready",
      icon: <Store size={18} />,
      label: "Por Retirar",
      desc: "Tu pedido está listo. Preséntate en la sede con tu PIN y cédula.",
    }]),
    {
      id: "delivered",
      icon: <CheckCircle size={18} />,
      label: "Entregado",
      desc: "Pedido entregado exitosamente. ¡Gracias por confiar en Farmahumana!",
    },
  ];

  const [status, setStatus] = useState(0);
  // Clamp status when steps shrink (e.g. switching delivery mode changes step count)
  const safeStatus = Math.min(status, steps.length - 1);
  const prepIndex = steps.findIndex(s => s.id === "preparation");
  const lastIndex = steps.length - 1;
  // PIN only visible once "En Preparación" is reached (client has paid)
  const pinVisible = safeStatus >= prepIndex && prepIndex >= 0;

  // ── Recipe rejection ──
  const [recipeRejected, setRecipeRejected] = useState(false);
  const [reuploadedRecipes, setReuploadedRecipes] = useState<Set<number>>(new Set());
  const rejectedProducts = [
    { id: 2, name: "Losartán 50mg", reason: "El récipe no tiene sello del médico visible" },
    { id: 3, name: "Amoxicilina 500mg", reason: "Récipe fuera de vigencia (más de 30 días)" },
  ];

  // ── Rating ──
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showThanksPopup, setShowThanksPopup] = useState(false);

  // ── Timers ──
  const [timeLeft, setTimeLeft] = useState({ medicalReview: 180, payment: 900, delivery: 2700 });
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => ({
      medicalReview: Math.max(0, p.medicalReview - 1),
      payment: Math.max(0, p.payment - 1),
      delivery: Math.max(0, p.delivery - 1),
    })), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (s: number) => s >= 3600
    ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
    : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ── Financial summary ──
  const demoItems = orderItems.length > 0
    ? orderItems
    : PRODUCTS.slice(0, 3).map(p => ({ product: p, quantity: 1 }));
  const subtotal = demoItems.reduce((s, i) => s + effectivePrice(i.product) * i.quantity, 0);
  const deliveryFee = demoDeliveryMode === "delivery" ? 2.50 : 0;
  const discountAmt = subtotal * discountPct / 100;
  const ivaAmt = +(subtotal * 0.16).toFixed(2);
  const total = +(subtotal + ivaAmt + deliveryFee - discountAmt).toFixed(2);

  const orderPin = "1234";

  const handleSubmitReview = () => {
    if (rating > 0) {
      setReviewSubmitted(true);
      setShowThanksPopup(true);
      onOrderComplete?.();
    }
  };

  const medicalIdx = steps.findIndex(s => s.id === "medical");
  const paymentIdx = steps.findIndex(s => s.id === "payment");
  const transitIdx = steps.findIndex(s => s.id === "transit");

  return (
    <div className="min-h-screen bg-[#f0fdf7]">


      {/* ── Order cancelled screen ── */}
      {orderCancelled && (
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <X size={38} className="text-red-500" />
          </div>
          <h2 className="text-3xl uppercase text-foreground mb-2" style={H9}>Pedido Cancelado</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Tu pedido fue cancelado. El reembolso será procesado en los próximos días hábiles.
          </p>
          <button onClick={() => onNav("home")} className="w-full bg-[#179150] text-white py-3.5 rounded-xl uppercase hover:bg-green-700 transition-colors" style={H7}>
            Volver al Inicio
          </button>
        </div>
      )}

      {!orderCancelled && <>
      {/* ── Thanks popup ── */}
      {showThanksPopup && (
        <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-10 shadow-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-[#179150] flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h2 className="text-3xl uppercase text-foreground mb-2" style={H9}>¡Gracias por tu valoración!</h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Compartiste <strong>{rating} estrella{rating !== 1 ? "s" : ""}</strong>. ¡Ya puedes hacer un nuevo pedido!
            </p>
            <div className="flex gap-1.5 justify-center mb-6">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={28} className={s <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
              ))}
            </div>
            <button onClick={() => setShowThanksPopup(false)}
              className="w-full bg-[#179150] text-white py-3.5 rounded-xl font-black uppercase hover:bg-green-700 transition-colors"
              style={H7}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-[#006064] text-white px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-white/50 text-[10px] uppercase tracking-widest font-semibold mb-0.5">Mi Pedido</div>
            <div className="text-2xl uppercase leading-none" style={H9}>#FHEC-20241204-8471</div>
            <div className="text-white/50 text-xs mt-1">
              Carlos A. Rodríguez · 4 dic. 2024 · {demoDeliveryMode === "delivery" ? "Delivery" : "Pickup"} · Ciudad Guayana
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => document.getElementById("tracking-timeline")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase cursor-pointer hover:opacity-90 transition-opacity
                ${safeStatus === lastIndex ? "bg-[#179150] text-white" : "bg-[#50e9f8] text-[#006064]"}`}
              style={H9}
            >
              <span className="relative flex w-1.5 h-1.5">
                {safeStatus < lastIndex && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "currentColor" }} />}
                <span className="relative inline-flex rounded-full w-1.5 h-1.5" style={{ backgroundColor: "currentColor" }} />
              </span>
              {steps[safeStatus]?.label}
            </button>
            <button onClick={() => onNav("home")} className="text-white/60 hover:text-white text-xs flex items-center gap-1 transition-colors">
              <ArrowLeft size={13} /> Inicio
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-1 flex flex-col gap-4">

            {/* PIN Card — only after "En Preparación" (client has paid) */}
            {pinVisible ? (
              <div className="bg-gradient-to-br from-[#006064] to-[#1a3a5c] rounded-2xl p-5 text-center border-2 border-[#50e9f8] shadow-lg">
                <div className="text-[#50e9f8] text-[10px] font-black uppercase tracking-widest mb-0.5" style={H9}>
                  PIN de {demoDeliveryMode === "pickup" ? "Retiro" : "Recepción"}
                </div>
                <div className="text-white tracking-[0.4em]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 60 }}>
                  {orderPin}
                </div>
                <p className="text-white/50 text-[10px] leading-relaxed mt-1">
                  {demoDeliveryMode === "pickup" ? "Preséntalo con tu cédula en farmacia" : "Entrégalo al motorizado al recibir"}
                </p>
              </div>
            ) : (
              <div className="bg-muted rounded-2xl p-4 text-center border-2 border-dashed border-border">
                <Lock size={20} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  El PIN de {demoDeliveryMode === "pickup" ? "retiro" : "recepción"} se mostrará una vez que tu pedido esté en preparación.
                </p>
              </div>
            )}

            {/* Contextual alerts */}
            {safeStatus === medicalIdx && medicalIdx >= 0 && !recipeRejected && (
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <Clock size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-blue-900 font-black text-xs uppercase mb-0.5" style={H9}>Revisión en Proceso</div>
                  <p className="text-blue-700 text-xs">Tiempo estimado: <strong>{fmt(timeLeft.medicalReview)}</strong></p>
                </div>
              </div>
            )}
            {safeStatus === paymentIdx && paymentIdx >= 0 && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-amber-900 font-black text-xs uppercase mb-0.5" style={H9}>Pago Pendiente</div>
                  <p className="text-amber-700 text-xs mb-2">Expira en: <strong>{fmt(timeLeft.payment)}</strong></p>
                  <button onClick={() => onNav("checkout")} className="w-full flex items-center justify-center gap-1.5 bg-[#179150] text-white px-3 py-2 rounded-xl text-xs font-black uppercase hover:bg-green-700 transition-colors" style={H7}>
                    <CreditCard size={11} /> Pagar Ahora
                  </button>
                </div>
              </div>
            )}
            {safeStatus === transitIdx && transitIdx >= 0 && (
              <div className="flex items-start gap-3 bg-[#e0f5eb] border border-[#a7f3d0] rounded-2xl p-4">
                <Bike size={16} className="text-[#006064] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[#006064] font-black text-xs uppercase mb-0.5" style={H9}>Motorizado en Camino</div>
                  <p className="text-[#003d45] text-xs">Llega en: <strong>{fmt(timeLeft.delivery)}</strong></p>
                </div>
              </div>
            )}
            {safeStatus === lastIndex && reviewSubmitted && (
              <div className="bg-[#179150]/10 border border-[#179150]/30 rounded-2xl p-4 text-center">
                <CheckCircle size={22} className="text-[#179150] mx-auto mb-1" />
                <div className="text-[#179150] font-black text-xs uppercase" style={H9}>¡Gracias por tu valoración!</div>
              </div>
            )}

            {/* Products + financial summary */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
              <div className="text-base font-black uppercase text-foreground mb-3" style={H9}>Productos del Pedido</div>
              <div className="space-y-2.5 mb-3">
                {demoItems.map(({ product: p, quantity }) => (
                  <div key={p.id} className="flex items-center gap-2.5">
                    <div className="w-9 h-11 rounded-lg overflow-hidden flex-shrink-0">
                      <ProductBox product={p} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black uppercase truncate" style={H9}>{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">{p.brand} · ×{quantity}</div>
                    </div>
                    <div className="text-xs font-semibold text-[#179150] flex-shrink-0">{fmtUSD(effectivePrice(p) * quantity)}</div>
                  </div>
                ))}
              </div>
              {/* Financial breakdown */}
              <div className="border-t border-border pt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span><span>{fmtUSD(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>IVA (16%)</span><span>{fmtUSD(ivaAmt)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Costo de envío</span>
                  <span>{deliveryFee > 0 ? fmtUSD(deliveryFee) : <span className="text-[#179150] font-semibold">Gratis</span>}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between text-xs text-[#179150]">
                    <span>Descuento ({discountPct}%)</span><span>−{fmtUSD(discountAmt)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-foreground pt-1.5 border-t border-border" style={H9}>
                  <span>Total</span>
                  <div className="text-right">
                    <div className="text-[#179150]">{fmtUSD(total)}</div>
                    <div className="text-[10px] font-normal text-muted-foreground">{fmtVES(total)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* "Nuevo Pedido" — only after review is submitted */}
            {safeStatus === lastIndex && reviewSubmitted && (
              <button
                onClick={() => onNav("catalog")}
                className="w-full bg-[#50e9f8] text-[#006064] py-3 rounded-xl font-black text-sm uppercase transition-colors hover:bg-[#2dd8e8]"
                style={H7}
              >
                + Nuevo Pedido
              </button>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Recipe rejected card */}
            {recipeRejected && safeStatus === medicalIdx && medicalIdx >= 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-red-900 font-black text-sm uppercase mb-1" style={H9}>Récipe Rechazado</div>
                    <p className="text-red-700 text-xs leading-relaxed">Carga nuevos récipes corregidos para los productos indicados.</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {rejectedProducts.map(product => {
                    const reuploaded = reuploadedRecipes.has(product.id);
                    return (
                      <div key={product.id} className="bg-white border border-red-200 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="text-xs font-black uppercase" style={H9}>{product.name}</div>
                          {reuploaded && <span className="bg-green-100 text-[#179150] text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1" style={H9}><CheckCircle size={9} /> OK</span>}
                        </div>
                        <div className="text-[10px] text-red-700 mb-2">{product.reason}</div>
                        {!reuploaded && (
                          <label className="flex items-center justify-center gap-1.5 border-2 border-dashed border-red-300 rounded-xl p-2 cursor-pointer hover:border-red-400 transition-all">
                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) setReuploadedRecipes(prev => new Set(prev).add(product.id)); }} />
                            <Upload size={12} className="text-red-600" />
                            <span className="text-[10px] font-black uppercase text-red-700" style={H9}>Cargar Récipe</span>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
                {reuploadedRecipes.size === rejectedProducts.length && (
                  <button onClick={() => { setRecipeRejected(false); setReuploadedRecipes(new Set()); }} className="w-full mt-4 bg-[#179150] text-white py-2.5 rounded-xl font-black uppercase hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm" style={H7}>
                    <CheckCircle size={14} /> Reenviar a Auditoría
                  </button>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6" id="tracking-timeline">
              <h3 className="text-2xl uppercase text-foreground mb-6" style={H9}>Línea de Tiempo</h3>
              {/* Mobile: vertical */}
              <div className="flex flex-col gap-0 sm:hidden">
                {steps.map((s, i) => {
                  const done = i < safeStatus;
                  const current = i === safeStatus;
                  return (
                    <div key={s.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-sm
                          ${done ? "bg-[#179150] text-white" : current ? "bg-[#50e9f8] text-[#006064] ring-4 ring-[#50e9f8]/20" : "bg-[#e0f5eb] text-[#179150]/40"}`}>
                          {done ? <Check size={18} /> : s.icon}
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`w-px flex-1 my-1 ${done ? "bg-[#179150]" : "border-l-2 border-dashed border-border"}`} style={{ minHeight: 32 }} />
                        )}
                      </div>
                      <div className="pb-6 pt-2 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs uppercase font-black ${current ? "text-[#006064]" : done ? "text-[#179150]" : "text-muted-foreground"}`} style={H9}>{i + 1}. {s.label}</span>
                          {current && <span className="w-2 h-2 bg-[#50e9f8] rounded-full animate-pulse flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Desktop: horizontal */}
              <div className="hidden sm:flex items-start">
                {steps.map((s, i) => {
                  const done = i < safeStatus;
                  const current = i === safeStatus;
                  return (
                    <React.Fragment key={s.id}>
                      <div className="flex flex-col items-center text-center flex-1 min-w-0">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all shadow-sm
                          ${done ? "bg-[#179150] text-white" : current ? "bg-[#50e9f8] text-[#006064] ring-4 ring-[#50e9f8]/20" : "bg-[#e0f5eb] text-[#179150]/50"}`}>
                          {done ? <Check size={22} /> : s.icon}
                        </div>
                        <div className={`text-xs uppercase font-black mb-1 leading-tight ${current ? "text-[#006064]" : done ? "text-[#179150]" : "text-muted-foreground/50"}`} style={H9}>
                          {i + 1}. {s.label}
                        </div>
                        <p className={`text-[11px] leading-relaxed px-1 ${current || done ? "text-muted-foreground" : "text-muted-foreground/40"}`}>{s.desc}</p>
                        {current && <span className="mt-1.5 text-[10px] text-[#179150] font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#50e9f8] rounded-full animate-pulse" />En curso</span>}
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`flex-shrink-0 w-8 mt-7 border-t-2 border-dashed ${done ? "border-[#179150]" : "border-border"}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Rating — only when delivered and not yet reviewed */}
            {safeStatus === lastIndex && !reviewSubmitted && (
              <div className="bg-white border border-border rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#179150]/10 flex items-center justify-center flex-shrink-0">
                    <Star size={20} className="text-[#179150]" />
                  </div>
                  <div>
                    <h3 className="text-base uppercase text-foreground" style={H9}>¿Cómo fue tu experiencia?</h3>
                    <p className="text-xs text-muted-foreground">Tu valoración habilita el botón de nuevo pedido</p>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => setRating(star)} className="transition-all hover:scale-110">
                      <Star size={34} className={`transition-colors ${star <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-300 hover:text-amber-300"}`} />
                    </button>
                  ))}
                </div>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Cuéntanos sobre tu experiencia..." className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] transition-all resize-none mb-3" rows={3} />
                <button onClick={handleSubmitReview} disabled={rating === 0} className={`w-full py-2.5 rounded-xl font-black uppercase transition-all flex items-center justify-center gap-2 text-sm ${rating > 0 ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`} style={H7}>
                  <CheckCircle size={15} /> Enviar Valoración
                </button>
              </div>
            )}

            {/* Demo controls */}
            <div className="bg-muted rounded-2xl p-4">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-3">Demo: Controles de Visualización</div>

              {/* Delivery type */}
              <div className="mb-3">
                <div className="text-[10px] text-muted-foreground mb-1.5 font-semibold">Tipo de Entrega</div>
                <div className="flex gap-1.5">
                  {(["delivery", "pickup"] as const).map(mode => (
                    <button key={mode} onClick={() => { setDemoDeliveryMode(mode); setStatus(0); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${demoDeliveryMode === mode ? "bg-[#50e9f8] text-[#006064]" : "bg-white border border-border text-muted-foreground hover:border-[#179150]"}`}
                      style={H7}>
                      {mode === "delivery" ? "🛵 Delivery" : "🏪 Pickup"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipe toggle */}
              <div className="mb-3">
                <div className="text-[10px] text-muted-foreground mb-1.5 font-semibold">Requiere Récipe Médico</div>
                <div className="flex gap-1.5">
                  {([true, false] as const).map(v => (
                    <button key={String(v)} onClick={() => { setDemoHasRecipe(v); setStatus(0); setRecipeRejected(false); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${demoHasRecipe === v ? "bg-[#50e9f8] text-[#006064]" : "bg-white border border-border text-muted-foreground hover:border-[#179150]"}`}
                      style={H7}>
                      {v ? "Con Récipe" : "Sin Récipe"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step selector */}
              <div className="mb-3">
                <div className="text-[10px] text-muted-foreground mb-1.5 font-semibold">Estado Actual</div>
                <div className="flex flex-wrap gap-1.5">
                  {steps.map((s, i) => (
                    <button key={s.id} onClick={() => setStatus(i)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${safeStatus === i ? "bg-[#50e9f8] text-[#006064]" : "bg-white border border-border text-muted-foreground hover:border-[#179150]"}`}
                      style={H7}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipe rejection toggle */}
              {demoHasRecipe && (
                <div className="flex gap-1.5 pt-2 border-t border-border">
                  {!recipeRejected
                    ? <button onClick={() => setRecipeRejected(true)} className="px-2.5 py-1 bg-red-100 border border-red-200 text-red-700 rounded-lg text-[10px] font-bold hover:bg-red-200 transition-colors">Caso Récipe Rechazado</button>
                    : <button onClick={() => { setRecipeRejected(false); setReuploadedRecipes(new Set()); }} className="px-2.5 py-1 bg-green-100 border border-green-300 text-[#179150] rounded-lg text-[10px] font-bold hover:bg-green-200 transition-colors">Caso Récipe Aprobado</button>
                  }
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      </>}
    </div>
  );
}
