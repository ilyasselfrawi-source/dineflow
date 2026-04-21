"use client";

import { useRef, useEffect } from "react";
import type { Category } from "./MenuPage";

interface Props {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function CategoryNav({ categories, activeId, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Auto-scroll active button into view
  useEffect(() => {
    if (activeButtonRef.current && scrollRef.current) {
      const btn = activeButtonRef.current;
      const container = scrollRef.current;
      const btnLeft = btn.offsetLeft;
      const btnWidth = btn.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = btnLeft - containerWidth / 2 + btnWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeId]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 px-4 pb-2.5 overflow-x-auto hide-scrollbar"
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <button
            key={cat.id}
            ref={isActive ? activeButtonRef : null}
            onClick={() => onSelect(cat.id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              isActive
                ? "bg-stone-900 text-white shadow-sm"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
