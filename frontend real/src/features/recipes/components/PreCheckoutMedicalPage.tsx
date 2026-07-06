import React, { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Bell, Check, CheckCircle, Clock, CreditCard, FileText, Shield, Upload } from "lucide-react";
import type { CartItem, Page } from "../../../app/types";
import { H7, H9 } from "../../../app/data";
import { validateRecipeUploads } from "../../../validation";

// ─── PreCheckoutMedicalPage ───────────────────────────────────────────────────
// Step 2A (conditional): recipe upload + 3-min validation timer
export function PreCheckoutMedicalPage({ cartItems, onNav }: { cartItems: CartItem[]; onNav: (p: Page) => void }) {
  const regulatedItems  = cartItems.filter(i => i.product.needsRecipe || i.product.controlledSubstance);
  const hasControlled   = cartItems.some(i => i.product.controlledSubstance);
  const [files, setFiles]   = useState<Record<number, File|null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(180); // 3 min
  const approved = countdown <= 0;

  useEffect(() => {
    if (regulatedItems.length === 0) { onNav("checkout"); }
  }, [regulatedItems.length, onNav]);

  useEffect(() => {
    if (!submitted || approved) return;
    const t = setInterval(() => setCountdown(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [submitted, approved]);

  const allUploaded = validateRecipeUploads({
    requiredProducts: regulatedItems.map(item => item.product),
    files,
  }).valid;
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  // Submitted state: timer screen
  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 pb-16 mt-12 text-center">
        {/* Psychotropic persistent banner */}
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
              Recibirás un aviso en tu <strong>correo electrónico</strong> y por <strong>WhatsApp</strong> cuando tu récipe sea aprobado y puedas proceder al pago.
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

  // Upload form
  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 mt-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => onNav("deliverySelect")} className="p-2 rounded-xl hover:bg-muted transition-colors"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-2xl uppercase text-foreground" style={H9}>Validación Médica</h1>
          <p className="text-sm text-muted-foreground">Carga tu récipe digital para continuar</p>
        </div>
      </div>

      {/* Psychotropic banner — always visible */}
      {hasControlled && (
        <div className="flex items-start gap-3 bg-red-50 border-2 border-red-400 rounded-2xl p-4 mb-5">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-800 font-black text-sm uppercase mb-1" style={H9}>Obligatorio — Récipe Físico Original</div>
            <p className="text-red-700 text-sm leading-relaxed">Debe presentar el <strong>récipe médico físico original</strong> al momento de retirar su pedido en la farmacia. No se aceptan copias ni fotografías.</p>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {regulatedItems.map(item => {
          const isControlled = item.product.controlledSubstance;
          const uploaded = !!files[item.product.id]; // always require upload, even for controlled
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
                  <p className="text-purple-700 text-xs leading-relaxed">El récipe físico original se presentará en farmacia al momento del retiro. Carga aquí la foto del récipe como referencia.</p>
                </div>
              ) : (
                <div className="bg-[#f0fdf7] border border-[#a7f3d0] rounded-xl px-4 py-3">
                  <p className="text-[#006064] text-xs mb-3">Sube una foto o PDF del récipe médico. Debe ser legible y estar vigente (no mayor a 30 días).</p>
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

      <button onClick={() => { if (allUploaded) onNav("tracking"); }} disabled={!allUploaded}
        className={`w-full py-4 rounded-xl font-black uppercase flex items-center justify-center gap-2 transition-all ${allUploaded ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        style={H7}>
        <FileText size={18} /> Enviar a Auditoría Médica
      </button>
    </div>
  );
}
