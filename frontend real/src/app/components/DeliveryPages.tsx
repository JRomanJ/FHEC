import React, { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle, MapPin, Store, Bike, CreditCard, User, Phone, Upload, Shield, FileText, Bell, Clock, CheckCircle, X, Check } from "lucide-react";
import { Page, CartItem, AuthUser, SEDES, DISCOUNT_CODES, DEMO_CONTACT, H9, H7, fmtUSD, fmtVES, effectivePrice } from "../shared";
import { GpsMapWidget } from "./DeliveryPanel";

export function DeliverySelectPage({ cartItems, onNav, deliveryMode, setDeliveryMode, selectedSede, setSelectedSede, deliveryAddress, setDeliveryAddress, discountApplied, discountCode, setDiscountApplied, setDiscountCode, user }: {
  cartItems: CartItem[]; onNav: (p: Page) => void;
  deliveryMode: "delivery"|"pickup"; setDeliveryMode: (m: "delivery"|"pickup") => void;
  selectedSede: string; setSelectedSede: (s: string) => void;
  deliveryAddress: string; setDeliveryAddress: (a: string) => void;
  discountApplied: number; discountCode: string;
  setDiscountApplied: (n: number) => void; setDiscountCode: (s: string) => void;
  user?: AuthUser | null;
}) {
  const hasControlled = cartItems.some(i => i.product.controlledSubstance);
  const hasRecipe     = cartItems.some(i => i.product.needsRecipe || i.product.controlledSubstance);
  const subtotal      = cartItems.reduce((s, i) => s + effectivePrice(i.product) * i.quantity, 0);
  const deliveryFee   = deliveryMode === "delivery" && !hasControlled ? 2.50 : 0;
  const discountAmt   = subtotal * discountApplied / 100;
  const total         = subtotal + deliveryFee - discountAmt;
  const activeSede    = SEDES.find(s => s.id === selectedSede) ?? SEDES[0];

  const userContact = user ? (DEMO_CONTACT[user.email] ?? { phone: "", address: "" }) : { phone: "", address: "" };
  const [receiverName,  setReceiverName]  = useState(user?.name ?? "");
  const [receiverPhone, setReceiverPhone] = useState(userContact.phone);

  const [discInput, setDiscInput] = useState(discountCode);
  const [discErr,   setDiscErr]   = useState("");
  const [discOk,    setDiscOk]    = useState(discountApplied > 0 ? `${discountApplied}% aplicado` : "");

  const applyDisc = () => {
    const pct = DISCOUNT_CODES[discInput.trim().toUpperCase()];
    if (pct) { setDiscountApplied(pct); setDiscountCode(discInput.trim().toUpperCase()); setDiscOk(`¡${pct}% de descuento aplicado!`); setDiscErr(""); }
    else      { setDiscErr("Código no válido."); setDiscOk(""); setDiscountApplied(0); }
  };

  useEffect(() => {
    if (hasControlled && deliveryMode === "delivery") setDeliveryMode("pickup");
  }, [hasControlled, deliveryMode, setDeliveryMode]);

  const canPay = receiverName.trim().length > 0 &&
    (deliveryMode === "pickup" || (deliveryMode === "delivery" && deliveryAddress.trim().length > 0));

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
        <div className="lg:col-span-3 space-y-5">
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
                  <a href={activeSede.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-[#179150] text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0 hover:bg-green-700 transition-colors">
                    <MapPin size={11} /> Ver en Maps
                  </a>
                </div>
              </div>
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

          {deliveryMode === "delivery" && (
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="p-5 pb-3">
                <h3 className="text-base uppercase mb-3" style={H9}>Dirección de Entrega</h3>
                <div className="relative mb-3">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={deliveryAddress} onChange={e => {
                    setDeliveryAddress(e.target.value);
                    const a = e.target.value.toLowerCase();
                    setSelectedSede(a.includes("clinica") || a.includes("gumilla") ? "clinica" : "principal");
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
              <div className="border-t border-border">
                <GpsMapWidget address={deliveryAddress || "Ciudad Guayana, Bolívar"} orderId="delivery-select" />
              </div>
            </div>
          )}

          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="text-base uppercase mb-1" style={H9}>Datos del Receptor</h3>
            <p className="text-xs text-muted-foreground mb-4">Persona que recibirá o retirará el pedido.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Nombre completo</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={receiverName} onChange={e => setReceiverName(e.target.value)}
                    placeholder="Nombre de quien recibe el pedido"
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Número de teléfono</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)}
                    placeholder="Ej: 0414-123-4567"
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-2xl p-5 sticky top-24 space-y-4">
            <h3 className="text-lg uppercase" style={H9}>Resumen del pedido</h3>

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

            <div className="space-y-2 border-t border-border pt-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{fmtUSD(subtotal)}</span></div>
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

            <button onClick={() => onNav(hasRecipe ? "preCheckout" : "checkout")}
              disabled={!canPay}
              className="w-full py-3.5 bg-[#179150] text-white rounded-xl font-black uppercase flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={H7}>
              <CreditCard size={16} /> Pagar
            </button>
            {hasRecipe && <p className="text-[10px] text-muted-foreground text-center">Se solicitará validación médica antes del pago.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PreCheckoutMedicalPage({ cartItems, onNav }: { cartItems: CartItem[]; onNav: (p: Page) => void }) {
  const regulatedItems  = cartItems.filter(i => i.product.needsRecipe || i.product.controlledSubstance);
  const hasControlled   = cartItems.some(i => i.product.controlledSubstance);
  const [files, setFiles]   = useState<Record<number, File|null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(180);
  const approved = countdown <= 0;

  useEffect(() => {
    if (regulatedItems.length === 0) { onNav("checkout"); }
  }, [regulatedItems.length, onNav]);

  useEffect(() => {
    if (!submitted || approved) return;
    const t = setInterval(() => setCountdown(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [submitted, approved]);

  const allUploaded = regulatedItems.every(i => i.product.controlledSubstance || files[i.product.id]);
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 pb-16 mt-12 text-center">
        {hasControlled && (
          <div className="flex items-start gap-3 bg-red-50 border-2 border-red-400 rounded-2xl p-4 mb-6 text-left">
            <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm leading-relaxed">
              <strong className="font-black uppercase text-red-800" style={H9}>Obligatorio: </strong>
              Debe presentar el <strong>récipe médico físico original</strong> al momento de retirar su pedido en la farmacia.
            </p>
          </div>
        )}

        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${approved ? "bg-[#179150]" : "bg-amber-400"}`}>
          {approved ? <CheckCircle size={40} className="text-white" /> : <Clock size={38} className="text-white" />}
        </div>
        <h1 className="text-4xl uppercase text-foreground mb-2" style={H9}>
          {approved ? "Récipe Aprobado" : "Validando Récipe"}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          {approved
            ? "Nuestro equipo farmacéutico aprobó tu récipe. Puedes proceder al pago."
            : "Nuestro equipo farmacéutico está verificando tu récipe médico."}
        </p>
        {!approved && (
          <div className="bg-[#e0f5eb] border border-[#a7f3d0] rounded-xl px-4 py-3 mb-4 text-left">
            <div className="flex items-center gap-2 mb-1">
              <Bell size={14} className="text-[#179150]" />
              <span className="text-[#179150] font-bold text-sm">Serás notificado automáticamente</span>
            </div>
            <p className="text-gray-700 text-xs leading-relaxed">
              Recibirás un aviso en tu <strong>correo electrónico</strong> y por <strong>WhatsApp</strong> cuando tu récipe sea aprobado.
            </p>
          </div>
        )}

        {!approved && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <div className="text-amber-700 text-xs mb-2">Tiempo estimado de revisión</div>
            <div className="text-5xl font-black text-amber-600 tracking-widest mb-3" style={H9}>{fmt(countdown)}</div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${((180-countdown)/180)*100}%` }} />
            </div>
          </div>
        )}

        <button onClick={() => onNav("checkout")} disabled={!approved}
          className={`w-full py-3.5 rounded-xl font-black uppercase flex items-center justify-center gap-2 transition-all mb-3 ${approved ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          style={H7}>
          <CreditCard size={16} /> {approved ? "Proceder al Pago" : "Esperando aprobación…"}
        </button>
        <button onClick={() => onNav("home")} className="w-full border border-border py-2.5 rounded-xl text-sm font-semibold hover:bg-muted transition-colors">
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 mt-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => onNav("deliverySelect")} className="p-2 rounded-xl hover:bg-muted transition-colors"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-2xl uppercase text-foreground" style={H9}>Validación Médica</h1>
          <p className="text-sm text-muted-foreground">Carga tu récipe digital para continuar</p>
        </div>
      </div>

      {hasControlled && (
        <div className="flex items-start gap-3 bg-red-50 border-2 border-red-400 rounded-2xl p-4 mb-5">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-800 font-black text-sm uppercase mb-1" style={H9}>Obligatorio — Récipe Físico Original</div>
            <p className="text-red-700 text-sm leading-relaxed">Debe presentar el <strong>récipe médico físico original</strong> al momento de retirar su pedido en la farmacia.</p>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {regulatedItems.map(item => {
          const isControlled = item.product.controlledSubstance;
          const uploaded = isControlled || !!files[item.product.id];
          return (
            <div key={item.product.id} className={`bg-white border-2 rounded-2xl p-5 ${uploaded ? "border-[#179150]" : "border-border"}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-black text-sm uppercase" style={H9}>{item.product.name}</div>
                  <div className="text-xs text-muted-foreground">{item.product.brand}</div>
                </div>
                {uploaded
                  ? <span className="bg-[#179150] text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1" style={H9}><Check size={10} />OK</span>
                  : <span className="bg-red-100 text-red-700 text-xs font-black px-3 py-1 rounded-full uppercase" style={H9}>Requerido</span>
                }
              </div>

              {isControlled ? (
                <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={13} className="text-purple-700" />
                    <span className="text-purple-800 text-xs font-black uppercase" style={H9}>Psicotrópico Controlado</span>
                  </div>
                  <p className="text-purple-700 text-xs leading-relaxed">El récipe físico original se presentará en farmacia al momento del retiro.</p>
                </div>
              ) : (
                <div className="bg-[#f0fdf7] border border-[#a7f3d0] rounded-xl px-4 py-3">
                  <p className="text-[#006064] text-xs mb-3">Sube una foto o PDF del récipe médico. Debe ser legible y estar vigente.</p>
                </div>
              )}

              <label className={`mt-3 flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-3 cursor-pointer transition-all
                ${uploaded ? "border-[#179150] bg-[#e0f5eb]" : "border-border hover:border-[#179150]/40 bg-muted/20"}`}>
                <input type="file" accept="image/*,.pdf" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setFiles(p => ({ ...p, [item.product.id]: f })); }} />
                <Upload size={14} className={uploaded ? "text-[#179150]" : "text-muted-foreground"} />
                <span className={`text-xs font-black uppercase ${uploaded ? "text-[#179150]" : "text-muted-foreground"}`} style={H9}>
                  {files[item.product.id] ? files[item.product.id]!.name : (isControlled ? "Subir foto del récipe (referencia)" : "Subir Récipe Digital")}
                </span>
              </label>
            </div>
          );
        })}
      </div>

      <button onClick={() => { if (allUploaded) setSubmitted(true); }} disabled={!allUploaded}
        className={`w-full py-4 rounded-xl font-black uppercase flex items-center justify-center gap-2 transition-all ${allUploaded ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        style={H7}>
        <FileText size={18} /> Enviar a Auditoría Médica
      </button>
    </div>
  );
}
