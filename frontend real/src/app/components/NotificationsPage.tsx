import React, { useState } from "react";
import { ArrowLeft, X, Check } from "lucide-react";
import { Page, H9, NOTIF_DATA } from "../shared";

export function NotificationsPage({ onNav, notifs, setNotifs }: {
  onNav: (p: Page) => void;
  notifs: typeof NOTIF_DATA;
  setNotifs: React.Dispatch<React.SetStateAction<typeof NOTIF_DATA>>;
}) {
  const [selected, setSelected] = useState<typeof NOTIF_DATA[0] | null>(null);
  const unread = notifs.filter(n => !n.read).length;

  const markRead    = (id: number) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = ()           => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const dismiss     = (id: number, e: React.MouseEvent) => { e.stopPropagation(); setNotifs(p => p.filter(n => n.id !== id)); };
  const open        = (n: typeof NOTIF_DATA[0]) => { markRead(n.id); setSelected(n); };

  const accent: Record<string, string> = {
    order:  "bg-[#e0f5eb] border-[#a7f3d0]",
    recipe: "bg-[#e0f5eb] border-[#a7f3d0]",
    promo:  "bg-amber-50 border-amber-200",
    info:   "bg-blue-50 border-blue-200",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 pb-16 mt-6">
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#f0fdf7] flex items-center justify-center text-3xl">{selected.icon}</div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <h2 className="text-2xl uppercase text-gray-900 mb-2" style={H9}>{selected.title}</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{selected.body}</p>
            {selected.type === "recipe" && selected.title.toLowerCase().includes("aprobado") && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check size={14} className="text-[#179150]" />
                  <span className="text-[#179150] font-bold text-sm">Notificaciones enviadas</span>
                </div>
                <p className="text-gray-700 text-xs leading-relaxed">
                  Se envió una notificación a tu <strong>correo electrónico</strong> y a tu número de <strong>WhatsApp</strong> con los detalles del récipe aprobado y las instrucciones para proceder al pago.
                </p>
              </div>
            )}
            <div className="text-xs text-gray-400">{selected.time}</div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNav("home")} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl uppercase text-foreground" style={H9}>Notificaciones</h1>
          <p className="text-sm text-gray-500">{unread > 0 ? `${unread} sin leer` : "Todo al día"}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-xs text-[#179150] font-semibold hover:underline">
            Marcar todo como leído
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl uppercase text-foreground mb-2" style={H9}>Sin notificaciones</h3>
          <p className="text-sm text-gray-500">No tienes notificaciones por el momento.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n.id} onClick={() => open(n)}
              className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md hover:scale-[1.005]
                ${!n.read ? accent[n.type] ?? "bg-[#e0f5eb] border-[#a7f3d0]" : "bg-white border-border"}`}
            >
              {!n.read && <div className="absolute mt-1 ml-[-8px] w-2.5 h-2.5 rounded-full bg-[#179150] flex-shrink-0" />}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${!n.read ? "bg-white/70" : "bg-muted"}`}>
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-gray-900 leading-snug" style={H9}>{n.title}</h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.read && <span className="bg-[#179150] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Nuevo</span>}
                    <button onClick={e => dismiss(n.id, e)} className="w-6 h-6 rounded-full hover:bg-black/10 flex items-center justify-center">
                      <X size={11} className="text-gray-400" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">{n.body}</p>
                <span className="text-[11px] text-gray-400 mt-1.5 block">{n.time} · Toca para ver detalle</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
