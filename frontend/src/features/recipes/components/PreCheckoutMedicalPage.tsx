import React, { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Bell, Check, CheckCircle, FileText, Shield, Upload } from "lucide-react";
import type { CartItem, Page } from "../../../app/types";
import { H7, H9 } from "../../../app/data";
import { validateRecipeUploads } from "../../../validation";
import { uploadRemoteRecipe } from "../../../services/recipeService";
import type { RemoteOrderDetail } from "../../../services/orderService";

export function PreCheckoutMedicalPage({ cartItems, onNav, orderId, orderDetails }: {
  cartItems: CartItem[];
  onNav: (p: Page) => void;
  orderId: string | null;
  orderDetails: RemoteOrderDetail[];
}) {
  const regulatedItems = cartItems.filter(item => item.product.needsRecipe || item.product.controlledSubstance);
  const hasControlled = cartItems.some(item => item.product.controlledSubstance);
  const [files, setFiles] = useState<Record<number, File | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (regulatedItems.length === 0) onNav("checkout");
  }, [regulatedItems.length, onNav]);

  const allUploaded = validateRecipeUploads({
    requiredProducts: regulatedItems.map(item => item.product),
    files,
  }).valid;

  const submitRecipes = async () => {
    if (!orderId || !allUploaded) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      for (const item of regulatedItems) {
        const file = files[item.product.id];
        const detail = orderDetails.find(candidate => candidate.id_producto === item.product.backendId);
        if (!file || !detail) throw new Error(`No se encontró el detalle del pedido para ${item.product.name}.`);
        await uploadRemoteRecipe(orderId, detail.id_detalle_pedido, file);
      }
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudieron cargar los recipes.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 pb-16 mt-12 text-center">
        {hasControlled && (
          <div className="flex items-start gap-3 bg-red-50 border-2 border-red-400 rounded-2xl p-4 mb-6 text-left">
            <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm leading-relaxed">
              <strong className="font-black uppercase text-red-800" style={H9}>Obligatorio: </strong>
              Debes presentar el recipe médico físico original al retirar el pedido.
            </p>
          </div>
        )}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#179150]">
          <CheckCircle size={40} className="text-white" />
        </div>
        <h1 className="text-4xl uppercase text-foreground mb-2" style={H9}>Recipes enviados</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Nuestro equipo farmacéutico debe auditarlos antes de que puedas confirmar el pago.
        </p>
        <div className="bg-[#e0f5eb] border border-[#a7f3d0] rounded-xl px-4 py-3 mb-5 text-left">
          <div className="flex items-center gap-2 mb-1">
            <Bell size={14} className="text-[#179150]" />
            <span className="text-[#179150] font-bold text-sm">El estado se actualizará automáticamente</span>
          </div>
          <p className="text-gray-700 text-xs">Consulta “Mi Pedido” para saber cuándo todos los recipes hayan sido aprobados.</p>
        </div>
        <button onClick={() => onNav("tracking")} className="w-full py-3.5 rounded-xl font-black uppercase flex items-center justify-center gap-2 bg-[#179150] text-white hover:bg-green-700" style={H7}>
          <FileText size={16} /> Ver estado del pedido
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
          <p className="text-sm text-muted-foreground">Carga un recipe por cada producto regulado</p>
        </div>
      </div>

      {hasControlled && (
        <div className="flex items-start gap-3 bg-red-50 border-2 border-red-400 rounded-2xl p-4 mb-5">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-800 font-black text-sm uppercase mb-1" style={H9}>Recipe físico obligatorio</div>
            <p className="text-red-700 text-sm">La carga digital no reemplaza la presentación del documento original en farmacia.</p>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {regulatedItems.map(item => {
          const uploaded = Boolean(files[item.product.id]);
          return (
            <div key={item.product.id} className={`bg-white border-2 rounded-2xl p-5 ${uploaded ? "border-[#179150]" : "border-border"}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-black text-lg uppercase" style={H9}>{item.product.name}</div>
                  <div className="text-xs text-muted-foreground">{item.product.brand} · {item.quantity} unidad(es)</div>
                </div>
                {uploaded ? <span className="bg-[#179150] text-white text-sm font-black px-4 py-1.5 rounded-full flex items-center gap-1"><Check size={12} />OK</span> : <span className="bg-red-100 text-red-700 text-sm font-black px-4 py-1.5 rounded-full">Requerido</span>}
              </div>
              {item.product.controlledSubstance && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-3 flex items-center gap-2">
                  <Shield size={13} className="text-purple-700" /><span className="text-purple-800 text-xs font-black uppercase">Producto controlado</span>
                </div>
              )}
              <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-3 cursor-pointer ${uploaded ? "border-[#179150] bg-[#e0f5eb]" : "border-border bg-muted/20"}`}>
                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) setFiles(current => ({ ...current, [item.product.id]: file })); }} />
                <Upload size={14} /><span className="text-xs font-black uppercase">{files[item.product.id]?.name ?? "Subir JPG, PNG, WEBP o PDF"}</span>
              </label>
            </div>
          );
        })}
      </div>

      {submitError && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>}
      {!orderId && <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">Primero debes confirmar el pedido.</div>}
      <button onClick={() => { void submitRecipes(); }} disabled={!allUploaded || submitting || !orderId} className={`w-full py-4 rounded-xl font-black uppercase flex items-center justify-center gap-2 ${allUploaded && orderId ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`} style={H7}>
        <FileText size={18} /> {submitting ? "Subiendo recipes..." : "Enviar a Auditoría Médica"}
      </button>
    </div>
  );
}
