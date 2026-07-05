import React, { useState } from "react";

const VES_RATE = 40.50;
const fmtVES = (u: number) => "Bs.S " + (u * VES_RATE).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtUSD = (u: number) => "$" + u.toFixed(2);
const H7: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 };
const VE_AREAS = ["0412", "0414", "0416", "0424", "0426"];
const DOC_TYPES = ["V", "E", "J", "G", "P"];
const VE_BANKS = [
  "Banesco", "Banco de Venezuela", "Mercantil", "BBVA Provincial",
  "Bicentenario", "BNC", "Banco Exterior", "Banplus",
  "Venezolano de Crédito", "Del Sur", "Banco Activo", "100% Banco",
];

export function RefundForm({ amountUSD, onSubmit }: { amountUSD: number; onSubmit: () => void }) {
  type RM = "transferencia" | "pago_movil";
  const [method, setMethod]   = useState<RM>("transferencia");
  const [bank,      setBank]      = useState("");
  const [account,   setAccount]   = useState("");
  const [cedula,    setCedula]    = useState("");
  const [cedType,   setCedType]   = useState("V");
  const [nombre,    setNombre]    = useState("");
  const [phone,     setPhone]     = useState("");
  const [phoneArea, setPhoneArea] = useState("0412");
  const ok = method === "transferencia"
    ? !!(bank && account && cedula && nombre)
    : !!(cedula && phone && bank);
  const inp = "w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]";
  const lbl = "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block";
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
        Reembolso de <strong>{fmtUSD(amountUSD)}</strong> ({fmtVES(amountUSD)}). Indica cómo deseas recibirlo.
      </div>
      <div className="flex gap-2">
        {(["transferencia","pago_movil"] as RM[]).map(m => (
          <button key={m} onClick={() => setMethod(m)}
            className={`flex-1 py-2 rounded-xl border-2 text-xs font-black uppercase transition-all ${method===m?"border-[#50e9f8] bg-[#e0f8fd] text-[#006064]":"border-border text-muted-foreground"}`}
            style={H7}>{m==="pago_movil"?"Pago Móvil":"Transferencia"}</button>
        ))}
      </div>
      <div>
        <label className={lbl}>Banco <span className="text-red-500">*</span></label>
        <select value={bank} onChange={e=>setBank(e.target.value)} className={inp+" bg-white"}>
          <option value="">Seleccionar banco</option>
          {VE_BANKS.map(b=><option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      {method==="transferencia" && <>
        <div><label className={lbl}>N° de cuenta <span className="text-red-500">*</span></label>
          <input value={account} onChange={e=>setAccount(e.target.value)} placeholder="XXXX-XXXX-XX-XXXXXXXXXX" className={inp}/></div>
        <div>
          <label className={lbl}>Tipo y N° de documento <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <select value={cedType} onChange={e=>setCedType(e.target.value)} className="px-2 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white">
              {DOC_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
            <input value={cedula} onChange={e=>setCedula(e.target.value)} placeholder="12345678" className={inp+" flex-1"}/>
          </div>
        </div>
        <div><label className={lbl}>Nombre del beneficiario <span className="text-red-500">*</span></label>
          <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre completo" className={inp}/></div>
      </>}
      {method==="pago_movil" && <>
        <div>
          <label className={lbl}>Tipo y N° de documento <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <select value={cedType} onChange={e=>setCedType(e.target.value)} className="px-2 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white">
              {DOC_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
            <input value={cedula} onChange={e=>setCedula(e.target.value)} placeholder="12345678" className={inp+" flex-1"}/>
          </div>
        </div>
        <div>
          <label className={lbl}>Teléfono <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <select value={phoneArea} onChange={e=>setPhoneArea(e.target.value)} className="px-2 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white">
              {VE_AREAS.map(a=><option key={a}>{a}</option>)}
            </select>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="000-0000" className={inp+" flex-1"}/>
          </div>
        </div>
      </>}
      <button onClick={onSubmit} disabled={!ok}
        className={`w-full py-3 rounded-xl font-black uppercase transition-colors ${ok?"bg-[#179150] text-white hover:bg-green-700":"bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        style={H7}>
        Confirmar Datos de Reembolso
      </button>
    </div>
  );
}
