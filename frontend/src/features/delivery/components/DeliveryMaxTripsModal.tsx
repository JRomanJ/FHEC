import { AlertTriangle } from "lucide-react";
import { H7, H9 } from "./deliveryShared";

type DeliveryMaxTripsModalProps = {
  onClose: () => void;
};

export function DeliveryMaxTripsModal({ onClose }: DeliveryMaxTripsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-amber-500" />
        </div>
        <h3 className="text-xl uppercase text-foreground mb-2" style={H9}>Límite de pedidos activos</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          No puedes seleccionar más de <strong>3 pedidos activos</strong> al mismo tiempo. Completa o entrega uno de tus viajes actuales antes de asignarte un nuevo pedido.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#179150] text-white rounded-xl font-black uppercase hover:bg-green-700 transition-colors"
          style={H7}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
