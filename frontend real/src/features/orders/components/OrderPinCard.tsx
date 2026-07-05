import { Lock } from "lucide-react";
import { H9 } from "./trackingShared";

export function OrderPinCard({
  deliveryMode,
  orderPin,
  pinVisible,
}: {
  deliveryMode: "delivery" | "pickup";
  orderPin: string;
  pinVisible: boolean;
}) {
  return pinVisible ? (
    <div className="bg-gradient-to-br from-[#006064] to-[#1a3a5c] rounded-2xl p-5 text-center border-2 border-[#50e9f8] shadow-lg">
      <div className="text-[#50e9f8] text-[10px] font-black uppercase tracking-widest mb-0.5" style={H9}>
        PIN de {deliveryMode === "pickup" ? "Retiro" : "Recepción"}
      </div>
      <div className="text-white tracking-[0.4em]" style={{ fontFamily: "\"Barlow Condensed\", sans-serif", fontWeight: 900, fontSize: 60 }}>
        {orderPin}
      </div>
      <p className="text-white/50 text-[10px] leading-relaxed mt-1">
        {deliveryMode === "pickup" ? "Preséntalo con tu cédula en farmacia" : "Entrégalo al motorizado al recibir"}
      </p>
    </div>
  ) : (
    <div className="bg-muted rounded-2xl p-4 text-center border-2 border-dashed border-border">
      <Lock size={20} className="text-muted-foreground mx-auto mb-2" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        El PIN de {deliveryMode === "pickup" ? "retiro" : "recepción"} se mostrará una vez que tu pedido esté en preparación.
      </p>
    </div>
  );
}

