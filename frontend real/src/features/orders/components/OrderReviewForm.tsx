import { CheckCircle, Star } from "lucide-react";
import { H7, H9 } from "./trackingShared";

export function OrderReviewForm({
  onSubmit,
  rating,
  reviewText,
  setRating,
  setReviewText,
}: {
  onSubmit: () => void;
  rating: number;
  reviewText: string;
  setRating: (rating: number) => void;
  setReviewText: (text: string) => void;
}) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#179150]/10 flex items-center justify-center flex-shrink-0">
          <Star size={20} className="text-[#179150]" />
        </div>
        <div>
          <h3 className="text-base uppercase text-foreground" style={H9}>¿Cómo fue tu experiencia?</h3>
          <p className="text-xs text-muted-foreground">Tu valoración habilita el botón de nuevo pedido</p>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        {[1,2,3,4,5].map(star => (
          <button key={star} onClick={() => setRating(star)} className="transition-all hover:scale-110">
            <Star size={34} className={`transition-colors ${star <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-300 hover:text-amber-300"}`} />
          </button>
        ))}
      </div>
      <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Cuéntanos sobre tu experiencia..." className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#179150] transition-all resize-none mb-3" rows={3} />
      <button onClick={onSubmit} disabled={rating === 0} className={`w-full py-2.5 rounded-xl font-black uppercase transition-all flex items-center justify-center gap-2 text-sm ${rating > 0 ? "bg-[#179150] text-white hover:bg-green-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`} style={H7}>
        <CheckCircle size={15} /> Enviar Valoración
      </button>
    </div>
  );
}

