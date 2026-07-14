import { ArrowLeft } from "lucide-react";
import type { Page } from "../../../app/types";
import { H9 } from "./deliveryShared";

type DeliveryHeaderProps = {
  onNav: (p: Page) => void;
  userSede?: string;
};

export function DeliveryHeader({ onNav, userSede }: DeliveryHeaderProps) {
  return (
    <div className="relative px-6 py-6" style={{ background: "linear-gradient(135deg, #50e9f8 0%, #179150 100%)" }}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-white text-3xl leading-none uppercase" style={H9}>Panel de Reparto</h1>
          <p className="text-white/75 text-sm mt-1">Gestión de entregas y rutas</p>
          {userSede && (
            <span className="inline-flex items-center gap-1 mt-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
              Sede asignada: {userSede}
            </span>
          )}
        </div>
        <button
          onClick={() => onNav("home")}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-black uppercase transition-colors border border-white/30"
          style={H9}
        >
          <ArrowLeft size={14} /> Dashboard
        </button>
      </div>
    </div>
  );
}
