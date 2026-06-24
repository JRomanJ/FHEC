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

// ─── LoginPage ────────────────────────────────────────────────────────────────
function OtpInput({ length = 6, value, onChange }: { length?: number; value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, "").split("").slice(0, length);

  const handle = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.map((v, idx) => idx === i ? d : v).join("");
    onChange(next);
    if (d && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="flex gap-2.5 justify-center my-4">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handle(i, e)}
          onKeyDown={e => handleKey(i, e)}
          className={`w-12 h-14 text-center border-2 rounded-xl text-xl font-black transition-all focus:outline-none
            ${d ? "border-[#179150] bg-[#179150]/5 text-[#179150]" : "border-border bg-white text-foreground"}
            focus:border-[#179150] focus:shadow-[0_0_0_3px_rgba(23,145,80,0.15)]`}
          style={H9}
        />
      ))}
    </div>
  );
}

function LoginPage({ onLogin, onNav }: { onLogin: (u: AuthUser) => void; onNav: (p: Page) => void }) {
  // ── Login state ──
  const [loginCred, setLoginCred] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);

  // ── Forgot password flow: "idle" | "sendCode" | "enterCode" | "newPass" | "done" ──
  type FpStep = "idle" | "sendCode" | "enterCode" | "newPass" | "done";
  const [fpStep, setFpStep] = useState<FpStep>("idle");
  const [fpCred, setFpCred] = useState("");
  const [fpCode, setFpCode] = useState("");
  const [fpNewPass, setFpNewPass] = useState("");
  const [fpConfirmPass, setFpConfirmPass] = useState("");
  const [showFpPass, setShowFpPass] = useState(false);

  // ── Register state ──
  const [regName, setRegName] = useState("");
  const [regContact, setRegContact] = useState(""); // email
  const [regPhone, setRegPhone] = useState(""); // teléfono
  const [regCedula, setRegCedula] = useState("");   // opcional
  const [regAddress, setRegAddress] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirmPass, setRegConfirmPass] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptNotifications, setAcceptNotifications] = useState(false);

  // ── OTP modal ──
  const [showOtp, setShowOtp] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const DEMO_OTP = "123456";

  const handleLogin = () => {
    const found = DEMO_ACCOUNTS.find(a => (a.email === loginCred || a.cedula === loginCred) && a.password === loginPass);
    if (!found) { setLoginError("Credencial o contraseña incorrectos."); return; }
    setLoginError("");
    const { password: _, ...user } = found;
    onLogin(user);
    // Internal staff roles go directly to their panel
    if (["auditor", "auxiliar", "superadmin"].includes(user.role)) {
      onNav("admin");
    } else if (user.role === "repartidor") {
      onNav("delivery");
    } else {
      onNav("home");
    }
  };

  const hasContact = regContact.trim() !== "" || regPhone.trim() !== "";
  const handleRegisterSubmit = () => {
    if (!acceptTerms || !regName.trim() || !hasContact || !regPass) return;
    setShowOtp(true);
    setOtpValue("");
    setOtpError("");
  };

  const handleOtpVerify = () => {
    if (otpValue !== DEMO_OTP) { setOtpError("Código incorrecto. Prueba: 123456"); return; }
    setShowOtp(false);
    setRegSuccess(true);
    setTimeout(() => {
      onLogin({ name: regName || "Nuevo Usuario", email: regContact, role: "cliente", cedula: regCedula || "—" });
      onNav("home");
    }, 1500);
  };

  // Forgot password helpers
  const fpCanSend = fpCred.trim().length > 0;
  const fpCodeComplete = fpCode.length === 6;
  const fpPassMatch = fpNewPass.length >= 8 && fpNewPass === fpConfirmPass;

  const sharedInput = "w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] focus:shadow-[0_0_0_3px_rgba(80,233,248,0.12)] transition-all";
  const label = "text-sm font-semibold text-foreground mb-1.5 block";

  return (
    <div className="min-h-screen bg-[#f0fdf7]">
      {/* OTP modal */}
      {showOtp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#50e9f8]/15 flex items-center justify-center mx-auto mb-4">
              <Bell size={26} className="text-[#179150]" />
            </div>
            <h3 className="text-2xl uppercase text-foreground text-center mb-1" style={H9}>Verificación</h3>
            <p className="text-sm text-muted-foreground text-center mb-1 leading-relaxed">
              Enviamos un código de 6 dígitos a
            </p>
            <p className="text-sm font-black text-[#179150] text-center mb-4 truncate">{regContact}</p>
            <OtpInput value={otpValue} onChange={setOtpValue} />
            {otpError && <p className="text-red-600 text-xs text-center mb-2 flex items-center justify-center gap-1"><AlertTriangle size={11}/>{otpError}</p>}
            <button
              onClick={handleOtpVerify}
              disabled={otpValue.length < 6}
              className={`w-full py-3 rounded-xl uppercase transition-colors mb-3
                ${otpValue.length === 6 ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
              style={H7}
            >
              Verificar Código
            </button>
            <button
              onClick={() => setShowOtp(false)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <p className="text-xs text-muted-foreground text-center mt-3">Demo: el código es <strong>123456</strong></p>
          </div>
        </div>
      )}

      {/* Forgot password modal */}
      {fpStep !== "idle" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
            {fpStep === "sendCode" && (
              <>
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Lock size={26} className="text-amber-600" />
                </div>
                <h3 className="text-2xl uppercase text-foreground text-center mb-2" style={H9}>Recuperar Contraseña</h3>
                <p className="text-sm text-muted-foreground text-center mb-5 leading-relaxed">
                  Ingresa tu correo o teléfono registrado. Te enviaremos un código de verificación.
                </p>
                <div className="relative mb-4">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={fpCred}
                    onChange={e => setFpCred(e.target.value)}
                    placeholder="Correo electrónico o teléfono"
                    className={sharedInput}
                  />
                </div>
                <button
                  onClick={() => { if (fpCanSend) setFpStep("enterCode"); }}
                  disabled={!fpCanSend}
                  className={`w-full py-3 rounded-xl uppercase mb-3 transition-colors
                    ${fpCanSend ? "bg-[#50e9f8] text-[#006064] hover:bg-[#2dd8e8]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                  style={H7}
                >
                  Enviar Código
                </button>
                <button onClick={() => setFpStep("idle")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
              </>
            )}

            {fpStep === "enterCode" && (
              <>
                <div className="w-14 h-14 rounded-full bg-[#50e9f8]/15 flex items-center justify-center mx-auto mb-4">
                  <Bell size={26} className="text-[#179150]" />
                </div>
                <h3 className="text-2xl uppercase text-foreground text-center mb-2" style={H9}>Ingresa el Código</h3>
                <p className="text-sm text-muted-foreground text-center mb-1">Código enviado a <strong className="text-foreground">{fpCred}</strong></p>
                <OtpInput value={fpCode} onChange={setFpCode} />
                <button
                  onClick={() => { if (fpCodeComplete) setFpStep("newPass"); }}
                  disabled={!fpCodeComplete}
                  className={`w-full py-3 rounded-xl uppercase mb-3 transition-colors
                    ${fpCodeComplete ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                  style={H7}
                >
                  Verificar
                </button>
                <button onClick={() => setFpStep("sendCode")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft size={11} className="inline mr-1" />Volver
                </button>
                <p className="text-xs text-muted-foreground text-center mt-2">Demo: usa cualquier 6 dígitos</p>
              </>
            )}

            {fpStep === "newPass" && (
              <>
                <div className="w-14 h-14 rounded-full bg-[#179150]/10 flex items-center justify-center mx-auto mb-4">
                  <Shield size={26} className="text-[#179150]" />
                </div>
                <h3 className="text-2xl uppercase text-foreground text-center mb-4" style={H9}>Nueva Contraseña</h3>
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showFpPass ? "text" : "password"}
                      value={fpNewPass}
                      onChange={e => setFpNewPass(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full pl-10 pr-10 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]"
                    />
                    <button type="button" onClick={() => setShowFpPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showFpPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showFpPass ? "text" : "password"}
                      value={fpConfirmPass}
                      onChange={e => setFpConfirmPass(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]"
                    />
                  </div>
                  {fpNewPass && fpConfirmPass && !fpPassMatch && (
                    <p className="text-red-500 text-xs">Las contraseñas no coinciden o son muy cortas.</p>
                  )}
                </div>
                <button
                  onClick={() => { if (fpPassMatch) setFpStep("done"); }}
                  disabled={!fpPassMatch}
                  className={`w-full py-3 rounded-xl uppercase mb-3 transition-colors
                    ${fpPassMatch ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                  style={H7}
                >
                  Guardar Contraseña
                </button>
              </>
            )}

            {fpStep === "done" && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-[#179150] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-white" />
                </div>
                <h3 className="text-2xl uppercase text-foreground mb-2" style={H9}>¡Listo!</h3>
                <p className="text-sm text-muted-foreground mb-6">Tu contraseña fue actualizada exitosamente.</p>
                <button
                  onClick={() => { setFpStep("idle"); setFpCred(""); setFpCode(""); setFpNewPass(""); setFpConfirmPass(""); }}
                  className="w-full py-3 bg-[#50e9f8] text-[#006064] rounded-xl uppercase hover:bg-[#2dd8e8] transition-colors"
                  style={H7}
                >
                  Ir a Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden px-8 py-8" style={{ background: "linear-gradient(135deg, #50e9f8 0%, #179150 100%)" }}>
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <img src={logoFarmahumana} alt="Farmahumana" className="w-14 h-14 object-contain drop-shadow-lg" />
          <div>
            <div className="text-white text-4xl leading-none uppercase" style={H9}>Farmahumana</div>
            <div className="text-white/80 text-sm mt-1">Tu salud, nuestra prioridad</div>
          </div>
        </div>
        <button onClick={() => onNav("home")} className="absolute top-4 right-5 text-white/70 hover:text-white text-xs flex items-center gap-1 transition-colors">
          <ArrowLeft size={13} /> Volver a la tienda
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-8">

        {/* ── Login ── */}
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <h2 className="text-2xl text-foreground mb-1" style={H9}>Iniciar Sesión</h2>
          <p className="text-sm text-muted-foreground mb-6">Usa tu correo, teléfono o cédula.</p>

          <div className="space-y-4">
            <div>
              <label className={label}>Correo electrónico y/o Número Telefónico</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={loginCred}
                  onChange={e => { setLoginCred(e.target.value); setLoginError(""); }}
                  placeholder="Correo o teléfono"
                  className={sharedInput}
                />
              </div>
            </div>
            <div>
              <label className={label}>Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showLoginPass ? "text" : "password"}
                  value={loginPass}
                  onChange={e => { setLoginPass(e.target.value); setLoginError(""); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] focus:shadow-[0_0_0_3px_rgba(80,233,248,0.12)] transition-all"
                />
                <button type="button" onClick={() => setShowLoginPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showLoginPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <AlertTriangle size={14} />{loginError}
              </div>
            )}

            <button onClick={handleLogin} className="w-full py-3 bg-[#179150] text-white rounded-xl hover:bg-green-700 transition-colors" style={H7}>
              Ingresar
            </button>

            <button
              onClick={() => setFpStep("sendCode")}
              className="w-full text-center text-sm text-[#179150] hover:underline transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Demo hint */}
          <div className="mt-6 bg-[#e0f5eb] border border-[#a7f3d0] rounded-xl p-4">
            <div className="text-xs font-black uppercase text-[#006064] mb-2" style={H9}>Cuentas demo</div>
            <div className="space-y-1">
              {DEMO_ACCOUNTS.map(a => (
                <button
                  key={a.email}
                  onClick={() => { setLoginCred(a.email); setLoginPass(a.password); setLoginError(""); }}
                  className="w-full text-left flex items-center justify-between text-xs px-2 py-1.5 rounded-lg hover:bg-[#e0f5eb] transition-colors"
                >
                  <span className="text-foreground font-semibold">{a.name}</span>
                  <span className={`font-black uppercase px-2 py-0.5 rounded-full text-[10px]
                    ${a.role === "superadmin" ? "bg-[#006064] text-white" :
                      a.role === "repartidor" ? "bg-[#50e9f8] text-[#006064]" :
                      a.role === "cliente" ? "bg-green-100 text-[#179150]" :
                      a.role === "auditor" ? "bg-gray-200 text-gray-700" :
                      "bg-amber-100 text-amber-800"}`} style={H9}>
                    {a.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Register ── */}
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <h2 className="text-2xl text-foreground mb-1" style={H9}>Crear Cuenta</h2>
          <p className="text-sm text-muted-foreground mb-6">Crea tu cuenta en segundos.</p>

          {regSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 bg-[#179150] rounded-full flex items-center justify-center">
                <CheckCircle size={30} className="text-white" />
              </div>
              <div className="text-xl uppercase text-foreground" style={H9}>¡Registro exitoso!</div>
              <div className="text-sm text-muted-foreground text-center">Redirigiendo a la tienda…</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Nombre completo */}
              <div>
                <label className={label}>Nombre Completo <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Ej: María González"
                    className={sharedInput} />
                </div>
              </div>

              {/* Email + Phone — at least one required */}
              <div className="bg-[#e0f5eb] border border-[#a7f3d0] rounded-xl px-3 py-2 text-xs text-[#006064] flex items-center gap-2">
                <Info size={12} className="flex-shrink-0" />
                Ingresa tu correo, teléfono, o ambos. Se requiere al menos uno.
              </div>
              <div>
                <label className={label}>
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={regContact}
                    onChange={e => setRegContact(e.target.value)}
                    placeholder="tu@email.com"
                    type="email"
                    className={sharedInput}
                  />
                </div>
              </div>

              <div>
                <label className={label}>
                  Número Telefónico
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="+58 412-1234567"
                    type="tel"
                    className={sharedInput}
                  />
                </div>
              </div>

              {/* Cédula (opcional) */}
              <div>
                <label className={label}>
                  Cédula de Identidad
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Opcional</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={regCedula} onChange={e => setRegCedula(e.target.value)} placeholder="V-12345678"
                    className={sharedInput} />
                </div>
              </div>

              {/* Dirección fiscal */}
              <div>
                <label className={label}>Dirección Fiscal</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={regAddress} onChange={e => setRegAddress(e.target.value)} placeholder="Calle, N°, Ciudad"
                    className={sharedInput} />
                </div>
              </div>

              {/* Contraseña + confirmar */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Contraseña <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showRegPass ? "text" : "password"}
                      value={regPass}
                      onChange={e => setRegPass(e.target.value)}
                      placeholder="Mín. 8 caracteres"
                      className="w-full pl-10 pr-10 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]"
                    />
                    <button type="button" onClick={() => setShowRegPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showRegPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={label}>Confirmar</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showRegConfirm ? "text" : "password"}
                      value={regConfirmPass}
                      onChange={e => setRegConfirmPass(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:outline-none transition-all
                        ${regConfirmPass && regConfirmPass !== regPass ? "border-red-400 focus:border-red-400" : "border-border focus:border-[#179150]"}`}
                    />
                    <button type="button" onClick={() => setShowRegConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showRegConfirm ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>
              </div>
              {regConfirmPass && regConfirmPass !== regPass && (
                <p className="text-red-500 text-xs -mt-1">Las contraseñas no coinciden.</p>
              )}

              {/* Terms */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <div
                  onClick={() => setAcceptTerms(v => !v)}
                  className={`w-4 h-4 mt-0.5 rounded flex-shrink-0 border transition-all flex items-center justify-center cursor-pointer
                    ${acceptTerms ? "bg-[#179150] border-[#179150]" : "border-border bg-white hover:border-[#179150]"}`}
                >
                  {acceptTerms && <Check size={10} className="text-white" />}
                </div>
                <span className="text-sm text-foreground">
                  Acepto los <span className="text-[#179150] hover:underline cursor-pointer">términos y condiciones</span> y la <span className="text-[#179150] hover:underline cursor-pointer">política de privacidad</span> <span className="text-red-500">*</span>
                </span>
              </label>

              {/* Notifications */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <div
                  onClick={() => setAcceptNotifications(v => !v)}
                  className={`w-4 h-4 mt-0.5 rounded flex-shrink-0 border transition-all flex items-center justify-center cursor-pointer
                    ${acceptNotifications ? "bg-[#179150] border-[#179150]" : "border-border bg-white hover:border-[#179150]"}`}
                >
                  {acceptNotifications && <Check size={10} className="text-white" />}
                </div>
                <span className="text-sm text-foreground">
                  Suscripción voluntaria a notificaciones promocionales <span className="text-muted-foreground">(SMS/Correo)</span>
                  <span className="ml-1.5 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Opcional</span>
                </span>
              </label>

              <button
                onClick={handleRegisterSubmit}
                disabled={!acceptTerms || !regName.trim() || !hasContact || !regPass || regPass !== regConfirmPass}
                className={`w-full py-3 rounded-xl transition-colors
                  ${acceptTerms && regName.trim() && hasContact && regPass && regPass === regConfirmPass
                    ? "bg-[#50e9f8] text-[#006064] hover:bg-[#2dd8e8]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                style={H7}
              >
                Crear Cuenta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export { LoginPage };
