import React, { useState } from "react";
import { ArrowLeft, User, Shield, ClipboardList, Check, CheckCircle, Clock, LogOut, Eye, EyeOff, Lock, Mail, Phone, MapPin, AlertTriangle, ChevronRight, ChevronLeft, ChevronDown, Package } from "lucide-react";
import codigoQrUsuario from "../../imports/codigoqr-usuario.jpg";
import { AuthUser, Page, H9, H7, DEMO_ORDERS, DEMO_CONTACT } from "../shared";
import { OtpInput } from "./LoginPageComponent";

export function ProfilePage({ user, onNav, onLogout }: { user: AuthUser; onNav: (p: Page) => void; onLogout: () => void }) {
  const defaultContact = DEMO_CONTACT[user.email] ?? { phone: "+58 412-0000000", address: "Ciudad Guayana, Bolívar" };

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [cedula, setCedula] = useState(user.cedula);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(defaultContact.phone);
  const [address, setAddress] = useState(defaultContact.address);

  const [originalEmail] = useState(user.email);
  const [originalPhone] = useState(defaultContact.phone);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [pendingChanges, setPendingChanges] = useState<{email?: string; phone?: string}>({});

  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passMsg, setPassMsg] = useState<{type:"ok"|"err"; text:string} | null>(null);

  const [orderPage, setOrderPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const ordersPerPage = 5;
  const totalPages = Math.ceil(DEMO_ORDERS.length / ordersPerPage);
  const paginatedOrders = DEMO_ORDERS.slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage);

  const [savedMsg, setSavedMsg] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const isCliente = user.role === "cliente";
  const [profileTab, setProfileTab] = useState<"info" | "security" | "orders">("info");

  const userQrData = `FHEC-USER-${user.cedula}`;

  const handleSave = () => {
    const emailChanged = email !== originalEmail;
    const phoneChanged = phone !== originalPhone;
    if (emailChanged || phoneChanged) {
      setPendingChanges({ ...(emailChanged && { email }), ...(phoneChanged && { phone }) });
      setShowOtpModal(true);
      setOtpValue(""); setOtpError("");
    } else {
      setEditing(false); setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    }
  };

  const handleOtpVerify = () => {
    if (otpValue !== "123456") { setOtpError("Código incorrecto. Prueba: 123456"); return; }
    setShowOtpModal(false); setEditing(false); setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
    setPendingChanges({});
  };

  const handlePassChange = () => {
    if (!curPass || newPass.length < 8 || newPass !== confirmPass) {
      setPassMsg({ type: "err", text: "Verifica los campos: la nueva contraseña debe tener al menos 8 caracteres y coincidir." });
      return;
    }
    setPassMsg({ type: "ok", text: "Contraseña actualizada correctamente." });
    setCurPass(""); setNewPass(""); setConfirmPass("");
    setTimeout(() => setPassMsg(null), 3000);
  };

  const statusColor = (s: string) => {
    if (s === "Entregado") return "bg-[#179150] text-white";
    if (s === "Cancelado") return "bg-red-500 text-white";
    if (s === "En camino") return "bg-[#50e9f8] text-[#006064]";
    return "bg-amber-400 text-[#006064]";
  };

  const fieldClass = `w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-all focus:outline-none
    ${editing ? "border-[#50e9f8] bg-white focus:shadow-[0_0_0_3px_rgba(80,233,248,0.12)]" : "border-border bg-[#f8fafc] text-foreground cursor-default"}`;

  return (
    <div className="min-h-screen bg-[#f0fdf7]">
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Shield size={26} className="text-amber-600" />
            </div>
            <h3 className="text-2xl uppercase text-foreground text-center mb-2" style={H9}>Verificación Requerida</h3>
            <p className="text-sm text-muted-foreground text-center mb-1 leading-relaxed">Has modificado información sensible. Ingresa el código enviado a:</p>
            <div className="text-center mb-4">
              {pendingChanges.email && <p className="text-sm font-black text-[#179150]">{pendingChanges.email}</p>}
              {pendingChanges.phone && <p className="text-sm font-black text-[#179150]">{pendingChanges.phone}</p>}
            </div>
            <OtpInput value={otpValue} onChange={setOtpValue} />
            {otpError && <p className="text-red-600 text-xs text-center mb-2 flex items-center justify-center gap-1"><AlertTriangle size={11}/>{otpError}</p>}
            <button onClick={handleOtpVerify} disabled={otpValue.length < 6} className={`w-full py-3 rounded-xl uppercase transition-colors mb-3 ${otpValue.length === 6 ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`} style={H7}>Verificar y Guardar</button>
            <button onClick={() => setShowOtpModal(false)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
            <p className="text-xs text-muted-foreground text-center mt-3">Demo: el código es <strong>123456</strong></p>
          </div>
        </div>
      )}

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

      {isCliente && (
        <div className="bg-[#f0fdf7] border-b border-border px-4 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto grid grid-cols-3 gap-3">
            {[
              { label: "Pedidos totales", value: DEMO_ORDERS.length, color: "#006064", bg: "bg-white", icon: <ClipboardList size={18} className="text-[#179150]" /> },
              { label: "Entregados", value: DEMO_ORDERS.filter(o => o.status === "Entregado").length, color: "#179150", bg: "bg-white", icon: <CheckCircle size={18} className="text-[#179150]" /> },
              { label: "En curso", value: DEMO_ORDERS.filter(o => o.status === "En curso").length, color: "#b45309", bg: "bg-white", icon: <Clock size={18} className="text-amber-500" /> },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-border flex items-center gap-3 shadow-sm`}>
                <div className="w-10 h-10 rounded-xl bg-[#f0fdf7] flex items-center justify-center flex-shrink-0">{s.icon}</div>
                <div>
                  <div className="text-2xl font-black leading-none" style={{ ...H9, color: s.color }}>{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {savedMsg && (
          <div className="flex items-center gap-2 bg-[#179150]/10 border border-[#179150]/30 rounded-xl px-4 py-3 text-[#179150] text-sm font-semibold mb-4">
            <CheckCircle size={15} /> Información guardada correctamente.
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-4">
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

            <div className="bg-white rounded-2xl border border-border shadow-sm p-5 flex flex-col items-center">
              <div className="text-xs font-black uppercase text-muted-foreground mb-3" style={H9}>Código QR · ID de Usuario</div>
              <button onClick={() => setShowQrModal(true)} className="bg-white border-4 border-[#50e9f8] rounded-2xl p-3 shadow-md mb-3 hover:border-[#179150] transition-colors cursor-zoom-in" title="Clic para ampliar">
                <img src={codigoQrUsuario} alt="Código QR de usuario" className="w-52 h-52 object-contain" />
              </button>
              <div className="text-sm font-black text-foreground text-center" style={H9}>{userQrData}</div>
              <div className="text-xs text-muted-foreground mt-1 text-center">Toca para ampliar · Presenta en farmacia</div>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              {([
                { id: "info", label: "Información Personal", icon: <User size={15} />, show: true },
                { id: "security", label: "Seguridad", icon: <Shield size={15} />, show: true },
                { id: "orders", label: "Historial de Pedidos", icon: <ClipboardList size={15} />, show: isCliente },
              ] as const).filter(tab => tab.show).map(tab => (
                <button key={tab.id} onClick={() => setProfileTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-colors border-b border-border last:border-0
                    ${profileTab === tab.id ? "bg-[#e0f5eb] text-[#006064] font-black" : "text-muted-foreground hover:bg-muted"}`}
                  style={H9}>
                  <span className={profileTab === tab.id ? "text-[#006064]" : "text-muted-foreground"}>{tab.icon}</span>
                  {tab.label}
                  {profileTab === tab.id && <ChevronRight size={13} className="ml-auto text-[#006064]" />}
                </button>
              ))}
            </div>

            <button onClick={() => { onLogout(); }} className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl hover:bg-red-100 transition-colors text-sm font-black uppercase" style={H7}>
              <LogOut size={15} /> Cerrar Sesión
            </button>
          </div>

          <div className="lg:col-span-2">
            {profileTab === "info" && (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h2 className="text-lg uppercase text-foreground" style={H9}>Información Personal</h2>
                  {editing ? (
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(false)} className="px-3 py-1.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors">Cancelar</button>
                      <button onClick={handleSave} className="px-3 py-1.5 bg-[#179150] text-white rounded-xl text-xs font-black uppercase hover:bg-green-700 transition-colors flex items-center gap-1.5" style={H7}><Check size={12} /> Guardar</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#50e9f8] text-[#006064] bg-[#e0f5eb] rounded-xl text-xs font-black uppercase hover:bg-[#50e9f8]/20 transition-colors" style={H9}>
                      Editar
                    </button>
                  )}
                </div>
                <div className="p-6 grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Nombre Completo</label>
                    <div className="relative"><User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={name} onChange={e => setName(e.target.value)} readOnly={!editing} className={fieldClass} /></div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Cédula</label>
                    <div className="relative"><User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={cedula} onChange={e => setCedula(e.target.value)} readOnly={!editing} className={fieldClass} /></div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Correo Electrónico</label>
                    <div className="relative"><Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={email} onChange={e => setEmail(e.target.value)} readOnly={!editing} className={fieldClass} /></div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Teléfono</label>
                    <div className="relative"><Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={phone} onChange={e => setPhone(e.target.value)} readOnly={!editing} className={fieldClass} /></div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 block">Dirección Fiscal</label>
                    <div className="relative"><MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={address} onChange={e => setAddress(e.target.value)} readOnly={!editing} className={fieldClass} /></div>
                  </div>
                </div>
              </div>
            )}

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
                          <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground" style={H9}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map((order, i) => (
                        <React.Fragment key={order.id}>
                          <tr className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                            <td className="px-4 py-3 text-[#179150] font-black text-xs" style={H9}>{order.id}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">{order.date}</td>
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
          </div>
        </div>
      </div>
    </div>
  );
}
