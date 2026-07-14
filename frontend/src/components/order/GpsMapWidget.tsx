import React, { useRef, useState } from "react";
import { Lock, MapPin } from "lucide-react";
import { H9 } from "../../app/data";

export function GpsMapWidget({ address, blocked, orderId, initialPin }: { address: string; blocked?: boolean; orderId: string; initialPin?: { x: number; y: number } }) {
  const [pinPos, setPinPos] = useState(initialPin ?? { x: 50, y: 42 });
  const [dragging, setDragging] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (blocked) return;
    setDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !mapRef.current || blocked) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    setPinPos({ x, y });
  };

  const handleMouseUp = () => setDragging(false);

  const mapZones = [
    { x: 0, y: 0, w: 100, h: 100, color: "#e8f4e8" },
    { x: 10, y: 15, w: 30, h: 8, color: "#d0e8d0", label: "Av. Principal" },
    { x: 40, y: 25, w: 45, h: 6, color: "#d0e8d0", label: "Calle 07" },
    { x: 15, y: 35, w: 20, h: 40, color: "#c8e0c8", label: "Zona Residencial" },
    { x: 55, y: 40, w: 30, h: 35, color: "#b8d4b8" },
    { x: 25, y: 60, w: 15, h: 15, color: "#a0c8a0" },
    { x: 70, y: 10, w: 20, h: 25, color: "#c0d8c0" },
    { x: 5, y: 70, w: 35, h: 12, color: "#d8e8d8" },
  ];

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      {blocked ? (
        <div className="bg-purple-50 border-b border-purple-200 px-3 py-2 flex items-center gap-2">
          <Lock size={13} className="text-purple-600 flex-shrink-0" />
          <span className="text-xs text-purple-800 font-semibold">Mapa bloqueado — psicotrópico controlado. Solo retiro presencial.</span>
        </div>
      ) : null}
      <div
        ref={mapRef}
        className={`relative w-full select-none ${blocked ? "opacity-40 pointer-events-none grayscale" : "cursor-crosshair"}`}
        style={{ height: 200 }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
          <rect width="100" height="100" fill="#e8f5e8" />
          <rect x="0" y="48" width="100" height="6" fill="#d4e8d4" />
          <rect x="30" y="0" width="6" height="100" fill="#d4e8d4" />
          <rect x="65" y="0" width="5" height="100" fill="#d4e8d4" />
          <rect x="0" y="75" width="100" height="5" fill="#d4e8d4" />
          <rect x="10" y="20" width="18" height="18" rx="1" fill="#c8dfc8" />
          <rect x="38" y="10" width="22" height="15" rx="1" fill="#c0d8c0" />
          <rect x="72" y="30" width="20" height="22" rx="1" fill="#c8dfc8" />
          <rect x="8" y="58" width="20" height="14" rx="1" fill="#c0d8c0" />
          <rect x="38" y="56" width="25" height="16" rx="1" fill="#c8dfc8" />
          <rect x="72" y="60" width="18" height="13" rx="1" fill="#c0d8c0" />
          <rect x="12" y="82" width="14" height="12" rx="1" fill="#c8dfc8" />
          <rect x="50" y="82" width="18" height="12" rx="1" fill="#c0d8c0" />
          <text x="2" y="52" fontSize="3" fill="#8aab8a" fontFamily="sans-serif">Av. Las Américas</text>
          <text x="31" y="47" fontSize="2.5" fill="#8aab8a" fontFamily="sans-serif" transform="rotate(90 34 40)">Calle 07</text>
          <text x="15" y="35" fontSize="2.5" fill="#7a9a7a" fontFamily="sans-serif">FHEC Principal</text>
        </svg>
        <div
          className="absolute z-10 transform -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing"
          style={{ left: `${pinPos.x}%`, top: `${pinPos.y}%` }}
          onMouseDown={handleMouseDown}
        >
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-red-500 border-3 border-white shadow-lg flex items-center justify-center text-white">
              <MapPin size={16} fill="white" />
            </div>
            <div className="w-2 h-2 bg-red-500 rounded-full mt-0.5 shadow" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 flex flex-col gap-1">
          <button className="w-7 h-7 bg-white border border-border rounded shadow text-foreground flex items-center justify-center text-sm font-bold hover:bg-gray-50">+</button>
          <button className="w-7 h-7 bg-white border border-border rounded shadow text-foreground flex items-center justify-center text-sm font-bold hover:bg-gray-50">−</button>
        </div>
      </div>
      {!blocked && (
        <div className="bg-white border-t border-border px-3 py-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex-1 truncate">{address}</span>
          <span className="text-[10px] text-[#006064] font-black bg-[#e0f5eb] px-2 py-0.5 rounded-full" style={H9}>
            {pinPos.x.toFixed(1)}°N, {pinPos.y.toFixed(1)}°W
          </span>
        </div>
      )}
    </div>
  );
}

// Deterministic pin position from address string
export function addressToPin(addr: string): { x: number; y: number } {
  let h = 5381;
  for (let i = 0; i < addr.length; i++) h = ((h << 5) + h) + addr.charCodeAt(i);
  h = Math.abs(h);
  return { x: 15 + (h % 65), y: 15 + ((h >> 8) % 55) };
}

