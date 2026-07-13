import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";
import type { Branch } from "../../app/types";

export function SedeSelector({ selectedSede, onSedeChange, branches }: {
  selectedSede: string;
  onSedeChange: (id: string) => void;
  branches: Branch[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = branches.find((branch) => branch.id === selectedSede) ?? branches[0];

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative ml-auto">
      <button onClick={() => setOpen((value) => !value)} disabled={!current}
        className="flex items-center gap-1.5 px-3 py-1.5 my-1 rounded-lg text-xs text-[#006064]/80 hover:bg-white/15 transition-all whitespace-nowrap disabled:opacity-50">
        <MapPin size={11} />
        <span className="hidden sm:inline">{current?.name ?? "Sin sedes"}</span>
        <span className="sm:hidden">Sede</span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && current && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-2xl shadow-2xl z-[60] overflow-hidden min-w-[220px]">
          {branches.map((branch) => (
            <button key={branch.id} onClick={() => { onSedeChange(branch.id); setOpen(false); }}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${selectedSede === branch.id ? "bg-[#f0fdf7]" : ""}`}>
              <MapPin size={13} className={selectedSede === branch.id ? "text-[#179150]" : "text-muted-foreground"} />
              <div>
                <div className={`text-sm font-semibold ${selectedSede === branch.id ? "text-[#179150]" : "text-foreground"}`}>{branch.name}</div>
                <div className="text-[11px] text-muted-foreground">{branch.address}</div>
              </div>
              {selectedSede === branch.id && <Check size={13} className="text-[#179150] ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
