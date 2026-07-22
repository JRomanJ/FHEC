import { ArrowLeft, CheckCircle, Star, X } from "lucide-react";
import type { Page } from "../../../app/types";
import { H7, H9 } from "./trackingShared";

export function OrderCancelledScreen({ onNav, onDismiss }: { onNav: (p: Page) => void; onDismiss?: () => void }) {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
        <X size={38} className="text-red-500" />
      </div>
      <h2 className="text-3xl uppercase text-foreground mb-2" style={H9}>Pedido Expirado</h2>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        El tiempo para confirmar el pago terminó. La reserva fue liberada y el stock de los productos se restauró.
      </p>
      <button onClick={() => { onDismiss?.(); onNav("home"); }} className="w-full bg-[#179150] text-white py-3.5 rounded-xl uppercase hover:bg-green-700 transition-colors" style={H7}>
        Volver al Inicio
      </button>
    </div>
  );
}

export function TrackingHeader({
  deliveryMode,
  label,
  onNav,
  safeStatus,
  lastIndex,
}: {
  deliveryMode: "delivery" | "pickup";
  label: string;
  onNav: (p: Page) => void;
  safeStatus: number;
  lastIndex: number;
}) {
  return (
    <div className="bg-[#006064] text-white px-4 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-white/50 text-[10px] uppercase tracking-widest font-semibold mb-0.5">Mi Pedido</div>
          <div className="text-2xl uppercase leading-none" style={H9}>#FHEC-20241204-8471</div>
          <div className="text-white/50 text-xs mt-1">
            Carlos A. Rodríguez · 4 dic. 2024 · {deliveryMode === "delivery" ? "Delivery" : "Pickup"} · Ciudad Guayana
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3">
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
            {label}
          </button>
          <button onClick={() => onNav("home")} className="text-white/60 hover:text-white text-xs flex items-center gap-1 transition-colors">
            <ArrowLeft size={13} /> Inicio
          </button>
        </div>
      </div>
    </div>
  );
}

export function ThanksPopup({
  onClose,
  rating,
}: {
  onClose: () => void;
  rating: number;
}) {
  return (
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
        <button onClick={onClose}
          className="w-full bg-[#179150] text-white py-3.5 rounded-xl font-black uppercase hover:bg-green-700 transition-colors"
          style={H7}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

