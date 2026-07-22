import React, { useState } from "react";
import { ArrowLeft, Check, Plus, Settings, Trash2 } from "lucide-react";
import type { Page, Slide } from "../../../app/types";
import { toast } from "sonner";
import { deleteRemoteBanner, deleteRemoteBannerImage, updateRemoteBanner, uploadRemoteBannerImage } from "../../../services/bannerService";

const H9: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 };
const H7: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 };

// ─── BannerManagementPage ─────────────────────────────────────────────────────
export function BannerManagementPage({ slides, setSlides, onNav }: { slides: Slide[]; setSlides: (s: Slide[]) => void; onNav: (p: Page) => void }) {
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Slide | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);

  const startEdit = (i: number) => { setEditing(i); setDraft({ ...slides[i] }); setUploadedPath(null); };
  const save = async () => {
    if (editing === null || !draft) return;
    setSaving(true);
    try {
      const saved = await updateRemoteBanner(draft);
      const next = [...slides];
      next[editing] = saved;
      setSlides(next);
      setEditing(null); setDraft(null);
      setUploadedPath(null);
      toast.success(draft.id == null ? "Banner creado." : "Banner actualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el banner.");
    } finally {
      setSaving(false);
    }
  };
  const remove = async (i: number) => {
    const banner = slides[i];
    if (!banner) return;
    try {
      if (banner.id != null) await deleteRemoteBanner(banner.id);
      else if (editing === i && uploadedPath) await deleteRemoteBannerImage(uploadedPath);
      setSlides(slides.filter((_, idx) => idx !== i));
      if (editing === i) { setEditing(null); setDraft(null); setUploadedPath(null); }
      toast.success("Banner eliminado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el banner.");
    }
  };
  const addNew = () => {
    const blank: Slide = { title: "Nuevo Banner", subtitle: "Descripción del banner", badge: "NUEVO", from: "#031b24", via: "#00546a", to: "#50e9f8", img: "https://images.unsplash.com/photo-1550572017-efe56097ef4a?w=900&h=500&fit=crop&auto=format", cta: "Ver más →" };
    setSlides([...slides, blank]);
    setUploadedPath(null);
    setEditing(slides.length); setDraft(blank);
  };

  const uploadImage = async (file: File) => {
    setImageUploading(true);
    try {
      const uploaded = await uploadRemoteBannerImage(file);
      if (uploadedPath) await deleteRemoteBannerImage(uploadedPath).catch(console.error);
      setUploadedPath(uploaded.path);
      setDraft(current => current ? { ...current, img: uploaded.publicUrl } : current);
      toast.success("Imagen cargada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar la imagen.");
    } finally {
      setImageUploading(false);
    }
  };

  const cancelEdit = async (index: number) => {
    if (uploadedPath) await deleteRemoteBannerImage(uploadedPath).catch(console.error);
    if (slides[index]?.id == null) setSlides(slides.filter((_, idx) => idx !== index));
    setUploadedPath(null);
    setEditing(null);
    setDraft(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 pb-16 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNav("home")} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-3xl uppercase text-foreground" style={H9}>Gestión de Banners</h1>
          <p className="text-sm text-muted-foreground">Administra los banners del carrusel principal · Solo Superadmin</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {slides.map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
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
              <div className="absolute top-2 right-2 flex gap-1.5">
                <span className="text-[10px] bg-black/30 text-white px-2 py-0.5 rounded-full font-semibold">Banner {i + 1}</span>
              </div>
            </div>
            {/* Controls */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
              <div className="text-sm text-muted-foreground truncate max-w-xs">{s.img}</div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(i)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-xl hover:bg-muted transition-colors">
                  <Settings size={12} />Editar
                </button>
                <button onClick={() => { void remove(i); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors">
                  <Trash2 size={12} />Eliminar
                </button>
              </div>
            </div>

            {/* Edit form */}
            {editing === i && draft && (
              <div className="border-t border-border p-5 grid sm:grid-cols-2 gap-4 bg-white">
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
                        <input type="color" value={draft[key] as string} onChange={e => setDraft({ ...draft, [key]: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-border cursor-pointer p-0.5" />
                      )}
                      <input value={draft[key] as string} onChange={e => {
                        if (key === "img" && uploadedPath) void deleteRemoteBannerImage(uploadedPath).catch(console.error);
                        if (key === "img") setUploadedPath(null);
                        setDraft({ ...draft, [key]: e.target.value });
                      }}
                        className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150]" />
                    </div>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted">
                    <Plus size={14} /> {imageUploading ? "Cargando imagen..." : "Subir imagen local"}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" disabled={imageUploading}
                      onChange={e => { const file = e.target.files?.[0]; if (file) void uploadImage(file); e.target.value = ""; }} />
                  </label>
                </div>
                <div className="sm:col-span-2 flex gap-2 pt-2">
                  <button onClick={() => { void save(); }} disabled={saving || imageUploading} className="flex-1 bg-[#179150] text-white py-2.5 rounded-xl text-sm font-black uppercase hover:bg-green-700 transition-colors disabled:opacity-60" style={H7}>
                    <Check size={14} className="inline mr-1.5" />Guardar cambios
                  </button>
                  <button onClick={() => { void cancelEdit(i); }} disabled={imageUploading} className="px-4 border border-border rounded-xl text-sm hover:bg-muted transition-colors disabled:opacity-60">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={addNew} className="w-full py-3.5 border-2 border-dashed border-[#50e9f8] rounded-2xl text-[#006064] font-black uppercase text-sm hover:bg-[#e0f5eb] transition-colors flex items-center justify-center gap-2" style={H7}>
        <Plus size={16} />Agregar nuevo banner
      </button>
    </div>
  );
}
