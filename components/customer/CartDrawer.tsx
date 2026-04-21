"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CartItemType, Table, Settings } from "./MenuPage";

interface Props {
  cart: CartItemType[];
  table: Table;
  settings: Settings;
  subtotal: number;
  taxAmount: number;
  serviceAmount: number;
  total: number;
  onClose: () => void;
  onUpdateQuantity: (cartId: string, qty: number) => void;
  onRemove: (cartId: string) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  cart, table, settings,
  subtotal, taxAmount, serviceAmount, total,
  onClose, onUpdateQuantity, onRemove, onClearCart,
}: Props) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const sym = settings.currencySymbol;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSubmit = async () => {
    if (submitting || cart.length === 0) return;
    setError("");
    setSubmitting(true);

    // Generate idempotency token
    const submissionToken = `${table.slug}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const payload = {
      tableSlug: table.slug,
      customerName: customerName.trim() || undefined,
      submissionToken,
      items: cart.map((ci) => ({
        menuItemId: ci.menuItem.id,
        quantity: ci.quantity,
        notes: ci.notes || "",
        selectedOptions: ci.selectedOptions,
        selectedExtras: ci.selectedExtras,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      onClearCart();
      router.push(`/order-confirmation/${data.orderId}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative bg-white rounded-t-3xl max-h-[92vh] flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900">Your Order</h2>
            <p className="text-xs text-stone-500">{table.number}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items list */}
        <div className="overflow-y-auto flex-1 px-5">
          <div className="space-y-3 pb-2">
            {cart.map((ci) => {
              const opts = ci.selectedOptions.map((o) => o.optionName).join(", ");
              const exts = ci.selectedExtras.map((e) => `+${e.name}`).join(", ");
              return (
                <div key={ci.cartId} className="flex gap-3 bg-stone-50 rounded-2xl p-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 text-sm">{ci.menuItem.name}</p>
                    {opts && <p className="text-xs text-stone-500 mt-0.5">{opts}</p>}
                    {exts && <p className="text-xs text-stone-500">{exts}</p>}
                    {ci.notes && (
                      <p className="text-xs text-stone-400 italic mt-0.5">"{ci.notes}"</p>
                    )}
                    <p className="text-sm font-bold text-stone-900 mt-1">
                      {sym}{ci.lineTotal.toFixed(2)}
                    </p>
                  </div>
                  {/* Quantity controls */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => onRemove(ci.cartId)}
                      className="text-stone-300 hover:text-red-400 transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-stone-200 px-2 py-1">
                      <button
                        onClick={() => onUpdateQuantity(ci.cartId, ci.quantity - 1)}
                        className="text-stone-600 w-5 h-5 flex items-center justify-center"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="text-sm font-bold text-stone-900 w-5 text-center">{ci.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(ci.cartId, ci.quantity + 1)}
                        className="text-stone-600 w-5 h-5 flex items-center justify-center"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Customer name (optional) */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Your name (optional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Marco"
              maxLength={50}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-orange-300 transition"
            />
          </div>

          {/* Totals */}
          <div className="mt-5 bg-stone-50 rounded-2xl px-4 py-4 space-y-2">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Subtotal</span>
              <span>{sym}{subtotal.toFixed(2)}</span>
            </div>
            {taxAmount > 0 && (
              <div className="flex justify-between text-sm text-stone-500">
                <span>Tax ({settings.taxRate}%)</span>
                <span>{sym}{taxAmount.toFixed(2)}</span>
              </div>
            )}
            {serviceAmount > 0 && (
              <div className="flex justify-between text-sm text-stone-500">
                <span>Service charge ({settings.serviceCharge}%)</span>
                <span>{sym}{serviceAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-200 text-base">
              <span>Total</span>
              <span>{sym}{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="h-4" />
        </div>

        {/* Submit bar */}
        <div className="flex-shrink-0 px-5 pt-3 pb-6 safe-bottom border-t border-stone-100 bg-white">
          <button
            onClick={handleSubmit}
            disabled={submitting || cart.length === 0}
            className="w-full bg-stone-900 text-white rounded-xl py-4 font-bold text-base flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] transition"
          >
            {submitting ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Placing order…
              </>
            ) : (
              <>
                Place Order · <span className="text-orange-400">{sym}{total.toFixed(2)}</span>
              </>
            )}
          </button>
          <p className="text-center text-xs text-stone-400 mt-2">
            By placing your order you agree to pay at the table.
          </p>
        </div>
      </div>
    </div>
  );
}
