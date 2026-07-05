import React, { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Building2, Check, CheckCircle, Clock, Copy, MapPin, Phone, User } from "lucide-react";
import type { AuthUser, CartItem, Page } from "../../../app/types";
import { effectivePrice, fmtUSD, fmtVES, H7, H9, VES_RATE } from "../../../app/data";
import { ProductBox } from "../../../components/product";

export function CheckoutPage({ cartItems, onNav, discountApplied = 0, deliveryMode = "delivery", selectedSede = "principal", onClearCart = () => {}, user = null, veAreas, docTypes, veBanks }: {
  cartItems: CartItem[]; onNav: (p: Page) => void;
  discountApplied?: number; deliveryMode?: "delivery"|"pickup"; selectedSede?: string;
  onClearCart?: () => void;
  user?: AuthUser | null;
  veAreas: string[];
  docTypes: string[];
  veBanks: string[];
}) {
  const hasControlled = cartItems.some(i => i.product.controlledSubstance);
  const subtotal   = cartItems.reduce((s, i) => s + effectivePrice(i.product) * i.quantity, 0);
  const deliveryFee = deliveryMode === "delivery" && !hasControlled ? 2.50 : 0;
  const discAmt    = subtotal * discountApplied / 100;
  const ivaAmt     = +(subtotal * 0.16).toFixed(2);
  const total      = +(subtotal + ivaAmt + deliveryFee - discAmt).toFixed(2);

  type PayMethod = "pago_movil" | "transferencia";
  const [payMethod,     setPayMethod]     = useState<PayMethod>("pago_movil");
  const [payRef,        setPayRef]        = useState("");
  const [payPhone,      setPayPhone]      = useState("");
  const [payPhoneArea,  setPayPhoneArea]  = useState("0412");
  const [payBank,       setPayBank]       = useState(""); // banco emisor
  const [payAmt,        setPayAmt]        = useState("");
  const [copied,        setCopied]        = useState(false);
  const [timeLeft,      setTimeLeft]      = useState(900);
  const [timeExpired,   setTimeExpired]   = useState(false);

  // Billing — auto-filled from profile
  const [billName,      setBillName]      = useState(user?.name ?? "");
  const [billCedula,    setBillCedula]    = useState(user?.cedula ?? "");
  const [billDocType,   setBillDocType]   = useState("V");
  const [billPhone,     setBillPhone]     = useState("");
  const [billPhoneArea, setBillPhoneArea] = useState("0412");
  const [billAddress,   setBillAddress]   = useState("");

  // Validation error
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => {
      if (p <= 1) { setTimeExpired(true); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  const handleConfirm = () => {
    setConfirmError("");
    if (!payBank) { setConfirmError("El banco emisor es obligatorio."); return; }
    if (!payAmt)  { setConfirmError("Ingresa el monto transferido."); return; }
    if (!payRef)  { setConfirmError("Ingresa el número de referencia."); return; }

    const paidBs  = parseFloat(payAmt.replace(/,/g, ".")) || 0;
    const paidUSD = +(paidBs / VES_RATE).toFixed(2);
    const diff    = Math.abs(+(paidUSD - total).toFixed(2));
    const THRESH  = 0.10;

    if (paidUSD <= 0) { setConfirmError("Monto inválido."); return; }
    if (diff > THRESH) {
      setConfirmError(`El monto reportado (${fmtUSD(paidUSD)}) no coincide con el total del pedido (${fmtUSD(total)}). Debes transferir el monto exacto.`);
      return;
    }
    onClearCart();
    onNav("tracking");
  };

  // Timer expired screen
  if (timeExpired) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={38} className="text-red-500" />
        </div>
        <h2 className="text-3xl uppercase text-foreground mb-2" style={H9}>Tiempo Agotado</h2>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          El tiempo para completar el pago expiró. Tu pedido fue <strong>cancelado</strong> automáticamente.
        </p>
        <button onClick={() => onNav("home")} className="w-full bg-[#179150] text-white py-3.5 rounded-xl uppercase hover:bg-green-700 transition-colors" style={H7}>
          Volver al Inicio
        </button>
      </div>
    );
  }

  const inp  = "w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]";
  const inpL = "w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]";
  const lbl  = "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block";

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 pb-16 mt-6">
      <div className="flex items-center gap-3 mb-6">
        {/* Back → Mi Pedido because the order was already created before payment */}
        <button onClick={() => onNav("tracking")} className="p-2 rounded-xl hover:bg-muted transition-colors"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-3xl uppercase text-foreground" style={H9}>Método de Pago</h1>
          <p className="text-sm text-muted-foreground">Completa el pago para confirmar tu pedido</p>
        </div>
      </div>

      {hasControlled && (
        <div className="flex items-start gap-3 bg-red-50 border-2 border-red-400 rounded-2xl p-4 mb-5">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-800 font-black text-sm uppercase mb-1" style={H9}>Obligatorio — Récipe Físico Original</div>
            <p className="text-red-700 text-sm leading-relaxed">Recuerda presentar el <strong>récipe médico físico original</strong> al retirar en farmacia.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left — payment form */}
        <div className="lg:col-span-3 space-y-5">

          {/* Method selector — only digital methods */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="text-base uppercase mb-4" style={H9}>Selecciona el Método</h3>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: "pago_movil" as const,    label: "Pago Móvil",    icon: <Phone size={18} /> },
                { id: "transferencia" as const, label: "Transferencia", icon: <Building2 size={18} /> },
              ]).map(m => (
                <button key={m.id} onClick={() => { setPayMethod(m.id); setPayBank(""); setConfirmError(""); }}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                    ${payMethod===m.id ? "border-[#50e9f8] bg-[#e0f8fd]" : "border-border hover:border-[#179150]/40"}`}>
                  <span className={payMethod===m.id ? "text-[#006064]" : "text-muted-foreground"}>{m.icon}</span>
                  <span className={`text-xs font-black uppercase ${payMethod===m.id ? "text-[#006064]" : "text-muted-foreground"}`} style={H9}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold border
            ${timeLeft <= 120 ? "bg-red-50 border-red-200 text-red-800" : "bg-amber-50 border-amber-200 text-amber-900"}`}>
            <Clock size={14} className="flex-shrink-0" />
            Tiempo restante para completar el pago: <strong className="tabular-nums">{fmt(timeLeft)}</strong>
          </div>

          {/* Pago Móvil details */}
          {payMethod === "pago_movil" && (
            <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
              <h3 className="text-sm uppercase text-foreground mb-1" style={H9}>Datos para Pago Móvil</h3>
              <div className="bg-muted rounded-xl p-3 space-y-1.5">
                {[["Banco","Banesco"],["Teléfono","0424-100-2024"],["Cédula FHEC","J-12345678-9"]].map(([k,v])=>(
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-semibold">{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <label className={lbl}>Banco emisor <span className="text-red-500">*</span></label>
                <select value={payBank} onChange={e=>{setPayBank(e.target.value);setConfirmError("");}} className={inp+" bg-white"}>
                  <option value="">Seleccionar banco</option>
                  {veBanks.map(b=><option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Teléfono emisor</label>
                <div className="flex gap-2">
                  <select value={payPhoneArea} onChange={e=>setPayPhoneArea(e.target.value)} className="px-2 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white">
                    {veAreas.map(a=><option key={a}>{a}</option>)}
                  </select>
                  <input value={payPhone} onChange={e=>setPayPhone(e.target.value)} placeholder="000-0000" className={inp+" flex-1"}/>
                </div>
              </div>
              <div>
                <label className={lbl}>Monto (Bs.) <span className="text-red-500">*</span></label>
                <input value={payAmt} onChange={e=>{setPayAmt(e.target.value);setConfirmError("");}} placeholder={fmtVES(total).replace("Bs.S ","")} className={inp}/>
              </div>
              <div>
                <label className={lbl}>N° de referencia <span className="text-red-500">*</span></label>
                <input value={payRef} onChange={e=>{setPayRef(e.target.value);setConfirmError("");}} placeholder="Ej: 00291847362" className={inp}/>
              </div>
            </div>
          )}

          {/* Transferencia details */}
          {payMethod === "transferencia" && (
            <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
              <h3 className="text-sm uppercase text-foreground mb-1" style={H9}>Datos para Transferencia</h3>
              <div className="bg-muted rounded-xl p-4 space-y-2">
                {[["Banco","Banesco Universal, C.A."],["N° de cuenta","0134-0001-23-0001234567"],["RIF","J-12345678-9"],["Beneficiario","Farmahumana FHEC, C.A."]].map(([k,v])=>(
                  <div key={k} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{k}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{v}</span>
                      {k==="N° de cuenta"&&<button onClick={()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)}}>
                        {copied?<Check size={11} className="text-[#179150]"/>:<Copy size={11}/>}
                      </button>}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className={lbl}>Banco emisor <span className="text-red-500">*</span></label>
                <select value={payBank} onChange={e=>{setPayBank(e.target.value);setConfirmError("");}} className={inp+" bg-white"}>
                  <option value="">Seleccionar banco</option>
                  {veBanks.map(b=><option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Monto transferido (Bs.) <span className="text-red-500">*</span></label>
                <input value={payAmt} onChange={e=>{setPayAmt(e.target.value);setConfirmError("");}} placeholder={fmtVES(total).replace("Bs.S ","")} className={inp}/>
              </div>
              <div>
                <label className={lbl}>N° de referencia <span className="text-red-500">*</span></label>
                <input value={payRef} onChange={e=>{setPayRef(e.target.value);setConfirmError("");}} placeholder="Ej: 00298374618" className={inp}/>
              </div>
            </div>
          )}

          {/* Billing card */}
          <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-base uppercase" style={H9}>Datos de Facturación</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Verifica o actualiza tus datos fiscales.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={lbl}>Nombre completo</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                  <input value={billName} onChange={e=>setBillName(e.target.value)} placeholder="Nombre completo" className={inpL}/>
                </div>
              </div>
              <div>
                <label className={lbl}>Tipo y N° de documento</label>
                <div className="flex gap-2">
                  <select value={billDocType} onChange={e=>setBillDocType(e.target.value)} className="px-2 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white">
                    {docTypes.map(t=><option key={t}>{t}</option>)}
                  </select>
                  <input value={billCedula} onChange={e=>setBillCedula(e.target.value)} placeholder="12345678" className={inp+" flex-1"}/>
                </div>
              </div>
              <div>
                <label className={lbl}>Número de teléfono</label>
                <div className="flex gap-2">
                  <select value={billPhoneArea} onChange={e=>setBillPhoneArea(e.target.value)} className="px-2 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white">
                    {veAreas.map(a=><option key={a}>{a}</option>)}
                  </select>
                  <input value={billPhone} onChange={e=>setBillPhone(e.target.value)} placeholder="000-0000" className={inp+" flex-1"}/>
                </div>
              </div>
              <div className="col-span-2">
                <label className={lbl}>Dirección fiscal</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                  <input value={billAddress} onChange={e=>setBillAddress(e.target.value)} placeholder="Calle, N°, Ciudad" className={inpL}/>
                </div>
              </div>
            </div>
          </div>

          {confirmError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertTriangle size={14} />{confirmError}
            </div>
          )}

          <button onClick={handleConfirm}
            className="w-full py-4 bg-[#179150] text-white rounded-xl uppercase flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
            style={H7}>
            <CheckCircle size={18} /> Confirmar Pago
          </button>
        </div>

        {/* Right — order summary */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-2xl p-5 sticky top-24">
            <h3 className="text-base uppercase mb-3" style={H9}>Resumen del Pedido</h3>
            <div className="space-y-2.5 mb-4">
              {cartItems.map(item => (
                <div key={item.product.id} className="flex items-center gap-2.5">
                  <div className="w-9 h-11 rounded-lg overflow-hidden flex-shrink-0"><ProductBox product={item.product} size="sm"/></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black uppercase truncate" style={H9}>{item.product.name}</div>
                    <div className="text-[10px] text-muted-foreground">×{item.quantity}</div>
                  </div>
                  <div className="text-xs font-semibold text-[#179150]">{fmtUSD(effectivePrice(item.product)*item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{fmtUSD(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">IVA (16%)</span><span>{fmtUSD(ivaAmt)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{deliveryMode==="delivery"?"Delivery":"Pickup"}</span><span>{deliveryFee>0?fmtUSD(deliveryFee):"Gratis"}</span></div>
              {discountApplied>0&&<div className="flex justify-between text-sm"><span className="text-amber-600">Descuento</span><span className="text-amber-600">−{fmtUSD(discAmt)}</span></div>}
              <div className="flex justify-between font-black text-base border-t border-border pt-2" style={H9}>
                <span>Total del pedido</span>
                <div className="text-right">
                  <div className="text-[#179150]">{fmtUSD(total)}</div>
                  <div className="text-[10px] text-muted-foreground font-normal">{fmtVES(total)}</div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <AlertTriangle size={10} className="text-amber-500 flex-shrink-0" />
                El monto transferido debe coincidir exactamente con el total.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

