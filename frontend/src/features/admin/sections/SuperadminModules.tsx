import React, { useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ClipboardList,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  Package,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import type { Page, Product, Slide } from "../../../app/types";
import logoFarmahumana from "../../../imports/logo-farmahumana.png";
import { toast } from "sonner";
import { CATS, fmtUSD, H7, H9 } from "../../../app/data";
import { annulRemoteTransaction, assignRole, createInventoryEntry, createRemoteCoupon, deleteRemoteBanner, deleteRemoteBannerImage, findUserByDocument, getCatalogProducts, getLegacyAdminMonitorOrderViewModels, getRemoteCoupons, getRemoteOrders, getRemoteTransactions, restoreOriginalLogo, updateInventoryPrice, updateRemoteBanner, updateRemoteCoupon, updateRemoteTransaction, uploadCustomLogo, uploadRemoteBannerImage, getStaff } from "../../../services";
import type { RemoteCoupon } from "../../../services";
import type { RemoteOrder, RemoteTransaction } from "../../../services/orderService";
import { BRANCH_IDS } from "../../../config/api";
import { InventarioTab } from "./AdminInventorySection";
import {
  firstError,
  normalizeCouponCode,
  validateAdminCouponForm,
  validateAdminProductForm,
} from "../../../validation";

// ─── SuperadminModules ────────────────────────────────────────────────────────
export type SuperTab = "contenido" | "catalogo" | "personal" | "monitor" | "inventario" | "cupones";

interface StaffRow {
  id: string;
  name: string;
  cedula: string;
  roles: string[];
  createdAt: string;
}

interface BackendUserProfile {
  id: string;
  nombre_completo: string;
  tipo_documento_identidad: string;
  documento_identidad: string;
  rol: string;
  created_at: string;
}

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

export function SuperadminModules({ onNav, products, setProducts, slides, setSlides, customLogoUrl, onLogoChange, forcedTab }: {
  onNav: (p: Page) => void;
  products: Product[];
  setProducts: (p: Product[]) => void;
  slides: Slide[];
  setSlides: (s: Slide[]) => void;
  customLogoUrl: string | null;
  onLogoChange: (url: string | null) => void;
  forcedTab?: SuperTab;
}) {
  const [superTab, setSuperTab] = useState<SuperTab>(forcedTab ?? "contenido");
  React.useEffect(() => { if (forcedTab) setSuperTab(forcedTab); }, [forcedTab]);

  // ── Gestor Contenido state ──
  const [slideEditing, setSlideEditing] = useState<number | null>(null);
  const [slideDraft, setSlideDraft] = useState<Slide | null>(null);
  const [slideSaving, setSlideSaving] = useState(false);
  const [slideImageUploading, setSlideImageUploading] = useState(false);
  const [slideUploadedPath, setSlideUploadedPath] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(customLogoUrl);
  const [logoSaving, setLogoSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  React.useEffect(() => setLogoPreview(customLogoUrl), [customLogoUrl]);

  const uploadLogo = async (file: File) => {
    const temporaryUrl = URL.createObjectURL(file);
    setLogoPreview(temporaryUrl);
    setLogoSaving(true);
    try {
      const url = await uploadCustomLogo(file);
      setLogoPreview(url);
      onLogoChange(url);
      toast.success("Logotipo actualizado.");
    } catch (error) {
      setLogoPreview(customLogoUrl);
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el logotipo.");
    } finally {
      URL.revokeObjectURL(temporaryUrl);
      setLogoSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const restoreLogo = async () => {
    setLogoSaving(true);
    try {
      await restoreOriginalLogo();
      setLogoPreview(null);
      onLogoChange(null);
      toast.success("Logotipo original restaurado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo restaurar el logotipo.");
    } finally {
      setLogoSaving(false);
    }
  };

  const startEditSlide = (i: number) => { setSlideEditing(i); setSlideDraft({ ...slides[i] }); setSlideUploadedPath(null); };
  const saveSlide = async () => {
    if (slideEditing === null || !slideDraft) return;
    setSlideSaving(true);
    try {
      const saved = await updateRemoteBanner(slideDraft);
      const next = [...slides]; next[slideEditing] = saved;
      setSlides(next); setSlideEditing(null); setSlideDraft(null);
      setSlideUploadedPath(null);
      toast.success(slideDraft.id == null ? "Banner creado." : "Banner actualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el banner.");
    } finally {
      setSlideSaving(false);
    }
  };
  const removeSlide = async (i: number) => {
    const banner = slides[i];
    if (!banner) return;
    try {
      if (banner.id != null) await deleteRemoteBanner(banner.id);
      else if (slideEditing === i && slideUploadedPath) await deleteRemoteBannerImage(slideUploadedPath);
      setSlides(slides.filter((_, idx) => idx !== i));
      if (slideEditing === i) { setSlideEditing(null); setSlideDraft(null); setSlideUploadedPath(null); }
      toast.success("Banner eliminado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el banner.");
    }
  };
  const addNewSlide = () => {
    const blank: Slide = { title: "Nuevo Banner", subtitle: "Descripción del banner", badge: "NUEVO", from: "#031b24", via: "#00546a", to: "#50e9f8", img: "https://images.unsplash.com/photo-1550572017-efe56097ef4a?w=900&h=500&fit=crop&auto=format", cta: "Ver más →" };
    setSlides([...slides, blank]);
    setSlideUploadedPath(null);
    setSlideEditing(slides.length); setSlideDraft(blank);
  };

  const uploadSlideImage = async (file: File) => {
    setSlideImageUploading(true);
    try {
      const uploaded = await uploadRemoteBannerImage(file);
      if (slideUploadedPath) await deleteRemoteBannerImage(slideUploadedPath).catch(console.error);
      setSlideUploadedPath(uploaded.path);
      setSlideDraft(current => current ? { ...current, img: uploaded.publicUrl } : current);
      toast.success("Imagen cargada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar la imagen.");
    } finally {
      setSlideImageUploading(false);
    }
  };

  const cancelSlideEdit = async (index: number) => {
    if (slideUploadedPath) await deleteRemoteBannerImage(slideUploadedPath).catch(console.error);
    if (slides[index]?.id == null) setSlides(slides.filter((_, idx) => idx !== index));
    setSlideUploadedPath(null);
    setSlideEditing(null);
    setSlideDraft(null);
  };

  // ── Gestor Catálogo state ──
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(products);
  const [catSearch, setCatSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todos");
  const [editProd, setEditProd] = useState<Product | null>(null);
  const [showProdForm, setShowProdForm] = useState(false);
  const [prodForm, setProdForm] = useState<Partial<Product>>({});
  const [prodFormError, setProdFormError] = useState("");
  const [prodSaving, setProdSaving] = useState(false);
  const isProdEnabled = (p: Product) => p.enabled !== false;
  React.useEffect(() => setCatalogProducts(products), [products]);

  // ── Gestor Personal state ──
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({ docType: "V", document: "", role: "auxiliar" });
  const [staffFormError, setStaffFormError] = useState("");
  const [editStaffId, setEditStaffId] = useState<string | null>(null);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSaving, setStaffSaving] = useState(false);
  const ROLE_OPTIONS = ["auxiliar", "repartidor", "auditor", "superadmin"];

  React.useEffect(() => {
  if (superTab !== "personal") return;

  let isMounted = true;
  async function fetchStaffList() {
    try {
      setStaffLoading(true);

      const response = await getStaff<BackendUserProfile[]>();

      if (!isMounted) return;

      const rawData = (response as any)?.data ?? response;
      console.log(response)

      const rawList = Array.isArray(rawData) ? rawData : [];

      const formattedRows: StaffRow[] = rawList.map((s: any) => ({
        id: s.id || String(Math.random()),
        name: s.nombre_completo || s.name || "Sin Nombre",
        cedula: s.cedula || 
          (s.tipo_documento_identidad && s.documento_identidad
            ? `${s.tipo_documento_identidad}-${s.documento_identidad}`
            : s.documento_identidad || "N/A"),
        roles: Array.isArray(s.roles) 
          ? s.roles 
          : s.rol 
          ? [s.rol] 
          : ["auxiliar"],
        createdAt: s.created_at || s.createdAt || new Date().toISOString(),
      }));

      setStaff(formattedRows);
    } catch (err) {
      console.error("Error al obtener personal operativo:", err);
    } finally {
      if (isMounted) setStaffLoading(false);
    }
  }

  fetchStaffList();

  return () => {
    isMounted = false;
  };
}, [superTab]);

  // ── Monitor Global state ──
  const [monitorOrders] = useState(DEMO_GLOBAL_ORDERS);
  const [monitorDateFrom, setMonitorDateFrom] = useState("");
  const [monitorDateTo, setMonitorDateTo] = useState("");
  const [monitorStatus, setMonitorStatus] = useState("Todos");
  const [monitorSede, setMonitorSede] = useState("Todas");
  const [transactions, setTransactions] = useState<RemoteTransaction[]>([]);
  const [remoteOrders, setRemoteOrders] = useState<RemoteOrder[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const refreshTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const [nextTransactions, nextOrders] = await Promise.all([getRemoteTransactions(), getRemoteOrders()]);
      setTransactions(nextTransactions);
      setRemoteOrders(nextOrders);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar las transacciones.");
    } finally {
      setTransactionsLoading(false);
    }
  };

  React.useEffect(() => {
    if (superTab === "monitor") void refreshTransactions();
  }, [superTab]);

  const editTransaction = async (transaction: RemoteTransaction) => {
    const bank = window.prompt("Banco emisor", transaction.banco_emisor);
    if (bank === null) return;
    const reference = window.prompt("Referencia bancaria", transaction.referencia_bancaria);
    if (reference === null) return;
    try {
      const updated = await updateRemoteTransaction(transaction.id_transaccion, { banco_emisor: bank, referencia_bancaria: reference });
      setTransactions(current => current.map(item => item.id_transaccion === updated.id_transaccion ? updated : item));
      toast.success("Transacción actualizada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar la transacción.");
    }
  };

  const annulTransaction = async (transaction: RemoteTransaction) => {
    const reason = window.prompt("Motivo obligatorio de la anulación");
    if (!reason?.trim()) return;
    try {
      const updated = await annulRemoteTransaction(transaction.id_transaccion, reason);
      setTransactions(current => current.map(item => item.id_transaccion === updated.id_transaccion ? updated : item));
      toast.success("Transacción anulada; el historial fue conservado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo anular la transacción.");
    }
  };

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
  const [coupons, setCoupons] = useState<RemoteCoupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [couponSaving, setCouponSaving] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editCouponId, setEditCouponId] = useState<string | null>(null);
  const [couponForm, setCouponForm] = useState({ code: "", discount: 0, startDate: "", endDate: "", userEmail: "" });
  const [couponError, setCouponError] = useState("");
  const [couponFilter, setCouponFilter] = useState<"all" | "general" | "user">("all");

  const openNewCoupon = () => {
    setEditCouponId(null);
    setCouponForm({ code: "", discount: 0, startDate: "", endDate: "", userEmail: "" });
    setCouponError("");
    setShowCouponForm(true);
  };
  React.useEffect(() => {
    let cancelled = false;
    setCouponsLoading(true);
    getRemoteCoupons()
      .then(data => { if (!cancelled) setCoupons(data); })
      .catch(error => { if (!cancelled) toast.error(error instanceof Error ? error.message : "No se pudieron cargar los cupones."); })
      .finally(() => { if (!cancelled) setCouponsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const openEditCoupon = (c: RemoteCoupon) => {
    setEditCouponId(c.id);
    setCouponForm({ code: c.code, discount: c.discount, startDate: c.startDate, endDate: c.endDate, userEmail: c.userEmail ?? "" });
    setCouponError("");
    setShowCouponForm(true);
  };
  const saveCoupon = async () => {
    const today = new Date().toISOString().split("T")[0];
    const duplicateVigente = coupons.some(c =>
      c.code.toUpperCase() === couponForm.code.trim().toUpperCase() &&
      c.id !== editCouponId &&
      (!c.endDate || c.endDate >= today)
    );
    const validation = validateAdminCouponForm({
      code: couponForm.code,
      discount: couponForm.discount,
      startDate: couponForm.startDate,
      endDate: couponForm.endDate,
      userEmail: couponForm.userEmail.trim(),
      duplicateActive: duplicateVigente,
    });
    if (!validation.valid) {
      setCouponError(firstError(validation));
      return;
    }
    setCouponError("");
    const payload = {
      code: normalizeCouponCode(couponForm.code),
      discount: couponForm.discount,
      startDate: couponForm.startDate,
      endDate: couponForm.endDate,
      userEmail: couponForm.userEmail.trim().toLowerCase(),
    };
    setCouponSaving(true);
    try {
      if (editCouponId !== null) {
        const updated = await updateRemoteCoupon(editCouponId, payload);
        setCoupons(prev => prev.map(c => c.id === editCouponId ? updated : c));
        toast.success("Cupón actualizado.");
      } else {
        const created = await createRemoteCoupon(payload);
        setCoupons(prev => [created, ...prev]);
        toast.success("Cupón creado.");
      }
      setShowCouponForm(false);
    } catch (error) {
      setCouponError(error instanceof Error ? error.message : "No se pudo guardar el cupón.");
    } finally {
      setCouponSaving(false);
    }
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
    setProdFormError("");
    setShowProdForm(true);
  };

  const openNewProd = () => {
    setEditProd(null);
    setProdForm({ name: "", brand: "", barcode: "", category: "analgesicos", presentation: "", packSize: "", priceUSD: 0, stock: 1, discount: 0, needsRecipe: false, rating: 5, reviews: 0, bgColor: "#e8f5e9", accentColor: "#179150", description: "", activeIngredient: "", contraindications: "", posology: "", concentration: "", concentrationUnit: "mg" });
    setProdFormError("");
    setShowProdForm(true);
  };

  const saveProd = async () => {
    const validation = validateAdminProductForm({
      name: prodForm.name,
      activeIngredient: prodForm.activeIngredient,
      brand: prodForm.brand,
      presentation: prodForm.presentation,
      price: prodForm.priceUSD,
      discount: prodForm.discount,
      concentration: prodForm.concentration,
      units: prodForm.packSize,
    });
    if (!validation.valid) {
      setProdFormError(firstError(validation));
      return;
    }
    if (!editProd && !prodForm.barcode?.trim()) {
      setProdFormError("El código de barras es obligatorio para registrar el producto.");
      return;
    }
    setProdFormError("");
    setProdSaving(true);
    try {
      if (editProd?.backendId) {
        await updateInventoryPrice(editProd.backendId, BRANCH_IDS.principal, Number(prodForm.priceUSD ?? 0));
      } else {
        const producto = {
          principio_activo: prodForm.activeIngredient,
          marca_comercial: prodForm.brand,
          id_categoria: prodForm.category,
          forma_farmaceutica: prodForm.presentation,
          cantidad_presentacion: prodForm.packSize,
          descripcion: prodForm.description,
          imagen_producto: prodForm.imageUrl,
          relevancia: prodForm.rating,
          nivel_control: controlLevel(prodForm) === "ninguno" ? "Venta libre" : "Bajo receta",
          concentracion: [prodForm.concentration, prodForm.concentrationUnit].filter(Boolean).join(""),
          codigo_barras: prodForm.barcode,
        };
        const created = await createInventoryEntry<{ success: boolean; productoId: string }>(producto, BRANCH_IDS.principal);
        await updateInventoryPrice(created.data.productoId, BRANCH_IDS.principal, Number(prodForm.priceUSD ?? 0));
      }
      const refreshed = await getCatalogProducts(BRANCH_IDS.principal);
      setCatalogProducts(refreshed);
      setProducts(refreshed);
      setShowProdForm(false);
    } catch (error) {
      setProdFormError(error instanceof Error ? error.message : "No se pudo guardar el producto en Supabase.");
    } finally {
      setProdSaving(false);
    }
  };

  const toggleProdEnabled = (id: number) => {
    setCatalogProducts(prev => prev.map(p => p.id === id ? { ...p, enabled: p.enabled === false ? true : false } : p));
  };

  const saveStaff = async () => {
    setStaffFormError("");
    if (!staffForm.document.trim()) {
      setStaffFormError("El documento de identidad es obligatorio.");
      return;
    }
    setStaffSaving(true);
    try {
      const response = await findUserByDocument<BackendUserProfile | null>(staffForm.docType, staffForm.document.trim());
      if (!response.data) throw new Error("No existe un usuario registrado con ese documento.");
      const databaseRole = staffForm.role === "superadmin" ? "super_admin" : staffForm.role;
      await assignRole(response.data.id, databaseRole);
      const row: StaffRow = {
        id: response.data.id,
        name: response.data.nombre_completo,
        cedula: `${response.data.tipo_documento_identidad}-${response.data.documento_identidad}`,
        roles: [staffForm.role],
        createdAt: response.data.created_at,
      };
      setStaff((current) => [...current.filter((item) => item.id !== row.id), row]);
      setStaffForm({ docType: "V", document: "", role: "auxiliar" });
      setEditStaffId(null);
      setShowStaffForm(false);
    } catch (error) {
      setStaffFormError(error instanceof Error ? error.message : "No se pudo asignar el rol.");
    } finally {
      setStaffSaving(false);
    }
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
                <img src={logoPreview ?? logoFarmahumana} alt="Vista previa del logotipo" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) void uploadLogo(f);
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={logoSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#50e9f8] text-[#006064] rounded-xl text-sm hover:bg-[#2dd8e8] transition-colors"
                  style={H7}
                >
                  <Upload size={14} />
                  {logoSaving ? "Guardando..." : "Subir imagen"}
                </button>
                <p className="text-xs text-muted-foreground mt-2">Formatos: JPG, PNG. Tamaño recomendado: 240×80 px.</p>
              </div>
              {customLogoUrl && (
                <button
                  onClick={() => { void restoreLogo(); }}
                  disabled={logoSaving}
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
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl uppercase text-foreground" style={H9}>Banners del Carrusel Principal</h3>
                <p className="text-sm text-muted-foreground">Edita título, gradiente, imagen y texto de cada banner. Los cambios se reflejan en tiempo real.</p>
              </div>
              <button onClick={() => onNav("home")} className="flex items-center gap-2 rounded-xl border border-[#179150] px-4 py-2 text-sm font-semibold text-[#179150] transition-colors hover:bg-[#f0fdf7]">
                <Eye size={14} /> Ver página de inicio
              </button>
            </div>
            <div className="space-y-4 mb-4">
              {slides.map((s, i) => (
                <div key={i} className="border border-border rounded-2xl overflow-hidden">
                  {/* Preview */}
                  <div className="relative h-24 overflow-hidden" style={{ background: `linear-gradient(135deg, ${slideEditing === i && slideDraft ? slideDraft.from : s.from}, ${slideEditing === i && slideDraft ? slideDraft.via : s.via}, ${slideEditing === i && slideDraft ? slideDraft.to : s.to})` }}>
                    {(slideEditing === i && slideDraft ? slideDraft.img : s.img) && (
                      <img src={slideEditing === i && slideDraft ? slideDraft.img : s.img} alt={slideEditing === i && slideDraft ? slideDraft.title : s.title} className="absolute inset-0 w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute inset-0 flex items-center px-6 gap-4">
                      <div className="flex-1">
                        <div className="inline-block bg-[#50e9f8] text-[#006064] text-[9px] font-black px-2 py-0.5 rounded-full mb-1 uppercase" style={H9}>{slideEditing === i && slideDraft ? slideDraft.badge : s.badge}</div>
                        <div className="text-white text-xl uppercase leading-tight" style={H9}>{slideEditing === i && slideDraft ? slideDraft.title : s.title}</div>
                        <div className="text-white/70 text-xs mt-0.5 line-clamp-1">{slideEditing === i && slideDraft ? slideDraft.subtitle : s.subtitle}</div>
                      </div>
                      <div className="text-xs font-semibold text-white/80 bg-white/10 px-3 py-1 rounded-lg border border-white/20">{slideEditing === i && slideDraft ? slideDraft.cta : s.cta}</div>
                    </div>
                    <span className="absolute top-2 right-2 text-[10px] bg-black/30 text-white px-2 py-0.5 rounded-full font-semibold">Banner {i + 1}</span>
                  </div>
                  {/* Controls */}
                  <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{slideEditing === i && slideDraft ? slideDraft.img : s.img}</div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditSlide(i)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-xl hover:bg-muted transition-colors">
                        <Settings size={12} />Editar
                      </button>
                      <button onClick={() => { void removeSlide(i); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors">
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
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">URL pública de la imagen</label>
                        <div className="flex items-center gap-4">
                          {slideDraft.img && (
                            <img src={slideDraft.img} alt="Preview" className="w-24 h-14 object-cover rounded-xl border border-border flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <label className="mb-2 flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted">
                              <Upload size={14} /> {slideImageUploading ? "Cargando..." : "Subir archivo local"}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/avif"
                                className="hidden"
                                disabled={slideImageUploading}
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) void uploadSlideImage(file);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                            <input
                              type="url"
                              value={slideDraft.img}
                              onChange={e => {
                                if (slideUploadedPath) void deleteRemoteBannerImage(slideUploadedPath).catch(console.error);
                                setSlideUploadedPath(null);
                                setSlideDraft({ ...slideDraft, img: e.target.value });
                              }}
                              placeholder="https://..."
                              className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]"
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">Usa una URL HTTPS permanente. Recomendado: 900×500 px.</p>
                          </div>
                        </div>
                      </div>
                      <div className="sm:col-span-2 flex gap-2 pt-2">
                        <button onClick={() => { void saveSlide(); }} disabled={slideSaving || slideImageUploading}
                          className="flex-1 bg-[#179150] text-white py-2.5 rounded-xl text-sm font-black uppercase hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                          style={H7}>
                          <Check size={14} />Guardar cambios
                        </button>
                        <button onClick={() => { void cancelSlideEdit(i); }} disabled={slideImageUploading}
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
                  <div className="sm:col-span-2">
                    <label className={lbl}>Código de barras *</label>
                    <input className={inp} value={prodForm.barcode ?? ""} disabled={Boolean(editProd)} onChange={e => setProdForm(f => ({ ...f, barcode: e.target.value }))} placeholder="Ej: 7591000000007" />
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
                {prodFormError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm mt-4">
                    <AlertTriangle size={14} />{prodFormError}
                  </div>
                )}
                <div className="flex gap-3 mt-6">
                  <button onClick={saveProd} disabled={prodSaving} className="flex-1 py-3 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60" style={H7}>
                    {prodSaving ? "Guardando…" : editProd ? "Guardar precio" : "Crear producto"}
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
              <p className="text-sm text-muted-foreground">Usuarios consultados y actualizados durante esta sesión.</p>
            </div>
            <button
              onClick={() => { setStaffForm({ docType: "V", document: "", role: "auxiliar" }); setEditStaffId(null); setStaffFormError(""); setShowStaffForm(true); }}
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
                    {["Nombre completo", "Documento de identidad", "Rol", "Fecha de registro", ""].map(h => (
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
                    return (
                      <tr key={s.id} className="border-b border-border/50 hover:bg-[#f9fdfe] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 bg-gradient-to-br from-[#50e9f8] to-[#179150]" style={H9}>
                              {s.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </div>
                            <span className="font-semibold text-sm text-foreground">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{s.cedula}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${roleBadge(s.roles[0] ?? "")}`} style={H9}>{s.roles[0]}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString("es-VE")}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => { const [docType, document] = s.cedula.split("-"); setEditStaffId(s.id); setStaffForm({ docType: docType ?? "V", document: document ?? "", role: s.roles[0] ?? "auxiliar" }); setShowStaffForm(true); }}
                              className="p-1.5 hover:bg-[#50e9f8]/10 rounded-lg text-[#006064] transition-colors"
                              title="Editar asignación"
                            >
                              <Settings size={14} />
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
                    <label className={lbl}>Documento de identidad *</label>
                    <div className="flex gap-2"><select className={`${inp} max-w-20`} value={staffForm.docType} onChange={e => setStaffForm(f => ({ ...f, docType: e.target.value }))}><option>V</option><option>E</option><option>J</option></select>
                    <input className={inp} value={staffForm.document} onChange={e => setStaffForm(f => ({ ...f, document: e.target.value }))} placeholder="31275151" disabled={editStaffId !== null} /></div>
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
                  {staffFormError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
                      <AlertTriangle size={14} />{staffFormError}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={saveStaff} disabled={staffSaving} className="flex-1 py-3 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors font-black uppercase disabled:opacity-60" style={H7}>
                    {staffSaving ? "Guardando…" : editStaffId ? "Guardar rol" : "Asignar"}
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

          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h4 className="text-lg uppercase text-foreground" style={H9}>Pedidos reales</h4>
                <p className="text-xs text-muted-foreground">Incluye pedidos pendientes, completados y expirados.</p>
              </div>
              <button onClick={() => { void refreshTransactions(); }} className="rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">Actualizar</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#f0fdf7] border-b border-border">
                  {['Fecha', 'Pedido', 'Entrega', 'Productos', 'Total', 'Vence', 'Estado'].map(label => <th key={label} className="px-4 py-3 text-left text-xs uppercase text-muted-foreground" style={H9}>{label}</th>)}
                </tr></thead>
                <tbody>
                  {remoteOrders.map(order => (
                    <tr key={order.id_pedido} className="border-b border-border/50">
                      <td className="px-4 py-3 text-xs whitespace-nowrap">{new Date(order.fecha_creacion).toLocaleString('es-VE')}</td>
                      <td className="px-4 py-3 font-mono text-xs">{order.id_pedido.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-xs capitalize">{order.metodo_entrega}</td>
                      <td className="px-4 py-3 text-xs">{order.detalles_pedidos?.reduce((sum, detail) => sum + detail.cantidad, 0) ?? 0}</td>
                      <td className="px-4 py-3 font-bold text-[#179150]">{fmtUSD(Number(order.total_pedido))}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">{new Date(order.fecha_limite).toLocaleString('es-VE')}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${order.estado_pedido === 'completado' ? 'bg-green-100 text-green-700' : order.estado_pedido === 'expirado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{order.estado_pedido}</span>
                      </td>
                    </tr>
                  ))}
                  {!transactionsLoading && remoteOrders.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No hay pedidos registrados.</td></tr>}
                  {transactionsLoading && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">Consultando pedidos...</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h4 className="text-lg uppercase text-foreground" style={H9}>Transacciones reales</h4>
                <p className="text-xs text-muted-foreground">Los pagos se crean al confirmar un pedido. Anular conserva la evidencia contable.</p>
              </div>
              <button onClick={() => { void refreshTransactions(); }} className="rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">Actualizar</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#f0fdf7] border-b border-border">
                  {['Fecha', 'Pedido', 'Método', 'Banco', 'Referencia', 'Monto', 'Estado', 'Acciones'].map(label => <th key={label} className="px-4 py-3 text-left text-xs uppercase text-muted-foreground" style={H9}>{label}</th>)}
                </tr></thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id_transaccion} className="border-b border-border/50">
                      <td className="px-4 py-3 text-xs whitespace-nowrap">{new Date(transaction.fecha_confirmacion).toLocaleString('es-VE')}</td>
                      <td className="px-4 py-3 font-mono text-xs">{transaction.id_pedido.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-xs">{transaction.metodo_pago}</td>
                      <td className="px-4 py-3 text-xs">{transaction.banco_emisor}</td>
                      <td className="px-4 py-3 font-mono text-xs">{transaction.referencia_bancaria}</td>
                      <td className="px-4 py-3 font-bold text-[#179150]">{fmtUSD(Number(transaction.monto_confirmado_usd))}</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${transaction.estado_transaccion === 'confirmada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{transaction.estado_transaccion}</span></td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button onClick={() => { void editTransaction(transaction); }} className="mr-2 text-xs font-semibold text-[#006064] hover:underline">Editar</button>
                        {transaction.estado_transaccion === 'confirmada' && <button onClick={() => { void annulTransaction(transaction); }} className="text-xs font-semibold text-red-600 hover:underline">Anular</button>}
                      </td>
                    </tr>
                  ))}
                  {!transactionsLoading && transactions.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No hay transacciones registradas.</td></tr>}
                  {transactionsLoading && <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">Consultando transacciones…</td></tr>}
                </tbody>
              </table>
            </div>
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
                  {couponsLoading && (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">Cargando cupones...</td></tr>
                  )}
                  {!couponsLoading && filteredCoupons.map((c, i) => {
                    const today = new Date().toISOString().split("T")[0];
                    const vigente = !c.usedAt && c.startDate <= today && c.endDate >= today;
                    const status = c.usedAt ? "Usado" : vigente ? "Vigente" : "Vencido";
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
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${vigente ? "bg-[#e0f5eb] text-[#179150]" : c.usedAt ? "bg-[#50e9f8]/20 text-[#006064]" : "bg-gray-100 text-gray-500"}`} style={H9}>
                            {status}
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
                  {!couponsLoading && filteredCoupons.length === 0 && (
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
                  <button onClick={() => void saveCoupon()} disabled={!couponForm.code.trim() || couponSaving}
                    className={`flex-1 py-3 rounded-xl transition-colors font-black uppercase ${couponForm.code.trim() && !couponSaving ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                    style={H7}>
                    {couponSaving ? "Guardando..." : editCouponId ? "Guardar cambios" : "Crear cupón"}
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
