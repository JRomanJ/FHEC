import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Plus,
  Shield,
  Star,
  User,
  X,
} from "lucide-react";
import codigoQrUsuario from "../../../imports/codigoqr-usuario.jpg";
import { H7, H9 } from "../../../app/data";
import type { AuthUser, Page } from "../../../app/types";
import {
  getLegacyOrderHistoryViewModels,
  getLegacyProfileCouponViewModels,
  getLegacyProfileRefundViewModels,
} from "../../../services";
import {
  firstError,
  validateProfileEmail,
  validateProfileInfo,
  validateProfilePhone,
  validateRefundDestinationStep,
  validateRefundTransactionStep,
} from "../../../validation";
import { updateUser } from "../../../../src/services";

export interface ProfilePageProps {
  user: AuthUser;
  onNav: (p: Page) => void;
  onLogout: () => void;
  onUpdateUser?: (user: AuthUser) => void;
  demoOrders: ReturnType<typeof getLegacyOrderHistoryViewModels>;
  demoContact: Record<string, { phone: string; address: string }>;
  veAreas: string[];
  docTypes: string[];
}

export interface RefundRequest {
  id: string; method: string; bank: string; reference: string; amount: string; status: "Pendiente" | "En revisión" | "Aprobado" | "Rechazado";
}

