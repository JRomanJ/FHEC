import { CheckCircle } from "lucide-react";
import { H9, type DeliveryCompletedTripView, type DeliverySede } from "./deliveryShared";

type DeliveryCompletedTripsProps = {
  trips: DeliveryCompletedTripView[];
  dateFrom: string;
  dateTo: string;
  sede: string;
  sedes: DeliverySede[];
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSedeChange: (value: string) => void;
};

export function DeliveryCompletedTrips({
  trips,
  dateFrom,
  dateTo,
  sede,
  sedes,
  onDateFromChange,
  onDateToChange,
  onSedeChange,
}: DeliveryCompletedTripsProps) {
  const filtered = trips.filter(t => {
    const matchSede = sede === "todas" || t.sede === sede;
    const matchFrom = !dateFrom || t.date >= dateFrom;
    const matchTo = !dateTo || t.date <= dateTo;
    return matchSede && matchFrom && matchTo;
  });
  const totalCost = filtered.reduce((s, t) => s + t.shippingCost, 0);

  return (
    <div>
      <div className="bg-white rounded-2xl border border-border shadow-sm p-5 mb-5">
        <div className="text-xs font-black uppercase text-muted-foreground mb-3" style={H9}>Filtros</div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Fecha desde</label>
            <input type="date" value={dateFrom} onChange={e => onDateFromChange(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Fecha hasta</label>
            <input type="date" value={dateTo} onChange={e => onDateToChange(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Sede</label>
            <select value={sede} onChange={e => onSedeChange(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]">
              <option value="todas">Todas</option>
              {sedes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base uppercase text-foreground" style={H9}>Viajes Completados</h2>
          <span className="text-xs text-muted-foreground">{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay viajes con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Nº Pedido", "Fecha", "Cliente", "Sede", "Costo de envío"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground" style={H9}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t.id} className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                    <td className="px-4 py-3 text-[#179150] font-black text-xs" style={H9}>{t.id}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{t.date}</td>
                    <td className="px-4 py-3 text-foreground text-xs font-semibold">{t.customer}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs capitalize">{t.sede === "principal" ? "Sede Principal" : "Clínica Humana"}</td>
                    <td className="px-4 py-3 text-foreground text-xs font-semibold">${t.shippingCost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-4 border-t border-border bg-[#f0fdf7] flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" style={H9}>Total acumulado (costos de envío)</span>
          <span className="text-xl font-black text-[#179150]" style={H9}>${totalCost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
