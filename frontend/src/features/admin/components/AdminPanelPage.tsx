import React, { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Bike,
  Check,
  CheckCircle,
  ChevronDown,
  ClipboardList,
  Copy,
  CreditCard,
  Eye,
  FileText,
  MapPin,
  Package,
  Search,
  Shield,
  SlidersHorizontal,
  Store,
  Truck,
  Trash2,
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
  getRemoteRecipeAuditViewModels,
  auditRemoteRecipe,
  deleteRemoteRecipe,
} from "../../../services";
import { InventarioTab, SuperadminModules } from "../sections";

// ─── AdminPanel ───────────────────────────────────────────────────────────────
// Demo data for admin panel
const DEMO_RECIPES = getLegacyRecipeAuditViewModels();

const DEMO_ADMIN_ORDERS = getLegacyAdminOrderViewModels();

export function AdminPanel({ user, onNav, products, setProducts, slides, setSlides, customLogoUrl, onLogoChange }: {
  user: AuthUser;
  onNav: (p: Page) => void;
  products: Product[];
  setProducts: (p: Product[]) => void;
  slides: Slide[];
  setSlides: (s: Slide[]) => void;
  customLogoUrl: string | null;
  onLogoChange: (url: string | null) => void;
}) {
  const [activeTab, setActiveTab] = useState<"auditor" | "auxiliar" | "contenido" | "catalogo" | "personal" | "monitor" | "inventario" | "cupones" | "reembolsos">("auditor");

  // Auditor state
  const [recipeTab, setRecipeTab] = useState<"pending" | "history">("pending");
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
  const isAuditor = user.role === "auditor" || isSuperadmin;
  const isAuxiliar = user.role === "auxiliar";

  // Auto-select first available tab
  React.useEffect(() => {
    if (isSuperadmin) setActiveTab("contenido");
    else if (isAuditor) setActiveTab("auditor");
    else if (isAuxiliar) setActiveTab("auxiliar");
  }, [isAuditor, isAuxiliar, isSuperadmin]);

  React.useEffect(() => {
    if (!isAuditor) return;
    let cancelled = false;
    getRemoteRecipeAuditViewModels()
      .then(data => { if (!cancelled) setRecipes(data); })
      .catch(error => { if (!cancelled) toast.error(error instanceof Error ? error.message : "No se pudieron cargar los recipes."); });
    return () => { cancelled = true; };
  }, [isAuditor]);

  const handleApproveRecipe = async (recipeId: number | string) => {
    try {
      await auditRemoteRecipe(String(recipeId), "aprobado");
      setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, status: "approved" as const } : r));
      setSelectedRecipe(null);
      toast.success("Récipe aprobado", { description: "El cliente ya puede proceder al pago.", icon: "✅" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo aprobar el récipe.");
    }
  };

  const handleRejectRecipe = async () => {
    if (!selectedRecipe || rejectReasons.size === 0) return;
    try {
      await auditRemoteRecipe(String(selectedRecipe.id), "rechazado", Array.from(rejectReasons), rejectComment);
      const reasons = Array.from(rejectReasons).join(", ");
      const fullReason = rejectComment ? `${reasons}. Nota: ${rejectComment}` : reasons;
      toast.error("Récipe rechazado", { description: `Motivo: ${fullReason}`, icon: "❌" });
      setRecipes(prev => prev.map(r => r.id === selectedRecipe.id ? { ...r, status: "rejected" as const } : r));
      setSelectedRecipe(null);
      setRejectReasons(new Set());
      setRejectComment("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo rechazar el récipe.");
    }
  };

  const handleDeleteRecipe = async (recipeId: number | string) => {
    if (!isSuperadmin || !window.confirm("¿Eliminar este récipe? El registro se conservará como eliminación lógica.")) return;
    try {
      await deleteRemoteRecipe(String(recipeId));
      setRecipes(current => current.filter(recipe => recipe.id !== recipeId));
      setSelectedRecipe(null);
      toast.success("Récipe eliminado; la auditoría fue conservada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el récipe.");
    }
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
              ...(isAuditor ? [{ key: "auditor", label: "Auditoría", icon: <Shield size={14} /> }] : []),
              ...(isAuxiliar ? [{ key: "auxiliar", label: "Operaciones", icon: <Package size={14} /> }] : []),
              ...(isSuperadmin ? [
                { key: "contenido", label: "Contenido", icon: <FileText size={14} /> },
                { key: "catalogo", label: "Catálogo", icon: <Package size={14} /> },
                { key: "inventario", label: "Inventario", icon: <SlidersHorizontal size={14} /> },
                { key: "personal", label: "Personal Operativo", icon: <User size={14} /> },
                { key: "monitor", label: "Monitor Global", icon: <ClipboardList size={14} /> },
                { key: "cupones", label: "Cupones", icon: <CreditCard size={14} /> },
                { key: "reembolsos", label: "Reembolsos", icon: <CreditCard size={14} /> },
              ] : []),
            ] as { key: typeof activeTab; label: string; icon: React.ReactNode }[]).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black uppercase transition-all ${activeTab === t.key ? "bg-white text-[#006064]" : "text-white/70 hover:text-white hover:bg-white/10"
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
                      <div className="flex items-center justify-start">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase ${selectedRecipe.status === "approved" ? "bg-[#179150] text-white" :
                          selectedRecipe.status === "rejected" ? "bg-red-500 text-white" :
                            "bg-amber-100 text-amber-800"}`} style={H9}>
                          {selectedRecipe.status === "approved" ? "Aprobado" : selectedRecipe.status === "rejected" ? "Rechazado" : "Pendiente"}
                        </span>
                      </div>

                      {/* Datos del medicamento */}
                      <div className="bg-[#f0fdf7] border border-[#a7f3d0] rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-[#179150] text-white text-xs font-black flex items-center justify-center" style={H9}>Rx</div>
                          <h4 className="text-sm uppercase text-[#006064] font-black" style={H9}>Datos del medicamento y pedido</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            ["Nº de pedido", selectedRecipe.orderId],
                            ["Producto", selectedRecipe.product],
                            ["Principio activo", selectedRecipe.activeIngredient],
                            ["Concentración", `${selectedRecipe.concentration} ${selectedRecipe.concentrationUnit}`],
                            ["Unidades por paquete", `${selectedRecipe.packSize} unidades`],
                            ["Cantidad solicitada", `${selectedRecipe.quantity} ${selectedRecipe.quantity === 1 ? "unidad" : "unidades"}`],
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
                      {isSuperadmin && (
                        <button
                          onClick={() => { void handleDeleteRecipe(selectedRecipe.id); }}
                          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-black uppercase text-xs"
                          style={H7}
                        >
                          <Trash2 size={14} /> Eliminar récipe
                        </button>
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

            {/* Auditor Header & Tabs */}
            <div className="mb-2 px-1">
              <h2 className="text-xl uppercase text-foreground mb-4" style={H9}>Auditoría de Récipes</h2>
              <div className="flex gap-4 border-b border-border">
                <button
                  onClick={() => setRecipeTab("pending")}
                  className={`pb-2 text-xs font-black uppercase tracking-wider transition-colors border-b-2 ${recipeTab === "pending" ? "border-[#179150] text-[#006064]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  style={H9}
                >
                  Pendientes ({recipes.filter(r => r.status === "pending").length})
                </button>
                <button
                  onClick={() => setRecipeTab("history")}
                  className={`pb-2 text-xs font-black uppercase tracking-wider transition-colors border-b-2 ${recipeTab === "history" ? "border-[#179150] text-[#006064]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  style={H9}
                >
                  Auditados / Historial
                </button>
              </div>
            </div>

            {/* Recipe Cards List */}
            <div className="flex flex-col gap-3">
              {recipes.filter(r => recipeTab === "pending" ? r.status === "pending" : r.status !== "pending").length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">No hay récipes {recipeTab === "pending" ? "pendientes" : "en el historial"}.</div>
              ) : (
                recipes.filter(r => recipeTab === "pending" ? r.status === "pending" : r.status !== "pending").map(recipe => (
                  <div key={recipe.id} className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
                      <div className="text-[#179150] font-black text-sm" style={H9}>{recipe.orderId}</div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${recipe.status === "approved" ? "bg-[#179150] text-white" :
                        recipe.status === "rejected" ? "bg-red-500 text-white" :
                        "bg-amber-100 text-amber-800"}`} style={H9}>
                        {recipe.status === "approved" ? "Aprobado" : recipe.status === "rejected" ? "Rechazado" : "Pendiente"}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-lg font-bold text-foreground mb-1">{recipe.product}</div>
                      <div className="text-sm text-muted-foreground">Paciente: {recipe.clientName}</div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="text-xs text-foreground font-semibold">Cantidad: {recipe.quantity} {recipe.quantity === 1 ? "unidad" : "unidades"}</div>
                      <button
                        onClick={() => { setSelectedRecipe(recipe); setRejectReasons(new Set()); setRejectComment(""); }}
                        className="px-4 py-2 bg-[#50e9f8] text-[#006064] rounded-xl text-xs font-black uppercase hover:bg-[#2dd8e8] transition-colors shadow-sm"
                        style={H9}
                      >
                        Revisar récipe
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* AUXILIAR MODULE */}
        {activeTab === "auxiliar" && isAuxiliar && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl border border-border p-3 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-amber-600 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-2xl sm:text-4xl font-black text-amber-600 leading-none" style={H9}>{ordersByStatus.porPreparar}</div>
                </div>
                <div className="text-xs sm:text-sm font-black uppercase text-muted-foreground tracking-wider leading-tight" style={H9}>Por Preparar</div>
              </div>

              <div className="bg-white rounded-2xl border border-border p-3 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Store size={18} className="text-blue-600 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-2xl sm:text-4xl font-black text-blue-600 leading-none" style={H9}>{ordersByStatus.porRetirar}</div>
                </div>
                <div className="text-xs sm:text-sm font-black uppercase text-muted-foreground tracking-wider leading-tight" style={H9}>Por Retirar</div>
              </div>

              <div className="bg-white rounded-2xl border border-border p-3 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Truck size={18} className="text-[#179150] sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-2xl sm:text-4xl font-black text-[#179150] leading-none" style={H9}>{ordersByStatus.listoDelivery}</div>
                </div>
                <div className="text-xs sm:text-sm font-black uppercase text-muted-foreground tracking-wider leading-tight" style={H9}>Listo Delivery</div>
              </div>
            </div>

            {/* Orders list */}
            <div className="bg-white sm:rounded-2xl border-y sm:border border-border shadow-sm overflow-hidden -mx-6 sm:mx-0">
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

              <div className="p-4 sm:p-6 bg-muted/10">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredOrders.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
                      No hay pedidos que coincidan con la búsqueda.
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-slate-50 rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-4 hover:border-[#179150]/30 hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => setSelectedOrder(order)}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[#179150] font-black text-sm mb-1" style={H9}>{order.id}</div>
                            <div className="text-foreground font-bold text-base leading-tight">{order.clientName}</div>
                          </div>
                          <span className={`shrink-0 inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${order.status === "Por preparar" ? "bg-amber-100 text-amber-800" :
                              order.status === "Por retirar" ? "bg-blue-100 text-blue-800" :
                                "bg-green-100 text-[#179150]"
                            }`} style={H9}>
                            {order.status}
                          </span>
                        </div>

                        <div className="h-px w-full bg-border" />

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                          <div>
                            <span className="text-muted-foreground text-xs block mb-0.5">Items</span>
                            <span className="font-semibold text-foreground">{order.items}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs block mb-0.5">Total</span>
                            <span className="font-black text-foreground">${order.total.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs block mb-0.5">Pago</span>
                            <span className="font-semibold text-foreground line-clamp-1" title={order.paymentMethod}>{order.paymentMethod}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs block mb-0.5">Sede</span>
                            <span className="font-semibold text-foreground capitalize">{order.sede}</span>
                          </div>
                        </div>

                        {/* Footer Action */}
                        <button
                          className="mt-1 w-full py-2.5 bg-cyan-50 hover:bg-cyan-600 text-cyan-700 hover:text-white rounded-xl font-bold text-sm transition-colors"
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                        >
                          Ver detalles del pedido
                        </button>
                      </div>
                    ))
                  )}
                </div>
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
                        <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-black uppercase ${selectedOrder.status === "Por preparar" ? "bg-amber-100 text-amber-800" :
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
                          className={`w-full py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${pinInput.length === 4
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
                            ["Método de pago", selectedRefund.method],
                            ["Banco emisor", selectedRefund.bank],
                            ["Código de área", selectedRefund.areaCode],
                            ["Número telefónico", selectedRefund.phone],
                            ["Monto", selectedRefund.amount],
                            ["Referencia bancaria", selectedRefund.reference],
                            ["Fecha", selectedRefund.date],
                          ]
                          : [
                            ["Método de pago", selectedRefund.method],
                            ["Banco emisor", selectedRefund.bank],
                            ["Monto", selectedRefund.amount],
                            ["Referencia bancaria", selectedRefund.reference],
                            ["Fecha", selectedRefund.date],
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
                            ["Método de reembolso", selectedRefund.refundMethod],
                            ["Banco", selectedRefund.refundBank],
                            ["Código de área", selectedRefund.refundAreaCode],
                            ["Número telefónico", selectedRefund.refundPhone],
                            ["Tipo de documento", selectedRefund.refundDocType],
                            ["N° de documento", selectedRefund.refundDoc],
                          ]
                          : [
                            ["Método de reembolso", selectedRefund.refundMethod],
                            ["Banco", selectedRefund.refundBank],
                            ["Número de cuenta", selectedRefund.account],
                            ["Tipo de documento", selectedRefund.refundDocType],
                            ["N° de documento", selectedRefund.refundDoc],
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
        {(["contenido", "catalogo", "personal", "monitor", "cupones"] as const).includes(activeTab as any) && isSuperadmin && (
          <SuperadminModules onNav={onNav} products={products} setProducts={setProducts} slides={slides} setSlides={setSlides} customLogoUrl={customLogoUrl} onLogoChange={onLogoChange} forcedTab={activeTab as "contenido" | "catalogo" | "personal" | "monitor" | "cupones"} />
        )}
      </div>
    </div>
  );
}
