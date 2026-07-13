import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { Product } from "../../../app/types";
import { H9, fmtUSD } from "../../../app/data";
import { BRANCH_IDS } from "../../../config/api";
import { getCatalogProducts } from "../../../services/backendService";

const BRANCH_OPTIONS = [
  { id: BRANCH_IDS.principal, name: "Farmacia Pzo" },
  { id: BRANCH_IDS.clinica, name: "Farmacia San Felix" },
];

export function InventarioTab({ setCatalogProducts }: {
  products: Product[];
  setCatalogProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}) {
  const [branchId, setBranchId] = useState<string>(BRANCH_IDS.principal);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getCatalogProducts(branchId)
      .then((items) => {
        if (!cancelled) {
          setProducts(items);
          setCatalogProducts(items);
        }
      })
      .catch((reason) => {
        if (!cancelled) {
          setProducts([]);
          setError(reason instanceof Error ? reason.message : "No se pudo consultar el inventario.");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [branchId, setCatalogProducts]);

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.brand.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl uppercase text-foreground" style={H9}>Inventario real por sede</h3>
          <p className="text-sm text-muted-foreground">Stock y precios consultados directamente desde Supabase.</p>
        </div>
        <select value={branchId} onChange={(event) => setBranchId(event.target.value)}
          className="px-4 py-2 border border-border rounded-xl text-sm font-semibold bg-white min-w-[200px]">
          {BRANCH_OPTIONS.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
        </select>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por principio activo o marca..."
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm" />
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#f0fdf7] border-b border-border">
              {["Producto / Marca", "Categoría", "Forma farmacéutica", "Stock", "Precio USD"].map((header) =>
                <th key={header} className="text-left px-4 py-3 text-xs font-black uppercase text-muted-foreground" style={H9}>{header}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((product) => <tr key={product.id} className="border-b border-border/50">
                <td className="px-4 py-3"><div className="font-semibold text-xs">{product.name}</div><div className="text-[10px] text-muted-foreground">{product.brand}</div></td>
                <td className="px-4 py-3 text-xs">{product.category}</td>
                <td className="px-4 py-3 text-xs">{product.presentation}</td>
                <td className="px-4 py-3 text-xs font-bold">{product.stock}</td>
                <td className="px-4 py-3 text-xs font-bold text-[#179150]">{fmtUSD(product.priceUSD)}</td>
              </tr>)}
              {!loading && filtered.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-sm text-muted-foreground">No hay registros para esta sede.</td></tr>}
              {loading && <tr><td colSpan={5} className="p-10 text-center text-sm text-muted-foreground">Consultando inventario…</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
