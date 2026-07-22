import React, { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Bike, Check, MapPin, Package, Store, User, X } from "lucide-react";
import type { AuthUser, CartItem, Page } from "../../../app/types";
import { effectivePrice, fmtUSD, fmtVES, H7, H9 } from "../../../app/data";
import { GpsMapWidget } from "../../../components/order";
import { firstError, normalizeCouponCode, validateCouponCodeInput, validateDeliverySelection } from "../../../validation";

interface LegacySede {
  id: string;
  name: string;
  address: string;
  hours: string;
  mapsUrl: string;
}

// ─── DeliverySelectPage ───────────────────────────────────────────────────────
export function DeliverySelectPage({ cartItems, onNav, deliveryMode, setDeliveryMode, selectedSede, setSelectedSede, deliveryAddress, setDeliveryAddress, discountApplied, discountCode, setDiscountApplied, setDiscountCode, user, onConfirmOrder, sedes, discountCodes, demoContact, veAreas }: {
  cartItems: CartItem[]; onNav: (p: Page) => void;
  deliveryMode: "delivery"|"pickup"; setDeliveryMode: (m: "delivery"|"pickup") => void;
  selectedSede: string; setSelectedSede: (s: string) => void;
  deliveryAddress: string; setDeliveryAddress: (a: string) => void;
  discountApplied: number; discountCode: string;
  setDiscountApplied: (n: number) => void; setDiscountCode: (s: string) => void;
  user?: AuthUser | null;
  onConfirmOrder?: (input: { receiverName: string; receiverPhoneArea: string; receiverPhone: string; deliveryAddress: string; deliveryMode: "delivery" | "pickup"; selectedSede: string; discountCode: string }) => Promise<{ ok: boolean; error?: string }>;
  sedes: LegacySede[];
  discountCodes: Record<string, number>;
  demoContact: Record<string, { phone: string; address: string }>;
  veAreas: string[];
}) {
  const hasControlled = cartItems.some(i => i.product.controlledSubstance);
  const hasRecipe     = cartItems.some(i => i.product.needsRecipe || i.product.controlledSubstance);
  const subtotal      = cartItems.reduce((s, i) => s + effectivePrice(i.product) * i.quantity, 0);
  const deliveryFee   = deliveryMode === "delivery" && !hasControlled ? 2.50 : 0;
  const discountAmt   = subtotal * discountApplied / 100;
  const ivaAmt        = subtotal * 0.16;
  const total         = subtotal + ivaAmt + deliveryFee - discountAmt;
  const activeSede    = sedes.find(s => s.id === selectedSede) ?? sedes[0] ?? {
    id: "", name: "Sede no disponible", address: "", hours: "", mapsUrl: "#",
  };

  // Receiver data — autocomplete from user profile
  const fallbackContact = user ? (demoContact[user.email] ?? { phone: "", address: "" }) : { phone: "", address: "" };
  const userContact = user ? {
    phone: user.phone ? (user.phone.startsWith("+") ? user.phone : `${user.areaCode ?? ""}-${user.phone}`.replace(/^-/, "")) : fallbackContact.phone,
    address: user.address ?? fallbackContact.address,
  } : fallbackContact;
  const [receiverName,      setReceiverName]      = useState(user?.name ?? "");
  const [receiverPhone,     setReceiverPhone]     = useState(userContact.phone);
  const [receiverPhoneArea, setReceiverPhoneArea] = useState("0414");

  const [discInput, setDiscInput] = useState(discountCode);
  const [discErr,   setDiscErr]   = useState("");
  const [discOk,    setDiscOk]    = useState(discountApplied > 0 ? `${discountApplied}% aplicado` : "");
  const [deliveryError, setDeliveryError] = useState("");
  const [orderSaving, setOrderSaving] = useState(false);

  const applyDisc = () => {
    const codeValidation = validateCouponCodeInput(discInput);
    if (!codeValidation.valid) {
      setDiscErr(firstError(codeValidation));
      setDiscOk("");
      setDiscountApplied(0);
      return;
    }
    const normalizedCode = normalizeCouponCode(discInput);
    const pct = discountCodes[normalizedCode];
    if (pct) { setDiscountApplied(pct); setDiscountCode(normalizedCode); setDiscOk(`¡${pct}% de descuento aplicado!`); setDiscErr(""); }
    else      { setDiscErr("El cupón no existe o no está vigente."); setDiscOk(""); setDiscountApplied(0); }
  };

  // Force pickup for psychotropics
  useEffect(() => {
    if (hasControlled && deliveryMode === "delivery") setDeliveryMode("pickup");
  }, [hasControlled, deliveryMode, setDeliveryMode]);

  const deliveryValidation = validateDeliverySelection({
    mode: deliveryMode,
    hasPickupOnlyItems: hasControlled,
    selectedSede,
    deliveryAddress,
    receiverName,
    receiverPhoneArea,
    receiverPhone,
  });
  const canPay = deliveryValidation.valid;

  // Google Maps embed URL for the selected sede
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(activeSede.address)}&output=embed&hl=es&zoom=16`;

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 pb-16 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNav("cart")} className="p-2 rounded-xl hover:bg-muted transition-colors"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-3xl uppercase text-foreground" style={H9}>Método de Entrega</h1>
          <p className="text-sm text-muted-foreground">Selecciona cómo recibirás tu pedido</p>
        </div>
      </div>

      {hasControlled && (
        <div className="flex items-start gap-3 bg-red-50 border-2 border-red-400 rounded-2xl p-4 mb-5">
          <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-800 font-bold text-sm uppercase mb-1" style={H9}>Obligatorio — Récipe Físico Original</div>
            <p className="text-red-700 text-sm leading-relaxed">Debe presentar el <strong>récipe médico físico original</strong> al momento de retirar. No se aceptan copias ni fotos.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left col: delivery options (3 cols) */}
        <div className="lg:col-span-3 space-y-5">

          {/* Modo de entrega */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="text-base uppercase mb-4" style={H9}>Tipo de Entrega</h3>
            <div className="grid grid-cols-2 gap-3">
              {(["delivery","pickup"] as const).map(mode => {
                const locked = mode === "delivery" && hasControlled;
                return (
                  <button key={mode} onClick={() => !locked && setDeliveryMode(mode)} disabled={locked}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                      ${locked ? "border-border bg-gray-50 opacity-40 cursor-not-allowed"
                        : deliveryMode === mode ? "border-[#179150] bg-[#e0f5eb]"
                        : "border-border hover:border-[#179150]/40"}`}>
                    {mode === "delivery"
                      ? <Bike size={22} className={deliveryMode === mode ? "text-[#006064]" : "text-muted-foreground"} />
                      : <Store size={22} className={deliveryMode === mode ? "text-[#006064]" : "text-muted-foreground"} />}
                    <span className={`text-sm font-black uppercase ${deliveryMode === mode ? "text-[#006064]" : "text-muted-foreground"}`} style={H9}>
                      {mode === "delivery" ? "Delivery" : "Pickup"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {mode === "delivery" ? (locked ? "No disponible — psicotrópico" : "$2.50 · 2–4 hrs") : "Gratis · Retiro en tienda"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── PICKUP: sede ya seleccionada + mapa ── */}
          {deliveryMode === "pickup" && (
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="p-5 pb-3">
                <h3 className="text-base uppercase mb-3" style={H9}>Sede de Retiro</h3>
                <div className="flex items-start gap-3 bg-[#f0fdf7] border border-[#a7f3d0] rounded-xl p-4">
                  <Store size={18} className="text-[#179150] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground" style={H9}>{activeSede.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{activeSede.address}</div>
                    <div className="text-xs text-[#179150] font-semibold mt-1">{activeSede.hours}</div>
                  </div>
                  {deliveryMode !== "pickup" && (
                  <a href={activeSede.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-[#179150] text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0 hover:bg-green-700 transition-colors">
                    <MapPin size={11} /> Ver en Maps
                  </a>
                  )}
                </div>
              </div>
              {/* Google Maps embed */}
              <div className="border-t border-border">
                <iframe
                  title={`Mapa ${activeSede.name}`}
                  src={mapsEmbedUrl}
                  width="100%" height="220"
                  style={{ border: 0, display: "block" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          )}

          {/* ── DELIVERY: dirección + mapa interactivo ── */}
          {deliveryMode === "delivery" && (
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="p-5 pb-3">
                <h3 className="text-base uppercase mb-3" style={H9}>Dirección de Entrega</h3>
                <div className="relative mb-3">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={deliveryAddress} onChange={e => {
                    setDeliveryError("");
                    setDeliveryAddress(e.target.value);
                    const a = e.target.value.toLowerCase();
                    const inferred = a.includes("clinica") || a.includes("gumilla") ? sedes[1] : sedes[0];
                    if (inferred) setSelectedSede(inferred.id);
                  }}
                    placeholder="Ej: Calle 07, Manzana 04, Ciudad Guayana"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white" />
                </div>
                {deliveryAddress && (
                  <div className="bg-[#e0f5eb] border border-[#a7f3d0] rounded-xl p-3 text-xs mb-3">
                    <span className="font-semibold text-[#006064]">Sede asignada: </span>
                    <span className="text-muted-foreground">{activeSede.name}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin size={11} />Ajusta el pin en el mapa para indicar la ubicación exacta
                </p>
              </div>
              {/* Interactive map */}
              <div className="border-t border-border">
                <GpsMapWidget address={deliveryAddress || "Ciudad Guayana, Bolívar"} orderId="delivery-select" />
              </div>
            </div>
          )}

          {/* ── DATOS DE LA PERSONA RECEPTORA — siempre visible ── */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="text-base uppercase mb-1" style={H9}>Datos del Receptor</h3>
            <p className="text-xs text-muted-foreground mb-4">Persona que recibirá o retirará el pedido. Puedes cambiarlo si es otra persona.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Nombre completo</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={receiverName} onChange={e => { setReceiverName(e.target.value); setDeliveryError(""); }}
                    placeholder="Nombre de quien recibe el pedido"
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Número de teléfono</label>
                <div className="flex gap-2">
                  <select value={receiverPhoneArea} onChange={e => { setReceiverPhoneArea(e.target.value); setDeliveryError(""); }}
                    className="px-2 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white">
                    {veAreas.map(a => <option key={a}>{a}</option>)}
                  </select>
                  <input value={receiverPhone} onChange={e => { setReceiverPhone(e.target.value); setDeliveryError(""); }}
                    placeholder="000-0000"
                    className="flex-1 px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: discount + summary + CTA (2 cols) */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-2xl p-5 sticky top-24 space-y-4">
            <h3 className="text-lg uppercase" style={H9}>Resumen del pedido</h3>

            {/* Discount */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Código de Descuento</label>
              <div className="flex gap-2">
                <input value={discInput} onChange={e => { setDiscInput(e.target.value); setDiscErr(""); setDiscOk(""); }}
                  onKeyDown={e => e.key === "Enter" && applyDisc()}
                  placeholder="Ej: FHEC10"
                  className="flex-1 px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:border-[#179150] uppercase" />
                <button onClick={applyDisc}
                  className="px-3 py-2 bg-[#50e9f8] text-[#006064] rounded-xl text-xs font-black uppercase hover:bg-[#2dd8e8] transition-colors" style={H7}>
                  Aplicar
                </button>
              </div>
              {discErr && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><X size={10} />{discErr}</p>}
              {discOk  && <p className="text-[#179150] text-xs mt-1 flex items-center gap-1"><Check size={10} />{discOk}</p>}
              {!discountApplied && !discErr && <p className="text-[10px] text-muted-foreground mt-1">Prueba: FHEC10 · SALUD15</p>}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-border pt-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{fmtUSD(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">IVA (16%)</span><span>{fmtUSD(ivaAmt)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Entrega</span><span>{deliveryFee > 0 ? fmtUSD(deliveryFee) : "Gratis"}</span></div>
              {discountApplied > 0 && <div className="flex justify-between text-sm"><span className="text-amber-600 font-semibold">Descuento ({discountApplied}%)</span><span className="text-amber-600">−{fmtUSD(discountAmt)}</span></div>}
              <div className="flex justify-between font-black text-lg border-t border-border pt-2" style={H9}>
                <span>Total</span>
                <div className="text-right">
                  <div className="text-[#179150]">{fmtUSD(total)}</div>
                  <div className="text-[10px] text-muted-foreground font-normal">{fmtVES(total)}</div>
                </div>
              </div>
            </div>

            {!receiverName.trim() && (
              <p className="text-xs text-amber-600 flex items-center gap-1.5">
                <AlertTriangle size={12} />Completa el nombre del receptor para continuar
              </p>
            )}
            {deliveryError && (
              <p className="text-xs text-amber-600 flex items-center gap-1.5">
                <AlertTriangle size={12} />{deliveryError}
              </p>
            )}

            <button onClick={async () => {
              const validation = validateDeliverySelection({
                mode: deliveryMode,
                hasPickupOnlyItems: hasControlled,
                selectedSede,
                deliveryAddress,
                receiverName,
                receiverPhoneArea,
                receiverPhone,
              });
              if (!validation.valid) {
                setDeliveryError(firstError(validation));
                return;
              }
              setOrderSaving(true);
              const result = await onConfirmOrder?.({ receiverName, receiverPhoneArea, receiverPhone, deliveryAddress, deliveryMode, selectedSede, discountCode });
              setOrderSaving(false);
              if (result && !result.ok) {
                setDeliveryError(result.error ?? "No se pudo crear el pedido.");
                return;
              }
              onNav(hasRecipe ? "preCheckout" : "tracking");
            }}
              disabled={!canPay || orderSaving}
              className="w-full py-3.5 bg-[#179150] text-white rounded-xl font-black uppercase flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={H7}>
              <Package size={16} /> {orderSaving ? "Creando pedido..." : "Confirmar Pedido"}
            </button>
            {hasRecipe && <p className="text-[10px] text-muted-foreground text-center">Se solicitará validación médica antes del pago.</p>}
            <p className="text-[10px] text-muted-foreground text-center">Podrás completar el pago desde "Mi Pedido".</p>
          </div>
        </div>
      </div>
    </div>
  );
}
