import { ProductBox } from "../../../components/product";
import type { CartItem } from "../../../app/types";
import { effectivePrice, fmtUSD, fmtVES, H9 } from "./trackingShared";

export function OrderItemsSummary({
  deliveryFee,
  discountAmt,
  discountPct,
  items,
  ivaAmt,
  subtotal,
  total,
}: {
  deliveryFee: number;
  discountAmt: number;
  discountPct: number;
  items: CartItem[];
  ivaAmt: number;
  subtotal: number;
  total: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
      <div className="text-base font-black uppercase text-foreground mb-3" style={H9}>Productos del Pedido</div>
      <div className="space-y-2.5 mb-3">
        {items.map(({ product: p, quantity }) => (
          <div key={p.id} className="flex items-center gap-2.5">
            <div className="w-9 h-11 rounded-lg overflow-hidden flex-shrink-0">
              <ProductBox product={p} size="sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black uppercase truncate" style={H9}>{p.name}</div>
              <div className="text-[10px] text-muted-foreground">{p.brand} · ×{quantity}</div>
            </div>
            <div className="text-xs font-semibold text-[#179150] flex-shrink-0">{fmtUSD(effectivePrice(p) * quantity)}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-3 space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Subtotal</span><span>{fmtUSD(subtotal)}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>IVA (16%)</span><span>{fmtUSD(ivaAmt)}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Costo de envío</span>
          <span>{deliveryFee > 0 ? fmtUSD(deliveryFee) : <span className="text-[#179150] font-semibold">Gratis</span>}</span>
        </div>
        {discountAmt > 0 && (
          <div className="flex justify-between text-xs text-[#179150]">
            <span>Descuento ({discountPct}%)</span><span>−{fmtUSD(discountAmt)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-black text-foreground pt-1.5 border-t border-border" style={H9}>
          <span>Total</span>
          <div className="text-right">
            <div className="text-[#179150]">{fmtUSD(total)}</div>
            <div className="text-[10px] font-normal text-muted-foreground">{fmtVES(total)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

