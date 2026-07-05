import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart, Search, User, ChevronRight, ChevronLeft, Plus, Minus, X,
  Upload, MapPin, Truck, Store, Clock, Package, AlertTriangle, Star,
  Trash2, ArrowLeft, Shield, CreditCard, Phone, Building2, FileText,
  ChevronDown, Bell, Check, Copy, SlidersHorizontal, CheckCircle, Info,
  LogOut, Heart, Lock, Mail, Eye, EyeOff, Bike, Settings, ClipboardList,
  Instagram, Facebook,
} from "lucide-react";
import { toast } from "sonner";
import { Page, AuthUser, Product, CartItem, Slide, H9, H7, fmtUSD, fmtVES, effectivePrice, PRODUCTS, CATS, DEFAULT_SLIDES } from "../shared";
import logoFarmahumana from "../../imports/logo-farmahumana.png";
import recipeMaria from "../../imports/recipe-Maria.jpg";
import recipeJose from "../../imports/recipe-Jose.jpg";
import recipeAna from "../../imports/recipe-Ana.jpg";

const SEDES = [
  { id: "principal", name: "Ciudad Guayana — Principal", address: "Parcela 01-02, Local Manzana 04, Calle 07, Ciudad Guayana 8050, Bolívar", hours: "Lun–Sáb: 8:00 am – 8:00 pm · Dom: 9:00 am – 6:00 pm", mapsUrl: "https://maps.google.com/?q=Ciudad+Guayana+Bolivar+Venezuela" },
  { id: "clinica",   name: "Clínica Humana",              address: "986M+QJ4, Frente a la Mezquita, Av. José Gumilla, Ciudad Guayana 8051, Bolívar",         hours: "Lun–Sáb: 8:00 am – 8:00 pm · Dom: 9:00 am – 6:00 pm", mapsUrl: "https://maps.google.com/?q=Clinica+Humana+Ciudad+Guayana+Venezuela" },
];

// ─── DeliveryPanel ────────────────────────────────────────────────────────────
function GpsMapWidget({ address, blocked, orderId, initialPin }: { address: string; blocked?: boolean; orderId: string; initialPin?: { x: number; y: number } }) {
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
function addressToPin(addr: string): { x: number; y: number } {
  let h = 5381;
  for (let i = 0; i < addr.length; i++) h = ((h << 5) + h) + addr.charCodeAt(i);
  h = Math.abs(h);
  return { x: 15 + (h % 65), y: 15 + ((h >> 8) % 55) };
}

// Format phone to WhatsApp link (Venezuelan numbers)
function toWaLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const num = digits.startsWith("0") ? "58" + digits.slice(1) : digits;
  return `https://wa.me/${num}`;
}

