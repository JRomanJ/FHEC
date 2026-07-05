import React, { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle, Store, Phone, Building2, Info, Copy, Check, CheckCircle, MapPin, User, CreditCard } from "lucide-react";
import { Page, CartItem, SEDES, H9, H7, fmtUSD, fmtVES, effectivePrice } from "../shared";
import { ProductBox } from "./ProductCard";

export function CheckoutPage({ cartItems, onNav, discountApplied = 0, deliveryMode = "delivery", selectedSede = "principal", onClearCart = () => {} }: {
  cartItems: CartItem[]; onNav: (p: Page) => void;
  discountApplied?: number; deliveryMode?: "delivery"|"pickup"; selectedSede?: string; onClearCart?: () => void;
}) {
  const hasControlled = cartItems.some(i => i.product.controlledSubstance);
  const subtotal   = cartItems.reduce((s, i) => s + effectivePrice(i.product) * i.quantity, 0);
  const deliveryFee= deliveryMode === "delivery" && !hasControlled ? 2.50 : 0;
  const discAmt    = subtotal * discountApplied / 100;
  const total      = subtotal + deliveryFee - discAmt;
  const activeSede = SEDES.find(s => s.id === selectedSede) ?? SEDES[0];

  type PayMethod = "pago_movil"|"transferencia"|"presencial";
  const [payMethod, setPayMethod] = useState<PayMethod>("pago_movil");
  const [payRef,   setPayRef]   = useState("");
  const [payPhone, setPayPhone] = useState("");
  const [payAmt,   setPayAmt]   = useState("");
  const [copied,   setCopied]   = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);
  const [done,     setDone]     = useState(false);

  useEffect(() => {
    if (payMethod === "presencial") return;
    const t = setInterval(() => setTimeLeft(p => Math.max(0,p-1)), 1000);
    return () => clearInterval(t);
  }, [payMethod]);

  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  if (done) return <OrderCompletePage cartItems={cartItems} onNav={onNav} deliveryMode={deliveryMode} activeSede={activeSede} total={total} hasControlled={hasControlled} onClearCart={onClearCart} />;

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 pb-16 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNav("deliverySelect")} className="p-2 rounded-xl hover:bg-muted transition-colors"><ArrowLeft size={18} /></button>
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
            <p className="text-red-700 text-sm leading-relaxed">Recuerda presentar el <strong>récipe médico físico original</strong> al momento de retirar en la farmacia.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="text-base uppercase mb-4" style={H9}>Selecciona el Método</h3>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: "pago_movil"   as const, label: "Pago Móvil",    icon: <Phone size={18} /> },
                { id: "transferencia" as const, label: "Transferencia", icon: <Building2 size={18} /> },
                { id: "presencial"   as const, label: "En Tienda",     icon: <Store size={18} /> },
              ] as { id: PayMethod; label: string; icon: React.ReactNode }[]).map(m => (
                <button key={m.id} onClick={() => setPayMethod(m.id)}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all
                    ${payMethod === m.id ? "border-[#50e9f8] bg-[#e0f8fd]" : "border-border hover:border-[#179150]/40"}`}>
                  <span className={payMethod === m.id ? "text-[#006064]" : "text-muted-foreground"}>{m.icon}</span>
                  <span className={`text-xs font-black uppercase ${payMethod === m.id ? "text-[#006064]" : "text-muted-foreground"}`} style={H9}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {payMethod === "pago_movil" && (
            <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-semibold mb-1"><Info size={13} />Tiempo restante: <strong>{fmt(timeLeft)}</strong></div>
                <p className="text-amber-700">Envía el monto exacto y registra tu referencia.</p>
              </div>
              <div className="bg-muted rounded-xl p-3 space-y-1.5">
                {[["Banco","Banesco"],["Teléfono","0424-100-2024"],["Cédula FHEC","J-12345678-9"]].map(([k,v])=>(
                  <div key={k} className="flex justify-between text-xs"><span className="text-muted-foreground">{k}</span><span className="font-semibold">{v}</span></div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Teléfono emisor</label>
                  <input value={payPhone} onChange={e=>setPayPhone(e.target.value)} placeholder="0412-000-0000" className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" /></div>
                <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Monto (Bs.)</label>
                  <input value={payAmt} onChange={e=>setPayAmt(e.target.value)} placeholder={fmtVES(total).replace("Bs.S ","")} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" /></div>
              </div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">N° de referencia</label>
                <input value={payRef} onChange={e=>setPayRef(e.target.value)} placeholder="Ej: 00291847362" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" /></div>
            </div>
          )}

          {payMethod === "transferencia" && (
            <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-semibold"><Info size={13} />Tiempo restante: <strong>{fmt(timeLeft)}</strong></div>
              </div>
              <div className="bg-muted rounded-xl p-4 space-y-2">
                {[["Banco","Banesco Universal, C.A."],["N° de cuenta","0134-0001-23-0001234567"],["RIF","J-12345678-9"],["Beneficiario","Farmahumana FHEC, C.A."]].map(([k,v])=>(
                  <div key={k} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{k}</span>
                    <div className="flex items-center gap-1.5"><span className="font-semibold">{v}</span>
                      {k==="N° de cuenta"&&<button onClick={()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)}}>{copied?<Check size={11} className="text-[#179150]"/>:<Copy size={11}/>}</button>}
                    </div>
                  </div>
                ))}
              </div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">N° de referencia</label>
                <input value={payRef} onChange={e=>setPayRef(e.target.value)} placeholder="Ej: 00298374618" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" /></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Monto transferido (Bs.)</label>
                <input value={payAmt} onChange={e=>setPayAmt(e.target.value)} placeholder={fmtVES(total).replace("Bs.S ","")} className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" /></div>
            </div>
          )}

          {payMethod === "presencial" && (
            <div className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <Store size={18} className="text-[#179150] flex-shrink-0" />
                <div>
                  <div className="font-black text-sm uppercase text-[#179150] mb-0.5" style={H9}>Pago en Tienda</div>
                  <p className="text-sm text-muted-foreground">Pagarás al momento de retirar en <strong>{activeSede.name}</strong>.</p>
                </div>
              </div>
            </div>
          )}

          <button onClick={() => setDone(true)}
            className="w-full py-4 bg-[#179150] text-white rounded-xl uppercase flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
            style={H7}>
            <CheckCircle size={18} /> Confirmar Pago
          </button>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-2xl p-5 sticky top-24">
            <h3 className="text-base uppercase mb-3" style={H9}>Resumen</h3>
            <div className="space-y-2.5 mb-4">
              {cartItems.map(item => (
                <div key={item.product.id} className="flex items-center gap-2.5">
                  <div className="w-9 h-11 rounded-lg overflow-hidden flex-shrink-0"><ProductBox product={item.product} size="sm" /></div>
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
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{deliveryMode==="delivery"?"Delivery":"Pickup"}</span><span>{deliveryFee>0?fmtUSD(deliveryFee):"Gratis"}</span></div>
              {discountApplied>0&&<div className="flex justify-between text-sm"><span className="text-amber-600">Descuento</span><span className="text-amber-600">−{fmtUSD(discAmt)}</span></div>}
              <div className="flex justify-between font-black text-base border-t border-border pt-2" style={H9}>
                <span>Total</span>
                <div className="text-right">
                  <div className="text-[#179150]">{fmtUSD(total)}</div>
                  <div className="text-[10px] text-muted-foreground font-normal">{fmtVES(total)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderCompletePage({ cartItems, onNav, deliveryMode, activeSede, total, hasControlled, onClearCart }: {
  cartItems: CartItem[]; onNav: (p: Page) => void;
  deliveryMode: string; activeSede: typeof SEDES[0]; total: number; hasControlled: boolean;
  onClearCart: () => void;
}) {
  const [pin]   = useState(() => String(Math.floor(1000+Math.random()*9000)));
  const [code]  = useState(() => `FHEC-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,"0")}${String(new Date().getDate()).padStart(2,"0")}-${Math.floor(1000+Math.random()*9000)}`);
  const [receiverName,  setReceiverName]  = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [docType,  setDocType]  = useState<"V"|"E"|"P"|"J"|"G">("V");
  const [docNum,   setDocNum]   = useState("");
  const [fiscalAddr, setFiscalAddr] = useState("");
  const [done, setDone] = useState(false);

  const handleFinish = () => { setDone(true); onClearCart(); };

  if (done) {
    return (
      <div className="fixed inset-0 overflow-hidden z-[300]" style={{ background: "rgba(0,0,0,0.75)" }}>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl text-center overflow-hidden" style={{ maxHeight: "90vh" }}>
            <div className="p-10">
              <div className="w-24 h-24 rounded-full bg-[#179150] flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} className="text-white" /></div>
              <h2 className="text-4xl uppercase text-foreground mb-2" style={H9}>¡Pedido Confirmado!</h2>
              <p className="text-gray-600 text-sm mb-4">Tu orden <strong>#{code}</strong> ha sido registrada. Te notificaremos por WhatsApp.</p>
              <div className="bg-[#f0fdf7] border border-[#a7f3d0] rounded-xl px-4 py-3 mb-5 text-left">
                <div className="text-[#006064] text-xs font-bold uppercase mb-0.5">N° de pedido</div>
                <div className="text-[#179150] text-lg font-black" style={H9}>#{code}</div>
              </div>
              {hasControlled && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-300 rounded-xl p-3 mb-5 text-left">
                  <AlertTriangle size={15} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-xs leading-relaxed"><strong>Recuerda:</strong> Presenta tu récipe médico físico original al retirar en {activeSede.name}.</p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <button onClick={() => onNav("tracking")} className="w-full bg-[#179150] text-white py-3.5 rounded-xl uppercase hover:bg-green-700 transition-colors" style={H7}>Seguir mi Pedido</button>
                <button onClick={() => onNav("home")} className="w-full border border-border py-3 rounded-xl text-sm hover:bg-muted transition-colors">Volver al inicio</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 pb-16 mt-6">
      <div className="bg-gradient-to-br from-[#006064] to-[#1a3a5c] rounded-3xl p-8 text-center mb-6 border-2 border-[#50e9f8]">
        <div className="text-[#179150] text-sm font-black uppercase tracking-widest mb-2" style={H9}>¡Pago Confirmado! · PIN de Entrega</div>
        <div className="text-white tracking-[0.5em] mb-2" style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:64 }}>{pin}</div>
        <p className="text-white/60 text-xs mb-3">Preséntalo en farmacia o entrégalo al repartidor</p>
        <div className="inline-block bg-white/10 border border-white/20 rounded-xl px-4 py-2">
          <div className="text-white/50 text-[10px] uppercase tracking-wider">N° de pedido</div>
          <div className="text-white text-base font-black" style={H9}>#{code}</div>
        </div>
      </div>

      {hasControlled && (
        <div className="flex items-start gap-3 bg-red-50 border-2 border-red-400 rounded-2xl p-4 mb-5">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-800 font-black text-sm uppercase mb-1" style={H9}>Obligatorio — Récipe Físico Original</div>
            <p className="text-red-700 text-sm leading-relaxed">Presente el <strong>récipe médico físico original</strong> al retirar en <strong>{activeSede.name}</strong>. Sin él no se entregará el medicamento.</p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-base uppercase" style={H9}>Datos del Receptor</h3>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Nombre completo</label>
            <div className="relative"><User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={receiverName} onChange={e=>setReceiverName(e.target.value)} placeholder="Quien recibirá el pedido" className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" /></div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Teléfono de contacto</label>
            <div className="relative"><Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={receiverPhone} onChange={e=>setReceiverPhone(e.target.value)} placeholder="0414-123-4567" className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" /></div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-base uppercase" style={H9}>Datos de Facturación</h3>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Tipo y N° de documento</label>
            <div className="flex gap-2">
              <div className="flex rounded-xl border border-border overflow-hidden flex-shrink-0">
                {(["V","E","P","J","G"] as const).map(t=>(
                  <button key={t} onClick={()=>setDocType(t)}
                    className={`px-2.5 py-2 text-sm font-black transition-colors ${docType===t?"bg-[#50e9f8] text-[#006064]":"bg-white text-muted-foreground hover:bg-muted"}`}
                    style={H9}>{t}</button>
                ))}
              </div>
              <input value={docNum} onChange={e=>setDocNum(e.target.value)} placeholder="12345678"
                className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Dirección fiscal</label>
            <div className="relative"><MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={fiscalAddr} onChange={e=>setFiscalAddr(e.target.value)} placeholder="Dirección SENIAT"
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" /></div>
          </div>
        </div>
      </div>

      <button onClick={handleFinish}
        className="w-full py-4 bg-[#179150] text-white rounded-xl uppercase flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
        style={H7}>
        <CheckCircle size={18} /> Finalizar Pedido
      </button>
      <p className="text-center text-xs text-muted-foreground mt-2">Los campos son opcionales para finalizar.</p>
    </div>
  );
}
