import React, { useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Bike,
  Check,
  CheckCircle,
  ChevronDown,
  ClipboardList,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  MapPin,
  Package,
  Plus,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Store,
  Trash2,
  Truck,
  Upload,
  User,
  X,
  Clock,
} from "lucide-react";
import type { AuthUser, Page, Product, Slide } from "../../../app/types";
import { CATS, DEMO_ACCOUNTS, PRODUCTS, fmtUSD, H7, H9 } from "../../../app/data";
import {
  getLegacyAdminCouponViewModels,
  getLegacyAdminMonitorOrderViewModels,
  getLegacyAdminOrderViewModels,
  getLegacyAdminRefundViewModels,
  getLegacyRecipeAuditViewModels,
} from "../../../services";

// ─── SuperadminModules ────────────────────────────────────────────────────────
type SuperTab = "contenido" | "catalogo" | "personal" | "monitor" | "inventario" | "cupones";

// payRef only present when the order has been paid
const DEMO_GLOBAL_ORDERS = getLegacyAdminMonitorOrderViewModels();

const STATUS_COLORS: Record<string, string> = {
  "En validación médica": "bg-amber-100 text-amber-800",
  "Pendiente pago": "bg-blue-100 text-blue-800",
  "Por preparar": "bg-orange-100 text-orange-800",
  "Por retirar": "bg-purple-100 text-purple-800",
  "Listo para delivery": "bg-cyan-100 text-cyan-800",
  "En tránsito": "bg-indigo-100 text-indigo-800",
  "Entregado": "bg-green-100 text-green-800",
  "Cancelado": "bg-red-100 text-red-800",
};

