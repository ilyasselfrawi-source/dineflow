"use client";

import { useState, useEffect } from "react";
import type { MenuItem, CartItemType, OptionGroup, Extra } from "./MenuPage";

interface Props {
  item: MenuItem;
  currencySymbol: string;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    qty: number,
    notes: string,
    selectedOptions: CartItemType["selectedOptions"],
    selectedExtras: CartItemType["selectedExtras"]
  ) => void;
}

export default function ItemDetailModal({ item, currencySymbol, onClose, onAddToCart }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({}); // groupId → optionId
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({}); // extraId → qty

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Pre-select first option for required groups
  useEffect(() => {
    const defaults: Record<string, string> = {};
    item.optionGroups.forEach((group) => {
      if (group.required && group.options.length > 0) {
        defaults[group.id] = group.options[0].id;
      }
    });
    setSelectedOptions(defaults);
  }, [item]);

  const toggleOption = (group: OptionGroup, optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [group.id]: prev[group.id] === optionId && !group.required ? "" : optionId,
    }));
  };

  const toggleExtra = (extra: Extra) => {
    setSelectedExtras((prev) => {
      const current = prev[extra.id] ?? 0;
      if (current > 0) {
        const next = { ...prev };
        delete next[extra.id];
        return next;
      }
      return { ...prev, [extra.id]: 1 };
    });
  };

  // Compute live price
  let totalUnitPrice = item.basePrice;
  item.optionGroups.forEach((group) => {
    const optId = selectedOptions[group.id];
    if (optId) {
      const opt = group.options.find((o) => o.id === optId);
      if (opt) totalUnitPrice += opt.priceModifier;
    }
  });
  Object.entries(selectedExtras).forEach(([extraId, qty]) => {
    const extra = item.extras.find((e) => e.id === extraId);
    if (extra) totalUnitPrice += extra.price * qty;
  });
  const lineTotal = parseFloat((totalUnitPrice * quantity).toFixed(2));

  // Validate required groups
  const isValid = item.optionGroups
    .filter((g) => g.required)
    .every((g) => !!selectedOptions[g.id]);

  const handleAdd = () => {
    if (!isValid) return;

    const builtOptions: CartItemType["selectedOptions"] = [];
    item.optionGroups.forEach((group) => {
      const optId = selectedOptions[group.id];
      if (optId) {
        const opt = group.options.find((o) => o.id === optId);
        if (opt) {
          builtOptions.push({
            groupId: group.id,
            groupName: group.name,
            optionId: opt.id,
            optionName: opt.name,
            priceModifier: opt.priceModifier,
          });
        }
      }
    });

    const builtExtras: CartItemType["selectedExtras"] = Object.entries(selectedExtras)
      .filter(([, qty]) => qty > 0)
      .map(([extraId, qty]) => {
        const extra = item.extras.find((e) => e.id === extraId)!;
        return { extraId, name: extra.name, price: extra.price, quantity: qty };
      });

    onAddToCart(item, quantity, notes, builtOptions, builtExtras);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl max-h-[92vh] flex flex-col animate-slide-up">
        {/* Close handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5">
          {/* Image */}
          {item.imageUrl && (
            <div className="w-full h-52 rounded-2xl overflow-hidden mb-5 bg-stone-100">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Title & price */}
          <div className="flex justify-between items-start mb-2 gap-3">
            <h2 className="font-display text-2xl font-bold text-stone-900 leading-tight flex-1">
              {item.name}
            </h2>
            <span className="text-xl font-bold text-stone-900 flex-shrink-0">
              {currencySymbol}{item.basePrice.toFixed(2)}
            </span>
          </div>
          {item.description && (
            <p className="text-stone-500 text-sm leading-relaxed mb-5">{item.description}</p>
          )}

          {/* Option groups */}
          {item.optionGroups.map((group) => (
            <div key={group.id} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-stone-800 text-sm">{group.name}</h3>
                {group.required ? (
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                    Required
                  </span>
                ) : (
                  <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {group.options.map((opt) => {
                  const isSelected = selectedOptions[group.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(group, opt.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-stone-900 bg-stone-50"
                          : "border-stone-100 bg-white hover:border-stone-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-stone-900 bg-stone-900" : "border-stone-300"
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="text-sm font-medium text-stone-800">{opt.name}</span>
                      </div>
                      {opt.priceModifier > 0 && (
                        <span className="text-sm text-stone-500">+{currencySymbol}{opt.priceModifier.toFixed(2)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Extras */}
          {item.extras.length > 0 && (
            <div className="mb-5">
              <h3 className="font-semibold text-stone-800 text-sm mb-2">Add-ons</h3>
              <div className="space-y-2">
                {item.extras.map((extra) => {
                  const isSelected = (selectedExtras[extra.id] ?? 0) > 0;
                  return (
                    <button
                      key={extra.id}
                      onClick={() => toggleExtra(extra)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-stone-900 bg-stone-50"
                          : "border-stone-100 bg-white hover:border-stone-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected ? "border-stone-900 bg-stone-900" : "border-stone-300"
                        }`}>
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-stone-800">{extra.name}</span>
                      </div>
                      <span className="text-sm text-stone-500">+{currencySymbol}{extra.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special notes */}
          <div className="mb-5">
            <h3 className="font-semibold text-stone-800 text-sm mb-2">Special Instructions</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. No onions, extra spicy, gluten free…"
              maxLength={200}
              rows={3}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-orange-300 resize-none transition"
            />
          </div>

          {/* Spacer for bottom bar */}
          <div className="h-4" />
        </div>

        {/* Bottom bar: quantity + add to cart */}
        <div className="flex-shrink-0 px-5 pt-3 pb-6 safe-bottom border-t border-stone-100 bg-white">
          <div className="flex items-center gap-4">
            {/* Quantity */}
            <div className="flex items-center gap-3 bg-stone-100 rounded-xl px-3 py-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-stone-700 active:scale-90 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
              </button>
              <span className="text-base font-bold text-stone-900 w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(20, quantity + 1))}
                className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-stone-700 active:scale-90 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAdd}
              disabled={!isValid}
              className="flex-1 bg-stone-900 text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-between px-5 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition"
            >
              <span>Add to cart</span>
              <span className="font-bold text-orange-400">
                {currencySymbol}{lineTotal.toFixed(2)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
