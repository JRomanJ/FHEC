import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Page } from "../../app/types";
import { CATS } from "./layoutShared";

// ─── CatNavButton ─────────────────────────────────────────────────────────────
export function CatNavButton({ page, onNav, onCategorySelect }: {
  page: Page; onNav: (p: Page) => void; onCategorySelect?: (c: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = page === "catalog";

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 px-2 sm:px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all my-1
          ${active || open ? "bg-white/25 text-[#006064] font-bold" : "text-[#006064]/80 hover:text-[#006064] hover:bg-white/15 hover:font-semibold"}`}>
        Categorías <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-border rounded-2xl shadow-2xl z-[60] overflow-hidden w-52">
          <div className="py-1">
            {CATS.map(c => (
              <button key={c.name}
                onClick={() => { if (onCategorySelect) onCategorySelect(c.name); onNav("catalog"); setOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                {c.name}
              </button>
            ))}
          </div>
          <div className="border-t border-border">
            <button onClick={() => { onNav("catalog"); setOpen(false); }}
              className="w-full py-2 px-4 text-xs text-[#179150] font-semibold hover:bg-muted transition-colors text-left">
              Ver todo el catálogo →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
