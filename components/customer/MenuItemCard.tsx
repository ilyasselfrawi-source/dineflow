"use client";

import type { MenuItem } from "./MenuPage";

interface Props {
  item: MenuItem;
  currencySymbol: string;
  onSelect: () => void;
}

export default function MenuItemCard({ item, currencySymbol, onSelect }: Props) {
  const hasOptions = item.optionGroups.length > 0 || item.extras.length > 0;

  return (
    <button
      onClick={onSelect}
      className="w-full text-left bg-white rounded-2xl overflow-hidden active:scale-[0.98] transition-transform shadow-sm hover:shadow-md"
    >
      <div className="flex gap-3 p-3">
        {/* Text content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            {item.isFeatured && (
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-orange-500 mb-1">
                ★ Featured
              </span>
            )}
            <h3 className="font-semibold text-stone-900 text-sm leading-snug">{item.name}</h3>
            {item.description && (
              <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-bold text-stone-900 text-sm">
              {currencySymbol}{item.basePrice.toFixed(2)}
              {hasOptions && <span className="font-normal text-stone-400 text-xs"> +</span>}
            </span>
            <span className="ml-auto bg-stone-900 text-white w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </span>
          </div>
        </div>

        {/* Image */}
        {item.imageUrl ? (
          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-xl flex-shrink-0 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}
