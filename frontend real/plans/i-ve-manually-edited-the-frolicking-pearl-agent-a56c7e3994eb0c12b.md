# Fix Plan

## Fix A — Product Cards (discount duplication)

### Problem
In both `ProductCard.tsx` and `App.tsx` ProductCard, the discount appears **twice**:
1. As an `absolute top-2 right-2` amber ribbon overlapping the image area
2. As an inline `<span>` badge next to the price inside the card body

### Changes in `ProductCard.tsx`

**ProductBox (lines 56-61):** Change `controlledSubstance` badge from `bg-purple-700` → `bg-red-500 text-white`

**ProductCard (lines 122-127):** Remove the absolute-positioned discount ribbon entirely.

**ProductCard price block (lines 157-171):** In the discount branch, remove the inline `<span className="bg-amber-400 ...">-{product.discount}%</span>` that appears next to the price. After the price block's closing `</div>`, add the amber pill below:
```tsx
{product.discount && product.discount > 0 && (
  <span className="inline-block mt-1 bg-amber-400 text-[#006064] text-[10px] font-black px-2 py-0.5 rounded-full" style={H9}>-{product.discount}% OFF</span>
)}
```

### Changes in `App.tsx` ProductCard (lines ~250-295)

**ProductBox in App.tsx (lines 179-184):** Change `controlledSubstance` badge from `bg-purple-700` → `bg-red-500 text-white`. Also change `needsRecipe` badge (lines 172-177) from `bg-red-600` → `bg-[#179150]` (green/teal as specified).

**ProductCard in App.tsx (lines 250-255):** Remove the absolute-positioned discount ribbon block.

**ProductCard price block (lines 281-296):** Remove the inline `-{product.discount}%` span next to the price, then add amber pill below the price block.

## Fix B — Product Detail "Comprados Frecuentemente Juntos"

### ProductDetailPage.tsx
- Remove the entire section lines 329–408 (the `{/* Cross-selling: Comprados frecuentemente juntos */}` block through its closing `})()}`)
- Remove the `FREQUENTLY_BOUGHT_TOGETHER` import from the shared import on line 5 (since it will be unused)

### App.tsx
- Remove the section lines 1495–1511 (the `{/* Comprados frecuentemente juntos */}` block through `})()}`)
- The `FREQUENTLY_BOUGHT_TOGETHER` const defined at line 57 in App.tsx is local (not imported), so check if it's used elsewhere. If only used for this section, remove it too.

## Summary of all file edits

| File | Change |
|------|--------|
| `src/app/components/ProductCard.tsx` | Remove absolute ribbon; remove inline discount span near price; add amber pill below price block; fix controlledSubstance badge to red-500 |
| `src/app/App.tsx` | Same ProductCard changes + fix needsRecipe to green, controlledSubstance to red-500 in ProductBox; remove "Comprados Frecuentemente Juntos" section; remove local FREQUENTLY_BOUGHT_TOGETHER const if unused |
| `src/app/components/ProductDetailPage.tsx` | Remove "Comprados Frecuentemente Juntos" section; remove FREQUENTLY_BOUGHT_TOGETHER from import |
