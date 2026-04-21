"use client";

import { useState } from "react";
import Link from "next/link";

interface Category { id: string; name: string; }
interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  isAvailable: boolean;
  isVisible: boolean;
  isFeatured: boolean;
  imageUrl: string | null;
  category: Category;
}

interface Props {
  initialItems: MenuItem[];
  categories: Category[];
}

export default function MenuItemsClient({ initialItems, categories }: Props) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [filterCat, setFilterCat] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", basePrice: "", imageUrl: "",
    categoryId: categories[0]?.id ?? "", isAvailable: true, isVisible: true, isFeatured: false,
  });

  const refresh = async () => {
    const res = await fetch("/api/admin/menu-items");
    if (res.ok) setItems(await res.json());
  };

  const openCreate = () => {
    setForm({ name: "", description: "", basePrice: "", imageUrl: "", categoryId: categories[0]?.id ?? "", isAvailable: true, isVisible: true, isFeatured: false });
    setEditItem(null);
    setShowForm(true);
  };

  const openEdit = (item: MenuItem) => {
    setForm({
      name: item.name,
      description: item.description ?? "",
      basePrice: item.basePrice.toString(),
      imageUrl: item.imageUrl ?? "",
      categoryId: item.category.id,
      isAvailable: item.isAvailable,
      isVisible: item.isVisible,
      isFeatured: item.isFeatured,
    });
    setEditItem(item);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        basePrice: parseFloat(form.basePrice),
        imageUrl: form.imageUrl || undefined,
      };
      const url = editItem ? `/api/admin/menu-items/${editItem.id}` : "/api/admin/menu-items";
      const method = editItem ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowForm(false);
        await refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    await fetch(`/api/admin/menu-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !item.isAvailable }),
    });
    await refresh();
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    const res = await fetch(`/api/admin/menu-items/${item.id}`, { method: "DELETE" });
    if (res.ok) await refresh();
    else alert("Failed to delete item.");
  };

  const filtered = filterCat ? items.filter(i => i.category.id === filterCat) : items;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Menu Items</h1>
          <p className="text-stone-500 text-sm mt-0.5">{items.length} items total</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/menu/categories" className="border border-stone-200 text-stone-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-50 transition">
            Categories
          </Link>
          <button onClick={openCreate} className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-700 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Item
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button
          onClick={() => setFilterCat("")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${!filterCat ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
        >All</button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCat(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filterCat === cat.id ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
          >{cat.name}</button>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 sticky top-0 bg-white">
              <h3 className="font-bold text-stone-900">{editItem ? "Edit Item" : "New Menu Item"}</h3>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required maxLength={100} className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} maxLength={500} rows={3} className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Base Price *</label>
                  <input type="number" step="0.01" min="0" value={form.basePrice} onChange={e => setForm({...form, basePrice: e.target.value})} required className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Category *</label>
                  <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Image URL</label>
                <input type="url" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div className="flex gap-4">
                {([["isAvailable","Available"],["isVisible","Visible"],["isFeatured","Featured"]] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={e => setForm({...form, [key]: e.target.checked})} className="w-4 h-4 accent-orange-500" />
                    <span className="text-sm text-stone-700">{label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-stone-900 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50">
                  {saving ? "Saving…" : editItem ? "Update Item" : "Create Item"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-3 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-sm">No items found</div>
        ) : (
          <div className="divide-y divide-stone-50">
            {filtered.map(item => (
              <div key={item.id} className={`flex items-center gap-4 px-5 py-4 ${!item.isAvailable ? "opacity-50" : ""}`}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-stone-100" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-stone-100 flex-shrink-0 flex items-center justify-center text-stone-300 text-xl">🍽</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-stone-900 text-sm">{item.name}</p>
                    {item.isFeatured && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Featured</span>}
                    {!item.isVisible && <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">Hidden</span>}
                  </div>
                  <p className="text-xs text-stone-400">{item.category.name}</p>
                </div>
                <p className="font-bold text-stone-900 text-sm flex-shrink-0">${item.basePrice.toFixed(2)}</p>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleAvailability(item)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${item.isAvailable ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}
                  >
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </button>
                  <button onClick={() => openEdit(item)} className="text-xs text-stone-500 hover:text-stone-800 px-2 py-1.5 rounded-lg hover:bg-stone-100 transition">Edit</button>
                  <button onClick={() => handleDelete(item)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition">Del</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
