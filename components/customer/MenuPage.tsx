"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { nanoid } from "nanoid";
import CategoryNav from "./CategoryNav";
import MenuItemCard from "./MenuItemCard";
import ItemDetailModal from "./ItemDetailModal";
import CartDrawer from "./CartDrawer";

export interface Settings {
  restaurantName: string;
  currencySymbol: string;
  currency: string;
  welcomeMessage: string;
  wifiSsid: string | null;
  wifiPassword: string | null;
  primaryColor: string;
  taxRate: number;
  serviceCharge: number;
  logoUrl: string | null;
}

export interface OptionItem {
  id: string;
  name: string;
  priceModifier: number;
  sortOrder: number;
}

export interface OptionGroup {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  options: OptionItem[];
}

export interface Extra {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  optionGroups: OptionGroup[];
  extras: Extra[];
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  menuItems: MenuItem[];
}

export interface Table {
  id: string;
  number: string;
  slug: string;
}

export interface CartItemType {
  cartId: string; // local unique id
  menuItem: MenuItem;
  quantity: number;
  notes: string;
  selectedOptions: {
    groupId: string;
    groupName: string;
    optionId: string;
    optionName: string;
    priceModifier: number;
  }[];
  selectedExtras: {
    extraId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  lineTotal: number;
}

function calcLineTotal(
  item: MenuItem,
  quantity: number,
  selectedOptions: CartItemType["selectedOptions"],
  selectedExtras: CartItemType["selectedExtras"]
): number {
  let price = item.basePrice;
  price += selectedOptions.reduce((s, o) => s + o.priceModifier, 0);
  price += selectedExtras.reduce((s, e) => s + e.price * e.quantity, 0);
  return parseFloat((price * quantity).toFixed(2));
}

interface Props {
  table: Table;
  categories: Category[];
  settings: Settings;
}

export default function MenuPage({ table, categories, settings }: Props) {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection observer to update active category while scrolling
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id.replace("cat-", ""));
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    Object.values(categoryRefs.current).forEach((el) => {
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [categories]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartSubtotal = cart.reduce((s, i) => s + i.lineTotal, 0);
  const taxAmount = parseFloat((cartSubtotal * (settings.taxRate / 100)).toFixed(2));
  const serviceAmount = parseFloat((cartSubtotal * (settings.serviceCharge / 100)).toFixed(2));
  const cartTotal = parseFloat((cartSubtotal + taxAmount + serviceAmount).toFixed(2));

  const sym = settings.currencySymbol;

  // Filter items by search
  const filteredCategories = searchQuery.trim()
    ? categories
        .map((cat) => ({
          ...cat,
          menuItems: cat.menuItems.filter(
            (item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description?.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((cat) => cat.menuItems.length > 0)
    : categories;

  const addToCart = useCallback(
    (
      menuItem: MenuItem,
      quantity: number,
      notes: string,
      selectedOptions: CartItemType["selectedOptions"],
      selectedExtras: CartItemType["selectedExtras"]
    ) => {
      const lineTotal = calcLineTotal(menuItem, quantity, selectedOptions, selectedExtras);
      const cartItem: CartItemType = {
        cartId: nanoid(),
        menuItem,
        quantity,
        notes,
        selectedOptions,
        selectedExtras,
        lineTotal,
      };
      setCart((prev) => [...prev, cartItem]);
      setSelectedItem(null);
    },
    []
  );

  const updateCartQuantity = useCallback((cartId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.cartId !== cartId));
      return;
    }
    setCart((prev) =>
      prev.map((i) => {
        if (i.cartId !== cartId) return i;
        return {
          ...i,
          quantity: qty,
          lineTotal: calcLineTotal(i.menuItem, qty, i.selectedOptions, i.selectedExtras),
        };
      })
    );
  }, []);

  const removeFromCart = useCallback((cartId: string) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const scrollToCategory = (catId: string) => {
    const el = categoryRefs.current[catId];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setActiveCategory(catId);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-20 safe-top">
        <div className="max-w-lg mx-auto px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.restaurantName} className="h-7 object-contain" />
              ) : (
                <span className="font-display text-lg font-bold text-stone-900">
                  {settings.restaurantName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full">
                {table.number}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search menu…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-orange-300 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category nav */}
        {!searchQuery && (
          <CategoryNav
            categories={categories}
            activeId={activeCategory}
            onSelect={scrollToCategory}
          />
        )}
      </header>

      {/* ── WiFi Banner ─────────────────────────────────────────── */}
      {settings.wifiSsid && (
        <div className="max-w-lg mx-auto px-4 pt-3">
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0z" />
            </svg>
            <p className="text-xs text-blue-700">
              <span className="font-medium">Free WiFi:</span> {settings.wifiSsid}
              {settings.wifiPassword && (
                <span className="text-blue-500"> · {settings.wifiPassword}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* ── Menu Content ────────────────────────────────────────── */}
      <main className="max-w-lg mx-auto px-4 pt-4">
        {filteredCategories.length === 0 && (
          <div className="text-center py-20 text-stone-400">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
            </svg>
            <p className="font-medium">No items found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}

        {filteredCategories.map((category) => (
          <section
            key={category.id}
            id={`cat-${category.id}`}
            ref={(el) => { categoryRefs.current[category.id] = el; }}
            className="mb-8"
          >
            <div className="mb-4">
              <h2 className="font-display text-xl font-bold text-stone-900">{category.name}</h2>
              {category.description && (
                <p className="text-sm text-stone-500 mt-0.5">{category.description}</p>
              )}
            </div>
            <div className="space-y-3">
              {category.menuItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  currencySymbol={sym}
                  onSelect={() => setSelectedItem(item)}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* ── Sticky Cart Button ───────────────────────────────────── */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-6 safe-bottom">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setCartOpen(true)}
              className="w-full flex items-center justify-between bg-stone-900 text-white rounded-2xl px-5 py-4 shadow-2xl active:scale-[0.98] transition-transform animate-slide-up"
            >
              <div className="flex items-center gap-3">
                <span className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
                <span className="font-medium">View Cart</span>
              </div>
              <span className="font-bold text-orange-400">
                {sym}{cartTotal.toFixed(2)}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────── */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          currencySymbol={sym}
          onClose={() => setSelectedItem(null)}
          onAddToCart={addToCart}
        />
      )}

      {cartOpen && (
        <CartDrawer
          cart={cart}
          table={table}
          settings={settings}
          subtotal={cartSubtotal}
          taxAmount={taxAmount}
          serviceAmount={serviceAmount}
          total={cartTotal}
          onClose={() => setCartOpen(false)}
          onUpdateQuantity={updateCartQuantity}
          onRemove={removeFromCart}
          onClearCart={clearCart}
        />
      )}
    </div>
  );
}
