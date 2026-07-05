import React from "react";
import { Instagram, Facebook } from "lucide-react";
import logoFarmahumana from "../../imports/logo-farmahumana.png";
import { Page, CATS } from "../shared";

export function Footer({ onNav }: { onNav: (p: Page) => void }) {
  return (
    <footer className="bg-[#004d52] text-white mt-16">
      <div className="h-0.5 bg-[#179150]" />
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-2">
              <img src={logoFarmahumana} alt="FHEC" className="w-8 h-8 object-contain" />
              <div>
                <div className="text-white text-base font-bold leading-none uppercase">FARMAHUMANA</div>
                <div className="text-white/50 text-[9px] tracking-widest">FHEC</div>
              </div>
            </div>
            <p className="text-white/55 text-xs leading-relaxed mb-4">Tu farmacia de confianza en Ciudad Guayana.</p>
            <div className="flex gap-2">
              {[
                { href: "https://www.instagram.com/farmahumana?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==", icon: <Instagram size={14} />, title: "Instagram" },
                { href: "https://www.facebook.com/farmahumana", icon: <Facebook size={14} />, title: "Facebook" },
                { href: "https://wa.me/584249395837", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a3.6 3.6 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374A9.86 9.86 0 012.1 11.892C2.1 6.442 6.535 2.008 11.987 2.008c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0011.987 0C5.432 0 .096 5.335.093 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>, title: "WhatsApp" },
              ].map(s => (
                <a key={s.title} href={s.href} target="_blank" rel="noopener noreferrer" title={s.title}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors text-white">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-3">Farmacia</div>
            <ul className="space-y-2">
              {CATS.slice(0, 7).map(c => (
                <li key={c.name}>
                  <button onClick={() => onNav("catalog")} className="text-white/60 text-xs hover:text-white transition-colors text-left">{c.name}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-3">Acerca de Nosotros</div>
            <ul className="space-y-2">
              {["Quiénes somos", "Misión y visión", "Nuestro equipo", "Certificaciones"].map(l => (
                <li key={l}><button className="text-white/60 text-xs hover:text-white transition-colors text-left">{l}</button></li>
              ))}
              <li><button className="text-white/60 text-xs hover:text-white transition-colors text-left">Contáctanos</button></li>
              <li><button className="text-white/60 text-xs hover:text-white transition-colors text-left">Trabaja con nosotros</button></li>
              <li className="pt-1">
                <div className="text-white/40 text-[10px] mb-1">Nuestras sedes</div>
                <div className="text-white/50 text-[10px] leading-relaxed">📍 Sede Principal — Calle 07, Ciudad Guayana</div>
                <div className="text-white/50 text-[10px] leading-relaxed mt-0.5">📍 Clínica Humana — Av. José Gumilla</div>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-3">Información</div>
            <ul className="space-y-2">
              {["Términos y condiciones", "Política de privacidad", "Política de devoluciones", "Preguntas frecuentes", "Blog de salud", "Regulación MPPS"].map(l => (
                <li key={l}><button className="text-white/60 text-xs hover:text-white transition-colors text-left">{l}</button></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-3">Métodos de Pago</div>
            <p className="text-white/50 text-[11px] mb-3">Aceptamos múltiples métodos de pago para tu comodidad.</p>
            <div className="text-white/70 text-[10px] font-semibold uppercase tracking-wider mb-2">Aceptamos</div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Pago Móvil",    bg: "#179150", text: "#fff" },
                { label: "Transferencia", bg: "#fff",    text: "#333", border: "#e0e0e0" },
              ].map(m => (
                <div key={m.label}
                  className="px-2.5 py-1 rounded-md text-[10px] font-bold border"
                  style={{ backgroundColor: m.bg, color: m.text, borderColor: m.border ?? m.bg }}>
                  {m.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/35">
          <span>© {new Date().getFullYear()} Farmahumana FHEC, C.A. · Reg. MPPS N° FAR-0001-2024 · Todos los derechos reservados.</span>
          <div className="flex items-center gap-4">
            <button className="hover:text-white/60 transition-colors">Términos</button>
            <button className="hover:text-white/60 transition-colors">Privacidad</button>
            <span className="flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 bg-[#179150] rounded-full" />Ciudad Guayana, Venezuela</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
