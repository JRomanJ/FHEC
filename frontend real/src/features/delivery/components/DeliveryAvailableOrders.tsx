import { Bike, ChevronDown, MapPin, Package, Phone, User } from "lucide-react";
import { GpsMapWidget } from "../../../components/order";
import { H7, H9, type DeliveryOrderView, type DeliverySede } from "./deliveryShared";

type DeliveryAvailableOrdersProps = {
  hasAllSedes: boolean;
  selectedSede: string;
  sedes: DeliverySede[];
  availableOrders: DeliveryOrderView[];
  expandedOrder: string | null;
  onSedeChange: (sede: string) => void;
  onExpandedOrderChange: (orderId: string | null) => void;
  onAssignOrder: (orderId: string) => void;
};

export function DeliveryAvailableOrders({
  hasAllSedes,
  selectedSede,
  sedes,
  availableOrders,
  expandedOrder,
  onSedeChange,
  onExpandedOrderChange,
  onAssignOrder,
}: DeliveryAvailableOrdersProps) {
  return (
    <div>
      {hasAllSedes ? (
        <div className="mb-6">
          <label className="text-sm font-semibold text-foreground uppercase mb-2 block" style={H9}>Filtrar por Sede</label>
          <div className="grid grid-cols-2 gap-3">
            {sedes.map(sede => (
              <button
                key={sede.id}
                onClick={() => onSedeChange(sede.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left
                  ${selectedSede === sede.id ? "border-[#50e9f8] bg-[#e0f5eb]" : "border-border hover:border-[#179150]/40"}`}
              >
                <div className="text-sm font-black uppercase text-foreground mb-1" style={H9}>{sede.name}</div>
                <div className="text-xs text-muted-foreground">{sede.address}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-2 bg-[#e0f5eb] border border-[#a7f3d0] rounded-xl px-4 py-3">
          <MapPin size={14} className="text-[#179150] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#006064]">
            Sede asignada: {sedes.find(s => s.id === selectedSede)?.name ?? selectedSede}
          </span>
        </div>
      )}

      <div className="space-y-4">
        {availableOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>No hay pedidos disponibles en esta sede</p>
          </div>
        ) : (
          availableOrders.map(order => {
            const isExpanded = expandedOrder === order.id;
            return (
              <div key={order.id} className={`bg-white border rounded-2xl overflow-hidden transition-all ${isExpanded ? "border-[#179150] shadow-md" : "border-border hover:border-[#179150]/50"}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-[#179150] text-base font-black uppercase" style={H9}>{order.id}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{order.items} productos · <strong>${order.total.toFixed(2)}</strong> · 📍 {order.distance}</div>
                    </div>
                    <button
                      onClick={() => onExpandedOrderChange(isExpanded ? null : order.id)}
                      className="flex items-center gap-1.5 border border-border text-muted-foreground px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-muted transition-colors"
                    >
                      {isExpanded ? "Ocultar" : "Ver detalles"}
                      <ChevronDown size={12} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-[#179150] flex-shrink-0" />
                      <span className="font-semibold text-foreground">{order.customer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-[#179150] flex-shrink-0" />
                      <span className="text-muted-foreground">{order.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-[#179150] flex-shrink-0" />
                      <span className="text-muted-foreground truncate">{order.address}</span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border bg-[#f9fdfe] px-5 py-4 space-y-4">
                    <div>
                      <div className="text-xs font-black uppercase text-muted-foreground mb-2" style={H9}>Productos del pedido</div>
                      <div className="space-y-1.5">
                        {order.products.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#179150] flex-shrink-0" />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-black uppercase text-muted-foreground mb-2" style={H9}>Dirección de entrega</div>
                      <GpsMapWidget address={order.address} orderId={order.id} />
                    </div>

                    {order.notes && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                        <div className="text-xs font-black text-amber-700 uppercase mb-1" style={H9}>Nota del pedido</div>
                        <p className="text-xs text-amber-800">{order.notes}</p>
                      </div>
                    )}

                    <button
                      onClick={() => onAssignOrder(order.id)}
                      className="w-full flex items-center justify-center gap-2 bg-[#179150] text-white py-2.5 rounded-xl font-black uppercase hover:bg-green-700 transition-colors text-sm"
                      style={H7}
                    >
                      <Bike size={15} /> Asignarme a este pedido
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
