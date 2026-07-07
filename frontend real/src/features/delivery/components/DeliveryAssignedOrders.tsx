import { Bike, CheckCircle, MapPin, Phone, User } from "lucide-react";
import { GpsMapWidget, addressToPin } from "../../../components/order";
import { H7, H9, toWaLink, type DeliveryOrderView } from "./deliveryShared";

type DeliveryAssignedOrdersProps = {
  orders: DeliveryOrderView[];
  onConfirmDelivery: (orderId: string) => void;
};

export function DeliveryAssignedOrders({ orders, onConfirmDelivery }: DeliveryAssignedOrdersProps) {
  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bike size={40} className="mx-auto mb-3 opacity-30" />
          <p>No tienes viajes asignados</p>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="bg-white border border-[#179150] rounded-2xl overflow-hidden shadow-md">
            <div className="bg-gradient-to-r from-[#179150] to-[#006064] px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-white text-base font-black uppercase" style={H9}>{order.id}</div>
                <div className="text-white/70 text-xs mt-0.5">{order.items} productos · ${order.total.toFixed(2)} · 📍 {order.distance}</div>
              </div>
              <span className="bg-[#50e9f8] text-[#006064] text-xs font-black px-3 py-1 rounded-full uppercase" style={H9}>En ruta</span>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-[#179150] flex-shrink-0" />
                    <span className="font-black text-foreground">{order.customer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-[#179150] flex-shrink-0" />
                    <span className="text-muted-foreground">{order.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={14} className="text-[#179150] flex-shrink-0" />
                    <span className="text-muted-foreground text-xs">{order.address}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <a href={`tel:${order.phone}`}
                    className="flex items-center gap-1.5 bg-[#179150] text-white px-3 py-2 rounded-xl text-xs font-black uppercase hover:bg-green-700 transition-colors">
                    <Phone size={13} /> Llamar
                  </a>
                  <a href={toWaLink(order.phone)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-white px-3 py-2 rounded-xl text-xs font-black uppercase transition-colors"
                    style={{ backgroundColor: "#25D366" }}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a3.6 3.6 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374A9.86 9.86 0 012.1 11.892C2.1 6.442 6.535 2.008 11.987 2.008c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0011.987 0C5.432 0 .096 5.335.093 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>

              <div className="bg-[#f0fdf7] rounded-xl px-4 py-3">
                <div className="text-xs font-black text-muted-foreground uppercase mb-2" style={H9}>Productos a entregar</div>
                <div className="space-y-1">
                  {order.products.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#179150] flex-shrink-0" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              {order.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <div className="text-xs font-black text-amber-700 uppercase mb-1" style={H9}>Nota</div>
                  <p className="text-xs text-amber-800">{order.notes}</p>
                </div>
              )}

              <div>
                <div className="text-xs font-black text-muted-foreground uppercase mb-2" style={H9}>Mapa de entrega</div>
                <GpsMapWidget address={order.address} orderId={order.id} initialPin={addressToPin(order.address)} />
              </div>

              <button
                onClick={() => onConfirmDelivery(order.id)}
                className="w-full flex items-center justify-center gap-2 bg-[#179150] text-white py-3.5 rounded-xl font-black uppercase hover:bg-green-700 transition-colors"
                style={H7}
              >
                <CheckCircle size={16} /> Confirmar Entrega
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