function DeliveryPanel({ onNav }: { onNav: (p: Page) => void }) {
  const [activeTab, setActiveTab] = useState<"available" | "myTrips">("available");
  const [selectedSede, setSelectedSede] = useState("principal");
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [myTrips, setMyTrips] = useState<string[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const DEMO_OTP = "1234";

  const ALL_ORDERS = [
    {
      id: "FHEC-20241204-8471", customer: "Carlos Rodríguez", phone: "+58 412-1234567",
      sede: "principal", address: "Calle 07, Manzana 04, Ciudad Guayana 8050, Bolívar",
      items: 3, total: 45.50, pin: "1234", distance: "2.4 km",
      products: ["Metformina 500mg ×2", "Vitamina C 1000mg ×1"],
      notes: "Entregar en recepción del edificio",
    },
    {
      id: "FHEC-20241204-8472", customer: "María González", phone: "+58 424-9876543",
      sede: "principal", address: "Av. Las Américas, Torre Mar, Piso 5, Apto 5B",
      items: 2, total: 32.00, pin: "5678", distance: "4.1 km",
      products: ["Losartán 50mg ×1", "Omeprazol 20mg ×1"],
      notes: "",
    },
    {
      id: "FHEC-20241204-8473", customer: "Luis Pérez", phone: "+58 414-5551234",
      sede: "clinica", address: "Frente a la Mezquita, Av. José Gumilla, Ciudad Guayana",
      items: 5, total: 67.90, pin: "9012", distance: "1.2 km",
      products: ["Paracetamol 500mg ×3", "Atorvastatina 20mg ×1", "Clonazepam 0.5mg ×1"],
      notes: "Cliente espera en la puerta — llamar al llegar",
    },
  ];

  const availableOrders = ALL_ORDERS.filter(o => o.sede === selectedSede && !myTrips.includes(o.id));
  const myTripOrders = ALL_ORDERS.filter(o => myTrips.includes(o.id));

  const handleAssignOrder = (orderId: string) => {
    setMyTrips(prev => [...prev, orderId]);
  };

  const handleDelivery = (orderId: string) => {
    setSelectedOrder(orderId);
    setShowPinModal(true);
    setPinInput("");
  };

  const verifyPin = () => {
    if (pinInput === DEMO_OTP) {
      setShowPinModal(false);
      setMyTrips(prev => prev.filter(id => id !== selectedOrder));
      setSelectedOrder(null);
      setPinInput("");
    }
  };

  const handlePinKeyPress = (key: string) => {
    if (key === "del") {
      setPinInput(p => p.slice(0, -1));
    } else if (pinInput.length < 4) {
      setPinInput(p => p + key);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0fdf7]">
      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#50e9f8]/15 flex items-center justify-center mx-auto mb-4">
              <Lock size={26} className="text-[#179150]" />
            </div>
            <h3 className="text-2xl uppercase text-foreground text-center mb-2" style={H9}>Confirmar Entrega</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
              Ingresa el PIN de 4 dígitos proporcionado por el cliente
            </p>

            {/* PIN Display */}
            <div className="flex gap-2 justify-center mb-6">
              {[0,1,2,3].map(i => (
                <div
                  key={i}
                  className={`w-14 h-16 border-2 rounded-xl flex items-center justify-center text-2xl font-black transition-all
                    ${pinInput[i] ? "border-[#179150] bg-[#179150]/5 text-[#179150]" : "border-border bg-white"}`}
                  style={H9}
                >
                  {pinInput[i] || ""}
                </div>
              ))}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button
                  key={n}
                  onClick={() => handlePinKeyPress(String(n))}
                  className="h-14 bg-muted hover:bg-[#e0f5eb] border border-border rounded-xl text-lg font-black transition-colors"
                  style={H9}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => handlePinKeyPress("del")}
                className="h-14 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-red-600" />
              </button>
              <button
                onClick={() => handlePinKeyPress("0")}
                className="h-14 bg-muted hover:bg-[#e0f5eb] border border-border rounded-xl text-lg font-black transition-colors"
                style={H9}
              >
                0
              </button>
              <button
                onClick={verifyPin}
                disabled={pinInput.length !== 4}
                className={`h-14 rounded-xl flex items-center justify-center transition-colors
                  ${pinInput.length === 4 ? "bg-[#179150] hover:bg-green-700 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
              >
                <Check size={20} />
              </button>
            </div>

            <button
              onClick={() => setShowPinModal(false)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <p className="text-xs text-muted-foreground text-center mt-3">Demo: el PIN es <strong>1234</strong></p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative px-6 py-6" style={{ background: "linear-gradient(135deg, #50e9f8 0%, #179150 100%)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white text-3xl leading-none uppercase" style={H9}>Panel de Reparto</h1>
            <p className="text-white/75 text-sm mt-1">Gestión de entregas y rutas</p>
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-6 py-3 text-sm font-black uppercase transition-all relative
              ${activeTab === "available" ? "text-[#179150]" : "text-muted-foreground hover:text-foreground"}`}
            style={H9}
          >
            Pedidos Disponibles
            {activeTab === "available" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#179150]" />}
          </button>
          <button
            onClick={() => setActiveTab("myTrips")}
            className={`px-6 py-3 text-sm font-black uppercase transition-all relative
              ${activeTab === "myTrips" ? "text-[#179150]" : "text-muted-foreground hover:text-foreground"}`}
            style={H9}
          >
            Mis Viajes ({myTrips.length})
            {activeTab === "myTrips" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#179150]" />}
          </button>
        </div>

        {/* Available Orders Tab */}
        {activeTab === "available" && (
          <div>
            {/* Sede Filter */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-foreground uppercase mb-2 block" style={H9}>Filtrar por Sede</label>
              <div className="grid grid-cols-2 gap-3">
                {SEDES.map(sede => (
                  <button
                    key={sede.id}
                    onClick={() => setSelectedSede(sede.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left
                      ${selectedSede === sede.id ? "border-[#50e9f8] bg-[#e0f5eb]" : "border-border hover:border-[#179150]/40"}`}
                  >
                    <div className="text-sm font-black uppercase text-foreground mb-1" style={H9}>{sede.name}</div>
                    <div className="text-xs text-muted-foreground">{sede.address}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
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
                      {/* Card header */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-[#179150] text-base font-black uppercase" style={H9}>{order.id}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{order.items} productos · <strong>${order.total.toFixed(2)}</strong> · 📍 {order.distance}</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                              className="flex items-center gap-1.5 border border-border text-muted-foreground px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-muted transition-colors"
                            >
                              {isExpanded ? "Ocultar" : "Ver detalles"}
                              <ChevronDown size={12} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </button>
                            <button
                              onClick={() => handleAssignOrder(order.id)}
                              className="flex items-center gap-1.5 bg-[#179150] text-white px-3 py-1.5 rounded-xl text-xs font-black uppercase hover:bg-green-700 transition-colors"
                              style={H7}
                            >
                              <Bike size={12} /> Asignarme
                            </button>
                          </div>
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

                      {/* Expanded detail panel */}
                      {isExpanded && (
                        <div className="border-t border-border bg-[#f9fdfe] px-5 py-4 space-y-4">
                          {/* Products */}
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

                          {/* Map preview */}
                          <div>
                            <div className="text-xs font-black uppercase text-muted-foreground mb-2" style={H9}>Dirección de entrega</div>
                            <GpsMapWidget address={order.address} orderId={order.id} />
                          </div>

                          {/* Notes */}
                          {order.notes && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                              <div className="text-xs font-black text-amber-700 uppercase mb-1" style={H9}>Nota del pedido</div>
                              <p className="text-xs text-amber-800">{order.notes}</p>
                            </div>
                          )}

                          <button
                            onClick={() => { handleAssignOrder(order.id); setExpandedOrder(null); }}
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
        )}

        {/* My Trips Tab */}
        {activeTab === "myTrips" && (
          <div className="space-y-4">
            {myTripOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bike size={40} className="mx-auto mb-3 opacity-30" />
                <p>No tienes viajes asignados</p>
              </div>
            ) : (
              myTripOrders.map(order => (
                <div key={order.id} className="bg-white border border-[#179150] rounded-2xl overflow-hidden shadow-md">
                  {/* Trip header */}
                  <div className="bg-gradient-to-r from-[#179150] to-[#006064] px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-white text-base font-black uppercase" style={H9}>{order.id}</div>
                      <div className="text-white/70 text-xs mt-0.5">{order.items} productos · ${order.total.toFixed(2)} · 📍 {order.distance}</div>
                    </div>
                    <span className="bg-[#50e9f8] text-[#006064] text-xs font-black px-3 py-1 rounded-full uppercase" style={H9}>En ruta</span>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Client info + action buttons */}
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
                      {/* Contact buttons */}
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

                    {/* Products summary */}
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

                    {/* Notes */}
                    {order.notes && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                        <div className="text-xs font-black text-amber-700 uppercase mb-1" style={H9}>Nota</div>
                        <p className="text-xs text-amber-800">{order.notes}</p>
                      </div>
                    )}

                    {/* Map preloaded with address */}
                    <div>
                      <div className="text-xs font-black text-muted-foreground uppercase mb-2" style={H9}>Mapa de entrega</div>
                      <GpsMapWidget address={order.address} orderId={order.id} initialPin={addressToPin(order.address)} />
                    </div>

                    <button
                      onClick={() => handleDelivery(order.id)}
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
        )}
      </div>
    </div>
  );
}


export { DeliveryPanel };
