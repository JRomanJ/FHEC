import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart, Search, User, ChevronRight, ChevronLeft, Plus, Minus, X,
  Upload, MapPin, Truck, Store, Clock, Package, AlertTriangle, Star,
  Trash2, ArrowLeft, Shield, CreditCard, Phone, Building2, FileText,
  ChevronDown, Bell, Check, Copy, SlidersHorizontal, CheckCircle, Info,
  LogOut, Heart, Lock, Mail, Eye, EyeOff, Bike, Settings, ClipboardList,
  Instagram, Facebook,
} from "lucide-react";
import { toast } from "sonner";
import { Page, AuthUser, Product, CartItem, Slide, H9, H7, fmtUSD, fmtVES, effectivePrice, PRODUCTS, CATS, DEFAULT_SLIDES } from "../shared";
import logoFarmahumana from "../../imports/logo-farmahumana.png";
import recipeMaria from "../../imports/recipe-Maria.jpg";
import recipeJose from "../../imports/recipe-Jose.jpg";
import recipeAna from "../../imports/recipe-Ana.jpg";

// ─── SuperadminModules ────────────────────────────────────────────────────────
type SuperTab = "contenido" | "catalogo" | "personal" | "monitor";

const DEMO_GLOBAL_ORDERS = [
  { id: "ORD-2024-301", date: "2024-06-08 16:20", client: "María González", sede: "Principal", status: "Entregado", total: 34.75, approvedBy: "Carlos Vega", preparedBy: "Ana Torres", dispatchedBy: "José Ramos" },
  { id: "ORD-2024-302", date: "2024-06-08 15:50", client: "Pedro Martínez", sede: "Clínica Sur", status: "En tránsito", total: 18.50, approvedBy: "Carlos Vega", preparedBy: "Ana Torres", dispatchedBy: "José Ramos" },
  { id: "ORD-2024-303", date: "2024-06-08 15:30", client: "Laura Díaz", sede: "Principal", status: "Por preparar", total: 55.00, approvedBy: "—", preparedBy: "—", dispatchedBy: "—" },
  { id: "ORD-2024-304", date: "2024-06-08 15:10", client: "Roberto Sánchez", sede: "Clínica Sur", status: "Pendiente pago", total: 12.25, approvedBy: "Carlos Vega", preparedBy: "—", dispatchedBy: "—" },
  { id: "ORD-2024-305", date: "2024-06-08 14:45", client: "Sofía Jiménez", sede: "Maternidad", status: "Cancelado", total: 8.00, approvedBy: "—", preparedBy: "—", dispatchedBy: "—" },
  { id: "ORD-2024-306", date: "2024-06-08 14:20", client: "Carlos Blanco", sede: "Principal", status: "Entregado", total: 22.90, approvedBy: "Carlos Vega", preparedBy: "Ana Torres", dispatchedBy: "José Ramos" },
  { id: "ORD-2024-307", date: "2024-06-08 13:55", client: "Elena Rojas", sede: "Maternidad", status: "Por retirar", total: 41.30, approvedBy: "Carlos Vega", preparedBy: "Ana Torres", dispatchedBy: "—" },
  { id: "ORD-2024-308", date: "2024-06-08 13:30", client: "Marcos Herrera", sede: "Principal", status: "En validación médica", total: 67.50, approvedBy: "—", preparedBy: "—", dispatchedBy: "—" },
];

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
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // ── Gestor Personal state ──
  const [staff, setStaff] = useState([
    { id: 1, name: "Ana Torres", email: "auxiliar@fhec.com", cedula: "V-11223344", roles: ["auxiliar"] as string[], active: true, createdAt: "2024-01-15" },
    { id: 2, name: "José Ramos", email: "repartidor@fhec.com", cedula: "V-87654321", roles: ["repartidor"] as string[], active: true, createdAt: "2024-02-03" },
    { id: 3, name: "Carlos Vega", email: "auditor@fhec.com", cedula: "V-33445566", roles: ["auditor"] as string[], active: true, createdAt: "2024-03-10" },
    { id: 4, name: "Luis Medina", email: "admin@fhec.com", cedula: "V-55667788", roles: ["superadmin", "auditor", "auxiliar"] as string[], active: true, createdAt: "2024-01-01" },
    { id: 5, name: "Carmen López", email: "carmen@fhec.com", cedula: "V-22334455", roles: ["auxiliar"] as string[], active: false, createdAt: "2024-04-20" },
  ]);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: "", email: "", cedula: "", password: "", roles: [] as string[] });
  const [staffFormError, setStaffFormError] = useState("");
  const ROLE_OPTIONS = ["cliente", "auxiliar", "repartidor", "auditor", "superadmin"];

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

  const filteredCat = catalogProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(catSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(catSearch.toLowerCase());
    const matchCat = catFilter === "Todos" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const openEditProd = (p: Product) => {
    setEditProd(p);
    setProdForm({ ...p });
    setShowProdForm(true);
  };

  const openNewProd = () => {
    setEditProd(null);
    setProdForm({ name: "", brand: "", category: "Diabetes", presentation: "", packSize: "", priceUSD: 0, stock: 0, discount: 0, needsRecipe: false, rating: 5, reviews: 0, bgColor: "#e8f5e9", accentColor: "#179150", description: "", activeIngredient: "", contraindications: "", posology: "" });
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

  const deleteProd = (id: number) => {
    setCatalogProducts(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  const toggleStaffRole = (role: string) => {
    setStaffForm(prev => {
      const has = prev.roles.includes(role);
      return { ...prev, roles: has ? prev.roles.filter(r => r !== role) : [...prev.roles, role] };
    });
  };

  const saveStaff = () => {
    setStaffFormError("");
    if (!staffForm.name.trim() || !staffForm.email.trim() || !staffForm.cedula.trim() || !staffForm.password.trim()) {
      setStaffFormError("Todos los campos son obligatorios.");
      return;
    }
    if (staffForm.roles.length === 0) {
      setStaffFormError("Debe asignar al menos un rol.");
      return;
    }
    const newId = Math.max(...staff.map(s => s.id), 0) + 1;
    setStaff(prev => [...prev, { id: newId, name: staffForm.name, email: staffForm.email, cedula: staffForm.cedula, roles: staffForm.roles, active: true, createdAt: new Date().toISOString().split("T")[0] }]);
    setStaffForm({ name: "", email: "", cedula: "", password: "", roles: [] });
    setShowStaffForm(false);
  };

  const SUPER_TABS: { key: SuperTab; label: string; icon: React.ReactNode }[] = [
    { key: "contenido", label: "Gestor de Contenido", icon: <FileText size={14} /> },
    { key: "catalogo", label: "Gestor de Catálogo", icon: <Package size={14} /> },
    { key: "personal", label: "Gestor de Personal", icon: <User size={14} /> },
    { key: "monitor", label: "Monitor Global", icon: <ClipboardList size={14} /> },
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
                  <div className="relative h-24" style={{ background: `linear-gradient(135deg, ${s.from}, ${s.via}, ${s.to})` }}>
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
                        ["URL de imagen", "img"],
                        ["Color inicio (from)", "from"],
                        ["Color medio (via)", "via"],
                        ["Color fin (to)", "to"],
                      ] as [string, keyof Slide][]).map(([label, key]) => (
                        <div key={key}>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
                          <div className="flex items-center gap-2">
                            {["from", "via", "to"].includes(key) && (
                              <input type="color" value={slideDraft[key] as string}
                                onChange={e => setSlideDraft({ ...slideDraft, [key]: e.target.value })}
                                className="w-8 h-8 rounded-lg border border-border cursor-pointer p-0.5 flex-shrink-0" />
                            )}
                            <input value={slideDraft[key] as string}
                              onChange={e => setSlideDraft({ ...slideDraft, [key]: e.target.value })}
                              className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" />
                          </div>
                        </div>
                      ))}
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

          {/* Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input className="w-full pl-9 pr-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] transition-all" placeholder="Buscar por nombre o marca…" value={catSearch} onChange={e => setCatSearch(e.target.value)} />
            </div>
            <select className="px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] transition-all" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="Todos">Todas las categorías</option>
              {[...new Set(catalogProducts.map(p => p.category))].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Products table */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f0fdf7] border-b border-border">
                    {["Nombre / Marca", "Categoría", "Precio USD", "Descuento", "Stock", "Récipe", "Relevancia", "Acciones"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase text-muted-foreground" style={H9}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCat.map(p => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-[#f9fdfe] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground text-sm">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.brand} · {p.presentation} {p.packSize}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{p.category}</td>
                      <td className="px-4 py-3 text-sm font-black text-[#179150]" style={H9}>{fmtUSD(p.priceUSD)}</td>
                      <td className="px-4 py-3 text-sm">{p.discount ? <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-black" style={H9}>{p.discount}% OFF</span> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${p.stock === 0 ? "bg-red-100 text-red-700" : p.stock < 10 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`} style={H9}>
                          {p.stock === 0 ? "Agotado" : p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${p.needsRecipe ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`} style={H9}>{p.needsRecipe ? "Sí" : "No"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(n => <Star key={n} size={10} className={n <= Math.round(p.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"} />)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEditProd(p)} className="p-1.5 hover:bg-[#50e9f8]/10 rounded-lg text-[#006064] transition-colors" title="Editar">
                            <Settings size={14} />
                          </button>
                          <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Eliminar">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCat.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">No se encontraron productos.</div>
              )}
            </div>
          </div>

          {/* Delete confirm */}
          {deleteConfirm !== null && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl">
                <Trash2 size={40} className="mx-auto mb-4 text-red-500" />
                <h3 className="text-xl uppercase text-foreground mb-2" style={H9}>¿Eliminar producto?</h3>
                <p className="text-sm text-muted-foreground mb-6">Esta acción no se puede deshacer.</p>
                <div className="flex gap-3">
                  <button onClick={() => deleteProd(deleteConfirm)} className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors" style={H7}>Eliminar</button>
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-border rounded-xl hover:bg-[#f0fdf7] transition-colors" style={H7}>Cancelar</button>
                </div>
              </div>
            </div>
          )}

          {/* Product form modal */}
          {showProdForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] overflow-y-auto p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl my-4 mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl uppercase text-foreground" style={H9}>{editProd ? "Editar Producto" : "Nuevo Producto"}</h3>
                  <button onClick={() => setShowProdForm(false)} className="p-2 hover:bg-[#f0fdf7] rounded-xl"><X size={18} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={lbl}>Nombre técnico *</label>
                    <input className={inp} value={prodForm.name ?? ""} onChange={e => setProdForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Metformina 500mg" />
                  </div>
                  <div>
                    <label className={lbl}>Marca comercial *</label>
                    <input className={inp} value={prodForm.brand ?? ""} onChange={e => setProdForm(f => ({ ...f, brand: e.target.value }))} />
                  </div>
                  <div>
                    <label className={lbl}>Categoría</label>
                    <select className={inp} value={prodForm.category ?? "Diabetes"} onChange={e => setProdForm(f => ({ ...f, category: e.target.value }))}>
                      {CATS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Presentación</label>
                    <input className={inp} value={prodForm.presentation ?? ""} onChange={e => setProdForm(f => ({ ...f, presentation: e.target.value }))} placeholder="Tabletas, Cápsulas, etc." />
                  </div>
                  <div>
                    <label className={lbl}>Tamaño de empaque</label>
                    <input className={inp} value={prodForm.packSize ?? ""} onChange={e => setProdForm(f => ({ ...f, packSize: e.target.value }))} placeholder="x30, x20, etc." />
                  </div>
                  <div>
                    <label className={lbl}>Precio (USD)</label>
                    <input type="number" min={0} step={0.01} className={inp} value={prodForm.priceUSD ?? 0} onChange={e => setProdForm(f => ({ ...f, priceUSD: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <label className={lbl}>% de Descuento (0, 5, 10…)</label>
                    <input type="number" min={0} max={100} className={inp} value={prodForm.discount ?? 0} onChange={e => { const v = parseInt(e.target.value) || 0; setProdForm(f => ({ ...f, discount: v || undefined })); }} />
                  </div>
                  <div>
                    <label className={lbl}>Stock</label>
                    <input type="number" min={0} className={inp} value={prodForm.stock ?? 0} onChange={e => setProdForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <label className={lbl}>Nivel de Relevancia (1–5)</label>
                    <input type="number" min={1} max={5} step={0.1} className={inp} value={prodForm.rating ?? 5} onChange={e => setProdForm(f => ({ ...f, rating: parseFloat(e.target.value) || 5 }))} />
                    <p className="text-[10px] text-muted-foreground mt-1">Controla posicionamiento en colaboraciones pagadas.</p>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={prodForm.needsRecipe ?? false} onChange={e => setProdForm(f => ({ ...f, needsRecipe: e.target.checked }))} className="w-4 h-4 rounded" />
                      <span className="text-sm font-semibold text-foreground">Requiere récipe</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={prodForm.controlledSubstance ?? false} onChange={e => setProdForm(f => ({ ...f, controlledSubstance: e.target.checked }))} className="w-4 h-4 rounded" />
                      <span className="text-sm font-semibold text-foreground">Sustancia controlada</span>
                    </label>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>Principio activo</label>
                    <input className={inp} value={prodForm.activeIngredient ?? ""} onChange={e => setProdForm(f => ({ ...f, activeIngredient: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>Descripción</label>
                    <textarea rows={3} className={`${inp} resize-none`} value={prodForm.description ?? ""} onChange={e => setProdForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>Contraindicaciones</label>
                    <textarea rows={2} className={`${inp} resize-none`} value={prodForm.contraindications ?? ""} onChange={e => setProdForm(f => ({ ...f, contraindications: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>Posología</label>
                    <textarea rows={2} className={`${inp} resize-none`} value={prodForm.posology ?? ""} onChange={e => setProdForm(f => ({ ...f, posology: e.target.value }))} />
                  </div>
                  <div>
                    <label className={lbl}>Color de fondo (hex)</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={prodForm.bgColor ?? "#e8f5e9"} onChange={e => setProdForm(f => ({ ...f, bgColor: e.target.value }))} className="w-10 h-9 rounded border border-border cursor-pointer" />
                      <input className={`${inp} flex-1`} value={prodForm.bgColor ?? "#e8f5e9"} onChange={e => setProdForm(f => ({ ...f, bgColor: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Color de acento (hex)</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={prodForm.accentColor ?? "#179150"} onChange={e => setProdForm(f => ({ ...f, accentColor: e.target.value }))} className="w-10 h-9 rounded border border-border cursor-pointer" />
                      <input className={`${inp} flex-1`} value={prodForm.accentColor ?? "#179150"} onChange={e => setProdForm(f => ({ ...f, accentColor: e.target.value }))} />
                    </div>
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

      {/* ── RF-ADM-11: Gestor de Personal ── */}
      {superTab === "personal" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl uppercase text-foreground" style={H9}>Gestor de Personal</h3>
              <p className="text-sm text-muted-foreground">{staff.length} empleados · {staff.filter(s => s.active).length} activos</p>
            </div>
            <button
              onClick={() => { setStaffForm({ name: "", email: "", cedula: "", password: "", roles: [] }); setStaffFormError(""); setShowStaffForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors"
              style={H7}
            >
              <Plus size={16} />
              Nuevo empleado
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-black" style={H9}>Normativa de base de datos:</span> No se permite eliminar cuentas de empleados. Solo es posible inhabilitarlas para conservar la trazabilidad de auditoría.
            </p>
          </div>

          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f0fdf7] border-b border-border">
                  {["Empleado", "Cédula", "Correo", "Roles asignados", "Alta", "Estado", "Acción"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase text-muted-foreground" style={H9}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id} className={`border-b border-border/50 transition-colors ${s.active ? "hover:bg-[#f9fdfe]" : "bg-gray-50/50 opacity-60"}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#50e9f8] to-[#179150] flex items-center justify-center text-white text-xs font-black" style={H9}>
                          {s.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                        </div>
                        <span className="font-semibold text-foreground text-sm">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.cedula}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.roles.map(r => (
                          <span key={r} className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            r === "superadmin" ? "bg-[#006064] text-white" :
                            r === "auditor" ? "bg-amber-100 text-amber-800" :
                            r === "auxiliar" ? "bg-[#50e9f8]/20 text-[#006064]" :
                            r === "repartidor" ? "bg-purple-100 text-purple-800" :
                            "bg-green-100 text-green-800"
                          }`} style={H9}>{r}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{s.createdAt}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${s.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`} style={H9}>
                        {s.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setStaff(prev => prev.map(m => m.id === s.id ? { ...m, active: !m.active } : m))}
                        className={`text-xs px-3 py-1.5 rounded-lg font-black uppercase transition-colors ${
                          s.active
                            ? "border border-red-200 text-red-600 hover:bg-red-50"
                            : "border border-green-200 text-green-700 hover:bg-green-50"
                        }`}
                        style={H9}
                      >
                        {s.active ? "Inhabilitar" : "Habilitar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* New staff modal */}
          {showStaffForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl uppercase text-foreground" style={H9}>Nuevo Empleado</h3>
                  <button onClick={() => setShowStaffForm(false)} className="p-2 hover:bg-[#f0fdf7] rounded-xl"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={lbl}>Nombre completo *</label>
                    <input className={inp} value={staffForm.name} onChange={e => setStaffForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Pedro González" />
                  </div>
                  <div>
                    <label className={lbl}>Correo electrónico *</label>
                    <input type="email" className={inp} value={staffForm.email} onChange={e => setStaffForm(f => ({ ...f, email: e.target.value }))} placeholder="empleado@fhec.com" />
                  </div>
                  <div>
                    <label className={lbl}>Cédula *</label>
                    <input className={inp} value={staffForm.cedula} onChange={e => setStaffForm(f => ({ ...f, cedula: e.target.value }))} placeholder="V-12345678" />
                  </div>
                  <div>
                    <label className={lbl}>Contraseña provisional *</label>
                    <input type="password" className={inp} value={staffForm.password} onChange={e => setStaffForm(f => ({ ...f, password: e.target.value }))} placeholder="Mínimo 8 caracteres" />
                  </div>
                  <div>
                    <label className={lbl}>Roles *</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {ROLE_OPTIONS.map(role => (
                        <label key={role} className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer border transition-all ${staffForm.roles.includes(role) ? "border-[#179150] bg-green-50" : "border-border hover:border-[#179150]"}`}>
                          <input type="checkbox" checked={staffForm.roles.includes(role)} onChange={() => toggleStaffRole(role)} className="w-4 h-4 rounded" />
                          <span className="text-sm font-semibold capitalize text-foreground">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {staffFormError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
                      <AlertTriangle size={14} />
                      {staffFormError}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={saveStaff} className="flex-1 py-3 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors" style={H7}>Crear cuenta</button>
                  <button onClick={() => setShowStaffForm(false)} className="px-6 py-3 border border-border rounded-xl hover:bg-[#f0fdf7] transition-colors" style={H7}>Cancelar</button>
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
                    {["# Pedido", "Fecha", "Cliente", "Sede", "Total", "Estado", "Aprobó", "Preparó", "Despachó"].map(h => (
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
            <div className="px-6 py-5 border-t border-border bg-[#f0fdf7] flex items-center justify-between">
              <div className="text-sm text-muted-foreground font-semibold">
                {filteredMonitor.length} de {monitorOrders.length} transacciones
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Total filtrado</div>
                <div className="text-4xl font-black text-[#179150] leading-none" style={H9}>
                  {fmtUSD(filteredMonitor.reduce((sum, o) => sum + o.total, 0))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AdminPanel ───────────────────────────────────────────────────────────────
// Demo data for admin panel
const DEMO_RECIPES = [
  { id: 1, orderId: "ORD-2024-123", clientName: "María González", product: "Losartán 50mg", uploadDate: "2024-06-08 14:32", imageUrl: recipeMaria, status: "pending" as const },
  { id: 2, orderId: "ORD-2024-124", clientName: "José Ramos", product: "Amoxicilina 500mg", uploadDate: "2024-06-08 14:28", imageUrl: recipeJose, status: "pending" as const },
  { id: 3, orderId: "ORD-2024-125", clientName: "Ana Torres", product: "Clonazepam 0.5mg", uploadDate: "2024-06-08 14:15", imageUrl: recipeAna, status: "pending" as const },
];

const DEMO_ADMIN_ORDERS = [
  { id: "ORD-2024-201", clientName: "Pedro Martínez", sede: "principal", status: "Por preparar", items: 3, total: 45.50, paymentMethod: "Pago Móvil", createdAt: "2024-06-08 15:30", products: ["Metformina 500mg x2", "Vitamina C 1000mg x1"] },
  { id: "ORD-2024-202", clientName: "Laura Díaz", sede: "clinica", status: "Por retirar", items: 2, total: 28.00, paymentMethod: "Transferencia", createdAt: "2024-06-08 15:15", products: ["Paracetamol 500mg x2"] },
  { id: "ORD-2024-203", clientName: "Carlos Ruiz", sede: "principal", status: "Listo para delivery", items: 4, total: 67.20, paymentMethod: "Pago Móvil", createdAt: "2024-06-08 14:50", products: ["Omeprazol 20mg x2", "Losartán 50mg x2"], deliveryAddress: "Calle 07, Manzana 04" },
  { id: "ORD-2024-204", clientName: "Isabel Vega", sede: "principal", status: "Por preparar", items: 1, total: 22.00, paymentMethod: "Presencial", createdAt: "2024-06-08 15:45", products: ["Clonazepam 0.5mg x1"], controlled: true },
];

function AdminPanel({ user, onNav, products, setProducts, slides, setSlides }: {
  user: AuthUser;
  onNav: (p: Page) => void;
  products: Product[];
  setProducts: (p: Product[]) => void;
  slides: Slide[];
  setSlides: (s: Slide[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<"auditor" | "auxiliar" | "contenido" | "catalogo" | "personal" | "monitor">("auditor");

  // Auditor state
  const [recipes, setRecipes] = useState(DEMO_RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState<typeof DEMO_RECIPES[0] | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Set<string>>(new Set());
  const [rejectComment, setRejectComment] = useState("");

  // Auxiliar state
  const [orders, setOrders] = useState(DEMO_ADMIN_ORDERS);
  const [sedeFilter, setSedeFilter] = useState("todas");
  const [searchOrder, setSearchOrder] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<typeof DEMO_ADMIN_ORDERS[0] | null>(null);
  const [pinInput, setPinInput] = useState("");

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
  const isAuditor = ["auditor", "superadmin"].includes(user.role);
  const isAuxiliar = ["auxiliar", "superadmin"].includes(user.role);
  const isSuperadmin = user.role === "superadmin";

  // Auto-select first available tab
  React.useEffect(() => {
    if (isAuditor) setActiveTab("auditor");
    else if (isAuxiliar) setActiveTab("auxiliar");
    else if (isSuperadmin) setActiveTab("contenido");
  }, [isAuditor, isAuxiliar, isSuperadmin]);

  const handleApproveRecipe = (recipeId: number) => {
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
    setSelectedRecipe(null);
    toast.success("Récipe aprobado", { description: "El cliente ha sido notificado para proceder al pago.", icon: "✅" });
  };

  const handleRejectRecipe = () => {
    if (!selectedRecipe || rejectReasons.size === 0) return;
    const reasons = Array.from(rejectReasons).join(", ");
    const fullReason = rejectComment ? `${reasons}. Nota: ${rejectComment}` : reasons;
    toast.error("Récipe rechazado", { description: `Motivo: ${fullReason}`, icon: "❌" });
    setRecipes(prev => prev.filter(r => r.id !== selectedRecipe.id));
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
            <button
              onClick={() => onNav("home")}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-black uppercase transition-colors border border-white/20"
              style={H7}
            >
              <ArrowLeft size={14} /> Volver a la tienda
            </button>
          </div>

          {/* Tabs — flat: Auditoría, Operaciones, + superadmin subtabs */}
          <div className="flex flex-wrap gap-2">
            {([
              ...(isAuditor  ? [{ key: "auditor",   label: "Auditoría",           icon: <Shield size={14} /> }] : []),
              ...(isAuxiliar ? [{ key: "auxiliar",  label: "Operaciones",          icon: <Package size={14} /> }] : []),
              ...(isSuperadmin ? [
                { key: "contenido", label: "Gestor de Contenido", icon: <FileText size={14} /> },
                { key: "catalogo",  label: "Gestor de Catálogo",  icon: <Package size={14} /> },
                { key: "personal",  label: "Gestor de Personal",  icon: <User size={14} /> },
                { key: "monitor",   label: "Monitor Global",      icon: <ClipboardList size={14} /> },
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
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <FileText size={20} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl uppercase text-foreground" style={H9}>Récipes Pendientes de Aprobación</h2>
                  <p className="text-sm text-muted-foreground">{recipes.length} récipe{recipes.length !== 1 ? "s" : ""} en bandeja</p>
                </div>
              </div>

              {recipes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No hay récipes pendientes</p>
                  <p className="text-sm mt-1">Todos los récipes han sido procesados</p>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Recipe List */}
                  <div className="space-y-3">
                    {recipes.map(recipe => (
                      <button
                        key={recipe.id}
                        onClick={() => setSelectedRecipe(recipe)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedRecipe?.id === recipe.id
                            ? "border-[#50e9f8] bg-[#e0f5eb]"
                            : "border-border hover:border-[#179150]/40 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                            <img src={recipe.imageUrl} alt="Récipe" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-black text-foreground uppercase" style={H9}>{recipe.orderId}</div>
                            <div className="text-xs text-muted-foreground">{recipe.clientName}</div>
                            <div className="text-xs text-[#179150] font-semibold mt-1">{recipe.product}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">Subido: {recipe.uploadDate}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Recipe Viewer */}
                  <div>
                    {selectedRecipe ? (
                      <div className="bg-white rounded-2xl border-2 border-[#50e9f8] overflow-hidden">
                        <div className="bg-[#e0f5eb] px-4 py-3 border-b border-[#50e9f8]">
                          <div className="text-xs text-[#006064] font-black uppercase mb-1" style={H9}>Visor de Récipe</div>
                          <div className="text-sm font-black text-foreground" style={H9}>{selectedRecipe.orderId} · {selectedRecipe.clientName}</div>
                        </div>

                        {/* Image viewer */}
                        <div className="p-4">
                          <div className="bg-gray-50 rounded-xl overflow-hidden mb-4">
                            <img src={selectedRecipe.imageUrl} alt="Récipe completo" className="w-full h-auto" />
                          </div>

                          {/* Action buttons */}
                          <div className="space-y-3">
                            <button
                              onClick={() => handleApproveRecipe(selectedRecipe.id)}
                              className="w-full flex items-center justify-center gap-2 py-3 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors"
                              style={H7}
                            >
                              <CheckCircle size={16} />
                              Aprobar Récipe
                            </button>

                            {/* Reject section */}
                            <details className="group">
                              <summary className="cursor-pointer list-none">
                                <div className="flex items-center justify-center gap-2 py-3 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-black uppercase text-sm" style={H7}>
                                  <X size={16} />
                                  Rechazar Récipe
                                  <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                                </div>
                              </summary>

                              <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                                <div className="text-xs font-black uppercase text-red-800 mb-2" style={H9}>Motivos de Rechazo</div>
                                {["Falta sello del médico", "No está en vigencia", "Datos borrosos o ilegibles", "Récipe incompleto", "Firma no visible"].map(reason => (
                                  <label key={reason} className="flex items-start gap-2.5 cursor-pointer">
                                    <div
                                      onClick={() => toggleRejectReason(reason)}
                                      className={`w-4 h-4 mt-0.5 rounded flex-shrink-0 border-2 transition-all flex items-center justify-center cursor-pointer
                                        ${rejectReasons.has(reason) ? "bg-red-600 border-red-600" : "border-red-300 bg-white hover:border-red-600"}`}
                                    >
                                      {rejectReasons.has(reason) && <Check size={10} className="text-white" />}
                                    </div>
                                    <span className="text-sm text-red-800">{reason}</span>
                                  </label>
                                ))}

                                <div>
                                  <label className="text-xs font-semibold text-red-800 uppercase tracking-wider mb-1.5 block">Comentarios adicionales (opcional)</label>
                                  <textarea
                                    value={rejectComment}
                                    onChange={e => setRejectComment(e.target.value)}
                                    placeholder="Ej: El sello médico está cortado en la foto..."
                                    className="w-full px-3 py-2 border border-red-200 rounded-xl text-sm focus:outline-none focus:border-red-400 bg-white resize-none"
                                    rows={3}
                                  />
                                </div>

                                <button
                                  onClick={handleRejectRecipe}
                                  disabled={rejectReasons.size === 0}
                                  className={`w-full py-2.5 rounded-xl text-sm font-black uppercase transition-colors ${
                                    rejectReasons.size > 0
                                      ? "bg-red-600 text-white hover:bg-red-700"
                                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  }`}
                                  style={H7}
                                >
                                  Confirmar Rechazo
                                </button>
                              </div>
                            </details>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center p-8 bg-white rounded-2xl border-2 border-dashed border-border">
                        <div>
                          <FileText size={40} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                          <p className="text-muted-foreground font-semibold">Selecciona un récipe</p>
                          <p className="text-sm text-muted-foreground mt-1">Haz clic en un récipe para visualizarlo</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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

                  <select
                    value={sedeFilter}
                    onChange={e => setSedeFilter(e.target.value)}
                    className="px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white"
                  >
                    <option value="todas">Todas las sedes</option>
                    <option value="principal">Principal</option>
                    <option value="clinica">Clínica Humana</option>
                  </select>
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
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
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

                    {(selectedOrder.status === "Por retirar" || selectedOrder.status === "Listo para delivery") && (
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

        {/* SUPERADMIN MODULES — flat, one per tab */}
        {(["contenido","catalogo","personal","monitor"] as const).includes(activeTab as any) && isSuperadmin && (
          <SuperadminModules onNav={onNav} products={products} setProducts={setProducts} slides={slides} setSlides={setSlides} forcedTab={activeTab as "contenido"|"catalogo"|"personal"|"monitor"} />
        )}
      </div>
    </div>
  );
}


export { AdminPanel };
