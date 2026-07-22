import React, { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Heart, LogOut, ShoppingCart, User } from "lucide-react";
import type { Page } from "../../app/types";

// ─── MobileUserMenu ───────────────────────────────────────────────────────────
export function MobileUserMenu({ userName, unreadCount, cartCount, onNav, onLogout }: {
  userName: string; unreadCount: number; cartCount: number; onNav: (p: Page) => void; onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const items = [
    { label: "Notificaciones", icon: <Bell size={14} />, page: "notifications" as Page, badge: unreadCount > 0 ? unreadCount : null },
    { label: "Favoritos",      icon: <Heart size={14} />, page: "favorites" as Page, badge: null },
    { label: "Mi carrito",     icon: <ShoppingCart size={14} />, page: "cart" as Page, badge: cartCount > 0 ? cartCount : null },
    { label: "Mi perfil",      icon: <User size={14} />, page: "profile" as Page, badge: null },
  ];
  return (
    <div className="relative sm:hidden" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2.5 py-2 rounded-xl hover:bg-muted transition-colors border border-border"
      >
        <div className="w-5 h-5 rounded-full bg-[#50e9f8] flex items-center justify-center flex-shrink-0">
          <User size={11} className="text-[#006064]" />
        </div>
        <ChevronDown size={12} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-border rounded-2xl shadow-2xl z-[70] overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/30">
            <div className="text-[10px] text-muted-foreground font-semibold uppercase truncate">{userName}</div>
          </div>
          {items.map(item => (
            <button
              key={item.label}
              onClick={() => { setOpen(false); onNav(item.page); }}
              className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-muted transition-colors border-b border-border/40"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-muted-foreground">{item.icon}</span>
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              {item.badge && (
                <span className="w-5 h-5 bg-[#179150] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-red-50 text-red-600 transition-colors"
          >
            <LogOut size={14} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}
