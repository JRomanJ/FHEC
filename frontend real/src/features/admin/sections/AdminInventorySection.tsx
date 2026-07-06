import React, { useState } from "react";
import { AlertTriangle, Search, Settings, X } from "lucide-react";
import type { Product } from "../../../app/types";
import { H7, H9 } from "../../../app/data";
import { firstError, validateInventoryStock } from "../../../validation";

export function InventarioTab({ products, setCatalogProducts }: { products: Product[]; setCatalogProducts: React.Dispatch<React.SetStateAction<Product[]>> }) {
  const [sede, setSede] = useState<"principal" | "clinica">("principal");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState(0);
  const [stockError, setStockError] = useState("");

  const getStock = (p: Product) => (sede === "principal" ? p.stockSedes?.principal : p.stockSedes?.clinica) ?? p.stock;

  const startEdit = (p: Product) => { setEditingId(p.id); setEditStock(getStock(p)); setStockError(""); };
  const cancelEdit = () => { setEditingId(null); setStockError(""); };

  const saveEdit = (id: number) => {
    const validation = validateInventoryStock(editStock);
    if (!validation.valid) {
      setStockError(firstError(validation));
      return;
    }
    setCatalogProducts(prev => prev.map(p => p.id === id ? {
      ...p,
      stock: editStock,
      stockSedes: { ...(p.stockSedes ?? { principal: p.stock, clinica: 0 }), [sede]: editStock },
    } : p));
    setEditingId(null);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const inp = "w-full px-2 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:border-[#179150]";
  const editingProduct = products.find(p => p.id === editingId);

  return (
    <div className="space-y-4">
      {/* Edit modal — stock only */}
      {editingId !== null && editingProduct && (
        <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl uppercase text-foreground" style={H9}>Ajustar Stock</h3>
                <p className="text-sm font-semibold text-foreground">{editingProduct.name}</p>
                <p className="text-xs text-muted-foreground">{editingProduct.brand} · {editingProduct.presentation}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Sede: {sede === "principal" ? "Sede Principal" : "Clínica Humana"}</p>
              </div>
              <button onClick={cancelEdit} className="p-2 hover:bg-muted rounded-xl transition-colors"><X size={18} /></button>
            </div>

            {/* Read-only info */}
            <div className="bg-muted/40 rounded-xl px-4 py-3 mb-4 space-y-1">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Categoría</span><span className="font-semibold text-foreground">{editingProduct.category}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Forma farmacéutica</span><span className="font-semibold text-foreground">{editingProduct.presentation}</span></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Sede</label>
                <select value={sede} onChange={e => { setSede(e.target.value as "principal" | "clinica"); setEditStock(getStock({ ...editingProduct, stockSedes: editingProduct.stockSedes })); }} className={inp}>
                  <option value="principal">Sede Principal</option>
                  <option value="clinica">Clínica Humana</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Stock disponible</label>
                <input type="number" min={0} className={inp} value={editStock}
                  onChange={e => { setEditStock(parseInt(e.target.value) || 0); setStockError(""); }} />
              </div>
              {stockError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
                  <AlertTriangle size={14} />{stockError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => saveEdit(editingId)}
                className="flex-1 py-3 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors font-black uppercase" style={H7}>
                Guardar
              </button>
              <button onClick={cancelEdit}
                className="px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors" style={H7}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl uppercase text-foreground" style={H9}>Inventario por Sede</h3>
          <p className="text-sm text-muted-foreground">Control exclusivo de stock disponible por sede.</p>
        </div>
        <select
          value={sede}
          onChange={e => { setSede(e.target.value as "principal" | "clinica"); setEditingId(null); }}
          className="px-4 py-2 border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-[#179150] bg-white min-w-[180px]"
        >
          <option value="principal">Sede Principal</option>
          <option value="clinica">Clínica Humana</option>
        </select>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o marca..."
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" />
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f0fdf7] border-b border-border">
              {["Producto / Marca", "Categoría", "Forma farmacéutica", "Stock disponible", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase text-muted-foreground whitespace-nowrap" style={H9}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const stock = getStock(p);
              return (
                <tr key={p.id} className="border-b border-border/50 hover:bg-[#f9fdfe] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground text-xs">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">{p.brand}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.presentation}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${stock === 0 ? "bg-red-100 text-red-700" : stock < 10 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`} style={H9}>
                      {stock === 0 ? "Agotado" : stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => startEdit(p)}
                      className="p-1.5 hover:bg-[#50e9f8]/10 rounded-lg text-[#006064] transition-colors"
                      title="Ajustar stock">
                      <Settings size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">Sin resultados para "{search}"</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
