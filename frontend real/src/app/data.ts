import type React from "react";
import { Product, Slide } from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const VES_RATE = 40.50;
export const fmtVES = (u: number) =>
  `Bs.S ${(u * VES_RATE).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fmtUSD = (u: number) => `$${u.toFixed(2)}`;
export const H9: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 };
export const H7: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 };
export const effectivePrice = (p: Product) => p.discount ? p.priceUSD * (1 - p.discount / 100) : p.priceUSD;

// Brand synonyms for smart search
export const BRAND_SYNONYMS: Record<string, string[]> = {
  "atamel": ["Paracetamol (Acetaminofén)", "Analgésicos"],
  "tylenol": ["Paracetamol (Acetaminofén)", "Analgésicos"],
  "panadol": ["Paracetamol (Acetaminofén)", "Analgésicos"],
  "calpol": ["Paracetamol (Acetaminofén)", "Analgésicos"],
  "lipitor": ["Atorvastatina Cálcica", "Cardiovascular"],
  "sortis": ["Atorvastatina Cálcica", "Cardiovascular"],
  "glucophage": ["Clorhidrato de Metformina", "Diabetes"],
  "stagid": ["Clorhidrato de Metformina", "Diabetes"],
  "omepral": ["Omeprazol", "Gastrointestinal"],
  "losec": ["Omeprazol", "Gastrointestinal"],
  "prilosec": ["Omeprazol", "Gastrointestinal"],
  "cozaar": ["Losartán Potásico", "Cardiovascular"],
  "hyzaar": ["Losartán Potásico", "Cardiovascular"],
  "augmentin": ["Amoxicilina Trihidrato", "Antibióticos"],
  "amoxil": ["Amoxicilina Trihidrato", "Antibióticos"],
  "rivotril": ["Clonazepam", "Sistema Nervioso"],
  "cebion": ["Ácido Ascórbico", "Vitaminas"],
  "redoxon": ["Ácido Ascórbico", "Vitaminas"],
  "ce-vi-cal": ["Ácido Ascórbico", "Vitaminas"],
};

// Frequently bought together data
export const FREQUENTLY_BOUGHT_TOGETHER: Record<number, number[]> = {
  1: [4, 7],
  2: [5, 7],
  3: [7, 4],
  4: [1, 7],
  5: [2, 6],
  6: [7, 4],
  7: [4, 6],
  8: [7, 4],
};

// Demo accounts
export const DEMO_ACCOUNTS: (import("./types").AuthUser & { password: string })[] = [
  { name: "María González", email: "cliente@fhec.com", password: "123", role: "cliente", cedula: "V-12345678" },
  { name: "José Ramos", email: "repartidor@fhec.com", password: "123", role: "repartidor", cedula: "V-87654321" },
  { name: "Ana Torres", email: "auxiliar@fhec.com", password: "123", role: "auxiliar", cedula: "V-11223344" },
  { name: "Carlos Vega", email: "auditor@fhec.com", password: "123", role: "auditor", cedula: "V-33445566" },
  { name: "Luis Medina", email: "admin@fhec.com", password: "123", role: "superadmin", cedula: "V-55667788" },
];

export const PRODUCTS: Product[] = [
  { id: 1, name: "Metformina 500mg", brand: "Roemmers", category: "Diabetes", presentation: "Tabletas", packSize: "x 30", priceUSD: 8.50, discount: 10, stock: 24, needsRecipe: false, rating: 4.8, reviews: 128, bgColor: "#e8f5e9", accentColor: "#179150", description: "Antidiabético oral biguanida. Reduce la glucosa en sangre en pacientes con diabetes mellitus tipo 2. No produce hipoglucemia. Primera línea de tratamiento según guías internacionales.", activeIngredient: "Clorhidrato de Metformina", contraindications: "Insuficiencia renal o hepática, uso de contraste yodado, alcoholismo.", posology: "500–1000 mg 2–3 veces/día con las comidas. Dosis máx. 2550 mg/día. Iniciar con dosis bajas para reducir intolerancia GI.", stockSedes: { principal: 15, clinica: 9 } },
  { id: 2, name: "Losartán 50mg", brand: "Farma-Plus", category: "Cardiovascular", presentation: "Comprimidos", packSize: "x 28", priceUSD: 12.00, stock: 18, needsRecipe: true, rating: 4.6, reviews: 94, bgColor: "#e3f2fd", accentColor: "#1565c0", description: "Antagonista selectivo AT-1 de angiotensina II. Indicado en hipertensión arterial esencial e insuficiencia cardíaca congestiva. Protección renal en diabéticos.", activeIngredient: "Losartán Potásico", contraindications: "Hipersensibilidad al losartán, embarazo, lactancia, estenosis bilateral de arterias renales.", posology: "50 mg 1 vez/día. Rango: 25–100 mg/día según respuesta. En insuficiencia hepática iniciar con 25 mg/día. Administrar con o sin alimentos.", stockSedes: { principal: 10, clinica: 8 } },
  { id: 3, name: "Amoxicilina 500mg", brand: "IVAX Venezuela", category: "Antibióticos", presentation: "Cápsulas", packSize: "x 21", priceUSD: 15.75, stock: 0, needsRecipe: true, rating: 4.7, reviews: 213, bgColor: "#fff3e0", accentColor: "#e65100", description: "Antibiótico beta-lactámico de amplio espectro. Activo frente a bacterias grampositivas y gramnegativas. Indicado en infecciones de vías respiratorias, urinarias y cutáneas.", activeIngredient: "Amoxicilina Trihidrato", contraindications: "Alergia a penicilinas o cefalosporinas. Contraindicado en mononucleosis infecciosa.", posology: "500 mg cada 8 h (infecciones moderadas) o 875 mg cada 12 h (infecciones graves). Duración habitual: 7–10 días. Completar siempre el ciclo.", stockSedes: { principal: 0, clinica: 0 } },
  { id: 4, name: "Vitamina C 1000mg", brand: "Naturecal", category: "Vitaminas", presentation: "Comprimidos efervescentes", packSize: "x 20", priceUSD: 6.25, discount: 5, stock: 52, needsRecipe: false, rating: 4.9, reviews: 307, bgColor: "#fffde7", accentColor: "#f9a825", description: "Suplemento vitamínico antioxidante potente. Refuerza el sistema inmunológico, favorece la síntesis de colágeno y mejora la absorción del hierro no hémico.", activeIngredient: "Ácido Ascórbico", contraindications: "Cálculos renales oxálicos previos. Precaución en hemochromatosis y talasemia.", posology: "1 comprimido efervescente disuelto en 200 ml de agua, 1 vez/día. Preferiblemente por la mañana con el desayuno. No masticar ni tragar directamente.", stockSedes: { principal: 30, clinica: 22 } },
  { id: 5, name: "Atorvastatina 20mg", brand: "Pfizer", category: "Cardiovascular", presentation: "Tabletas", packSize: "x 30", priceUSD: 18.90, stock: 11, needsRecipe: true, rating: 4.5, reviews: 156, bgColor: "#f3e5f5", accentColor: "#6a1b9a", description: "Inhibidor selectivo de la HMG-CoA reductasa. Reduce niveles de colesterol LDL y triglicéridos. Prevención cardiovascular primaria y secundaria en pacientes de alto riesgo.", activeIngredient: "Atorvastatina Cálcica", contraindications: "Hepatopatía activa, embarazo, lactancia, uso concomitante de inhibidores potentes de CYP3A4.", posology: "10–80 mg 1 vez/día, a cualquier hora del día con o sin alimentos. Inicio habitual: 20 mg/día. Ajustar según perfil lipídico a las 4 semanas.", stockSedes: { principal: 7, clinica: 4 } },
  { id: 6, name: "Omeprazol 20mg", brand: "Genoma Lab", category: "Gastrointestinal", presentation: "Cápsulas", packSize: "x 14", priceUSD: 9.30, discount: 5, stock: 38, needsRecipe: false, rating: 4.7, reviews: 189, bgColor: "#e0f7fa", accentColor: "#006064", description: "Inhibidor irreversible de la bomba de protones gástrica. Suprime eficazmente la secreción ácida. Indicado en úlcera péptica, esofagitis y enfermedad por reflujo gastroesofágico.", activeIngredient: "Omeprazol", contraindications: "Hipersensibilidad al omeprazol o benzimidazoles. Interacción significativa con clopidogrel.", posology: "20 mg 1 vez/día, 30–60 min antes del desayuno. En úlcera duodenal: 4 semanas. En esofagitis erosiva: 4–8 semanas. No triturar ni masticar la cápsula.", stockSedes: { principal: 22, clinica: 16 } },
  { id: 7, name: "Paracetamol 500mg", brand: "Bayer Venezuela", category: "Analgésicos", presentation: "Tabletas", packSize: "x 20", priceUSD: 4.50, discount: 10, stock: 87, needsRecipe: false, rating: 4.9, reviews: 521, bgColor: "#fce4ec", accentColor: "#c62828", description: "Analgésico y antipirético de acción central. Indicado en dolor leve a moderado, fiebre, cefalea y estados gripales. Amplio margen de seguridad en dosis terapéuticas.", activeIngredient: "Paracetamol (Acetaminofén)", contraindications: "Insuficiencia hepática grave, alcoholismo crónico. No superar 4g/día en adultos.", posology: "500–1000 mg cada 4–6 h según necesidad. Dosis máx. 4000 mg/día (adultos). Intervalo mínimo entre dosis: 4 horas. No combinar con otros analgésicos que contengan paracetamol.", stockSedes: { principal: 50, clinica: 37 } },
  { id: 8, name: "Clonazepam 0.5mg", brand: "Roche", category: "Sistema Nervioso", presentation: "Comprimidos", packSize: "x 30", priceUSD: 22.00, stock: 7, needsRecipe: true, rating: 4.4, reviews: 63, bgColor: "#e8eaf6", accentColor: "#283593", description: "Benzodiazepina con acción antiepiléptica, ansiolítica y miorrelajante. Indicada en epilepsia, trastorno de pánico y ansiedad generalizada refractaria.", activeIngredient: "Clonazepam", contraindications: "Miastenia gravis, glaucoma de ángulo cerrado, insuficiencia hepática grave, síndrome de apnea del sueño.", posology: "Inicio: 0.25–0.5 mg 2–3 veces/día. Mantenimiento: individualizar según respuesta (máx. 20 mg/día en epilepsia). No suspender bruscamente; reducir gradualmente.", controlledSubstance: true, stockSedes: { principal: 5, clinica: 2 } },
];

export const DEFAULT_SLIDES: Slide[] = [
  { title: "Control de Diabetes", subtitle: "Medicamentos de primera línea con los mejores precios del mercado venezolano.", badge: "HASTA 20% OFF", from: "#0b1e1e", via: "#003d2e", to: "#179150", img: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=900&h=500&fit=crop&auto=format", cta: "Ver Medicamentos →" },
  { title: "Vitaminas & Suplementos", subtitle: "Refuerza tu sistema inmune con los mejores suplementos. Entrega rápida en Ciudad Guayana.", badge: "DESTACADOS", from: "#031b24", via: "#00546a", to: "#50e9f8", img: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=900&h=500&fit=crop&auto=format", cta: "Explorar Vitaminas →" },
  { title: "Salud Cardiovascular", subtitle: "Tratamientos completos para cuidar tu corazón. Pedido con o sin récipe médico.", badge: "RECOMENDADO", from: "#006064", via: "#5c0f0f", to: "#c62828", img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=900&h=500&fit=crop&auto=format", cta: "Ver Cardioprotectores →" },
];

export const CATS = [
  { name: "Diabetes", count: 12, emoji: "💉", color: "#179150" },
  { name: "Cardiovascular", count: 28, emoji: "🫀", color: "#c62828" },
  { name: "Antibióticos", count: 19, emoji: "💊", color: "#e65100" },
  { name: "Vitaminas", count: 35, emoji: "⚡", color: "#f9a825" },
  { name: "Analgésicos", count: 22, emoji: "🩺", color: "#1565c0" },
  { name: "Gastrointestinal", count: 15, emoji: "🔬", color: "#006064" },
  { name: "Sistema Nervioso", count: 9, emoji: "🧠", color: "#283593" },
  { name: "Equipos Médicos", count: 8, emoji: "🩻", color: "#6a1b9a" },
  { name: "Descartables", count: 14, emoji: "🧤", color: "#37474f" },
  { name: "Higiene Personal", count: 31, emoji: "🧴", color: "#0277bd" },
  { name: "Dermatología", count: 17, emoji: "🫧", color: "#ad1457" },
  { name: "Oftalmología", count: 6, emoji: "👁️", color: "#00695c" },
];

export const SEDES_LIST = [
  { id: "principal", name: "Sede Principal", city: "Ciudad Guayana", address: "Calle 07, Manzana 04, Bolívar" },
  { id: "clinica",   name: "Clínica Humana",  city: "Ciudad Guayana", address: "Av. José Gumilla, Bolívar" },
];

export const SEDES = [
  { id: "principal", name: "Ciudad Guayana — Principal", address: "Parcela 01-02, Local Manzana 04, Calle 07, Ciudad Guayana 8050, Bolívar", hours: "Lun–Sáb: 8:00 am – 8:00 pm · Dom: 9:00 am – 6:00 pm", mapsUrl: "https://maps.google.com/?q=Ciudad+Guayana+Bolivar+Venezuela" },
  { id: "clinica",   name: "Clínica Humana",              address: "986M+QJ4, Frente a la Mezquita, Av. José Gumilla, Ciudad Guayana 8051, Bolívar",         hours: "Lun–Sáb: 8:00 am – 8:00 pm · Dom: 9:00 am – 6:00 pm", mapsUrl: "https://maps.google.com/?q=Clinica+Humana+Ciudad+Guayana+Venezuela" },
];

export const DISCOUNT_CODES: Record<string,number> = { FHEC10:10, SALUD15:15, BIENVENIDO:5, FHEC2024:20 };

export const DEMO_GLOBAL_ORDERS = [
  { id: "ORD-2024-301", date: "2024-06-08 16:20", client: "María González", sede: "Principal", status: "Entregado", total: 34.75, approvedBy: "Carlos Vega", preparedBy: "Ana Torres", dispatchedBy: "José Ramos" },
  { id: "ORD-2024-302", date: "2024-06-08 15:50", client: "Pedro Martínez", sede: "Clínica Sur", status: "En tránsito", total: 18.50, approvedBy: "Carlos Vega", preparedBy: "Ana Torres", dispatchedBy: "José Ramos" },
  { id: "ORD-2024-303", date: "2024-06-08 15:30", client: "Laura Díaz", sede: "Principal", status: "Por preparar", total: 55.00, approvedBy: "—", preparedBy: "—", dispatchedBy: "—" },
  { id: "ORD-2024-304", date: "2024-06-08 15:10", client: "Roberto Sánchez", sede: "Clínica Sur", status: "Pendiente pago", total: 12.25, approvedBy: "Carlos Vega", preparedBy: "—", dispatchedBy: "—" },
  { id: "ORD-2024-305", date: "2024-06-08 14:45", client: "Sofía Jiménez", sede: "Maternidad", status: "Cancelado", total: 8.00, approvedBy: "—", preparedBy: "—", dispatchedBy: "—" },
  { id: "ORD-2024-306", date: "2024-06-08 14:20", client: "Carlos Blanco", sede: "Principal", status: "Entregado", total: 22.90, approvedBy: "Carlos Vega", preparedBy: "Ana Torres", dispatchedBy: "José Ramos" },
  { id: "ORD-2024-307", date: "2024-06-08 13:55", client: "Elena Rojas", sede: "Maternidad", status: "Por retirar", total: 41.30, approvedBy: "Carlos Vega", preparedBy: "Ana Torres", dispatchedBy: "—" },
  { id: "ORD-2024-308", date: "2024-06-08 13:30", client: "Marcos Herrera", sede: "Principal", status: "En validación médica", total: 67.50, approvedBy: "—", preparedBy: "—", dispatchedBy: "—" },
];

export const STATUS_COLORS: Record<string, string> = {
  "En validación médica": "bg-amber-100 text-amber-800",
  "Pendiente pago": "bg-blue-100 text-blue-800",
  "Por preparar": "bg-orange-100 text-orange-800",
  "Por retirar": "bg-purple-100 text-purple-800",
  "Listo para delivery": "bg-cyan-100 text-cyan-800",
  "En tránsito": "bg-indigo-100 text-indigo-800",
  "Entregado": "bg-green-100 text-green-800",
  "Cancelado": "bg-red-100 text-red-800",
};

export const DEMO_ORDERS = [
  { id: "ORD-2024-001", date: "2024-05-28", status: "En curso", items: 3, totalBs: 125.50, totalUsd: 3.10, products: ["Metformina 500mg", "Vitamina C 1000mg", "Paracetamol 500mg"] },
  { id: "ORD-2024-002", date: "2024-05-25", status: "Entregado", items: 2, totalBs: 89.00, totalUsd: 2.20, products: ["Losartán 50mg", "Omeprazol 20mg"] },
  { id: "ORD-2024-003", date: "2024-05-20", status: "Entregado", items: 5, totalBs: 234.75, totalUsd: 5.79, products: ["Amoxicilina 500mg", "Paracetamol 500mg", "Vitamina C 1000mg", "Metformina 500mg", "Atorvastatina 20mg"] },
  { id: "ORD-2024-004", date: "2024-05-10", status: "Entregado", items: 4, totalBs: 189.90, totalUsd: 4.69, products: ["Losartán 50mg", "Atorvastatina 20mg", "Metformina 500mg", "Paracetamol 500mg"] },
  { id: "ORD-2024-005", date: "2024-05-05", status: "Entregado", items: 2, totalBs: 67.50, totalUsd: 1.67, products: ["Vitamina C 1000mg", "Paracetamol 500mg"] },
  { id: "ORD-2024-006", date: "2024-04-28", status: "Entregado", items: 3, totalBs: 156.00, totalUsd: 3.85, products: ["Amoxicilina 500mg", "Omeprazol 20mg", "Metformina 500mg"] },
  { id: "ORD-2024-007", date: "2024-04-20", status: "Entregado", items: 1, totalBs: 45.50, totalUsd: 1.12, products: ["Paracetamol 500mg"] },
];

export const DEMO_CONTACT: Record<string, { phone: string; address: string }> = {
  "cliente@fhec.com":    { phone: "+58 414-1234567", address: "Av. Las Américas, Edif. Torre Pte., Piso 3, Pto. Ordaz" },
  "repartidor@fhec.com": { phone: "+58 416-8765432", address: "Urb. Villa Asia, Calle 15, Casa 8, Pto. Ordaz" },
  "auxiliar@fhec.com":   { phone: "+58 412-1122334", address: "Calle Caroní, Res. La Llovizna, Apto 2B, Pto. Ordaz" },
  "auditor@fhec.com":    { phone: "+58 414-3344556", address: "Av. Guayana, Centro Cívico, Piso 7, Pto. Ordaz" },
  "admin@fhec.com":      { phone: "+58 424-5566778", address: "Urb. Chilemex, Calle Principal, Casa 1, Pto. Ordaz" },
};

export const NOTIF_DATA = [
  { id: 1, type: "order",  icon: "📦", title: "Pedido listo para retiro", body: "Tu pedido #FHEC-20241204-8471 está listo. Preséntate con tu PIN y cédula.", time: "Hace 5 min",   read: false },
  { id: 2, type: "recipe", icon: "✅", title: "Récipe aprobado",          body: "Tu récipe para Losartán 50mg fue validado. Ya puedes proceder al pago.",   time: "Hace 1 hr",   read: false },
  { id: 3, type: "promo",  icon: "💊", title: "Oferta especial",          body: "Hasta 20% OFF en vitaminas y suplementos esta semana.",                     time: "Hace 3 hrs",  read: false },
  { id: 4, type: "order",  icon: "🏠", title: "Pedido entregado",         body: "Tu pedido anterior fue entregado. ¿Cómo fue tu experiencia?",              time: "Ayer",        read: true  },
  { id: 5, type: "recipe", icon: "⚠️", title: "Récipe rechazado",         body: "El récipe para Amoxicilina 500mg requiere correcciones. Ver detalles.",    time: "Hace 2 días", read: true  },
  { id: 6, type: "info",   icon: "🕐", title: "Horario extendido",        body: "Esta semana atendemos L–S hasta las 9 PM en nuestra sede principal.",      time: "Hace 3 días", read: true  },
  { id: 7, type: "promo",  icon: "⭐", title: "Programa de puntos",       body: "¡Acumula puntos con cada compra y canjéalos por descuentos!",              time: "Hace 5 días", read: true  },
];
