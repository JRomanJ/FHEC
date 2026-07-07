import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { getSedesListLegacy } from "../../services";

// ─── SedeSelector ─────────────────────────────────────────────────────────────
const SEDES_LIST = getSedesListLegacy();
export function SedeSelector({ selectedSede, onSedeChange }: { selectedSede: string; onSedeChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SEDES_LIST.find(s => s.id === selectedSede) ?? SEDES_LIST[0];
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative ml-auto">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 my-1 rounded-lg text-xs text-[#006064]/80 hover:bg-white/15 transition-all whitespace-nowrap">
        <MapPin size={11} />
        <span className="hidden sm:inline">{current.name}</span>
        <span className="sm:hidden">Sede</span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-2xl shadow-2xl z-[60] overflow-hidden min-w-[200px]">
          <div className="px-4 py-2 border-b border-border bg-muted/40">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Ciudad Guayana</p>
          </div>
          {SEDES_LIST.map(s => (
            <button key={s.id} onClick={() => { onSedeChange(s.id); setOpen(false); }}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${selectedSede === s.id ? "bg-[#f0fdf7]" : ""}`}>
              <MapPin size={13} className={`flex-shrink-0 mt-0.5 ${selectedSede === s.id ? "text-[#179150]" : "text-muted-foreground"}`} />
              <div>
                <div className={`text-sm font-semibold ${selectedSede === s.id ? "text-[#179150]" : "text-foreground"}`}>{s.name}</div>
                <div className="text-[11px] text-muted-foreground">{s.address}</div>
              </div>
              {selectedSede === s.id && <Check size={13} className="text-[#179150] ml-auto flex-shrink-0 mt-0.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
