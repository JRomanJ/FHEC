import React, { useState, useEffect } from "react";
import {
  FileText, CreditCard, Package, Truck, Store, Bike, CheckCircle, Star,
  Clock, AlertTriangle, Shield, Check, ArrowLeft, Upload,
} from "lucide-react";
import { Page, H9, H7, fmtUSD, fmtVES, PRODUCTS } from "../shared";
import { ProductBox } from "./ProductCard";

export function TrackingPage({ onNav }: { onNav: (p: Page) => void }) {
  const [status, setStatus] = useState(0);
  const [recipeRejected, setRecipeRejected] = useState(false);
  const [rejectedProducts, setRejectedProducts] = useState<Array<{id: number; name: string; reason: string}>>([
    { id: 2, name: "Losartán 50mg", reason: "El récipe no tiene sello del médico visible" },
    { id: 3, name: "Amoxicilina 500mg", reason: "Récipe fuera de vigencia (más de 30 días)" }
  ]);
  const [reuploadedRecipes, setReuploadedRecipes] = useState<Set<number>>(new Set());
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const orderType: "delivery" | "pickup" | "controlled" = "delivery"; // demo
  const orderPin = "1234";
  const needsPayment = true; // demo

  // Countdown states
  const [timeLeft, setTimeLeft] = useState({
    medicalReview: 180, // 3 minutes in seconds
    payment: 900, // 15 minutes
    controlledReservation: 86400, // 24 hours
    delivery: 2700 // 45 minutes
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => ({
        medicalReview: Math.max(0, prev.medicalReview - 1),
        payment: Math.max(0, prev.payment - 1),
        controlledReservation: Math.max(0, prev.controlledReservation - 1),
        delivery: Math.max(0, prev.delivery - 1)
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h ${m}m`;
    }
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const steps = [
    {
      icon: <FileText size={18} />,
      label: "En Revisión Médica",
      desc: "Nuestro equipo farmacéutico está verificando disponibilidad y validando los récipes médicos.",
      time: "04 dic, 10:32 AM",
    },
    {
      icon: <CreditCard size={18} />,
      label: "Pendiente por Pago",
      desc: "Récipes aprobados. Procede con el pago para continuar con la preparación de tu pedido.",
      time: needsPayment ? "04 dic, 10:35 AM" : "—",
      skip: !needsPayment
    },
    {
      icon: <Package size={18} />,
      label: "En Preparación",
      desc: "Tu pedido está siendo preparado y empacado con los más altos estándares de calidad.",
      time: "04 dic, 10:50 AM",
    },
    {
      icon: orderType === "pickup" || orderType === "controlled" ? <Store size={18} /> : <Truck size={18} />,
      label: orderType === "pickup" || orderType === "controlled" ? "Por Retirar" : "Listo para Delivery",
      desc: orderType === "pickup" || orderType === "controlled"
        ? "Tu pedido está listo. Preséntate en la sede con tu PIN y cédula para retirarlo."
        : "Tu pedido está listo y será asignado a un motorizado para su entrega.",
      time: "04 dic, 11:30 AM",
    },
    {
      icon: <Bike size={18} />,
      label: "En Camino",
      desc: "El motorizado está en camino a tu dirección. Mantén tu PIN listo para la entrega.",
      time: "04 dic, 12:05 PM",
      skip: orderType === "pickup" || orderType === "controlled"
    },
    {
      icon: <CheckCircle size={18} />,
      label: "Entregado",
      desc: "Pedido entregado exitosamente. ¡Gracias por confiar en Farmahumana FHEC!",
      time: "Pendiente",
    },
  ].filter(s => !s.skip);

  const handleFileUpload = (productId: number, _file: File) => {
    setReuploadedRecipes(prev => new Set(prev).add(productId));
  };

  const handleSubmitReview = () => {
    if (rating > 0) {
      setReviewSubmitted(true);
    }
  };

  const orderTotal = PRODUCTS.slice(0, 3).reduce((s, p) => s + p.priceUSD, 0) + 2.50;

  return (
    <div className="min-h-screen bg-[#f0fdf7]">
      {/* Top header bar */}
      <div className="bg-[#006064] text-white px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-white/50 text-[10px] uppercase tracking-widest font-semibold mb-0.5">Mi Pedido</div>
            <div className="text-2xl uppercase leading-none" style={H9}>#FHEC-20241204-8471</div>
            <div className="text-white/50 text-xs mt-1">Carlos A. Rodríguez · 4 dic. 2024 · {orderType === "controlled" ? "Pickup (Controlado)" : orderType === "pickup" ? "Pickup" : "Delivery"} · Ciudad Guayana</div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase
              ${status === steps.length - 1 ? "bg-[#179150] text-white" : "bg-[#50e9f8] text-[#006064]"}`} style={H9}>
              <span className="relative flex w-1.5 h-1.5">
                {status < steps.length - 1 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "currentColor" }} />}
                <span className="relative inline-flex rounded-full w-1.5 h-1.5" style={{ backgroundColor: "currentColor" }} />
              </span>
              {steps[status].label}
            </div>
            <button onClick={() => onNav("home")} className="text-white/60 hover:text-white text-xs flex items-center gap-1 transition-colors">
              <ArrowLeft size={13} /> Inicio
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-[#006064] pb-4 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center flex-1">
                <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= status ? "bg-[#50e9f8]" : "bg-white/15"}`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            {steps.map((s, i) => (
              <div key={s.label} className={`text-[9px] font-black uppercase truncate ${i <= status ? "text-[#50e9f8]" : "text-white/30"}`} style={H9}>
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 flex flex-col gap-4">

            {/* PIN Card */}
            <div className="bg-gradient-to-br from-[#006064] to-[#1a3a5c] rounded-2xl p-5 text-center border-2 border-[#50e9f8] shadow-lg">
              <div className="text-[#50e9f8] text-[10px] font-black uppercase tracking-widest mb-1" style={H9}>
                PIN de {orderType === "pickup" || orderType === "controlled" ? "Retiro" : "Recepción"}
              </div>
              <div className="text-white tracking-[0.4em]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 60 }}>
                {orderPin}
              </div>
              <p className="text-white/50 text-[10px] leading-relaxed mt-1">
                {orderType === "pickup" || orderType === "controlled"
                  ? "Preséntalo con tu cédula en farmacia"
                  : "Entrégalo al motorizado al recibir"}
              </p>
            </div>

            {/* Dynamic alert */}
            {status === 0 && !recipeRejected && (
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <Clock size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-blue-900 font-black text-xs uppercase mb-0.5" style={H9}>Revisión en Proceso</div>
                  <p className="text-blue-700 text-xs">Tiempo estimado: <strong>{formatTime(timeLeft.medicalReview)}</strong></p>
                </div>
              </div>
            )}
            {status === 1 && needsPayment && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-amber-900 font-black text-xs uppercase mb-0.5" style={H9}>Pago Pendiente</div>
                  <p className="text-amber-700 text-xs mb-2">Tiempo: <strong>{formatTime(timeLeft.payment)}</strong></p>
                  <button onClick={() => onNav("checkout")} className="w-full flex items-center justify-center gap-1.5 bg-[#179150] text-white px-3 py-2 rounded-xl text-xs font-black uppercase hover:bg-green-700 transition-colors" style={H7}>
                    <CreditCard size={11} /> Pagar Ahora
                  </button>
                </div>
              </div>
            )}
            {orderType === "controlled" && status >= 2 && status < steps.length - 1 && (
              <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-2xl p-4">
                <Shield size={16} className="text-purple-700 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-purple-900 font-black text-xs uppercase mb-0.5" style={H9}>Reserva Activa</div>
                  <p className="text-purple-700 text-xs">Récipe físico en: <strong>{formatTime(timeLeft.controlledReservation)}</strong></p>
                </div>
              </div>
            )}
            {status === steps.findIndex(s => s.label === "En Camino") && orderType === "delivery" && (
              <div className="flex items-start gap-3 bg-[#e0f5eb] border border-[#a7f3d0] rounded-2xl p-4">
                <Bike size={16} className="text-[#006064] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[#006064] font-black text-xs uppercase mb-0.5" style={H9}>Motorizado en Camino</div>
                  <p className="text-[#003d45] text-xs">Llega en: <strong>{formatTime(timeLeft.delivery)}</strong></p>
                </div>
              </div>
            )}
            {status === steps.length - 1 && reviewSubmitted && (
              <div className="bg-[#179150]/10 border border-[#179150]/30 rounded-2xl p-4 text-center">
                <CheckCircle size={22} className="text-[#179150] mx-auto mb-1" />
                <div className="text-[#179150] font-black text-xs uppercase" style={H9}>¡Gracias por tu valoración!</div>
              </div>
            )}

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
              <div className="text-xs font-black uppercase text-muted-foreground mb-3" style={H9}>Productos del Pedido</div>
              <div className="space-y-2.5">
                {PRODUCTS.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-center gap-2.5">
                    <div className="w-9 h-11 rounded-lg overflow-hidden flex-shrink-0">
                      <ProductBox product={p} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black uppercase truncate" style={H9}>{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">{p.brand}</div>
                    </div>
                    <div className="text-xs font-semibold text-[#179150] flex-shrink-0">{fmtUSD(p.priceUSD)}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 mt-3 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total</span>
                <div className="text-right">
                  <div className="text-sm text-[#179150]" style={H9}>{fmtUSD(orderTotal)}</div>
                  <div className="text-[10px] text-muted-foreground">{fmtVES(orderTotal)}</div>
                </div>
              </div>
            </div>

            <button onClick={() => onNav("catalog")} className="w-full bg-[#50e9f8] text-[#006064] py-3 rounded-xl font-black text-sm uppercase transition-colors hover:bg-[#2dd8e8]" style={H7}>
              + Nuevo Pedido
            </button>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Recipe rejected */}
            {recipeRejected && status === 0 && (
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
                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(product.id, f); }} />
                            <Upload size={12} className="text-red-600" />
                            <span className="text-[10px] font-black uppercase text-red-700" style={H9}>Cargar Récipe</span>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
                {reuploadedRecipes.size === rejectedProducts.length && (
                  <button onClick={() => { setRecipeRejected(false); setStatus(0); }} className="w-full mt-4 bg-[#179150] text-white py-2.5 rounded-xl font-black uppercase hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm" style={H7}>
                    <CheckCircle size={14} /> Reenviar a Auditoría
                  </button>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg uppercase text-foreground" style={H9}>Línea de Tiempo</h3>
                <div className="text-xs text-muted-foreground">{status + 1} / {steps.length} pasos</div>
              </div>
              <div className="space-y-1">
                {steps.map((s, i) => {
                  const done = i < status;
                  const current = i === status;
                  return (
                    <div key={s.label} className={`flex gap-3 p-3 rounded-xl transition-all ${current ? "bg-[#e0f5eb] border border-[#a7f3d0]" : done ? "bg-[#f0fdf4]" : "opacity-40"}`}>
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                          ${done ? "bg-[#179150] text-white" : current ? "bg-[#50e9f8] text-[#006064] shadow-[0_0_0_3px_rgba(80,233,248,0.2)]" : "bg-muted text-muted-foreground border border-border"}`}>
                          {done ? <Check size={13} /> : s.icon}
                        </div>
                        {i < steps.length - 1 && <div className={`w-px h-3 ${i < status ? "bg-[#179150]" : "bg-border"}`} />}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <div className={`text-xs uppercase font-black ${current ? "text-[#006064]" : done ? "text-[#179150]" : "text-muted-foreground"}`} style={H9}>{s.label}</div>
                          {current && <span className="flex items-center gap-1 text-[10px] text-[#50e9f8] font-semibold flex-shrink-0"><span className="w-1.5 h-1.5 bg-[#50e9f8] rounded-full animate-pulse" />En curso</span>}
                          {!current && <span className="text-[10px] text-muted-foreground flex-shrink-0">{s.time}</span>}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rating (when delivered) */}
            {status === steps.length - 1 && !reviewSubmitted && (
              <div className="bg-white border border-border rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#179150]/10 flex items-center justify-center flex-shrink-0">
                    <Star size={20} className="text-[#179150]" />
                  </div>
                  <div>
                    <h3 className="text-base uppercase text-foreground" style={H9}>¿Cómo fue tu experiencia?</h3>
                    <p className="text-xs text-muted-foreground">Tu opinión nos ayuda a mejorar</p>
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
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Demo: Simular Estado</div>
                <button onClick={() => setRecipeRejected(!recipeRejected)} className="px-2.5 py-1 bg-red-100 border border-red-200 text-red-700 rounded-lg text-[10px] font-bold hover:bg-red-200 transition-colors">
                  {recipeRejected ? "✓ Récipe OK" : "✗ Rechazar Récipe"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {steps.map((s, i) => (
                  <button key={s.label} onClick={() => setStatus(i)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${status === i ? "bg-[#50e9f8] text-[#006064]" : "bg-white border border-border text-muted-foreground hover:border-[#179150]"}`} style={H7}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
