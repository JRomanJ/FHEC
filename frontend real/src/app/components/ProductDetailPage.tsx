import React, { useState } from "react";
import {
  ShoppingCart, Plus, Minus, AlertTriangle, Shield, Check, ChevronRight, Info, Clock,
} from "lucide-react";
import { Page, Product, H9, H7, fmtVES, fmtUSD, effectivePrice, FREQUENTLY_BOUGHT_TOGETHER } from "../shared";
import { ProductBox, Stars } from "./ProductCard";

const VES_RATE = 40.50;

// ─── ProductDetailPage ─────────────────────────────────────────────────────────
export function ProductDetailPage({ product, products, onAddToCart, onBack, onProductClick, onNav, favoriteIds, onToggleFavorite }: {
  product: Product; products: Product[]; onAddToCart: (p: Product, qty: number) => void;
  onBack: () => void; onProductClick: (id: number) => void; onNav: (p: Page) => void;
  favoriteIds: Set<number>; onToggleFavorite: (id: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showRecipeDetails, setShowRecipeDetails] = useState(false);
  const [showControlledDetails, setShowControlledDetails] = useState(false);
  const [carouselQty, setCarouselQty] = useState<Record<number, number>>({});
  const isFav = favoriteIds.has(product.id);
  const alternatives = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  const getCarouselQty = (productId: number) => carouselQty[productId] || 1;
  const updateCarouselQty = (productId: number, newQty: number) => {
    setCarouselQty(prev => ({ ...prev, [productId]: newQty }));
  };

  const handleAdd = () => {
    if (product.stock === 0) return;
    onAddToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mt-5 mb-6 text-sm text-muted-foreground">
        <button onClick={() => onNav("home")} className="hover:text-foreground transition-colors">Inicio</button>
        <ChevronRight size={13} />
        <button onClick={onBack} className="hover:text-foreground transition-colors">Catálogo</button>
        <ChevronRight size={13} />
        <span className="text-foreground font-semibold">{product.name}</span>
      </div>

      {/* Medical alert — prescription required */}
      {product.needsRecipe && !product.controlledSubstance && (
        <div className="bg-red-50 border-l-4 border-red-600 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-4">
            <AlertTriangle size={22} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-red-800 font-black text-base uppercase" style={H9}>Récipe Digital Requerido</div>
              <p className="text-red-700 text-sm mt-1 leading-relaxed">
                Este producto requiere la carga de récipe digital previa al pago.
              </p>
              <button
                onClick={() => setShowRecipeDetails(!showRecipeDetails)}
                className="text-[#006064] text-xs font-bold underline hover:text-red-800 transition-colors mt-2 flex items-center gap-1"
              >
                Ver más {showRecipeDetails ? "▲" : "▼"}
              </button>
              {showRecipeDetails && (
                <div className="mt-3 bg-white border border-red-200 rounded-lg p-3 text-xs text-red-800 space-y-2">
                  <div className="font-bold">Exigencias del récipe digital:</div>
                  <ul className="list-disc list-inside space-y-1 text-red-700">
                    <li>Foto o PDF del récipe médico legible y completo</li>
                    <li>Récipe firmado y sellado por médico colegiado activo</li>
                    <li>Vigencia del récipe no mayor a 30 días desde emisión</li>
                    <li>Debe incluir: nombre del paciente, diagnóstico, medicamento prescrito, dosis y frecuencia</li>
                    <li>Número de colegio médico del profesional claramente visible</li>
                    <li>El pedido será validado por nuestro equipo farmacéutico antes del despacho</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controlled substance alert */}
      {product.controlledSubstance && (
        <div className="bg-purple-50 border-l-4 border-purple-700 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-4">
            <Shield size={22} className="text-purple-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-purple-900 font-black text-base uppercase" style={H9}>Uso Controlado</div>
              <p className="text-purple-800 text-sm mt-1 leading-relaxed">
                Solo disponible para reserva, retiro en tienda física y pago presencial con entrega de récipe original.
              </p>
              <button
                onClick={() => setShowControlledDetails(!showControlledDetails)}
                className="text-[#006064] text-xs font-bold underline hover:text-purple-900 transition-colors mt-2 flex items-center gap-1"
              >
                Ver más {showControlledDetails ? "▲" : "▼"}
              </button>
              {showControlledDetails && (
                <div className="mt-3 bg-white border border-purple-200 rounded-lg p-3 text-xs text-purple-800 space-y-2">
                  <div className="font-bold">Exigencias del récipe para sustancias controladas:</div>
                  <ul className="list-disc list-inside space-y-1 text-purple-700">
                    <li>Récipe médico ORIGINAL en físico (no se aceptan copias ni fotos)</li>
                    <li>Firmado y sellado por médico psiquiatra o neurólogo colegiado</li>
                    <li>Vigencia del récipe no mayor a 15 días desde emisión</li>
                    <li>Debe incluir: nombre completo del paciente, cédula, diagnóstico CIE-10</li>
                    <li>Medicamento prescrito con dosis exacta, frecuencia y duración del tratamiento</li>
                    <li>Número de colegio médico y firma del profesional legibles</li>
                    <li>Solo retiro presencial con presentación de cédula del paciente o apoderado legal</li>
                    <li>Sujeto a regulación especial del MPPS - No disponible para delivery</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: image */}
        <div>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <ProductBox product={product} size="lg" />
          </div>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs bg-[#e0f5eb] text-[#006064] border border-[#a7f3d0] px-3 py-1 rounded-full font-semibold">{product.category}</span>
            <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full font-semibold">{product.presentation} {product.packSize}</span>
            {product.controlledSubstance ? (
              <span className="text-xs bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                <Shield size={10} />Uso Controlado
              </span>
            ) : product.needsRecipe ? (
              <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                <AlertTriangle size={10} />Récipe Requerido
              </span>
            ) : null}
          </div>
        </div>

        {/* Right: info */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">{product.brand}</div>
          <h1 className="text-foreground text-4xl lg:text-5xl uppercase leading-none mb-2" style={H9}>{product.name}</h1>

          <div className="flex items-center gap-2 mb-5">
            <Stars rating={product.rating} />
            <span className="text-sm text-muted-foreground font-semibold">{product.rating} · {product.reviews} reseñas</span>
          </div>

          {/* Price */}
          <div className="bg-muted rounded-2xl p-4 mb-5">
            {product.discount ? (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-[#179150] text-4xl leading-none" style={H9}>{fmtUSD(effectivePrice(product))} USD</div>
                  <span className="bg-amber-400 text-[#006064] text-sm font-black px-2.5 py-1 rounded-full" style={H9}>-{product.discount}% DCTO</span>
                </div>
                <div className="text-muted-foreground text-lg mt-1 line-through" style={H7}>{fmtUSD(product.priceUSD)} USD</div>
                <div className="text-muted-foreground text-base mt-0.5" style={H7}>{fmtVES(effectivePrice(product))}</div>
                <div className="text-xs text-green-700 font-semibold mt-1">
                  Ahorras {fmtUSD(product.priceUSD - effectivePrice(product))} USD ({fmtVES(product.priceUSD - effectivePrice(product))})
                </div>
              </>
            ) : (
              <>
                <div className="text-[#179150] text-4xl leading-none" style={H9}>{fmtUSD(product.priceUSD)} USD</div>
                <div className="text-muted-foreground text-lg mt-1" style={H7}>{fmtVES(product.priceUSD)}</div>
              </>
            )}
            <div className="text-xs text-muted-foreground mt-2">Tasa de cambio referencial: 1 USD = Bs.S {VES_RATE.toFixed(2)}</div>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-5">
            <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? "bg-[#179150]" : "bg-gray-400"}`} />
            <span className={`text-sm font-semibold ${product.stock > 0 ? "text-[#179150]" : "text-gray-500"}`}>
              {product.stock > 0 ? `${product.stock} unidades disponibles` : "Producto agotado"}
            </span>
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-5">
              <span className="text-sm font-semibold text-foreground">Cantidad:</span>
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-black text-base" style={H9}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className={`flex-1 py-3 rounded-xl text-base uppercase flex items-center justify-center gap-2 transition-all duration-200
                ${product.stock === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : added ? "bg-[#179150] text-white" : "bg-[#50e9f8] text-[#006064] hover:bg-[#2dd8e8]"}`}
              style={H7}
            >
              {added ? (<><Check size={16} />Añadido al carrito</>) : product.stock === 0 ? "Sin Disponibilidad" : (<><ShoppingCart size={16} />Añadir al Carrito</>)}
            </button>
            <button
              onClick={() => onToggleFavorite(product.id)}
              className={`w-12 h-12 border rounded-xl flex items-center justify-center transition-colors ${isFav ? "bg-red-50 border-red-300" : "border-border hover:bg-red-50 hover:border-red-200"}`}
            >
              <svg viewBox="0 0 24 24" fill={isFav ? "#c62828" : "none"} stroke={isFav ? "#c62828" : "currentColor"} strokeWidth="2" className="w-5 h-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            </button>
          </div>

          {/* Drug info */}
          <div className="space-y-3">
            <div className="bg-muted rounded-xl p-4">
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">Principio Activo</div>
              <div className="text-sm text-foreground font-semibold">{product.activeIngredient}</div>
            </div>
            <div className="bg-[#e0f5eb] border border-[#a7f3d0] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Clock size={13} className="text-[#006064]" />
                <div className="text-xs text-[#005f6b] font-black uppercase tracking-wider">Posología Referencial</div>
              </div>
              <div className="text-sm text-[#003d45] leading-relaxed">{product.posology}</div>
              <div className="mt-2.5 flex items-start gap-1.5 text-[10px] text-[#006064]/70">
                <AlertTriangle size={10} className="flex-shrink-0 mt-0.5" />
                <span>Información orientativa. Siga siempre las indicaciones de su médico o farmacéutico.</span>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Info size={13} className="text-amber-600" />
                <div className="text-xs text-amber-800 font-semibold uppercase tracking-wider">Contraindicaciones</div>
              </div>
              <div className="text-sm text-amber-900 leading-relaxed">{product.contraindications}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-8 bg-card border border-border rounded-2xl p-6">
        <h3 className="text-foreground text-lg uppercase mb-3" style={H9}>Descripción del Producto</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
      </div>

      {/* Cross-selling: Equivalentes (Mismo principio activo) */}
      {(() => {
        const equivalents = products.filter(p => p.activeIngredient === product.activeIngredient && p.id !== product.id);
        if (equivalents.length === 0) return null;
        return (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔄</span>
              <h3 className="text-foreground text-2xl uppercase" style={H9}>Equivalentes (Mismo principio activo)</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
              {equivalents.map(p => {
                const localQty = getCarouselQty(p.id);
                const isFav = favoriteIds.has(p.id);
                return (
                  <div
                    key={p.id}
                    className="flex-shrink-0 w-64 bg-card border border-border rounded-2xl overflow-hidden hover:border-[#179150] hover:shadow-lg transition-all relative"
                  >
                    {/* Favorite button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite(p.id); }}
                      className="absolute top-2 left-2 z-10 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all"
                    >
                      <svg viewBox="0 0 24 24" fill={isFav ? "#c62828" : "none"} stroke={isFav ? "#c62828" : "currentColor"} strokeWidth="2" className={`w-3.5 h-3.5 ${isFav ? "text-red-600" : "text-gray-400"}`}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    <div onClick={() => onProductClick(p.id)} className="cursor-pointer">
                      <div className="h-40 overflow-hidden">
                        <ProductBox product={p} size="md" />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{p.brand}</div>
                      <div className="text-foreground text-sm uppercase leading-tight mb-2" style={H9}>{p.name}</div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Stars rating={p.rating} />
                        <span className="text-[10px] text-muted-foreground">({p.reviews})</span>
                      </div>
                      <div className="text-[#179150] text-xl leading-none mb-3" style={H9}>{fmtUSD(effectivePrice(p))} USD</div>

                      {/* Quantity selector */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center border border-border rounded-lg overflow-hidden flex-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateCarouselQty(p.id, Math.max(1, localQty - 1)); }}
                            className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="flex-1 text-center text-sm font-black" style={H9}>{localQty}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateCarouselQty(p.id, Math.min(p.stock, localQty + 1)); }}
                            className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                            disabled={localQty >= p.stock}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); onAddToCart(p, localQty); }}
                        disabled={p.stock === 0}
                        className={`w-full py-2 rounded-lg text-xs uppercase font-black transition-colors ${p.stock === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#50e9f8] text-[#006064] hover:bg-[#2dd8e8]"}`}
                        style={H7}
                      >
                        {p.stock === 0 ? "Sin Stock" : "Añadir al Carrito"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Cross-selling: Comprados frecuentemente juntos */}
      {(() => {
        const frequentlyBoughtIds = FREQUENTLY_BOUGHT_TOGETHER[product.id] || [];
        const frequentlyBought = frequentlyBoughtIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => p !== undefined);
        if (frequentlyBought.length === 0) return null;
        return (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🛒</span>
              <h3 className="text-foreground text-2xl uppercase" style={H9}>Comprados Frecuentemente Juntos</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
              {frequentlyBought.map(p => {
                const localQty = getCarouselQty(p.id);
                const isFav = favoriteIds.has(p.id);
                return (
                  <div
                    key={p.id}
                    className="flex-shrink-0 w-64 bg-card border border-border rounded-2xl overflow-hidden hover:border-[#179150] hover:shadow-lg transition-all relative"
                  >
                    {/* Favorite button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite(p.id); }}
                      className="absolute top-2 left-2 z-10 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all"
                    >
                      <svg viewBox="0 0 24 24" fill={isFav ? "#c62828" : "none"} stroke={isFav ? "#c62828" : "currentColor"} strokeWidth="2" className={`w-3.5 h-3.5 ${isFav ? "text-red-600" : "text-gray-400"}`}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    <div onClick={() => onProductClick(p.id)} className="cursor-pointer">
                      <div className="h-40 overflow-hidden">
                        <ProductBox product={p} size="md" />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{p.brand}</div>
                      <div className="text-foreground text-sm uppercase leading-tight mb-2" style={H9}>{p.name}</div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Stars rating={p.rating} />
                        <span className="text-[10px] text-muted-foreground">({p.reviews})</span>
                      </div>
                      <div className="text-[#179150] text-xl leading-none mb-3" style={H9}>{fmtUSD(effectivePrice(p))} USD</div>

                      {/* Quantity selector */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center border border-border rounded-lg overflow-hidden flex-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateCarouselQty(p.id, Math.max(1, localQty - 1)); }}
                            className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="flex-1 text-center text-sm font-black" style={H9}>{localQty}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateCarouselQty(p.id, Math.min(p.stock, localQty + 1)); }}
                            className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                            disabled={localQty >= p.stock}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); onAddToCart(p, localQty); }}
                        disabled={p.stock === 0}
                        className={`w-full py-2 rounded-lg text-xs uppercase font-black transition-colors ${p.stock === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#50e9f8] text-[#006064] hover:bg-[#2dd8e8]"}`}
                        style={H7}
                      >
                        {p.stock === 0 ? "Sin Stock" : "Añadir al Carrito"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
