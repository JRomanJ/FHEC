import React, { useEffect, useState } from "react";
import {
  AlertTriangle, Bike, CheckCircle, Clock, CreditCard, FileText,
  Package, Store, Truck, Upload,
} from "lucide-react";
import { getAppProductViewModels } from "../../../services";
import type { CartItem, Page, Product } from "../../../app/types";
import { OrderItemsSummary } from "./OrderItemsSummary";
import { OrderPinCard } from "./OrderPinCard";
import { OrderReviewForm } from "./OrderReviewForm";
import { OrderTrackingTimeline, type TrackingStep } from "./OrderTrackingTimeline";
import { H7, H9, effectivePrice } from "./trackingShared";
import { OrderCancelledScreen, ThanksPopup, TrackingHeader } from "./TrackingFeedbackModals";
import { getRemoteOrder, type RemoteOrder } from "../../../services/orderService";
import { getRemoteRecipes, replaceRemoteRecipe, type RemoteRecipe } from "../../../services/recipeService";

const PRODUCTS: Product[] = getAppProductViewModels();

// ─── TrackingPage ─────────────────────────────────────────────────────────────
export function TrackingPage({
  onNav,
  orderItems = [],
  deliveryMode: initialDeliveryMode = "delivery",
  discountPct = 0,
  onOrderComplete,
  onOrderExpired,
  remoteOrder,
  onRemoteOrderChange,
}: {
  onNav: (p: Page) => void;
  orderItems?: CartItem[];
  deliveryMode?: "delivery" | "pickup";
  discountPct?: number;
  onOrderComplete?: () => void;
  onOrderExpired?: () => void;
  remoteOrder: RemoteOrder | null;
  onRemoteOrderChange: (order: RemoteOrder) => void;
}) {
  // ── Demo controls ──
  const [demoDeliveryMode, setDemoDeliveryMode] = useState<"delivery" | "pickup">(initialDeliveryMode);
  const [demoHasRecipe, setDemoHasRecipe] = useState(orderItems.some(i => i.product.needsRecipe || i.product.controlledSubstance));

  const [orderCancelled, setOrderCancelled] = useState(false);
  const [remoteRecipes, setRemoteRecipes] = useState<RemoteRecipe[]>([]);

  // ── Steps computed from demo options ──
  const steps: TrackingStep[] = [
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
  const [reuploadedRecipes, setReuploadedRecipes] = useState<Set<number | string>>(new Set());
  const [recipeUploadError, setRecipeUploadError] = useState("");
  const [recipeUploadingId, setRecipeUploadingId] = useState<string | null>(null);
  const demoRejectedProducts = [
    { id: 2, name: "Losartán 50mg", reason: "El récipe no tiene sello del médico visible" },
    { id: 3, name: "Amoxicilina 500mg", reason: "Récipe fuera de vigencia (más de 30 días)" },
  ];

  // ── Rating ──
  const rejectedProducts = remoteOrder
    ? remoteRecipes.filter(recipe => recipe.estado_recipe === "rechazado").map(recipe => ({
        id: recipe.id_recipe,
        recipeId: recipe.id_recipe,
        name: [recipe.detalles_pedidos.productos.principio_activo, recipe.detalles_pedidos.productos.concentracion].filter(Boolean).join(" "),
        reason: [...(recipe.razones_rechazo ?? []), recipe.comentario_auditoria ?? ""].filter(Boolean).join(". ") || "El recipe requiere correcciones.",
      }))
    : demoRejectedProducts.map(product => ({ ...product, recipeId: null }));

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

  useEffect(() => {
    if (!remoteOrder) return;
    setDemoDeliveryMode(remoteOrder.metodo_entrega);
    setDemoHasRecipe((remoteOrder.detalles_pedidos ?? []).some(detail => detail.requiere_recipe));
    const refresh = async () => {
      try {
        const [order, recipes] = await Promise.all([getRemoteOrder(remoteOrder.id_pedido), getRemoteRecipes()]);
        onRemoteOrderChange(order);
        setRemoteRecipes(recipes.filter(recipe => recipe.detalles_pedidos.id_pedido === order.id_pedido));
      } catch (error) {
        console.error("No se pudo actualizar el pedido:", error);
      }
    };
    void refresh();
    const interval = window.setInterval(() => { void refresh(); }, 10_000);
    return () => window.clearInterval(interval);
  }, [remoteOrder?.id_pedido]);

  useEffect(() => {
    if (remoteOrder) setRecipeRejected(remoteRecipes.some(recipe => recipe.estado_recipe === "rechazado"));
  }, [remoteOrder, remoteRecipes]);

  useEffect(() => {
    if (!remoteOrder) return;
    setTimeLeft(current => ({
      ...current,
      payment: Math.max(0, Math.floor((new Date(remoteOrder.fecha_limite).getTime() - Date.now()) / 1000)),
    }));
  }, [remoteOrder?.fecha_limite]);

  const reuploadRejectedRecipe = async (recipeId: string, file: File) => {
    if (!remoteOrder) return;
    setRecipeUploadingId(recipeId);
    setRecipeUploadError("");
    try {
      const updated = await replaceRemoteRecipe(remoteOrder.id_pedido, recipeId, file);
      setRemoteRecipes(current => current.map(recipe => recipe.id_recipe === recipeId ? { ...recipe, ...updated } : recipe));
      setReuploadedRecipes(current => new Set(current).add(recipeId));
    } catch (error) {
      setRecipeUploadError(error instanceof Error ? error.message : "No se pudo reemplazar el recipe.");
    } finally {
      setRecipeUploadingId(null);
    }
  };

  useEffect(() => {
    if (!remoteOrder) return;
    if (remoteOrder.estado_pedido === "expirado") {
      setOrderCancelled(true);
      return;
    }
    setOrderCancelled(false);
    if (remoteOrder.estado_pedido === "completado") {
      if (prepIndex >= 0) setStatus(prepIndex);
      return;
    }
    const requiredDetails = (remoteOrder.detalles_pedidos ?? []).filter(detail => detail.requiere_recipe);
    const allApproved = requiredDetails.length === 0 || requiredDetails.every(detail => remoteRecipes.some(recipe => recipe.id_detalle_pedido === detail.id_detalle_pedido && recipe.estado_recipe === "aprobado"));
    const target = allApproved ? paymentIdx : medicalIdx;
    if (target >= 0) setStatus(target);
  }, [medicalIdx, paymentIdx, prepIndex, remoteOrder, remoteRecipes]);

  return (
    <div className="min-h-screen bg-[#f0fdf7]">


      {/* ── Order cancelled screen ── */}
      {orderCancelled && (
        <OrderCancelledScreen onNav={onNav} onDismiss={onOrderExpired} />
      )}

      {!orderCancelled && <>
      {/* ── Thanks popup ── */}
      {showThanksPopup && (
        <ThanksPopup rating={rating} onClose={() => setShowThanksPopup(false)} />
      )}

      {/* ── Header ── */}
      <TrackingHeader
        deliveryMode={demoDeliveryMode}
        label={steps[safeStatus]?.label ?? ""}
        lastIndex={lastIndex}
        onNav={onNav}
        safeStatus={safeStatus}
      />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-1 flex flex-col gap-4">

            <OrderPinCard deliveryMode={demoDeliveryMode} orderPin={orderPin} pinVisible={pinVisible} />

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
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6">
                <AlertTriangle size={24} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-amber-900 text-2xl uppercase mb-2" style={H9}>Pago Pendiente</div>
                  <p className="text-amber-700 text-sm mb-4">Expira en: <strong>{fmt(timeLeft.payment)}</strong></p>
                  <button onClick={() => onNav("checkout")} className="w-full flex items-center justify-center gap-1.5 bg-[#179150] text-white px-4 py-3 rounded-xl text-sm sm:text-base font-black uppercase hover:bg-green-700 transition-colors shadow-sm" style={H7}>
                    <CreditCard size={16} /> Pagar Ahora
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

            <OrderItemsSummary
              deliveryFee={deliveryFee}
              discountAmt={discountAmt}
              discountPct={discountPct}
              items={demoItems}
              ivaAmt={ivaAmt}
              subtotal={subtotal}
              total={total}
            />

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
                            <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" disabled={recipeUploadingId === product.recipeId} onChange={e => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (remoteOrder && product.recipeId) void reuploadRejectedRecipe(product.recipeId, file);
                              else setReuploadedRecipes(prev => new Set(prev).add(product.id));
                            }} />
                            <Upload size={12} className="text-red-600" />
                            <span className="text-[10px] font-black uppercase text-red-700" style={H9}>Cargar Récipe</span>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
                {recipeUploadError && <div className="mt-3 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs text-red-700">{recipeUploadError}</div>}
                {!remoteOrder && reuploadedRecipes.size === rejectedProducts.length && (
                  <button onClick={() => { setRecipeRejected(false); setReuploadedRecipes(new Set()); }} className="w-full mt-4 bg-[#179150] text-white py-2.5 rounded-xl font-black uppercase hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm" style={H7}>
                    <CheckCircle size={14} /> Reenviar a Auditoría
                  </button>
                )}
              </div>
            )}

            <OrderTrackingTimeline safeStatus={safeStatus} steps={steps} />

            {/* Rating — only when delivered and not yet reviewed */}
            {safeStatus === lastIndex && !reviewSubmitted && (
              <OrderReviewForm
                onSubmit={handleSubmitReview}
                rating={rating}
                reviewText={reviewText}
                setRating={setRating}
                setReviewText={setReviewText}
              />
            )}

            {/* Demo controls */}
            {!remoteOrder && <div className="bg-muted rounded-2xl p-4">
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
            </div>}

          </div>
        </div>
      </div>
      </>}
    </div>
  );
}
