import { Facebook, Instagram, ChevronDown, MapPin } from "lucide-react";
import logoFarmahumana from "../../imports/logo-farmahumana.png";
import type { Page } from "../../app/types";
import { CATS, H9 } from "./layoutShared";

// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer({ onNav }: { onNav: (p: Page) => void }) {
  const SOCIAL_LINKS = [
    { href: "https://www.instagram.com/farmahumana?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==", icon: <Instagram size={20} />, title: "Instagram" },
    { href: "https://www.facebook.com/farmahumana", icon: <Facebook size={20} />, title: "Facebook" },
    { href: "https://wa.me/584249395837", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a3.6 3.6 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374A9.86 9.86 0 012.1 11.892C2.1 6.442 6.535 2.008 11.987 2.008c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0011.987 0C5.432 0 .096 5.335.093 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>, title: "WhatsApp" },
  ];

  const PAYMENT_METHODS = [
    { label: "Pago Móvil",    bg: "#179150", text: "#fff" },
    { label: "Transferencia", bg: "#fff",    text: "#333", border: "#e0e0e0" },
  ];

  return (
    <footer className="bg-[#004d52] text-white mt-16">
      <div className="h-0.5 bg-[#179150]" />
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">

        {/* ─── DESKTOP & TABLET LAYOUT ─── */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Col 1: Brand + Social */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <img src={logoFarmahumana} alt="FHEC" className="w-12 h-12 object-contain" />
              <div>
                <div className="text-white text-lg font-black leading-none uppercase tracking-[0.05em]" style={H9}>FARMAHUMANA</div>
                <div className="text-[#50e9f8] text-[10px] font-bold tracking-[0.2em] mt-1">FHEC</div>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-5">Servicio con calidad humana.</p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(s => (
                <a key={s.title} href={s.href} target="_blank" rel="noopener noreferrer" title={s.title}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#50e9f8] hover:text-[#004d52] flex items-center justify-center transition-colors text-white">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Categorías */}
          <div>
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-4">Categorías</div>
            <ul className="space-y-2 pl-2">
              {CATS.slice(0, 7).map(c => (
                <li key={c.name}>
                  <button onClick={() => onNav("catalog")} className="text-white/70 text-sm hover:text-white transition-colors text-left">{c.name}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Acerca de Nosotros */}
          <div>
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-4">Acerca de Nosotros</div>
            <ul className="space-y-2 pl-2">
              {["Quiénes somos", "Misión y visión", "Nuestro equipo", "Certificaciones"].map(l => (
                <li key={l}><button className="text-white/70 text-sm hover:text-white transition-colors text-left">{l}</button></li>
              ))}
              <li><button className="text-white/70 text-sm hover:text-white transition-colors text-left">Contáctanos</button></li>
              <li><button className="text-white/70 text-sm hover:text-white transition-colors text-left">Trabaja con nosotros</button></li>
            </ul>
          </div>

          {/* Col 4: Ayuda y Soporte */}
          <div>
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-4">Ayuda y Soporte</div>
            <ul className="space-y-2 pl-2">
              {["Términos y condiciones", "Política de privacidad", "Política de devoluciones", "Preguntas frecuentes", "Blog de salud", "Regulación MPPS"].map(l => (
                <li key={l}><button className="text-white/70 text-sm hover:text-white transition-colors text-left">{l}</button></li>
              ))}
            </ul>
          </div>

          {/* Col 5: Métodos de Pago & Sedes */}
          <div>
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-4">Métodos de Pago</div>
            <div className="text-white/80 text-[11px] font-semibold uppercase tracking-wider mb-2 pl-2">Aceptamos</div>
            <div className="flex flex-wrap gap-2 pl-2">
              {PAYMENT_METHODS.map(m => (
                <div key={m.label}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border"
                  style={{ backgroundColor: m.bg, color: m.text, borderColor: m.border ?? m.bg }}>
                  {m.label}
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-5 border-t border-white/10">
              <div className="text-[#50e9f8] font-black text-sm uppercase tracking-wider mb-3">Nuestras sedes</div>
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="text-[#50e9f8] shrink-0 mt-0.5" size={14} />
                <span className="text-white/80 text-xs leading-relaxed font-semibold">Sede Principal — Calle 07, Ciudad Guayana</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="text-[#50e9f8] shrink-0 mt-0.5" size={14} />
                <span className="text-white/80 text-xs leading-relaxed font-semibold">Clínica Humana — Av. José Gumilla</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MOBILE LAYOUT (ACCORDION) ─── */}
        <div className="block md:hidden mb-6">
          {/* Header (Logo + Social) */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-4">
              <img src={logoFarmahumana} alt="FHEC" className="w-14 h-14 object-contain" />
              <div className="text-left">
                <div className="text-white text-xl font-black leading-none uppercase tracking-[0.05em]" style={H9}>FARMAHUMANA</div>
                <div className="text-[#50e9f8] text-[10px] font-bold tracking-[0.2em] mt-1.5">FHEC</div>
              </div>
            </div>
            
            <div className="flex gap-4 mb-4">
              {SOCIAL_LINKS.map(s => (
                <a key={s.title} href={s.href} target="_blank" rel="noopener noreferrer" title={s.title}
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-[#50e9f8] hover:text-[#004d52] flex items-center justify-center transition-colors text-white">
                  {s.icon}
                </a>
              ))}
            </div>

            <p className="text-white/80 text-[15px] font-medium leading-relaxed whitespace-nowrap">Servicio con calidad humana.</p>
          </div>

          {/* Nuestras Sedes */}
          <div className="mb-6 mt-4 pb-2">
            <div className="text-[#50e9f8] font-black text-sm uppercase tracking-wider mb-3">Nuestras sedes</div>
            <div className="pl-2">
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="text-[#50e9f8] shrink-0 mt-0.5" size={14} />
                <span className="text-white/80 text-xs leading-relaxed font-semibold">Sede Principal — Calle 07, Ciudad Guayana</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="text-[#50e9f8] shrink-0 mt-0.5" size={14} />
                <span className="text-white/80 text-xs leading-relaxed font-semibold">Clínica Humana — Av. José Gumilla</span>
              </div>
            </div>
          </div>

          {/* Accordions */}
          <div className="border-t border-white/10">
            {/* Accordion 1: Métodos de Pago */}
            <details className="group border-b border-white/10">
              <summary className="flex items-center justify-between py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="text-white font-bold text-sm uppercase tracking-wider">Métodos de Pago</span>
                <ChevronDown size={18} className="text-white/50 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pb-5 pt-1 pl-3">
                <div className="text-white/70 text-[11px] font-semibold uppercase tracking-wider mb-3">Aceptamos</div>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map(m => (
                    <div key={m.label}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border"
                      style={{ backgroundColor: m.bg, color: m.text, borderColor: m.border ?? m.bg }}>
                      {m.label}
                    </div>
                  ))}
                </div>
              </div>
            </details>

            {/* Accordion 2: Categorías */}
            <details className="group border-b border-white/10">
              <summary className="flex items-center justify-between py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="text-white font-bold text-sm uppercase tracking-wider">Categorías</span>
                <ChevronDown size={18} className="text-white/50 group-open:rotate-180 transition-transform" />
              </summary>
              <ul className="pb-5 pt-1 space-y-3 pl-3">
                {CATS.slice(0, 7).map(c => (
                  <li key={c.name}>
                    <button onClick={() => onNav("catalog")} className="text-white/70 text-sm hover:text-white transition-colors text-left">{c.name}</button>
                  </li>
                ))}
              </ul>
            </details>

            {/* Accordion 3: Acerca de Nosotros */}
            <details className="group border-b border-white/10">
              <summary className="flex items-center justify-between py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="text-white font-bold text-sm uppercase tracking-wider">Acerca de Nosotros</span>
                <ChevronDown size={18} className="text-white/50 group-open:rotate-180 transition-transform" />
              </summary>
              <ul className="pb-5 pt-1 space-y-3 pl-3">
                {["Quiénes somos", "Misión y visión", "Nuestro equipo", "Certificaciones"].map(l => (
                  <li key={l}><button className="text-white/70 text-sm hover:text-white transition-colors text-left">{l}</button></li>
                ))}
                <li><button className="text-white/70 text-sm hover:text-white transition-colors text-left">Contáctanos</button></li>
                <li><button className="text-white/70 text-sm hover:text-white transition-colors text-left">Trabaja con nosotros</button></li>
              </ul>
            </details>

            {/* Accordion 4: Ayuda y Soporte */}
            <details className="group border-b border-white/10">
              <summary className="flex items-center justify-between py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="text-white font-bold text-sm uppercase tracking-wider">Ayuda y Soporte</span>
                <ChevronDown size={18} className="text-white/50 group-open:rotate-180 transition-transform" />
              </summary>
              <ul className="pb-5 pt-1 space-y-3 pl-3">
                {["Términos y condiciones", "Política de privacidad", "Política de devoluciones", "Preguntas frecuentes", "Blog de salud", "Regulación MPPS"].map(l => (
                  <li key={l}><button className="text-white/70 text-sm hover:text-white transition-colors text-left">{l}</button></li>
                ))}
              </ul>
            </details>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 flex items-center justify-center text-center text-[11px] text-white/40">
          <span>© {new Date().getFullYear()} Farmahumana FHEC, C.A. · Reg. MPPS N° FAR-0001-2024 · Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