export function ProfilePage({ user, onNav, onLogout, onUpdateUser, demoOrders, demoContact, veAreas, docTypes }: ProfilePageProps) {
  const mockContact = demoContact[user.email] ?? { phone: "", address: "" };
  const defaultContact = {
    phone: user.phone ? (user.phone.startsWith("+") ? user.phone : `${user.areaCode ?? ""}-${user.phone}`.replace(/^-/, "")) : mockContact.phone,
    address: user.address ?? mockContact.address,
  };
  // ── Personal info (no OTP needed) ──
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);
  const [name,       setName]       = useState(user.name);
  const [cedula,     setCedula]     = useState(user.cedula.replace(/^[A-Z]-?/, ""));
  const [profDocType, setProfDocType] = useState(user.cedula.split("-")[0] || "V");
  const [address,    setAddress]    = useState(defaultContact.address);
  const [savedMsg,   setSavedMsg]   = useState(false);

  useEffect(() => {
    setName(user.name);
    setCedula(user.cedula.replace(/^[A-Z]-?/, ""));
    setProfDocType(user.cedula.split("-")[0] || "V");
    setAddress(defaultContact.address);
  }, [user.id, user.name, user.cedula, user.address, defaultContact.address]);

  const handleSaveInfo = async () => {
    const validation = validateProfileInfo({ name, document: cedula });
    if (!validation.valid) {
      toast.error(firstError(validation));
      return;
    }
    
    setIsUpdating(true);
    try {
      const updatedUser = await updateUser(user.id, {
        name,
        documentType: profDocType,
        document: cedula,
        address
      });
      
      onUpdateUser?.(updatedUser);
      setEditingInfo(false);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch (error) {
      toast.error("Error al actualizar la información personal.");
      console.log(error)
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Email change with inline OTP ──
  const [editingEmail,   setEditingEmail]   = useState(false);
  const [currentEmail,   setCurrentEmail]   = useState(user.email);
  const [newEmail,       setNewEmail]       = useState("");
  const [emailOtpSent,   setEmailOtpSent]   = useState(false);
  const [emailOtpValue,  setEmailOtpValue]  = useState("");
  const [emailOtpError,  setEmailOtpError]  = useState("");

  useEffect(() => {
    setCurrentEmail(user.email);
    setCurrentPhone(defaultContact.phone);
  }, [user.email, user.phone, user.areaCode, defaultContact.phone]);

  const handleSendEmailOtp = () => {
    const validation = validateProfileEmail(newEmail);
    if (!validation.valid) {
      setEmailOtpError(firstError(validation));
      toast.error(firstError(validation));
      return;
    }
    setEmailOtpSent(true); setEmailOtpValue(""); setEmailOtpError("");
  };
  const handleVerifyEmailOtp = async () => {
    if (emailOtpValue.replace(/ /g,"") !== "123456") {
      setEmailOtpError("Código incorrecto. Prueba: 123456");
      return;
    }

    setIsUpdating(true);
    try {
      const updatedUser = await updateUser(user.id, { email: newEmail });
      onUpdateUser?.(updatedUser);
      setCurrentEmail(newEmail);
      setEditingEmail(false);
      setEmailOtpSent(false);
      setNewEmail("");
      setEmailOtpValue("");
      setEmailOtpError("");
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch (error) {
      toast.error("Error al actualizar el correo electrónico.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Phone change with inline OTP ──
  const [editingPhone,   setEditingPhone]   = useState(false);
  const [currentPhone,   setCurrentPhone]   = useState(defaultContact.phone);
  const [newPhoneArea,   setNewPhoneArea]   = useState("0414");
  const [newPhoneNum,    setNewPhoneNum]    = useState("");
  const [phoneOtpSent,   setPhoneOtpSent]   = useState(false);
  const [phoneOtpValue,  setPhoneOtpValue]  = useState("");
  const [phoneOtpError,  setPhoneOtpError]  = useState("");

  const handleSendPhoneOtp = () => {
    const validation = validateProfilePhone({ areaCode: newPhoneArea, phone: newPhoneNum });
    if (!validation.valid) {
      setPhoneOtpError(firstError(validation));
      toast.error(firstError(validation));
      return;
    }
    setPhoneOtpSent(true); setPhoneOtpValue(""); setPhoneOtpError("");
  };
  const handleVerifyPhoneOtp = async () => {
    if (phoneOtpValue.replace(/ /g,"") !== "123456") {
      setPhoneOtpError("Código incorrecto. Prueba: 123456");
      return;
    }

    setIsUpdating(true);
    try {
      const updatedUser = await updateUser(user.id, {
        areaCode: newPhoneArea,
        phone: newPhoneNum,
      });
      onUpdateUser?.(updatedUser);
      setCurrentPhone(`${newPhoneArea}-${newPhoneNum}`);
      setEditingPhone(false);
      setPhoneOtpSent(false);
      setNewPhoneNum("");
      setPhoneOtpValue("");
      setPhoneOtpError("");
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch (error) {
      toast.error("Error al actualizar el número de teléfono.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Notifications ──
  const [notifPromo,       setNotifPromo]       = useState(true);
  const [notifPromoSms,    setNotifPromoSms]    = useState(false);
  const [notifPromoEmail,  setNotifPromoEmail]  = useState(true);
  const [notifOrders,      setNotifOrders]      = useState(true);
  const [notifOrdersSms,   setNotifOrdersSms]   = useState(true);
  const [notifOrdersEmail, setNotifOrdersEmail] = useState(true);

  // ── Change password ──
  const [curPass,     setCurPass]     = useState("");
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCur,     setShowCur]     = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [passMsg,     setPassMsg]     = useState<{type:"ok"|"err"; text:string} | null>(null);

  const handlePassChange = () => {
    if (!curPass || newPass.length < 8 || newPass !== confirmPass) {
      setPassMsg({ type: "err", text: "Verifica los campos: la nueva contraseña debe tener al menos 8 caracteres y coincidir." });
      return;
    }
    setPassMsg({ type: "ok", text: "Contraseña actualizada correctamente." });
    setCurPass(""); setNewPass(""); setConfirmPass("");
    setTimeout(() => setPassMsg(null), 3000);
  };

  // ── Order history ──
  const [orderPage, setOrderPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const ordersPerPage = 5;
  const totalPages = Math.ceil(demoOrders.length / ordersPerPage);
  const paginatedOrders = demoOrders.slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage);

  const statusColor = (s: string) => {
    if (s === "Entregado") return "bg-[#179150] text-white";
    if (s === "Cancelado") return "bg-red-500 text-white";
    if (s === "En camino") return "bg-[#50e9f8] text-[#006064]";
    if (s === "Pendiente pago" || s === "Pendiente por pago") return "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30 !text-xs !px-3 !py-1 animate-pulse";
    return "bg-amber-400 text-[#006064]";
  };

  const fieldClass = `w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-all focus:outline-none
    ${editingInfo ? "border-[#50e9f8] bg-white focus:shadow-[0_0_0_3px_rgba(80,233,248,0.12)]" : "border-border bg-[#f8fafc] text-foreground cursor-default"}`;

  const userQrData = `FHEC-USER-${user.cedula}`;
  const [showQrModal, setShowQrModal] = useState(false);

  const isCliente = user.role === "cliente";
  const [profileTab, setProfileTab] = useState<"info" | "notifications" | "security" | "orders" | "refunds" | "coupons">("info");

  // Datos mock de cupones del cliente (solo lectura)
  const USER_COUPONS = getLegacyProfileCouponViewModels();

  // ── Refund requests ──
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>(getLegacyProfileRefundViewModels());
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundStep, setRefundStep]   = useState<1 | 2>(1);

  // Refund form — Paso 1 (transacción)
  const [rfMethod, setRfMethod]       = useState("Pago Móvil");
  const [rfBank, setRfBank]           = useState("");
  const [rfAreaCode, setRfAreaCode]   = useState("0414");
  const [rfPhone, setRfPhone]         = useState("");
  const [rfRef, setRfRef]             = useState("");
  const [rfAmount, setRfAmount]       = useState("");
  const [rfDate, setRfDate]           = useState("");

  // Refund form — Paso 2 (datos de reembolso)
  const [rbMethod, setRbMethod]       = useState("Pago Móvil");
  const [rbBank, setRbBank]           = useState("");
  const [rbAreaCode, setRbAreaCode]   = useState("0414");
  const [rbPhone, setRbPhone]         = useState("");
  const [rbDocType, setRbDocType]     = useState("V");
  const [rbDoc, setRbDoc]             = useState("");
  const [rbHolder, setRbHolder]       = useState("");
  const [rbAccount, setRbAccount]     = useState("");

  const openRefundModal = () => { setRefundStep(1); setShowRefundModal(true); };
  const closeRefundModal = () => { setShowRefundModal(false); setRefundStep(1); };

  const VENEZUELA_BANKS = [
    "Banco de Venezuela", "Banesco", "Mercantil", "BBVA Provincial", "Banco del Tesoro",
    "BNC", "Banplus", "Bicentenario", "Bancamiga", "Banco Exterior", "Otro",
  ];

  const handleSubmitRefund = () => {
    const validation = validateRefundDestinationStep({
      method: rbMethod,
      bank: rbBank,
      phoneArea: rbAreaCode,
      phone: rbPhone,
      document: rbDoc,
      holder: rbHolder,
      account: rbAccount,
    });
    if (!validation.valid) {
      toast.error(firstError(validation));
      return;
    }
    const newReq: RefundRequest = {
      id: `REM-${String(refundRequests.length + 1).padStart(3, "0")}`,
      method: rfMethod, bank: rfBank, reference: rfRef,
      amount: rfAmount ? `$${rfAmount}` : "—", status: "Pendiente",
    };
    setRefundRequests(prev => [newReq, ...prev]);
    closeRefundModal();
    setRfMethod("Pago Móvil"); setRfBank(""); setRfAreaCode("0414"); setRfPhone("");
    setRfRef(""); setRfAmount(""); setRfDate("");
    setRbMethod("Pago Móvil"); setRbBank(""); setRbAreaCode("0414"); setRbPhone("");
    setRbDocType("V"); setRbDoc(""); setRbHolder(""); setRbAccount("");
    toast.success("Solicitud enviada", { description: "Tu solicitud de reembolso fue enviada correctamente." });
  };

  const refundStatusColor = (s: string) => {
    if (s === "Aprobado") return "bg-[#179150] text-white";
    if (s === "Rechazado") return "bg-red-500 text-white";
    if (s === "En revisión") return "bg-[#50e9f8] text-[#006064]";
    return "bg-amber-400 text-[#006064]";
  };

  return (
    <div className="min-h-screen bg-[#f0fdf7]">
      {/* Dashboard header */}
      <div className="px-4 lg:px-8 py-5" style={{ background: "linear-gradient(135deg, #006064 0%, #179150 100%)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#50e9f8] flex items-center justify-center flex-shrink-0 shadow-lg">
              <User size={26} className="text-[#006064]" />
            </div>
            <div>
              <div className="text-white/60 text-[10px] uppercase tracking-widest font-semibold">Mi Perfil</div>
              <div className="text-white text-2xl uppercase leading-none" style={H9}>{user.name}</div>
              <div className="text-white/60 text-xs mt-0.5">{user.email} · {user.cedula}</div>
            </div>
          </div>
          <button onClick={() => onNav("home")} className="hidden sm:flex items-center gap-1.5 text-white/60 hover:text-white text-xs transition-colors"><ArrowLeft size={13} /> Inicio</button>
        </div>
      </div>



      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {savedMsg && (
          <div className="flex items-center gap-2 bg-[#179150]/10 border border-[#179150]/30 rounded-xl px-4 py-3 text-[#179150] text-sm font-semibold mb-4">
            <CheckCircle size={15} /> Información guardada correctamente.
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* QR fullscreen modal */}
            {showQrModal && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-6" onClick={() => setShowQrModal(false)}>
                <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center max-w-sm w-full" onClick={e => e.stopPropagation()}>
                  <div className="text-xs font-black uppercase text-muted-foreground mb-4" style={H9}>Código QR · ID de Usuario</div>
                  <div className="bg-white border-4 border-[#50e9f8] rounded-2xl p-4 shadow-md mb-4">
                    <img src={codigoQrUsuario} alt="Código QR" className="w-64 h-64 object-contain" />
                  </div>
                  <div className="text-base font-black text-foreground text-center mb-1" style={H9}>{userQrData}</div>
                  <div className="text-xs text-muted-foreground text-center mb-5">Presenta este QR en farmacia para identificarte</div>
                  <button onClick={() => setShowQrModal(false)} className="w-full py-3 bg-[#006064] text-white rounded-xl font-black uppercase hover:bg-[#004d52] transition-colors" style={H7}>Cerrar</button>
                </div>
              </div>
            )}

            {/* QR Card */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-5 flex flex-col items-center">
              <div className="text-xs font-black uppercase text-muted-foreground mb-3" style={H9}>Código QR · ID de Usuario</div>
              <button onClick={() => setShowQrModal(true)} className="bg-white border-4 border-[#50e9f8] rounded-2xl p-3 shadow-md mb-3 hover:border-[#179150] transition-colors cursor-zoom-in" title="Clic para ampliar">
                <img src={codigoQrUsuario} alt="Código QR de usuario" className="w-52 h-52 object-contain" />
              </button>
              <div className="text-sm font-black text-foreground text-center" style={H9}>{userQrData}</div>
              <div className="text-xs text-muted-foreground mt-1 text-center">Toca para ampliar · Presenta en farmacia</div>
            </div>

            {/* Nav tabs */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              {([
                { id: "info",          label: "Información Personal",   icon: <User size={15} />,          show: true },
                { id: "notifications", label: "Notificaciones",         icon: <Bell size={15} />,           show: true },
                { id: "security",      label: "Seguridad",              icon: <Shield size={15} />,        show: true },
                { id: "orders",        label: "Historial de Pedidos",   icon: <ClipboardList size={15} />, show: true },
                { id: "refunds",       label: "Solicitudes de Reembolso", icon: <CreditCard size={15} />,  show: true },
                { id: "coupons",       label: "Cupones",                  icon: <Star size={15} />,          show: true },
              ] as const).filter(tab => tab.show).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setProfileTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-colors border-b border-border last:border-0
                    ${profileTab === tab.id ? "bg-[#e0f5eb] text-[#006064] font-black" : "text-muted-foreground hover:bg-muted"}`}
                  style={H9}
                >
                  <span className={profileTab === tab.id ? "text-[#006064]" : "text-muted-foreground"}>{tab.icon}</span>
                  {tab.label}
                  {profileTab === tab.id && <ChevronRight size={13} className="ml-auto text-[#006064]" />}
                </button>
              ))}
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                onLogout();
                toast.success("Sesión cerrada", { description: "Has salido de tu cuenta correctamente.", icon: "👋" });
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl hover:bg-red-100 transition-colors text-sm font-black uppercase"
              style={H7}
            >
              <LogOut size={15} /> Cerrar Sesión
            </button>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-2 min-w-0">
            {/* Personal Info tab */}
            {profileTab === "info" && (
              <div className="space-y-4">

                {/* ── Personal data card ── */}
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg uppercase text-foreground" style={H9}>Datos Personales</h2>
                    {editingInfo ? (
                      <div className="flex gap-2">
                        <button onClick={() => setEditingInfo(false)} className="px-3 py-1.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors">Cancelar</button>
                        <button 
                          onClick={handleSaveInfo} 
                          disabled={isUpdating}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-colors flex items-center gap-1.5 ${isUpdating ? "bg-gray-400" : "bg-[#179150] hover:bg-green-700"} text-white`} 
                          style={H7}
                        >
                          <Check size={12} /> {isUpdating ? "Guardando..." : "Guardar"}
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingInfo(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#50e9f8] text-[#006064] bg-[#e0f5eb] rounded-xl text-xs font-black uppercase hover:bg-[#50e9f8]/20 transition-colors" style={H9}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Editar
                      </button>
                    )}
                  </div>
                  <div className="p-6 grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Nombre Completo</label>
                      <div className="relative"><User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={name} onChange={e => setName(e.target.value)} readOnly={!editingInfo} className={fieldClass} /></div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Tipo de documento</label>
                      <select value={profDocType} onChange={e => setProfDocType(e.target.value)} disabled={!editingInfo} className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-[#179150] ${editingInfo ? "border-[#50e9f8] bg-white" : "border-border bg-[#f8fafc] opacity-70"}`}>
                        {docTypes.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Número de documento</label>
                      <div className="relative"><FileText size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={cedula} onChange={e => setCedula(e.target.value)} readOnly={!editingInfo} placeholder="12345678" className={fieldClass} /></div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Dirección Fiscal</label>
                      <div className="relative"><MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={address} onChange={e => setAddress(e.target.value)} readOnly={!editingInfo} className={fieldClass} /></div>
                    </div>
                  </div>
                </div>

                {/* ── Email OTP modal ── */}
                {emailOtpSent && (
                  <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
                      <div className="w-14 h-14 rounded-full bg-[#50e9f8]/15 flex items-center justify-center mx-auto mb-4">
                        <Mail size={26} className="text-[#179150]" />
                      </div>
                      <h3 className="text-2xl uppercase text-foreground text-center mb-1" style={H9}>Verifica tu correo</h3>
                      <p className="text-sm text-muted-foreground text-center mb-1 leading-relaxed">Enviamos un código de 6 dígitos a:</p>
                      <p className="text-sm font-black text-[#179150] text-center mb-5 truncate">{newEmail}</p>
                      <div className="flex gap-2 justify-center mb-2">
                        {[0,1,2,3,4,5].map(i => (
                          <input key={i} type="text" inputMode="numeric" maxLength={1}
                            value={emailOtpValue[i] ?? ""}
                            id={`prof-email-otp-${i}`}
                            onChange={e => {
                              const d = e.target.value.replace(/\D/g,"").slice(-1);
                              const arr = emailOtpValue.padEnd(6," ").split(""); arr[i] = d;
                              setEmailOtpValue(arr.join("").trimEnd());
                              if (d) document.querySelector<HTMLInputElement>(`#prof-email-otp-${i+1}`)?.focus();
                            }}
                            onKeyDown={e => { if (e.key==="Backspace" && !emailOtpValue[i] && i>0) document.querySelector<HTMLInputElement>(`#prof-email-otp-${i-1}`)?.focus(); }}
                            className={`w-11 h-14 text-center text-xl font-black border-2 rounded-xl focus:outline-none transition-all
                              ${emailOtpValue[i] ? "border-[#179150] bg-[#179150]/5 text-[#179150]" : "border-gray-300 bg-white"}
                              focus:border-[#179150] focus:shadow-[0_0_0_3px_rgba(80,233,248,0.15)]`} style={H9} />
                        ))}
                      </div>
                      {emailOtpError && <p className="text-red-600 text-xs text-center mb-2 flex items-center justify-center gap-1"><AlertTriangle size={11}/>{emailOtpError}</p>}
                      <button onClick={handleVerifyEmailOtp} disabled={emailOtpValue.replace(/ /g,"").length < 6}
                        className={`w-full py-3 rounded-xl uppercase transition-colors mb-3 mt-3 ${emailOtpValue.replace(/ /g,"").length >= 6 ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`} style={H7}>
                        Verificar código
                      </button>
                      <button onClick={() => { setEditingEmail(false); setEmailOtpSent(false); setEmailOtpValue(""); }} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
                      <p className="text-xs text-muted-foreground text-center mt-3">Demo: el código es <strong>123456</strong></p>
                    </div>
                  </div>
                )}

                {/* ── Phone OTP modal ── */}
                {phoneOtpSent && (
                  <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
                      <div className="w-14 h-14 rounded-full bg-[#50e9f8]/15 flex items-center justify-center mx-auto mb-4">
                        <Phone size={26} className="text-[#179150]" />
                      </div>
                      <h3 className="text-2xl uppercase text-foreground text-center mb-1" style={H9}>Verifica tu teléfono</h3>
                      <p className="text-sm text-muted-foreground text-center mb-1 leading-relaxed">Enviamos un código de 6 dígitos a:</p>
                      <p className="text-sm font-black text-[#179150] text-center mb-5">{newPhoneArea}-{newPhoneNum}</p>
                      <div className="flex gap-2 justify-center mb-2">
                        {[0,1,2,3,4,5].map(i => (
                          <input key={i} type="text" inputMode="numeric" maxLength={1}
                            value={phoneOtpValue[i] ?? ""}
                            id={`prof-phone-otp-${i}`}
                            onChange={e => {
                              const d = e.target.value.replace(/\D/g,"").slice(-1);
                              const arr = phoneOtpValue.padEnd(6," ").split(""); arr[i] = d;
                              setPhoneOtpValue(arr.join("").trimEnd());
                              if (d) document.querySelector<HTMLInputElement>(`#prof-phone-otp-${i+1}`)?.focus();
                            }}
                            onKeyDown={e => { if (e.key==="Backspace" && !phoneOtpValue[i] && i>0) document.querySelector<HTMLInputElement>(`#prof-phone-otp-${i-1}`)?.focus(); }}
                            className={`w-11 h-14 text-center text-xl font-black border-2 rounded-xl focus:outline-none transition-all
                              ${phoneOtpValue[i] ? "border-[#179150] bg-[#179150]/5 text-[#179150]" : "border-gray-300 bg-white"}
                              focus:border-[#179150] focus:shadow-[0_0_0_3px_rgba(80,233,248,0.15)]`} style={H9} />
                        ))}
                      </div>
                      {phoneOtpError && <p className="text-red-600 text-xs text-center mb-2 flex items-center justify-center gap-1"><AlertTriangle size={11}/>{phoneOtpError}</p>}
                      <button onClick={handleVerifyPhoneOtp} disabled={phoneOtpValue.replace(/ /g,"").length < 6}
                        className={`w-full py-3 rounded-xl uppercase transition-colors mb-3 mt-3 ${phoneOtpValue.replace(/ /g,"").length >= 6 ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`} style={H7}>
                        Verificar código
                      </button>
                      <button onClick={() => { setEditingPhone(false); setPhoneOtpSent(false); setPhoneOtpValue(""); }} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
                      <p className="text-xs text-muted-foreground text-center mt-3">Demo: el código es <strong>123456</strong></p>
                    </div>
                  </div>
                )}

                {/* ── Email card — editable field style ── */}
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-[#179150]" />
                      <h2 className="text-lg uppercase text-foreground" style={H9}>Correo Electrónico</h2>
                    </div>
                    {editingEmail ? (
                      <div className="flex gap-2">
                        <button onClick={() => setEditingEmail(false)} className="px-3 py-1.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors">Cancelar</button>
                        <button onClick={handleSendEmailOtp} disabled={!newEmail.includes("@")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-colors flex items-center gap-1.5 ${newEmail.includes("@") ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`} style={H7}>
                          <Check size={12} /> Guardar
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingEmail(true); setNewEmail(currentEmail); setEmailOtpValue(""); setEmailOtpError(""); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#50e9f8] text-[#006064] bg-[#e0f5eb] rounded-xl text-xs font-black uppercase hover:bg-[#50e9f8]/20 transition-colors" style={H9}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Editar
                      </button>
                    )}
                  </div>
                  <div className="p-6">
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Correo electrónico</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input value={editingEmail ? newEmail : currentEmail} onChange={e => setNewEmail(e.target.value)} type="email" readOnly={!editingEmail}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-all focus:outline-none
                            ${editingEmail ? "border-[#50e9f8] bg-white focus:shadow-[0_0_0_3px_rgba(80,233,248,0.12)]" : "border-border bg-[#f8fafc] text-foreground cursor-default"}`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Phone card — editable field style ── */}
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-[#179150]" />
                      <h2 className="text-lg uppercase text-foreground" style={H9}>Número de Teléfono</h2>
                    </div>
                    {editingPhone ? (
                      <div className="flex gap-2">
                        <button onClick={() => setEditingPhone(false)} className="px-3 py-1.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors">Cancelar</button>
                        <button onClick={handleSendPhoneOtp} disabled={newPhoneNum.length < 7}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-colors flex items-center gap-1.5 ${newPhoneNum.length >= 7 ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`} style={H7}>
                          <Check size={12} /> Guardar
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingPhone(true); setPhoneOtpValue(""); setPhoneOtpError(""); const parts = currentPhone.replace(/^\+58\s?/,"").split("-"); setNewPhoneArea(veAreas.find(a => a === parts[0]) ?? "0414"); setNewPhoneNum(parts.slice(1).join("-")); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#50e9f8] text-[#006064] bg-[#e0f5eb] rounded-xl text-xs font-black uppercase hover:bg-[#50e9f8]/20 transition-colors" style={H9}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Editar
                      </button>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-3 items-end">
                      <div>
                        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Cód. área</label>
                        <select value={editingPhone ? newPhoneArea : currentPhone.split("-")[0]?.replace(/^\+58\s?/,"") || "0414"}
                          onChange={e => setNewPhoneArea(e.target.value)} disabled={!editingPhone}
                          className={`w-full pl-3 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none bg-[position:right_1.25rem_center] ${editingPhone ? "border-[#50e9f8] bg-white focus:border-[#179150]" : "border-border bg-[#f8fafc] opacity-70"}`}>
                          {veAreas.map(a => <option key={a}>{a}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Número telefónico</label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input value={editingPhone ? newPhoneNum : currentPhone.split("-").slice(1).join("-")} onChange={e => setNewPhoneNum(e.target.value)}
                            type="tel" placeholder="000-0000" readOnly={!editingPhone}
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-all focus:outline-none
                              ${editingPhone ? "border-[#50e9f8] bg-white focus:shadow-[0_0_0_3px_rgba(80,233,248,0.12)]" : "border-border bg-[#f8fafc] text-foreground cursor-default"}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Notifications tab */}
            {profileTab === "notifications" && (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-lg uppercase text-foreground" style={H9}>Notificaciones</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Administra cómo y cuándo quieres recibir notificaciones.</p>
                </div>
                <div className="p-6 space-y-6">

                  {/* Promocionales */}
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-[#006064] mb-3" style={H9}>Notificaciones Promocionales</div>
                    <div className="space-y-3">
                      {([
                        { label: "Activar notificaciones promocionales", sub: "Recibe alertas sobre ofertas y descuentos", value: notifPromo, set: setNotifPromo },
                        { label: "Promociones por SMS", sub: "Mensajes de texto con ofertas especiales", value: notifPromoSms, set: setNotifPromoSms },
                        { label: "Promociones por correo", sub: "Boletín de ofertas enviado a tu email", value: notifPromoEmail, set: setNotifPromoEmail },
                      ] as { label: string; sub: string; value: boolean; set: (v: boolean) => void }[]).map(item => (
                        <div key={item.label} className="flex items-center justify-between gap-4 bg-muted rounded-xl px-4 py-3">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-foreground">{item.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{item.sub}</div>
                          </div>
                          <button
                            onClick={() => item.set(!item.value)}
                            className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${item.value ? "bg-[#179150]" : "bg-gray-300"}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${item.value ? "translate-x-5" : "translate-x-0"}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Generales */}
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-[#006064] mb-3" style={H9}>Notificaciones Generales de Pedidos</div>
                    <div className="space-y-3">
                      {([
                        { label: "Activar notificaciones de pedidos", sub: "Estado de tu pedido en tiempo real", value: notifOrders, set: setNotifOrders },
                        { label: "Notificaciones de pedidos por SMS", sub: "Alertas de pedido por mensaje de texto", value: notifOrdersSms, set: setNotifOrdersSms },
                        { label: "Notificaciones de pedidos por correo", sub: "Confirmaciones y actualizaciones por email", value: notifOrdersEmail, set: setNotifOrdersEmail },
                      ] as { label: string; sub: string; value: boolean; set: (v: boolean) => void }[]).map(item => (
                        <div key={item.label} className="flex items-center justify-between gap-4 bg-muted rounded-xl px-4 py-3">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-foreground">{item.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{item.sub}</div>
                          </div>
                          <button
                            onClick={() => item.set(!item.value)}
                            className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${item.value ? "bg-[#179150]" : "bg-gray-300"}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${item.value ? "translate-x-5" : "translate-x-0"}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Security tab */}
            {profileTab === "security" && (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                  <div className="w-8 h-8 rounded-full bg-[#179150]/10 flex items-center justify-center flex-shrink-0"><Shield size={15} className="text-[#179150]" /></div>
                  <h2 className="text-lg uppercase text-foreground" style={H9}>Cambiar Contraseña</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Contraseña Actual</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type={showCur ? "text" : "password"} value={curPass} onChange={e => setCurPass(e.target.value)} placeholder="Ingresa tu contraseña actual" className="w-full pl-10 pr-10 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white" />
                      <button type="button" onClick={() => setShowCur(v=>!v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">{showCur ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Nueva Contraseña</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input type={showNew ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Mínimo 8 caracteres" className="w-full pl-10 pr-10 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] bg-white" />
                        <button type="button" onClick={() => setShowNew(v=>!v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">{showNew ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Confirmar Nueva</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input type={showNew ? "text" : "password"} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Repite la nueva contraseña" className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none bg-white ${confirmPass && confirmPass !== newPass ? "border-red-400" : "border-border focus:border-[#179150]"}`} />
                      </div>
                    </div>
                  </div>
                  {passMsg && (
                    <div className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-xl border ${passMsg.type === "ok" ? "text-[#179150] bg-[#179150]/8 border-[#179150]/25" : "text-red-600 bg-red-50 border-red-200"}`}>
                      {passMsg.type === "ok" ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}{passMsg.text}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button onClick={handlePassChange} className="flex items-center gap-2 bg-[#179150] text-white px-6 py-2.5 rounded-xl uppercase font-black hover:bg-green-700 transition-colors" style={H7}><Shield size={14} /> Actualizar Contraseña</button>
                  </div>
                </div>
              </div>
            )}

            {/* Orders tab */}
            {profileTab === "orders" && (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-lg uppercase text-foreground" style={H9}>Historial de Pedidos</h2>
                  <span className="text-xs text-muted-foreground">Pág. {orderPage}/{totalPages}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        {["ID Pedido", "Fecha", "Estado", "Ítems", "Total", ""].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap" style={H9}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map((order, i) => (
                        <React.Fragment key={order.id}>
                          <tr className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                            <td className="px-4 py-3 text-[#179150] font-black text-xs whitespace-nowrap" style={H9}>{order.id}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{order.date}</td>
                            <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusColor(order.status)}`} style={H9}>{order.status}</span></td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">{order.items}</td>
                            <td className="px-4 py-3">
                              <div className="text-foreground text-xs font-semibold">Bs. {order.totalBs.toFixed(2)}</div>
                              <div className="text-muted-foreground text-[10px]">${order.totalUsd.toFixed(2)}</div>
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} className="text-[#179150] text-xs font-semibold flex items-center gap-1 hover:underline">
                                {expandedOrder === order.id ? "Ocultar" : "Detalles"}
                                <ChevronDown size={11} className={`transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`} />
                              </button>
                            </td>
                          </tr>
                          {expandedOrder === order.id && (
                            <tr className="bg-[#f8fafc] border-b border-border">
                              <td colSpan={6} className="px-4 py-3">
                                <div className="space-y-1 mb-2">
                                  {order.products.map((prod, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-foreground">
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#179150]" />{prod}
                                    </div>
                                  ))}
                                </div>
                                {order.status === "En curso" && (
                                  <button onClick={() => onNav("tracking")} className="px-3 py-1.5 bg-[#50e9f8] text-[#006064] rounded-lg text-xs uppercase hover:bg-[#2dd8e8] transition-colors flex items-center gap-1">
                                    <Package size={11} /> Ver seguimiento
                                  </button>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="px-6 py-3 border-t border-border flex items-center justify-between">
                    <button onClick={() => setOrderPage(p => Math.max(1, p-1))} disabled={orderPage===1} className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-30"><ChevronLeft size={12} /> Anterior</button>
                    <span className="text-xs text-muted-foreground">Página {orderPage} de {totalPages}</span>
                    <button onClick={() => setOrderPage(p => Math.min(totalPages, p+1))} disabled={orderPage===totalPages} className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-30">Siguiente <ChevronRight size={12} /></button>
                  </div>
                )}
              </div>
            )}
            {/* Refunds tab */}
            {profileTab === "refunds" && (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-lg uppercase text-foreground" style={H9}>Solicitudes de Reembolso</h2>
                  <button
                    onClick={openRefundModal}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#179150] text-white rounded-xl text-xs font-black uppercase hover:bg-green-700 transition-colors"
                    style={H7}
                  >
                    <Plus size={13} /> Nueva solicitud de reembolso
                  </button>
                </div>
                {refundRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <CreditCard size={36} className="mb-3 opacity-30" />
                    <p className="text-sm">No tienes solicitudes de reembolso aún.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          {["Método", "Banco emisor", "Referencia", "Monto", "Estado"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap" style={H9}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {refundRequests.map((req, i) => (
                          <tr key={req.id} className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                            <td className="px-4 py-3 text-foreground text-xs font-semibold whitespace-nowrap">{req.method}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{req.bank}</td>
                            <td className="px-4 py-3 text-[#179150] font-black text-xs whitespace-nowrap" style={H9}>{req.reference}</td>
                            <td className="px-4 py-3 text-foreground text-xs font-semibold whitespace-nowrap">{req.amount}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${refundStatusColor(req.status)}`} style={H9}>{req.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Cupones tab */}
            {profileTab === "coupons" && (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-lg uppercase text-foreground" style={H9}>Mis Cupones</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Cupones disponibles y utilizados en tus pedidos.</p>
                </div>
                {USER_COUPONS.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Star size={36} className="mb-3 opacity-30" />
                    <p className="text-sm">No tienes cupones asignados aún.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          {["Código", "Descuento", "Creado", "Vence", "Pedido", "Estado"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground" style={H9}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {USER_COUPONS.map((c, i) => (
                          <tr key={c.code} className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                            <td className="px-4 py-3">
                              <span className="font-mono text-xs font-black text-[#006064] bg-[#e0f5eb] px-2 py-0.5 rounded-lg tracking-widest" style={H9}>{c.code}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700" style={H9}>{c.discount}% OFF</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{c.createdAt}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{c.expiresAt}</td>
                            <td className="px-4 py-3 text-xs">
                              {c.usedOnOrder
                                ? <span className="text-[#179150] font-black" style={H9}>{c.usedOnOrder}</span>
                                : <span className="text-muted-foreground">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                c.status === "vigente" ? "bg-[#e0f5eb] text-[#179150]" :
                                c.status === "usado"   ? "bg-[#50e9f8]/20 text-[#006064]" :
                                "bg-gray-100 text-gray-500"
                              }`} style={H9}>
                                {c.status === "vigente" ? "Vigente" : c.status === "usado" ? "Usado" : "Vencido"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Refund Modal ── */}
      {showRefundModal && (() => {
        const fld = "w-full px-3 py-2.5 border border-[#50e9f8] bg-white rounded-xl text-sm focus:outline-none focus:border-[#179150]";
        const fld2 = "w-full px-3 py-2.5 border border-[#90caf9] bg-white rounded-xl text-sm focus:outline-none focus:border-[#006064]";
        const lbl = "text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block";
        const step1Validation = validateRefundTransactionStep({
          method: rfMethod,
          bank: rfBank,
          phoneArea: rfAreaCode,
          phone: rfPhone,
          reference: rfRef,
          amount: rfAmount,
          date: rfDate,
        });
        const step2Validation = validateRefundDestinationStep({
          method: rbMethod,
          bank: rbBank,
          phoneArea: rbAreaCode,
          phone: rbPhone,
          document: rbDoc,
          holder: rbHolder,
          account: rbAccount,
        });
        const step1Valid = step1Validation.valid;
        const step2Valid = step2Validation.valid;
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400] flex items-center justify-center p-4" onClick={closeRefundModal}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

              {/* Header fijo */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10 rounded-t-3xl">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#179150]" style={H9}>Farmahumana · FHEC</div>
                  <h2 className="text-lg uppercase text-foreground leading-none mt-0.5" style={H9}>Solicitud de Reembolso</h2>
                </div>
                <button onClick={closeRefundModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">
                  <X size={16} />
                </button>
              </div>

              {/* Indicador de pasos */}
              <div className="flex items-center gap-2 px-6 pt-5 pb-1">
                {[1, 2].map(n => (
                  <React.Fragment key={n}>
                    <div className={`flex items-center gap-1.5 ${refundStep >= n ? "text-[#179150]" : "text-muted-foreground"}`}>
                      <div className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${refundStep > n ? "bg-[#179150] text-white" : refundStep === n ? "bg-[#179150] text-white" : "bg-muted text-muted-foreground"}`} style={H9}>
                        {refundStep > n ? <Check size={12} /> : n}
                      </div>
                      <span className="text-xs font-semibold hidden sm:block">
                        {n === 1 ? "Transacción realizada" : "Datos para reembolso"}
                      </span>
                    </div>
                    {n < 2 && <div className={`flex-1 h-0.5 rounded-full ${refundStep > 1 ? "bg-[#179150]" : "bg-muted"}`} />}
                  </React.Fragment>
                ))}
              </div>

              <div className="p-6 space-y-4">

                {/* ─── PASO 1 ─── */}
                {refundStep === 1 && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-[#179150] text-white text-[10px] font-black flex items-center justify-center" style={H9}>1</div>
                      <h3 className="text-sm uppercase text-[#006064] font-black" style={H9}>Datos de la transacción realizada</h3>
                    </div>

                    {/* Selector de método — visual tipo radio */}
                    <div>
                      <label className={lbl}>Método de pago realizado</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Pago Móvil", "Transferencia"].map(m => (
                          <button key={m} type="button" onClick={() => setRfMethod(m)}
                            className={`py-2.5 rounded-xl border-2 text-sm font-black uppercase transition-all ${rfMethod === m ? "border-[#179150] bg-[#e0f5eb] text-[#006064]" : "border-border text-muted-foreground hover:border-[#179150]/50"}`}
                            style={H9}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Banco emisor — siempre */}
                    <div>
                      <label className={lbl}>Banco emisor</label>
                      <select value={rfBank} onChange={e => setRfBank(e.target.value)} className={fld}>
                        <option value="">Seleccionar banco…</option>
                        {VENEZUELA_BANKS.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>

                    {/* Campos condicionales según método */}
                    {rfMethod === "Pago Móvil" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={lbl}>Código de área</label>
                          <select value={rfAreaCode} onChange={e => setRfAreaCode(e.target.value)} className={fld}>
                            {veAreas.map(a => <option key={a}>{a}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={lbl}>Número telefónico</label>
                          <input value={rfPhone} onChange={e => setRfPhone(e.target.value)} type="tel" placeholder="000-0000" className={fld} />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={lbl}>Monto ($)</label>
                        <input value={rfAmount} onChange={e => setRfAmount(e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" className={fld} />
                      </div>
                      <div>
                        <label className={lbl}>Referencia bancaria</label>
                        <input value={rfRef} onChange={e => setRfRef(e.target.value)} placeholder="Nº referencia" className={fld} />
                      </div>
                    </div>

                    <div className="max-w-[200px] sm:max-w-full">
                      <label className={lbl}>Fecha de la transacción</label>
                      <input value={rfDate} onChange={e => setRfDate(e.target.value)} type="date" className={fld} />
                    </div>

                    <button
                      onClick={() => { if (step1Valid) setRefundStep(2); }}
                      disabled={!step1Valid}
                      className={`w-full py-3 rounded-xl text-sm font-black uppercase transition-colors mt-2 ${step1Valid ? "bg-[#50e9f8] text-[#006064] hover:bg-[#2dd8e8]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                      style={H7}
                    >
                      Continuar →
                    </button>
                  </>
                )}

                {/* ─── PASO 2 ─── */}
                {refundStep === 2 && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-[#006064] text-white text-[10px] font-black flex items-center justify-center" style={H9}>2</div>
                      <h3 className="text-sm uppercase text-[#006064] font-black" style={H9}>Datos bancarios para el reembolso</h3>
                    </div>

                    {/* Resumen paso 1 */}
                    <div className="bg-[#f0fdf7] border border-[#a7f3d0] rounded-xl px-4 py-3 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{rfMethod}</span> · {rfBank} · <span className="font-semibold text-[#179150]">${rfAmount}</span>
                      </div>
                      <button onClick={() => setRefundStep(1)} className="text-xs text-[#179150] hover:underline font-semibold flex items-center gap-1">
                        <ArrowLeft size={11} /> Editar
                      </button>
                    </div>

                    {/* Selector de método de reembolso */}
                    <div>
                      <label className={lbl}>Método de reembolso</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Pago Móvil", "Transferencia"].map(m => (
                          <button key={m} type="button" onClick={() => setRbMethod(m)}
                            className={`py-2.5 rounded-xl border-2 text-sm font-black uppercase transition-all ${rbMethod === m ? "border-[#006064] bg-[#e3f2fd] text-[#006064]" : "border-border text-muted-foreground hover:border-[#006064]/50"}`}
                            style={H9}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Banco receptor — siempre */}
                    <div>
                      <label className={lbl}>Banco receptor</label>
                      <select value={rbBank} onChange={e => setRbBank(e.target.value)} className={fld2}>
                        <option value="">Seleccionar banco…</option>
                        {VENEZUELA_BANKS.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>

                    {/* Pago Móvil */}
                    {rbMethod === "Pago Móvil" && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={lbl}>Código de área</label>
                            <select value={rbAreaCode} onChange={e => setRbAreaCode(e.target.value)} className={fld2}>
                              {veAreas.map(a => <option key={a}>{a}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={lbl}>Número telefónico</label>
                            <input value={rbPhone} onChange={e => setRbPhone(e.target.value)} type="tel" placeholder="000-0000" className={fld2} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={lbl}>Tipo de documento</label>
                            <select value={rbDocType} onChange={e => setRbDocType(e.target.value)} className={fld2}>
                              {docTypes.map(t => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={lbl}>Número de documento</label>
                            <input value={rbDoc} onChange={e => setRbDoc(e.target.value)} placeholder="12345678" className={fld2} />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Transferencia */}
                    {rbMethod === "Transferencia" && (
                      <>
                        <div>
                          <label className={lbl}>Número de cuenta</label>
                          <input value={rbAccount} onChange={e => setRbAccount(e.target.value)} placeholder="0000-0000-00-0000000000" className={fld2} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={lbl}>Tipo de documento</label>
                            <select value={rbDocType} onChange={e => setRbDocType(e.target.value)} className={fld2}>
                              {docTypes.map(t => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={lbl}>Número de documento</label>
                            <input value={rbDoc} onChange={e => setRbDoc(e.target.value)} placeholder="12345678" className={fld2} />
                          </div>
                        </div>
                        <div>
                          <label className={lbl}>Nombre del beneficiario</label>
                          <input value={rbHolder} onChange={e => setRbHolder(e.target.value)} placeholder="Nombre completo" className={fld2} />
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setRefundStep(1)}
                        className="flex items-center gap-1 px-4 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                        style={H7}>
                        <ArrowLeft size={13} /> Volver
                      </button>
                      <button
                        onClick={handleSubmitRefund}
                        disabled={!step2Valid}
                        className={`flex-1 py-3 rounded-xl text-sm font-black uppercase transition-colors flex items-center justify-center gap-2 ${step2Valid ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                        style={H7}
                      >
                        <CreditCard size={14} /> Enviar solicitud
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
