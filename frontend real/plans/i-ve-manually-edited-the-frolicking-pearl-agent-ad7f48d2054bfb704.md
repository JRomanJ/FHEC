# Plan: Remove partial payment / underpayment logic from App.tsx

## File: `/workspaces/default/code/src/app/App.tsx`

---

### 1. CheckoutPage function signature & helpers (~line 2278)

**Remove from signature:**
- `alreadyPaid = 0` prop and its type
- Change `onClearCart?: (paidAmount: number) => void` → `onClearCart?: () => void`

**Remove variable:**
- `const remaining = +(total - alreadyPaid).toFixed(2);` (line 2326)

**Simplify `handleConfirm`:**
- Remove the `diff < -THRESH` branch (lines 2341–2344)
- Replace it with: `setConfirmError("El monto reportado no coincide con el total del pedido.")`
- In the exact/close branch: change `onClearCart(remaining)` → `onClearCart()`
- Keep overpayment branch as-is

**Input placeholder fix (line 2471):**
- Change `placeholder={fmtVES(remaining).replace("Bs.S ","")}` → `placeholder={fmtVES(total).replace("Bs.S ","")}`

**Sidebar summary (lines 2592–2603):**
- Remove entire `{alreadyPaid > 0 && <> ... </>}` block
- Change label "Total del pedido" is already fine; no changes needed to "Total a pagar" label since it already shows `total`

---

### 2. TrackingPage function (~line 2613)

**Remove from signature:**
- `paidAmount?: number` prop and `initialPaidAmount` variable

**Remove state declarations:**
- `underTimer`, `underExpired`, `showRefundModal`, `orderCancelled` (lines 2633–2636)

**Remove the underpayment useEffect** (lines 2738–2746)

**Simplify financial vars (lines 2732–2736):**
- Remove: `const realPaid = initialPaidAmount >= 0 ? initialPaidAmount : total;`
- Remove: `const effectivePaid = realPaid;`
- Remove: `const paidAmount = effectivePaid;`
- Remove: `const pendingAmount = +(total - paidAmount).toFixed(2);`
- Remove: `const hasUnderpayment = pendingAmount > 0.01;`
- Keep just `const paidAmount = total;` (for the "Pagado" row in the products card)

**Remove JSX blocks:**
1. Refund modal (`{showRefundModal && ...}`) — lines 2765–2783
2. Order cancelled screen (`{orderCancelled && ...}`) — lines 2785–2799
3. `{!orderCancelled && <>` wrapper and its closing `</>}` — lines 2801 and somewhere after
4. Underpayment card (`{hasUnderpayment && !orderCancelled && ...}`) — lines 2976–3004
5. `{pendingAmount > 0.01 && ...}` row in financial summary — lines 2968–2972

**Fix "Pago Pendiente" alert condition (line 2895):**
- Change `!hasUnderpayment &&` → remove this condition (or just remove `&& !hasUnderpayment` from it)

**Fix "Nuevo Pedido" button condition (line 3007):**
- Change `&& !hasUnderpayment` → remove that clause

**Financial summary "Pagado" row (line 2966):**
- Keep as-is; `paidAmount` will now equal `total`

---

### 3. App component (~line 6578+)

**Remove state:**
- `const [orderPaidAmount, setOrderPaidAmount] = useState(-1);` (line 6578)

**Logout handler (line 6661):**
- Remove `setOrderPaidAmount(-1);` from the logout handler

**DeliverySelectPage call (line 6693):**
- Remove `setOrderPaidAmount(-1);` from `onConfirmOrder` callback

**CheckoutPage call (line 6695):**
- Remove `alreadyPaid={...}` prop
- Simplify `onClearCart` to: `() => { setActiveOrderItems(cartItems.length > 0 ? cartItems : activeOrderItems); setHasActiveOrder(true); setCartItems([]); }`

**TrackingPage call (lines 6696–6705):**
- Remove `paidAmount={orderPaidAmount}` prop
- Simplify `onOrderComplete` to: `() => { setHasActiveOrder(false); }`

---

### Execution order
1. Edit CheckoutPage signature, remove `remaining`, fix `handleConfirm`, fix placeholder, remove alreadyPaid sidebar block
2. Edit TrackingPage: remove states, useEffect, simplify financials, remove JSX blocks, fix fragment wrapper, fix conditions
3. Edit App component: remove state, clean up all call sites