function InventarioTab({ products, setCatalogProducts }: { products: Product[]; setCatalogProducts: React.Dispatch<React.SetStateAction<Product[]>> }) {
  const [sede, setSede] = useState<"principal" | "clinica">("principal");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState(0);

  const getStock = (p: Product) => (sede === "principal" ? p.stockSedes?.principal : p.stockSedes?.clinica) ?? p.stock;

  const startEdit = (p: Product) => { setEditingId(p.id); setEditStock(getStock(p)); };
  const cancelEdit = () => setEditingId(null);

  const saveEdit = (id: number) => {
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
                  onChange={e => setEditStock(parseInt(e.target.value) || 0)} />
              </div>
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

function SuperadminModules({ onNav, products, setProducts, slides, setSlides, forcedTab }: {
  onNav: (p: Page) => void;
  products: Product[];
  setProducts: (p: Product[]) => void;
  slides: Slide[];
  setSlides: (s: Slide[]) => void;
  forcedTab?: SuperTab;
}) {
  const [superTab, setSuperTab] = useState<SuperTab>(forcedTab ?? "contenido");
  React.useEffect(() => { if (forcedTab) setSuperTab(forcedTab); }, [forcedTab]);

  // ── Gestor Contenido state ──
  const [slideEditing, setSlideEditing] = useState<number | null>(null);
  const [slideDraft, setSlideDraft] = useState<Slide | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startEditSlide = (i: number) => { setSlideEditing(i); setSlideDraft({ ...slides[i] }); };
  const saveSlide = () => {
    if (slideEditing === null || !slideDraft) return;
    const next = [...slides]; next[slideEditing] = slideDraft;
    setSlides(next); setSlideEditing(null); setSlideDraft(null);
  };
  const removeSlide = (i: number) => setSlides(slides.filter((_, idx) => idx !== i));
  const addNewSlide = () => {
    const blank: Slide = { title: "Nuevo Banner", subtitle: "Descripción del banner", badge: "NUEVO", from: "#031b24", via: "#00546a", to: "#50e9f8", img: "https://images.unsplash.com/photo-1550572017-efe56097ef4a?w=900&h=500&fit=crop&auto=format", cta: "Ver más →" };
    setSlides([...slides, blank]);
    setSlideEditing(slides.length); setSlideDraft(blank);
  };

  // ── Gestor Catálogo state ──
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(products.length ? products : PRODUCTS);
  const [catSearch, setCatSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todos");
  const [editProd, setEditProd] = useState<Product | null>(null);
  const [showProdForm, setShowProdForm] = useState(false);
  const [prodForm, setProdForm] = useState<Partial<Product>>({});
  const isProdEnabled = (p: Product) => p.enabled !== false;

  // ── Gestor Personal state ──
  const [staff, setStaff] = useState([
    { id: 1, name: "Ana Torres",   email: "auxiliar@fhec.com",   cedula: "V-11223344", roles: ["auxiliar"] as string[],                        sede: "principal", active: true,  createdAt: "2024-01-15" },
    { id: 2, name: "José Ramos",   email: "repartidor@fhec.com", cedula: "V-87654321", roles: ["repartidor"] as string[],                       sede: "principal", active: true,  createdAt: "2024-02-03" },
    { id: 3, name: "Carlos Vega",  email: "auditor@fhec.com",    cedula: "V-33445566", roles: ["auditor"] as string[],                          sede: "clinica",   active: true,  createdAt: "2024-03-10" },
    { id: 4, name: "Luis Medina",  email: "admin@fhec.com",      cedula: "V-55667788", roles: ["superadmin", "auditor", "auxiliar"] as string[], sede: "Todas",     active: true,  createdAt: "2024-01-01" },
    { id: 5, name: "Carmen López", email: "carmen@fhec.com",     cedula: "V-22334455", roles: ["auxiliar"] as string[],                         sede: "clinica",   active: false, createdAt: "2024-04-20" },
  ]);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({ email: "", role: "auxiliar", sede: "principal" });
  const [staffFormError, setStaffFormError] = useState("");
  const [editStaffId, setEditStaffId] = useState<number | null>(null);
  const ROLE_OPTIONS = ["auxiliar", "repartidor", "auditor", "superadmin"];

  // ── Monitor Global state ──
  const [monitorOrders] = useState(DEMO_GLOBAL_ORDERS);
  const [monitorDateFrom, setMonitorDateFrom] = useState("");
  const [monitorDateTo, setMonitorDateTo] = useState("");
  const [monitorStatus, setMonitorStatus] = useState("Todos");
  const [monitorSede, setMonitorSede] = useState("Todas");

  const kpiData = [
    { label: "En validación médica", count: monitorOrders.filter(o => o.status === "En validación médica").length, color: "bg-amber-500" },
    { label: "Pendiente pago", count: monitorOrders.filter(o => o.status === "Pendiente pago").length, color: "bg-blue-500" },
    { label: "Por preparar", count: monitorOrders.filter(o => o.status === "Por preparar").length, color: "bg-orange-500" },
    { label: "Por retirar", count: monitorOrders.filter(o => o.status === "Por retirar").length, color: "bg-purple-500" },
    { label: "Listo para delivery", count: monitorOrders.filter(o => o.status === "Listo para delivery").length, color: "bg-cyan-500" },
    { label: "En tránsito", count: monitorOrders.filter(o => o.status === "En tránsito").length, color: "bg-indigo-500" },
    { label: "Entregado", count: monitorOrders.filter(o => o.status === "Entregado").length, color: "bg-green-500" },
    { label: "Cancelado", count: monitorOrders.filter(o => o.status === "Cancelado").length, color: "bg-red-500" },
  ];

  const filteredMonitor = monitorOrders.filter(o => {
    const matchStatus = monitorStatus === "Todos" || o.status === monitorStatus;
    const matchSede = monitorSede === "Todas" || o.sede === monitorSede;
    return matchStatus && matchSede;
  });

  // ── Cupones state ──
  interface Coupon { id: number; code: string; discount: number; startDate: string; endDate: string; userEmail?: string; }
  const [coupons, setCoupons] = useState<Coupon[]>(getLegacyAdminCouponViewModels());
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editCouponId, setEditCouponId] = useState<number | null>(null);
  const [couponForm, setCouponForm] = useState({ code: "", discount: 0, startDate: "", endDate: "", userEmail: "" });
  const [couponError, setCouponError] = useState("");
  const [couponFilter, setCouponFilter] = useState<"all" | "general" | "user">("all");

  const openNewCoupon = () => {
    setEditCouponId(null);
    setCouponForm({ code: "", discount: 0, startDate: "", endDate: "", userEmail: "" });
    setCouponError("");
    setShowCouponForm(true);
  };
  const openEditCoupon = (c: Coupon) => {
    setEditCouponId(c.id);
    setCouponForm({ code: c.code, discount: c.discount, startDate: c.startDate, endDate: c.endDate, userEmail: c.userEmail ?? "" });
    setCouponError("");
    setShowCouponForm(true);
  };
  const saveCoupon = () => {
    if (!couponForm.code.trim()) return;
    const today = new Date().toISOString().split("T")[0];
    const duplicateVigente = coupons.some(c =>
      c.code.toUpperCase() === couponForm.code.trim().toUpperCase() &&
      c.id !== editCouponId &&
      (!c.endDate || c.endDate >= today)
    );
    if (duplicateVigente) {
      setCouponError("Ya existe un cupón vigente con este código.");
      return;
    }
    setCouponError("");
    const payload: Coupon = {
      id: editCouponId ?? Math.max(...coupons.map(c => c.id), 0) + 1,
      code: couponForm.code.trim(),
      discount: couponForm.discount,
      startDate: couponForm.startDate,
      endDate: couponForm.endDate,
      ...(couponForm.userEmail.trim() ? { userEmail: couponForm.userEmail.trim() } : {}),
    };
    if (editCouponId !== null) {
      setCoupons(prev => prev.map(c => c.id === editCouponId ? payload : c));
    } else {
      setCoupons(prev => [...prev, payload]);
    }
    setShowCouponForm(false);
  };

  const filteredCoupons = coupons.filter(c => {
    if (couponFilter === "general") return !c.userEmail;
    if (couponFilter === "user")    return !!c.userEmail;
    return true;
  });

  const [catSort, setCatSort] = useState<"relevancia" | "precio" | "descuento">("relevancia");

  const filteredCat = catalogProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(catSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(catSearch.toLowerCase());
    const matchCat = catFilter === "Todos" || p.category === catFilter;
    return matchSearch && matchCat;
  }).sort((a, b) => {
    if (catSort === "precio") return a.priceUSD - b.priceUSD;
    if (catSort === "descuento") return (b.discount ?? 0) - (a.discount ?? 0);
    return b.rating - a.rating; // relevancia
  });

  const controlLevel = (p: Partial<Product>) =>
    p.controlledSubstance ? "fisico" : p.needsRecipe ? "digital" : "ninguno";

  const applyControlLevel = (level: string) => ({
    needsRecipe: level !== "ninguno",
    controlledSubstance: level === "fisico",
  });

  const openEditProd = (p: Product) => {
    setEditProd(p);
    setProdForm({ ...p });
    setShowProdForm(true);
  };

  const openNewProd = () => {
    setEditProd(null);
    setProdForm({ name: "", brand: "", category: "Diabetes", presentation: "", packSize: "", priceUSD: 0, stock: 0, discount: 0, needsRecipe: false, rating: 5, reviews: 0, bgColor: "#e8f5e9", accentColor: "#179150", description: "", activeIngredient: "", contraindications: "", posology: "", concentration: "", concentrationUnit: "mg" });
    setShowProdForm(true);
  };

  const saveProd = () => {
    if (!prodForm.name?.trim() || !prodForm.brand?.trim()) return;
    if (editProd) {
      setCatalogProducts(prev => prev.map(p => p.id === editProd.id ? { ...p, ...prodForm } as Product : p));
    } else {
      const newId = Math.max(...catalogProducts.map(p => p.id), 0) + 1;
      setCatalogProducts(prev => [...prev, { ...prodForm, id: newId } as Product]);
    }
    setShowProdForm(false);
  };

  const toggleProdEnabled = (id: number) => {
    setCatalogProducts(prev => prev.map(p => p.id === id ? { ...p, enabled: p.enabled === false ? true : false } : p));
  };

  const toggleStaffEnabled = (id: number) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const saveStaff = () => {
    setStaffFormError("");
    if (!staffForm.email.trim()) {
      setStaffFormError("El correo electrónico es obligatorio.");
      return;
    }
    // Look up user data from existing accounts (demo)
    const knownAccount = DEMO_ACCOUNTS.find(a => a.email === staffForm.email);
    const resolvedName  = knownAccount?.name  ?? staffForm.email;
    const resolvedCedula = knownAccount?.cedula ?? "—";
    if (editStaffId !== null) {
      setStaff(prev => prev.map(m => m.id === editStaffId ? { ...m, roles: [staffForm.role], sede: staffForm.sede } : m));
    } else {
      const newId = Math.max(...staff.map(s => s.id), 0) + 1;
      setStaff(prev => [...prev, { id: newId, name: resolvedName, email: staffForm.email, cedula: resolvedCedula, roles: [staffForm.role], sede: staffForm.sede, active: true, createdAt: new Date().toISOString().split("T")[0] }]);
    }
    setStaffForm({ email: "", role: "auxiliar", sede: "principal" });
    setEditStaffId(null);
    setShowStaffForm(false);
  };

  const SUPER_TABS: { key: SuperTab; label: string; icon: React.ReactNode }[] = [
    { key: "contenido", label: "Contenido",          icon: <FileText size={14} /> },
    { key: "catalogo",  label: "Catálogo",           icon: <Package size={14} /> },
    { key: "personal",  label: "Personal Operativo", icon: <User size={14} /> },
    { key: "monitor", label: "Monitor Global", icon: <ClipboardList size={14} /> },
    { key: "inventario", label: "Inventario", icon: <SlidersHorizontal size={14} /> },
    { key: "cupones",    label: "Cupones Promocionales", icon: <CreditCard size={14} /> },
  ];

  const inp = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-[#179150] transition-all";
  const lbl = "text-xs font-semibold text-foreground mb-1 block uppercase tracking-wide";

  return (
    <div className="space-y-6">
      {/* ── RF-ADM-09: Gestor de Contenido ── */}
      {superTab === "contenido" && (
        <div className="space-y-6">
          {/* Logo personalizado */}
          <div className="bg-white border border-border rounded-2xl p-6">
            <h3 className="text-xl uppercase text-foreground mb-1" style={H9}>Logotipo de Inicio</h3>
            <p className="text-sm text-muted-foreground mb-4">Carga una imagen JPG/PNG para reemplazar el logo principal de la plataforma.</p>
            <div className="flex items-center gap-6">
              <div className="w-32 h-16 border-2 border-dashed border-border rounded-xl flex items-center justify-center bg-[#f0fdf7] overflow-hidden">
                {logoPreview
                  ? <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                  : <span className="text-xs text-muted-foreground text-center px-2">Vista previa</span>
                }
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) setLogoPreview(URL.createObjectURL(f));
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#50e9f8] text-[#006064] rounded-xl text-sm hover:bg-[#2dd8e8] transition-colors"
                  style={H7}
                >
                  <Upload size={14} />
                  Subir imagen
                </button>
                <p className="text-xs text-muted-foreground mt-2">Formatos: JPG, PNG. Tamaño recomendado: 240×80 px.</p>
              </div>
              {logoPreview && (
                <button
                  onClick={() => { setLogoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50 transition-colors"
                  style={H7}
                >
                  Restaurar original
                </button>
              )}
            </div>
          </div>

          {/* Gestión de Banners del Carrusel */}
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="mb-4">
              <h3 className="text-xl uppercase text-foreground" style={H9}>Banners del Carrusel Principal</h3>
              <p className="text-sm text-muted-foreground">Edita título, gradiente, imagen y texto de cada banner. Los cambios se reflejan en tiempo real.</p>
            </div>
            <div className="space-y-4 mb-4">
              {slides.map((s, i) => (
                <div key={i} className="border border-border rounded-2xl overflow-hidden">
                  {/* Preview */}
                  <div className="relative h-24 overflow-hidden" style={{ background: `linear-gradient(135deg, ${s.from}, ${s.via}, ${s.to})` }}>
                    {s.img && (
                      <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute inset-0 flex items-center px-6 gap-4">
                      <div className="flex-1">
                        <div className="inline-block bg-[#50e9f8] text-[#006064] text-[9px] font-black px-2 py-0.5 rounded-full mb-1 uppercase" style={H9}>{s.badge}</div>
                        <div className="text-white text-xl uppercase leading-tight" style={H9}>{s.title}</div>
                        <div className="text-white/70 text-xs mt-0.5 line-clamp-1">{s.subtitle}</div>
                      </div>
                      <div className="text-xs font-semibold text-white/80 bg-white/10 px-3 py-1 rounded-lg border border-white/20">{s.cta}</div>
                    </div>
                    <span className="absolute top-2 right-2 text-[10px] bg-black/30 text-white px-2 py-0.5 rounded-full font-semibold">Banner {i + 1}</span>
                  </div>
                  {/* Controls */}
                  <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{s.img}</div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditSlide(i)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-xl hover:bg-muted transition-colors">
                        <Settings size={12} />Editar
                      </button>
                      <button onClick={() => removeSlide(i)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors">
                        <Trash2 size={12} />Eliminar
                      </button>
                    </div>
                  </div>
                  {/* Inline edit form */}
                  {slideEditing === i && slideDraft && (
                    <div className="border-t border-border p-5 grid sm:grid-cols-2 gap-4 bg-[#f9fdfe]">
                      {([
                        ["Título", "title"],
                        ["Subtítulo", "subtitle"],
                        ["Badge / Etiqueta", "badge"],
                        ["Texto del botón (CTA)", "cta"],
                        ["URL de destino del botón (CTA)", "ctaLink"],
                      ] as [string, keyof Slide][]).map(([label, key]) => (
                        <div key={key}>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
                          <input value={slideDraft[key] as string}
                            onChange={e => setSlideDraft({ ...slideDraft, [key]: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" />
                        </div>
                      ))}
                      {/* Imagen del banner */}
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Imagen del banner</label>
                        <div className="flex items-center gap-4">
                          {slideDraft.img && (
                            <img src={slideDraft.img} alt="Preview" className="w-24 h-14 object-cover rounded-xl border border-border flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors w-fit text-sm font-semibold">
                              <Upload size={14} /> Subir imagen del banner
                              <input type="file" accept="image/*" className="hidden"
                                onChange={e => {
                                  const f = e.target.files?.[0];
                                  if (f) setSlideDraft({ ...slideDraft, img: URL.createObjectURL(f) });
                                }} />
                            </label>
                            <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG, WEBP. Recomendado: 900×500 px.</p>
                          </div>
                        </div>
                      </div>
                      <div className="sm:col-span-2 flex gap-2 pt-2">
                        <button onClick={saveSlide}
                          className="flex-1 bg-[#179150] text-white py-2.5 rounded-xl text-sm font-black uppercase hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          style={H7}>
                          <Check size={14} />Guardar cambios
                        </button>
                        <button onClick={() => { setSlideEditing(null); setSlideDraft(null); }}
                          className="px-4 border border-border rounded-xl text-sm hover:bg-muted transition-colors">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addNewSlide}
              className="w-full py-3.5 border-2 border-dashed border-[#50e9f8] rounded-2xl text-[#006064] font-black uppercase text-sm hover:bg-[#e0f5eb] transition-colors flex items-center justify-center gap-2"
              style={H7}>
              <Plus size={16} />Agregar nuevo banner
            </button>
          </div>
        </div>
      )}

      {/* ── RF-ADM-10: Gestor de Catálogo ── */}
      {superTab === "catalogo" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div>
              <h3 className="text-xl uppercase text-foreground" style={H9}>Catálogo de Productos</h3>
              <p className="text-sm text-muted-foreground">{catalogProducts.length} productos registrados</p>
            </div>
            <button
              onClick={openNewProd}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors"
              style={H7}
            >
              <Plus size={16} />
              Nuevo Producto
            </button>
          </div>

          {/* Filters + sort */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input className="w-full pl-9 pr-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] transition-all" placeholder="Buscar por nombre o marca…" value={catSearch} onChange={e => setCatSearch(e.target.value)} />
            </div>
            <select className="px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] transition-all" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="Todos">Todas las categorías</option>
              {[...new Set(catalogProducts.map(p => p.category))].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] transition-all" value={catSort} onChange={e => setCatSort(e.target.value as typeof catSort)}>
              <option value="relevancia">Ordenar: Relevancia</option>
              <option value="precio">Ordenar: Precio</option>
              <option value="descuento">Ordenar: Descuento</option>
            </select>
          </div>

          {/* Products table */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f0fdf7] border-b border-border">
                    {["Nombre / Marca", "Categoría", "Forma farmacéutica", "Nivel de control", "Estado", "Relevancia", "Precio", "Descuento", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase text-muted-foreground whitespace-nowrap" style={H9}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCat.map(p => {
                    const enabled = isProdEnabled(p);
                    return (
                      <tr key={p.id} className={`border-b border-border/50 transition-colors ${enabled ? "hover:bg-[#f9fdfe]" : "bg-gray-50/60 opacity-60"}`}>
                        <td className="px-4 py-3">
                          <div className={`font-semibold text-sm ${enabled ? "text-foreground" : "text-muted-foreground"}`}>{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.brand}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground">{p.category}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{p.presentation || "—"}</td>
                        <td className="px-4 py-3">
                          {p.controlledSubstance
                            ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-800" style={H9}>Récipe físico</span>
                            : p.needsRecipe
                            ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700" style={H9}>Récipe digital</span>
                            : <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-500" style={H9}>Ninguno</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${enabled ? "bg-[#e0f5eb] text-[#179150]" : "bg-gray-100 text-gray-500"}`} style={H9}>
                            {enabled ? "Habilitado" : "Inhabilitado"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground">{p.rating.toFixed(1)}</td>
                        <td className="px-4 py-3 text-xs font-black text-[#179150]" style={H9}>{fmtUSD(p.priceUSD)}</td>
                        <td className="px-4 py-3">
                          {p.discount && p.discount > 0
                            ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700" style={H9}>{p.discount}% OFF</span>
                            : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => openEditProd(p)} className="p-1.5 hover:bg-[#50e9f8]/10 rounded-lg text-[#006064] transition-colors" title="Editar producto">
                              <Settings size={14} />
                            </button>
                            <button
                              onClick={() => toggleProdEnabled(p.id)}
                              className={`p-1.5 rounded-lg transition-colors ${enabled ? "hover:bg-amber-50 text-amber-600" : "hover:bg-[#e0f5eb] text-[#179150]"}`}
                              title={enabled ? "Inhabilitar producto" : "Habilitar producto"}
                            >
                              {enabled ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredCat.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">No se encontraron productos.</div>
              )}
            </div>
          </div>

          {/* Product form modal */}
          {showProdForm && (
            <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[200] overflow-y-auto p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl my-4 mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl uppercase text-foreground" style={H9}>{editProd ? "Editar Producto" : "Nuevo Producto"}</h3>
                  <button onClick={() => setShowProdForm(false)} className="p-2 hover:bg-[#f0fdf7] rounded-xl"><X size={18} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div className="sm:col-span-2">
                    <label className={lbl}>Nombre del producto *</label>
                    <input className={inp} value={prodForm.name ?? ""} onChange={e => setProdForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Metformina 500mg" />
                  </div>
                  {/* Marca */}
                  <div>
                    <label className={lbl}>Marca comercial *</label>
                    <input className={inp} value={prodForm.brand ?? ""} onChange={e => setProdForm(f => ({ ...f, brand: e.target.value }))} />
                  </div>
                  {/* Categoría */}
                  <div>
                    <label className={lbl}>Categoría</label>
                    <select className={inp} value={prodForm.category ?? "Diabetes"} onChange={e => setProdForm(f => ({ ...f, category: e.target.value }))}>
                      {CATS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  {/* Principio activo */}
                  <div className="sm:col-span-2">
                    <label className={lbl}>Principio activo</label>
                    <input className={inp} value={prodForm.activeIngredient ?? ""} onChange={e => setProdForm(f => ({ ...f, activeIngredient: e.target.value }))} placeholder="Ej: Clorhidrato de Metformina" />
                  </div>
                  {/* Forma farmacéutica */}
                  <div>
                    <label className={lbl}>Forma farmacéutica</label>
                    <select className={inp} value={prodForm.presentation ?? ""} onChange={e => setProdForm(f => ({ ...f, presentation: e.target.value }))}>
                      <option value="">Seleccionar…</option>
                      {["Tabletas", "Comprimidos", "Cápsulas", "Comprimidos efervescentes", "Solución oral", "Jarabe", "Suspensión", "Inyectable", "Crema", "Gel", "Ungüento", "Parche", "Supositorio", "Gotas"].map(ff => <option key={ff} value={ff}>{ff}</option>)}
                    </select>
                  </div>
                  {/* Concentración */}
                  <div>
                    <label className={lbl}>Concentración</label>
                    <input className={inp} value={prodForm.concentration ?? ""} onChange={e => setProdForm(f => ({ ...f, concentration: e.target.value }))} placeholder="Ej: 500" type="text" />
                  </div>
                  {/* Unidad de concentración */}
                  <div>
                    <label className={lbl}>Unidad de concentración</label>
                    <select className={inp} value={prodForm.concentrationUnit ?? "mg"} onChange={e => setProdForm(f => ({ ...f, concentrationUnit: e.target.value }))}>
                      {["mg", "g", "mcg", "UI", "ml", "%", "mEq", "mmol"].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  {/* Unidades */}
                  <div>
                    <label className={lbl}>Unidades</label>
                    <input className={inp} value={prodForm.packSize ?? ""} onChange={e => setProdForm(f => ({ ...f, packSize: e.target.value }))} placeholder="Ej: 30, 20, 14" type="text" />
                  </div>
                  {/* Descripción */}
                  <div className="sm:col-span-2">
                    <label className={lbl}>Descripción</label>
                    <textarea rows={3} className={`${inp} resize-none`} value={prodForm.description ?? ""} onChange={e => setProdForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  {/* Imagen */}
                  <div className="sm:col-span-2">
                    <label className={lbl}>Imagen del producto</label>
                    <div className="flex items-center gap-4">
                      {prodForm.imageUrl ? (
                        <img src={prodForm.imageUrl} alt="Producto" className="w-20 h-20 object-cover rounded-xl border border-border flex-shrink-0" />
                      ) : (
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center flex-shrink-0 bg-muted/30">
                          <Package size={24} className="text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="flex-1">
                        <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors w-fit">
                          <Upload size={14} />
                          <span className="text-sm font-semibold">Cargar imagen</span>
                          <input type="file" accept="image/*" className="hidden"
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (f) setProdForm(prev => ({ ...prev, imageUrl: URL.createObjectURL(f) }));
                            }} />
                        </label>
                        {prodForm.imageUrl && (
                          <button onClick={() => setProdForm(prev => ({ ...prev, imageUrl: undefined }))} className="mt-2 text-xs text-red-500 hover:underline">Quitar imagen</button>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG, WEBP. Recomendado: 400×400 px.</p>
                      </div>
                    </div>
                  </div>
                  {/* Nivel de control */}
                  <div className="sm:col-span-2">
                    <label className={lbl}>Nivel de control</label>
                    <select className={inp}
                      value={controlLevel(prodForm)}
                      onChange={e => setProdForm(f => ({ ...f, ...applyControlLevel(e.target.value) }))}>
                      <option value="ninguno">Ninguno</option>
                      <option value="digital">Requiere récipe digital</option>
                      <option value="fisico">Requiere récipe en físico</option>
                    </select>
                  </div>
                  {/* Precio */}
                  <div>
                    <label className={lbl}>Precio (USD)</label>
                    <input className={inp} type="number" min={0} step={0.01} value={prodForm.priceUSD ?? 0} onChange={e => setProdForm(f => ({ ...f, priceUSD: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  {/* Descuento */}
                  <div>
                    <label className={lbl}>Descuento (%)</label>
                    <input className={inp} type="number" min={0} max={100} value={prodForm.discount ?? 0} onChange={e => setProdForm(f => ({ ...f, discount: parseInt(e.target.value) || 0 }))} />
                  </div>
                  {/* Relevancia */}
                  <div>
                    <label className={lbl}>Relevancia (1.0 – 5.0)</label>
                    <input className={inp} type="number" min={1} max={5} step={0.1} value={prodForm.rating ?? 5} onChange={e => setProdForm(f => ({ ...f, rating: parseFloat(e.target.value) || 5 }))} />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={saveProd} className="flex-1 py-3 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors" style={H7}>
                    {editProd ? "Guardar cambios" : "Crear producto"}
                  </button>
                  <button onClick={() => setShowProdForm(false)} className="px-6 py-3 border border-border rounded-xl hover:bg-[#f0fdf7] transition-colors" style={H7}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Personal Operativo ── */}
      {superTab === "personal" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl uppercase text-foreground" style={H9}>Personal Operativo</h3>
              <p className="text-sm text-muted-foreground">{staff.length} personas · {staff.filter(s => s.active).length} activas</p>
            </div>
            <button
              onClick={() => { setStaffForm({ email: "", role: "auxiliar", sede: "principal" }); setEditStaffId(null); setStaffFormError(""); setShowStaffForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors"
              style={H7}
            >
              <Plus size={16} />
              Asignar personal operativo
            </button>
          </div>

          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f0fdf7] border-b border-border">
                    {["Nombre completo", "Correo", "Documento de identidad", "Rol", "Sede", "Estado", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase text-muted-foreground whitespace-nowrap" style={H9}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staff.map(s => {
                    const roleBadge = (r: string) => ({
                      superadmin: "bg-[#006064] text-white",
                      auditor:    "bg-amber-100 text-amber-800",
                      auxiliar:   "bg-[#50e9f8]/20 text-[#006064]",
                      repartidor: "bg-purple-100 text-purple-800",
                    }[r] ?? "bg-green-100 text-green-800");
                    const sedeLabel = s.sede === "principal" ? "Sede Principal" : s.sede === "clinica" ? "Clínica Humana" : "Todas las sedes";
                    return (
                      <tr key={s.id} className={`border-b border-border/50 transition-colors ${s.active ? "hover:bg-[#f9fdfe]" : "bg-gray-50/60 opacity-60"}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 ${s.active ? "bg-gradient-to-br from-[#50e9f8] to-[#179150]" : "bg-gray-300"}`} style={H9}>
                              {s.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </div>
                            <span className={`font-semibold text-sm ${s.active ? "text-foreground" : "text-muted-foreground"}`}>{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{s.email}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{s.cedula}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.active ? roleBadge(s.roles[0]) : "bg-gray-100 text-gray-400"}`} style={H9}>{s.roles[0]}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{sedeLabel}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.active ? "bg-[#e0f5eb] text-[#179150]" : "bg-gray-100 text-gray-500"}`} style={H9}>
                            {s.active ? "Habilitado" : "Inhabilitado"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => { setEditStaffId(s.id); setStaffForm({ email: s.email, role: s.roles[0] ?? "auxiliar", sede: s.sede }); setShowStaffForm(true); }}
                              className="p-1.5 hover:bg-[#50e9f8]/10 rounded-lg text-[#006064] transition-colors"
                              title="Editar asignación"
                            >
                              <Settings size={14} />
                            </button>
                            <button
                              onClick={() => toggleStaffEnabled(s.id)}
                              className={`p-1.5 rounded-lg transition-colors ${s.active ? "hover:bg-amber-50 text-amber-600" : "hover:bg-[#e0f5eb] text-[#179150]"}`}
                              title={s.active ? "Inhabilitar" : "Habilitar"}
                            >
                              {s.active ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Staff assignment modal */}
          {showStaffForm && (
            <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl uppercase text-foreground" style={H9}>{editStaffId ? "Editar asignación" : "Asignar personal operativo"}</h3>
                  <button onClick={() => { setShowStaffForm(false); setEditStaffId(null); }} className="p-2 hover:bg-[#f0fdf7] rounded-xl"><X size={18} /></button>
                </div>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  El usuario debe tener una cuenta registrada previamente. Solo se asigna su rol operativo y sede.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className={lbl}>Correo electrónico del usuario *</label>
                    <input type="email" className={inp} value={staffForm.email} onChange={e => setStaffForm(f => ({ ...f, email: e.target.value }))} placeholder="usuario@fhec.com" disabled={editStaffId !== null} />
                    {editStaffId !== null && <p className="text-[10px] text-muted-foreground mt-1">El correo no puede modificarse.</p>}
                  </div>
                  <div>
                    <label className={lbl}>Rol operativo *</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {ROLE_OPTIONS.map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setStaffForm(f => ({ ...f, role }))}
                          className={`px-3 py-2.5 rounded-xl border-2 text-sm font-black uppercase text-left transition-all ${staffForm.role === role ? "border-[#179150] bg-[#e0f5eb] text-[#006064]" : "border-border text-muted-foreground hover:border-[#179150]/50"}`}
                          style={H9}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Sede asignada</label>
                    <select className={inp} value={staffForm.sede} onChange={e => setStaffForm(f => ({ ...f, sede: e.target.value }))}>
                      <option value="principal">Sede Principal</option>
                      <option value="clinica">Clínica Humana</option>
                      <option value="Todas">Todas las sedes</option>
                    </select>
                  </div>
                  {staffFormError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
                      <AlertTriangle size={14} />{staffFormError}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={saveStaff} className="flex-1 py-3 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors font-black uppercase" style={H7}>
                    {editStaffId ? "Guardar cambios" : "Asignar"}
                  </button>
                  <button onClick={() => { setShowStaffForm(false); setEditStaffId(null); }} className="px-6 py-3 border border-border rounded-xl hover:bg-[#f0fdf7] transition-colors" style={H7}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RF-ADM-12: Monitor Global ── */}
      {superTab === "monitor" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl uppercase text-foreground" style={H9}>Monitor Global</h3>
            <p className="text-sm text-muted-foreground">Historial completo de transacciones con trazabilidad de auditoría.</p>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {kpiData.map(k => (
              <div key={k.label} className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${k.color} flex items-center justify-center text-white text-xl font-black flex-shrink-0`} style={H9}>
                  {k.count}
                </div>
                <div className="text-xs font-semibold text-muted-foreground leading-tight">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 bg-white border border-border rounded-2xl p-4">
            <div>
              <label className={`${lbl} mb-0.5`}>Desde</label>
              <input type="date" className={inp} value={monitorDateFrom} onChange={e => setMonitorDateFrom(e.target.value)} />
            </div>
            <div>
              <label className={`${lbl} mb-0.5`}>Hasta</label>
              <input type="date" className={inp} value={monitorDateTo} onChange={e => setMonitorDateTo(e.target.value)} />
            </div>
            <div>
              <label className={`${lbl} mb-0.5`}>Estado</label>
              <select className={inp} value={monitorStatus} onChange={e => setMonitorStatus(e.target.value)}>
                <option value="Todos">Todos los estados</option>
                {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={`${lbl} mb-0.5`}>Sede</label>
              <select className={inp} value={monitorSede} onChange={e => setMonitorSede(e.target.value)}>
                <option value="Todas">Todas las sedes</option>
                {[...new Set(monitorOrders.map(o => o.sede))].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Master table */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f0fdf7] border-b border-border">
                    {["# Pedido", "Fecha", "Cliente", "Sede", "Total", "Costo envío", "Ref. Pago", "Estado", "Aprobó", "Preparó", "Despachó"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase text-muted-foreground whitespace-nowrap" style={H9}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMonitor.map(o => (
                    <tr key={o.id} className="border-b border-border/50 hover:bg-[#f9fdfe] transition-colors">
                      <td className="px-4 py-3 text-sm font-black text-[#006064] whitespace-nowrap" style={H9}>{o.id}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{o.date}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{o.client}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{o.sede}</td>
                      <td className="px-4 py-3 text-sm font-black text-[#179150]" style={H9}>{fmtUSD(o.total)}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-foreground">
                        {o.shippingCost > 0 ? fmtUSD(o.shippingCost) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {(o as any).payRef
                          ? <span className="font-mono text-[#006064] font-semibold">{(o as any).payRef}</span>
                          : <span className="text-muted-foreground/50">—</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-600"}`} style={H9}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{o.approvedBy}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{o.preparedBy}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{o.dispatchedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredMonitor.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">No hay pedidos que coincidan con los filtros.</div>
              )}
            </div>
            <div className="px-6 py-5 border-t border-border bg-[#f0fdf7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground font-semibold">
                {filteredMonitor.length} de {monitorOrders.length} transacciones
              </div>
              <div className="flex gap-8">
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Total ventas filtrado</div>
                  <div className="text-3xl font-black text-[#179150] leading-none" style={H9}>
                    {fmtUSD(filteredMonitor.reduce((sum, o) => sum + o.total, 0))}
                  </div>
                </div>
                <div className="text-right border-l border-border pl-8">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Total costo de envío filtrado</div>
                  <div className="text-3xl font-black text-[#006064] leading-none" style={H9}>
                    {fmtUSD(filteredMonitor.reduce((sum, o) => sum + (o.shippingCost ?? 0), 0))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {superTab === "inventario" && (
        <InventarioTab products={catalogProducts} setCatalogProducts={setCatalogProducts} />
      )}

      {/* ── Cupones Promocionales ── */}
      {superTab === "cupones" && (
        <div className="space-y-4">
          {/* Header + button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl uppercase text-foreground" style={H9}>Cupones Promocionales</h3>
              <p className="text-sm text-muted-foreground">{coupons.length} cupón{coupons.length !== 1 ? "es" : ""} registrado{coupons.length !== 1 ? "s" : ""}</p>
            </div>
            <button onClick={openNewCoupon} className="flex items-center gap-2 px-5 py-2.5 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors" style={H7}>
              <Plus size={16} /> Añadir cupón
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            {([ ["all","Todos"], ["general","Generales"], ["user","Asignados a usuario"] ] as const).map(([val, label]) => (
              <button key={val} onClick={() => setCouponFilter(val)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${couponFilter === val ? "bg-[#179150] text-white" : "bg-white border border-border text-muted-foreground hover:border-[#179150]/50"}`}
                style={H9}>
                {label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f0fdf7] border-b border-border">
                    {["Código del cupón", "Descuento", "Usuario", "Fecha de inicio", "Fecha de fin", "Estado", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase text-muted-foreground whitespace-nowrap" style={H9}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((c, i) => {
                    const today = new Date().toISOString().split("T")[0];
                    const vigente = !c.endDate || c.endDate >= today;
                    return (
                      <tr key={c.id} className={`border-b border-border/50 hover:bg-[#f9fdfe] transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-black text-[#006064] bg-[#e0f5eb] px-2.5 py-1 rounded-lg tracking-widest" style={H9}>{c.code}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-red-100 text-red-700 whitespace-nowrap" style={H9}>{c.discount}% OFF</span>
                        </td>
                        <td className="px-4 py-3">
                          {c.userEmail
                            ? <span className="text-xs text-[#006064] font-semibold">{c.userEmail}</span>
                            : <span className="text-xs text-muted-foreground italic">General</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{c.startDate || "—"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{c.endDate || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${vigente ? "bg-[#e0f5eb] text-[#179150]" : "bg-gray-100 text-gray-500"}`} style={H9}>
                            {vigente ? "Vigente" : "Vencido"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => openEditCoupon(c)} className="p-1.5 hover:bg-[#50e9f8]/10 rounded-lg text-[#006064] transition-colors" title="Editar cupón">
                            <Settings size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCoupons.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">No hay cupones con este filtro.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Coupon form modal */}
          {showCouponForm && (
            <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl uppercase text-foreground" style={H9}>{editCouponId ? "Editar cupón" : "Nuevo cupón"}</h3>
                  <button onClick={() => setShowCouponForm(false)} className="p-2 hover:bg-[#f0fdf7] rounded-xl"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  {/* Código */}
                  <div>
                    <label className={lbl}>Código del cupón *</label>
                    <input
                      className={`${inp} uppercase font-mono tracking-widest ${couponError ? "border-red-400 focus:border-red-500" : ""}`}
                      value={couponForm.code}
                      onChange={e => { setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() })); setCouponError(""); }}
                      placeholder="Ej: FARMA10"
                    />
                    {couponError && (
                      <div className="flex items-center gap-1.5 mt-2 text-red-600 text-xs font-semibold">
                        <AlertTriangle size={12} /> {couponError}
                      </div>
                    )}
                  </div>
                  {/* Descuento */}
                  <div>
                    <label className={lbl}>Descuento aplicado (%)</label>
                    <input type="number" min={1} max={100} className={inp} value={couponForm.discount} onChange={e => setCouponForm(f => ({ ...f, discount: parseInt(e.target.value) || 0 }))} placeholder="Ej: 10" />
                  </div>
                  {/* Fechas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Fecha de inicio</label>
                      <input type="date" className={inp} value={couponForm.startDate} onChange={e => setCouponForm(f => ({ ...f, startDate: e.target.value }))} />
                    </div>
                    <div>
                      <label className={lbl}>Fecha de fin</label>
                      <input type="date" className={inp} value={couponForm.endDate} onChange={e => setCouponForm(f => ({ ...f, endDate: e.target.value }))} />
                    </div>
                  </div>
                  {/* Usuario (opcional) */}
                  <div>
                    <label className={lbl}>Correo del usuario <span className="text-muted-foreground normal-case font-normal">(opcional — dejar vacío para cupón general)</span></label>
                    <input
                      type="email"
                      className={inp}
                      value={couponForm.userEmail}
                      onChange={e => setCouponForm(f => ({ ...f, userEmail: e.target.value }))}
                      placeholder="usuario@correo.com"
                    />
                    {couponForm.userEmail.trim()
                      ? <p className="text-xs text-[#179150] mt-1 font-semibold">Cupón exclusivo para: {couponForm.userEmail.trim()}</p>
                      : <p className="text-xs text-muted-foreground mt-1">Sin usuario asignado — será un cupón general.</p>}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Para dejar de usar un cupón, edita su fecha de fin a una fecha pasada.
                  </p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={saveCoupon} disabled={!couponForm.code.trim()}
                    className={`flex-1 py-3 rounded-xl transition-colors font-black uppercase ${couponForm.code.trim() ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                    style={H7}>
                    {editCouponId ? "Guardar cambios" : "Crear cupón"}
                  </button>
                  <button onClick={() => setShowCouponForm(false)} className="px-6 py-3 border border-border rounded-xl hover:bg-[#f0fdf7] transition-colors" style={H7}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AdminPanel ───────────────────────────────────────────────────────────────
// Demo data for admin panel
const DEMO_RECIPES = getLegacyRecipeAuditViewModels();

const DEMO_ADMIN_ORDERS = getLegacyAdminOrderViewModels();

export function AdminPanel({ user, onNav, products, setProducts, slides, setSlides }: {
  user: AuthUser;
  onNav: (p: Page) => void;
  products: Product[];
  setProducts: (p: Product[]) => void;
  slides: Slide[];
  setSlides: (s: Slide[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<"auditor" | "auxiliar" | "contenido" | "catalogo" | "personal" | "monitor" | "inventario" | "cupones" | "reembolsos">("auditor");

  // Auditor state
  const [recipes, setRecipes] = useState(DEMO_RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState<typeof DEMO_RECIPES[0] | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Set<string>>(new Set());
  const [rejectComment, setRejectComment] = useState("");

  // Resolve user's assigned sede
  const USER_SEDE_MAP: Record<string, string> = {
    "auxiliar@fhec.com": "principal",
    "repartidor@fhec.com": "principal",
    "auditor@fhec.com": "clinica",
    "admin@fhec.com": "Todas",
  };
  const userAssignedSede = USER_SEDE_MAP[user.email] ?? "Todas";
  const userHasAllSedes = userAssignedSede === "Todas";

  // Auxiliar state
  const [orders, setOrders] = useState(DEMO_ADMIN_ORDERS);
  const [sedeFilter, setSedeFilter] = useState(userHasAllSedes ? "todas" : userAssignedSede.toLowerCase());
  const [searchOrder, setSearchOrder] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<typeof DEMO_ADMIN_ORDERS[0] | null>(null);
  const [pinInput, setPinInput] = useState("");

  // Superadmin - Reembolsos
  const DEMO_REFUNDS = getLegacyAdminRefundViewModels();
  const [refunds, setRefunds] = useState(DEMO_REFUNDS);
  const [selectedRefund, setSelectedRefund] = useState<typeof DEMO_REFUNDS[0] | null>(null);

  // Superadmin - Product Management
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState(false);

  // Superadmin - Staff Management
  const [staff, setStaff] = useState([
    { id: 1, name: "Ana Torres", email: "auxiliar@fhec.com", roles: ["auxiliar"], active: true, cedula: "V-11223344" },
    { id: 2, name: "José Ramos", email: "repartidor@fhec.com", roles: ["repartidor"], active: true, cedula: "V-87654321" },
    { id: 3, name: "Luis Medina", email: "admin@fhec.com", roles: ["superadmin", "auditor", "auxiliar"], active: true, cedula: "V-55667788" },
  ]);
  const [newStaffModal, setNewStaffModal] = useState(false);

  // Determine available tabs based on role
  const isSuperadmin = user.role === "superadmin";
  const isAuditor   = user.role === "auditor";
  const isAuxiliar  = user.role === "auxiliar";

  // Auto-select first available tab
  React.useEffect(() => {
    if (isSuperadmin) setActiveTab("contenido");
    else if (isAuditor) setActiveTab("auditor");
    else if (isAuxiliar) setActiveTab("auxiliar");
  }, [isAuditor, isAuxiliar, isSuperadmin]);

  const handleApproveRecipe = (recipeId: number) => {
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, status: "approved" as const } : r));
    setSelectedRecipe(null);
    toast.success("Récipe aprobado", { description: "El cliente ha sido notificado para proceder al pago.", icon: "✅" });
  };

  const handleRejectRecipe = () => {
    if (!selectedRecipe || rejectReasons.size === 0) return;
    const reasons = Array.from(rejectReasons).join(", ");
    const fullReason = rejectComment ? `${reasons}. Nota: ${rejectComment}` : reasons;
    toast.error("Récipe rechazado", { description: `Motivo: ${fullReason}`, icon: "❌" });
    setRecipes(prev => prev.map(r => r.id === selectedRecipe.id ? { ...r, status: "rejected" as const } : r));
    setSelectedRecipe(null);
    setRejectReasons(new Set());
    setRejectComment("");
  };

  const toggleRejectReason = (reason: string) => {
    setRejectReasons(prev => {
      const next = new Set(prev);
      if (next.has(reason)) next.delete(reason);
      else next.add(reason);
      return next;
    });
  };

  const confirmarEmpacado = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const newStatus = o.deliveryAddress ? "Listo para delivery" : "Por retirar";
        return { ...o, status: newStatus };
      }
      return o;
    }));
    setSelectedOrder(null);
    toast.success("Empacado confirmado", { description: "El pedido fue actualizado al siguiente estado.", icon: "📦" });
  };

  const despacharPedido = () => {
    if (!selectedOrder) return;
    if (pinInput !== "1234") {
      toast.error("PIN incorrecto", { description: "El PIN correcto en modo demo es 1234.", icon: "🔐" });
      return;
    }
    toast.success(`Pedido ${selectedOrder.id} despachado`, { description: "El pedido fue entregado al repartidor.", icon: "🛵" });
    setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
    setSelectedOrder(null);
    setPinInput("");
  };

  const filteredOrders = orders.filter(o => {
    const matchesSede = sedeFilter === "todas" || o.sede === sedeFilter;
    const matchesSearch = o.id.toLowerCase().includes(searchOrder.toLowerCase()) ||
                          o.clientName.toLowerCase().includes(searchOrder.toLowerCase());
    return matchesSede && matchesSearch;
  });

  const ordersByStatus = {
    porPreparar: orders.filter(o => o.status === "Por preparar").length,
    porRetirar: orders.filter(o => o.status === "Por retirar").length,
    listoDelivery: orders.filter(o => o.status === "Listo para delivery").length,
  };

  return (
    <div className="min-h-screen bg-[#f0fdf7]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-[#006064] to-[#1a3060] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-white text-3xl uppercase leading-none" style={H9}>Panel de Administración</h1>
              <p className="text-white/70 text-sm mt-1">Sistema de gestión farmacéutica · {user.name}</p>
            </div>
          </div>

          {/* Tabs — flat: Auditoría, Operaciones, + superadmin subtabs */}
          <div className="flex flex-wrap gap-2">
            {([
              ...(isAuditor  ? [{ key: "auditor",   label: "Auditoría",           icon: <Shield size={14} /> }] : []),
              ...(isAuxiliar ? [{ key: "auxiliar",  label: "Operaciones",          icon: <Package size={14} /> }] : []),
              ...(isSuperadmin ? [
                { key: "contenido",  label: "Contenido",          icon: <FileText size={14} /> },
                { key: "catalogo",   label: "Catálogo",           icon: <Package size={14} /> },
                { key: "inventario", label: "Inventario",         icon: <SlidersHorizontal size={14} /> },
                { key: "personal",   label: "Personal Operativo", icon: <User size={14} /> },
                { key: "monitor",    label: "Monitor Global",     icon: <ClipboardList size={14} /> },
                { key: "cupones",    label: "Cupones",            icon: <CreditCard size={14} /> },
                { key: "reembolsos", label: "Reembolsos",         icon: <CreditCard size={14} /> },
              ] : []),
            ] as { key: typeof activeTab; label: string; icon: React.ReactNode }[]).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black uppercase transition-all ${
                  activeTab === t.key ? "bg-white text-[#006064]" : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                style={H7}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* AUDITOR MODULE */}
        {activeTab === "auditor" && isAuditor && (
          <div className="space-y-6">
            {/* Recipe detail modal */}
            {selectedRecipe && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 500, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  {/* Modal header */}
                  <div className="sticky top-0 bg-gradient-to-r from-[#006064] to-[#1a3060] px-6 py-5 border-b border-white/10 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl uppercase text-white" style={H9}>{selectedRecipe.orderId}</h3>
                        <p className="text-white/70 text-sm">{selectedRecipe.clientName} · Subido: {selectedRecipe.uploadDate}</p>
                      </div>
                      <button onClick={() => setSelectedRecipe(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* 2-col layout: data left, image right */}
                  <div className="p-6 grid lg:grid-cols-5 gap-6">
                    {/* LEFT — datos y acciones */}
                    <div className="lg:col-span-3 space-y-4">
                      {/* Estado */}
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase ${
                          selectedRecipe.status === "approved" ? "bg-[#179150] text-white" :
                          selectedRecipe.status === "rejected" ? "bg-red-500 text-white" :
                          "bg-amber-100 text-amber-800"}`} style={H9}>
                          {selectedRecipe.status === "approved" ? "Aprobado" : selectedRecipe.status === "rejected" ? "Rechazado" : "Pendiente"}
                        </span>
                        <span className="text-xs text-muted-foreground">{selectedRecipe.product}</span>
                      </div>

                      {/* Datos del medicamento */}
                      <div className="bg-[#f0fdf7] border border-[#a7f3d0] rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-[#179150] text-white text-xs font-black flex items-center justify-center" style={H9}>Rx</div>
                          <h4 className="text-sm uppercase text-[#006064] font-black" style={H9}>Datos del medicamento y pedido</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            ["Nº de pedido",           selectedRecipe.orderId],
                            ["Producto",               selectedRecipe.product],
                            ["Principio activo",       selectedRecipe.activeIngredient],
                            ["Concentración",          `${selectedRecipe.concentration} ${selectedRecipe.concentrationUnit}`],
                            ["Unidades por paquete",   `${selectedRecipe.packSize} unidades`],
                            ["Cantidad solicitada",    `${selectedRecipe.quantity} ${selectedRecipe.quantity === 1 ? "unidad" : "unidades"}`],
                          ].map(([label, value]) => (
                            <div key={label}>
                              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">{label}</div>
                              <div className="text-xs font-semibold text-foreground">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Acciones */}
                      {selectedRecipe.status === "pending" && (
                        <div className="space-y-3">
                          <button
                            onClick={() => handleApproveRecipe(selectedRecipe.id)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors font-black uppercase text-sm"
                            style={H7}
                          >
                            <CheckCircle size={15} /> Aprobar récipe
                          </button>
                          <details className="group">
                            <summary className="cursor-pointer list-none">
                              <div className="flex items-center justify-center gap-2 py-2.5 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-black uppercase text-sm" style={H7}>
                                <X size={15} /> Rechazar récipe
                                <ChevronDown size={13} className="group-open:rotate-180 transition-transform" />
                              </div>
                            </summary>
                            <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
                              <div className="text-xs font-black uppercase text-red-800" style={H9}>Motivos de rechazo</div>
                              {["Falta sello del médico", "No está en vigencia", "Datos borrosos o ilegibles", "Récipe incompleto", "Firma no visible"].map(reason => (
                                <label key={reason} className="flex items-start gap-2 cursor-pointer">
                                  <div onClick={() => toggleRejectReason(reason)}
                                    className={`w-4 h-4 mt-0.5 rounded flex-shrink-0 border-2 transition-all flex items-center justify-center cursor-pointer
                                      ${rejectReasons.has(reason) ? "bg-red-600 border-red-600" : "border-red-300 bg-white hover:border-red-600"}`}>
                                    {rejectReasons.has(reason) && <Check size={10} className="text-white" />}
                                  </div>
                                  <span className="text-xs text-red-800">{reason}</span>
                                </label>
                              ))}
                              <div>
                                <label className="text-xs font-semibold text-red-800 uppercase tracking-wider mb-1 block">Comentario (opcional)</label>
                                <textarea value={rejectComment} onChange={e => setRejectComment(e.target.value)}
                                  placeholder="Ej: El sello médico está cortado..." rows={2}
                                  className="w-full px-3 py-2 border border-red-200 rounded-xl text-xs focus:outline-none focus:border-red-400 bg-white resize-none" />
                              </div>
                              <button onClick={handleRejectRecipe} disabled={rejectReasons.size === 0}
                                className={`w-full py-2 rounded-xl text-xs font-black uppercase transition-colors ${rejectReasons.size > 0 ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                                style={H7}>
                                Confirmar rechazo
                              </button>
                            </div>
                          </details>
                        </div>
                      )}
                    </div>

                    {/* RIGHT — imagen / botones */}
                    <div className="lg:col-span-2 flex flex-col gap-3">
                      <div className="text-xs font-black uppercase text-muted-foreground" style={H9}>Récipe adjunto</div>
                      <div className="bg-gray-50 border border-border rounded-xl overflow-hidden">
                        <img src={selectedRecipe.imageUrl} alt="Récipe" className="w-full h-auto max-h-56 object-contain" />
                      </div>
                      <a href={selectedRecipe.imageUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-2 bg-[#50e9f8] text-[#006064] rounded-xl text-xs font-black uppercase hover:bg-[#2dd8e8] transition-colors"
                        style={H7}>
                        <Eye size={13} /> Ver imagen completa
                      </a>
                      <a href={selectedRecipe.imageUrl} download
                        className="flex items-center justify-center gap-2 py-2 border border-border text-muted-foreground rounded-xl text-xs font-semibold hover:bg-muted transition-colors">
                        <Copy size={13} /> Descargar imagen
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-xl uppercase text-foreground" style={H9}>Auditoría de Récipes</h2>
                  <p className="text-sm text-muted-foreground">{recipes.filter(r => r.status === "pending").length} pendiente{recipes.filter(r => r.status === "pending").length !== 1 ? "s" : ""} · {recipes.length} total</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {["Nº Orden", "Producto", "Cantidad", "Estado", "Acción"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground" style={H9}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recipes.map((recipe, i) => (
                      <tr key={recipe.id} className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                        <td className="px-4 py-3.5 text-[#179150] font-black text-xs" style={H9}>{recipe.orderId}</td>
                        <td className="px-4 py-3.5">
                          <div className="text-xs font-semibold text-foreground">{recipe.product}</div>
                          <div className="text-[10px] text-muted-foreground">{recipe.clientName}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">{recipe.quantity} {recipe.quantity === 1 ? "unidad" : "unidades"}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            recipe.status === "approved" ? "bg-[#179150] text-white" :
                            recipe.status === "rejected" ? "bg-red-500 text-white" :
                            "bg-amber-100 text-amber-800"}`} style={H9}>
                            {recipe.status === "approved" ? "Aprobado" : recipe.status === "rejected" ? "Rechazado" : "Pendiente"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => { setSelectedRecipe(recipe); setRejectReasons(new Set()); setRejectComment(""); }}
                            className="text-[#179150] text-xs font-semibold hover:underline"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                    {recipes.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No hay récipes registrados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AUXILIAR MODULE */}
        {activeTab === "auxiliar" && isAuxiliar && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock size={20} className="text-amber-600" />
                  </div>
                  <div className="text-xs font-black uppercase text-muted-foreground tracking-wider" style={H9}>Por Preparar</div>
                </div>
                <div className="text-4xl font-black text-amber-600" style={H9}>{ordersByStatus.porPreparar}</div>
              </div>

              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Store size={20} className="text-blue-600" />
                  </div>
                  <div className="text-xs font-black uppercase text-muted-foreground tracking-wider" style={H9}>Por Retirar</div>
                </div>
                <div className="text-4xl font-black text-blue-600" style={H9}>{ordersByStatus.porRetirar}</div>
              </div>

              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Truck size={20} className="text-[#179150]" />
                  </div>
                  <div className="text-xs font-black uppercase text-muted-foreground tracking-wider" style={H9}>Listo Delivery</div>
                </div>
                <div className="text-4xl font-black text-[#179150]" style={H9}>{ordersByStatus.listoDelivery}</div>
              </div>
            </div>

            {/* Orders list */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border">
                <h2 className="text-xl uppercase text-foreground mb-4" style={H9}>Gestión de Pedidos</h2>

                {/* Filters */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={searchOrder}
                      onChange={e => setSearchOrder(e.target.value)}
                      placeholder="Buscar por orden o cliente..."
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]"
                    />
                  </div>

                  {userHasAllSedes ? (
                  <select
                    value={sedeFilter}
                    onChange={e => setSedeFilter(e.target.value)}
                    className="px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white"
                  >
                    <option value="todas">Todas las sedes</option>
                    <option value="principal">Principal</option>
                    <option value="clinica">Clínica Humana</option>
                  </select>
                  ) : (
                    <div className="flex items-center gap-2 bg-[#e0f5eb] border border-[#a7f3d0] rounded-xl px-4 py-2.5">
                      <MapPin size={14} className="text-[#179150] flex-shrink-0" />
                      <span className="text-sm font-semibold text-[#006064]">
                        Sede asignada: {userAssignedSede === "principal" ? "Principal" : "Clínica Humana"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {["Orden", "Cliente", "Sede", "Estado", "Items", "Total", "Método Pago", "Acción"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground" style={H9}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, i) => (
                      <tr key={order.id} className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="px-4 py-3.5 text-[#179150] font-black text-xs" style={H9}>{order.id}</td>
                        <td className="px-4 py-3.5 text-foreground text-xs font-semibold">{order.clientName}</td>
                        <td className="px-4 py-3.5 text-muted-foreground text-xs capitalize">{order.sede}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            order.status === "Por preparar" ? "bg-amber-100 text-amber-800" :
                            order.status === "Por retirar" ? "bg-blue-100 text-blue-800" :
                            "bg-green-100 text-[#179150]"
                          }`} style={H9}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground text-xs">{order.items}</td>
                        <td className="px-4 py-3.5 text-foreground text-xs font-semibold">${order.total.toFixed(2)}</td>
                        <td className="px-4 py-3.5 text-muted-foreground text-xs">{order.paymentMethod}</td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-[#179150] text-xs font-semibold hover:underline"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="sticky top-0 bg-gradient-to-r from-[#006064] to-[#1a3060] px-6 py-5 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl uppercase text-white" style={H9}>{selectedOrder.id}</h3>
                        <p className="text-white/70 text-sm">{selectedOrder.clientName} · {selectedOrder.createdAt}</p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Order info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Estado</div>
                        <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-black uppercase ${
                          selectedOrder.status === "Por preparar" ? "bg-amber-100 text-amber-800" :
                          selectedOrder.status === "Por retirar" ? "bg-blue-100 text-blue-800" :
                          "bg-green-100 text-[#179150]"
                        }`} style={H9}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Sede</div>
                        <div className="text-sm font-black text-foreground capitalize" style={H9}>{selectedOrder.sede}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Total</div>
                        <div className="text-lg font-black text-[#179150]" style={H9}>${selectedOrder.total.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Método de Pago</div>
                        <div className="text-sm font-semibold text-foreground">{selectedOrder.paymentMethod}</div>
                      </div>
                    </div>

                    {/* Purchase Request (Packing List) */}
                    <div className="bg-[#f8fafc] border border-border rounded-xl p-4">
                      <div className="text-xs font-black uppercase text-muted-foreground mb-3 tracking-wider" style={H9}>Lista de Empacado</div>
                      <div className="space-y-2">
                        {selectedOrder.products.map((prod, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#179150]" />
                            {prod}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Controlled substance alert */}
                    {selectedOrder.controlled && (
                      <div className="bg-red-600 text-white p-6 rounded-xl border-4 border-red-700">
                        <div className="flex items-center gap-3 mb-3">
                          <Shield size={32} />
                          <div className="text-2xl font-black uppercase" style={H9}>¡ATENCIÓN!</div>
                        </div>
                        <p className="text-lg font-bold leading-tight">
                          EXIJA Y RETENGA EL RÉCIPE FÍSICO ORIGINAL
                        </p>
                        <p className="text-sm mt-2 text-red-100">
                          Este pedido contiene psicotrópicos controlados. NO DESPACHE sin verificar el récipe original.
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {selectedOrder.status === "Por preparar" && (
                      <button
                        onClick={() => confirmarEmpacado(selectedOrder.id)}
                        className="w-full py-3 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        style={H7}
                      >
                        <CheckCircle size={16} />
                        Confirmar Empacado
                      </button>
                    )}

                    {selectedOrder.status === "Listo para delivery" && (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 bg-[#e3f2fd] border border-[#90caf9] rounded-xl px-4 py-3">
                          <Bike size={18} className="text-[#006064] flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-[#006064] leading-relaxed">
                            El pedido está listo. Al confirmar, se registra la entrega del paquete preparado al repartidor. El PIN se solicitará después, al momento de la entrega al cliente.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            toast.success(`Pedido ${selectedOrder.id} entregado al repartidor`, { description: "El repartidor recibió el pedido para su despacho.", icon: "🛵" });
                            setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
                            setSelectedOrder(null);
                          }}
                          className="w-full py-3 bg-[#50e9f8] text-[#006064] rounded-xl hover:bg-[#2dd8e8] transition-colors flex items-center justify-center gap-2 font-black uppercase"
                          style={H7}
                        >
                          <Truck size={16} />
                          Confirmar entrega al repartidor
                        </button>
                      </div>
                    )}

                    {selectedOrder.status === "Por retirar" && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                            PIN del Cliente (4 dígitos)
                          </label>
                          <input
                            type="text"
                            value={pinInput}
                            onChange={e => setPinInput(e.target.value.slice(0, 4))}
                            placeholder="1234"
                            maxLength={4}
                            className="w-full px-4 py-3 border-2 border-border rounded-xl text-center text-2xl font-black tracking-widest focus:outline-none focus:border-[#179150]"
                            style={H9}
                          />
                          <p className="text-xs text-muted-foreground mt-2">Demo: El PIN correcto es <strong>1234</strong></p>
                        </div>
                        <button
                          onClick={despacharPedido}
                          disabled={pinInput.length !== 4}
                          className={`w-full py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                            pinInput.length === 4
                              ? "bg-[#50e9f8] text-[#006064] hover:bg-[#2dd8e8]"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                          style={H7}
                        >
                          <Truck size={16} />
                          Despachar Pedido
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REEMBOLSOS — superadmin only */}
        {activeTab === "reembolsos" && isSuperadmin && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-xl uppercase text-foreground" style={H9}>Solicitudes de Reembolso</h2>
                  <p className="text-sm text-muted-foreground">{refunds.filter(r => r.status === "Pendiente").length} pendiente{refunds.filter(r => r.status === "Pendiente").length !== 1 ? "s" : ""} de {refunds.length} totales</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {["Método reportado", "Banco emisor", "Referencia bancaria", "Monto", "Estado", ""].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground" style={H9}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {refunds.map((r, i) => (
                      <tr key={r.id} className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                        <td className="px-4 py-3.5 text-foreground text-xs font-semibold">{r.method}</td>
                        <td className="px-4 py-3.5 text-muted-foreground text-xs">{r.bank}</td>
                        <td className="px-4 py-3.5 text-[#179150] font-black text-xs" style={H9}>{r.reference}</td>
                        <td className="px-4 py-3.5 text-foreground text-xs font-semibold">{r.amount}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${r.status === "Realizada" ? "bg-[#179150] text-white" : "bg-amber-100 text-amber-800"}`} style={H9}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => setSelectedRefund(r)} className="text-[#179150] text-xs font-semibold hover:underline">
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Refund Detail Modal */}
            {selectedRefund && (
              <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  {/* Modal header — same gradient as operaciones */}
                  <div className="sticky top-0 bg-gradient-to-r from-[#006064] to-[#1a3060] px-6 py-5 border-b border-white/10 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl uppercase text-white" style={H9}>Solicitud {selectedRefund.id}</h3>
                        <p className="text-white/70 text-sm">Detalle del reembolso solicitado · {selectedRefund.date}</p>
                      </div>
                      <button onClick={() => setSelectedRefund(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Estado badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase ${selectedRefund.status === "Realizada" ? "bg-[#179150] text-white" : "bg-amber-100 text-amber-800"}`} style={H9}>
                        {selectedRefund.status}
                      </span>
                      <span className="text-xs text-muted-foreground">Ref. {selectedRefund.reference}</span>
                    </div>

                    {/* Bloque 1: Datos de la transacción reportada */}
                    <div className="bg-[#f0fdf7] border border-[#a7f3d0] rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-[#179150] text-white text-xs font-black flex items-center justify-center" style={H9}>1</div>
                        <h4 className="text-sm uppercase text-[#006064] font-black" style={H9}>Datos de la transacción reportada</h4>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(selectedRefund.method === "Pago Móvil"
                          ? [
                              ["Método de pago",      selectedRefund.method],
                              ["Banco emisor",         selectedRefund.bank],
                              ["Código de área",       selectedRefund.areaCode],
                              ["Número telefónico",    selectedRefund.phone],
                              ["Monto",                selectedRefund.amount],
                              ["Referencia bancaria",  selectedRefund.reference],
                              ["Fecha",                selectedRefund.date],
                            ]
                          : [
                              ["Método de pago",      selectedRefund.method],
                              ["Banco emisor",         selectedRefund.bank],
                              ["Monto",                selectedRefund.amount],
                              ["Referencia bancaria",  selectedRefund.reference],
                              ["Fecha",                selectedRefund.date],
                            ]
                        ).map(([label, value]) => (
                          <div key={label}>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">{label}</div>
                            <div className="text-sm font-semibold text-foreground">{value || "—"}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bloque 2: Datos bancarios para el reembolso */}
                    <div className="bg-[#e3f2fd] border border-[#90caf9] rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-[#006064] text-white text-xs font-black flex items-center justify-center" style={H9}>2</div>
                        <h4 className="text-sm uppercase text-[#006064] font-black" style={H9}>Datos bancarios para el reembolso</h4>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(selectedRefund.refundMethod === "Pago Móvil"
                          ? [
                              ["Método de reembolso",  selectedRefund.refundMethod],
                              ["Banco",                selectedRefund.refundBank],
                              ["Código de área",       selectedRefund.refundAreaCode],
                              ["Número telefónico",    selectedRefund.refundPhone],
                              ["Tipo de documento",    selectedRefund.refundDocType],
                              ["N° de documento",      selectedRefund.refundDoc],
                            ]
                          : [
                              ["Método de reembolso",  selectedRefund.refundMethod],
                              ["Banco",                selectedRefund.refundBank],
                              ["Número de cuenta",     selectedRefund.account],
                              ["Tipo de documento",    selectedRefund.refundDocType],
                              ["N° de documento",      selectedRefund.refundDoc],
                              ["Nombre del beneficiario", selectedRefund.holder],
                            ]
                        ).map(([label, value]) => (
                          <div key={label}>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">{label}</div>
                            <div className="text-sm font-semibold text-foreground">{value || "—"}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Confirmar reembolso */}
                    {selectedRefund.status === "Pendiente" ? (
                      <button
                        onClick={() => {
                          setRefunds(prev => prev.map(r => r.id === selectedRefund.id ? { ...r, status: "Realizada" } : r));
                          setSelectedRefund(prev => prev ? { ...prev, status: "Realizada" } : prev);
                        }}
                        className="w-full py-3.5 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-black uppercase"
                        style={H7}
                      >
                        <CheckCircle size={16} /> Confirmar reembolso
                      </button>
                    ) : (
                      <div className="w-full py-3.5 bg-[#e0f5eb] border border-[#a7f3d0] text-[#179150] rounded-xl flex items-center justify-center gap-2 font-black uppercase text-sm" style={H9}>
                        <CheckCircle size={16} /> Reembolso realizado
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INVENTARIO — superadmin only */}
        {activeTab === "inventario" && isSuperadmin && (
          <InventarioTab products={products.length ? products : PRODUCTS} setCatalogProducts={setProducts} />
        )}

        {/* SUPERADMIN MODULES — flat, one per tab */}
        {(["contenido","catalogo","personal","monitor","cupones"] as const).includes(activeTab as any) && isSuperadmin && (
          <SuperadminModules onNav={onNav} products={products} setProducts={setProducts} slides={slides} setSlides={setSlides} forcedTab={activeTab as "contenido"|"catalogo"|"personal"|"monitor"|"cupones"} />
        )}
      </div>
    </div>
  );
}

