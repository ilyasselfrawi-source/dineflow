"use client";

import { useState } from "react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isVisible: boolean;
  _count: { menuItems: number };
}

interface Props {
  initialCategories: Category[];
}

export default function CategoriesClient({ initialCategories }: Props) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", description: "", sortOrder: "0", isVisible: true,
  });

  const refresh = async () => {
    const res = await fetch("/api/admin/categories");
    if (res.ok) setCategories(await res.json());
  };

  const openCreate = () => {
    setForm({ name: "", description: "", sortOrder: String(categories.length + 1), isVisible: true });
    setEditCat(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      description: cat.description ?? "",
      sortOrder: String(cat.sortOrder),
      isVisible: cat.isVisible,
    });
    setEditCat(cat);
    setError("");
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        sortOrder: parseInt(form.sortOrder) || 0,
        isVisible: form.isVisible,
      };
      const url = editCat ? `/api/admin/categories/${editCat.id}` : "/api/admin/categories";
      const method = editCat ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to save.");
        return;
      }
      setShowForm(false);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (cat: Category) => {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !cat.isVisible }),
    });
    await refresh();
  };

  const handleDelete = async (cat: Category) => {
    if (cat._count.menuItems > 0) {
      alert(`Cannot delete "${cat.name}" — it has ${cat._count.menuItems} menu item(s). Remove or reassign them first.`);
      return;
    }
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
    if (res.ok) {
      await refresh();
    } else {
      const d = await res.json();
      alert(d.error || "Failed to delete.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Link href="/admin/menu" className="text-stone-400 hover:text-stone-700 text-sm">
              Menu Items
            </Link>
            <span className="text-stone-300">/</span>
            <span className="text-stone-700 text-sm font-medium">Categories</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Categories</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-700 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h3 className="font-bold text-stone-900">{editCat ? "Edit Category" : "New Category"}</h3>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  maxLength={50}
                  placeholder="e.g. Starters, Mains, Drinks"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={200}
                  placeholder="Optional short description"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  min="0"
                  className="w-24 border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                />
                <p className="text-xs text-stone-400 mt-1">Lower numbers appear first</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isVisible}
                  onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm text-stone-700">Visible to customers</span>
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-stone-900 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {saving ? "Saving…" : editCat ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-3 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories list */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <p className="text-sm">No categories yet. Add one to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {categories.map((cat) => (
              <div key={cat.id} className={`flex items-center gap-4 px-5 py-4 ${!cat.isVisible ? "opacity-60" : ""}`}>
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-bold flex-shrink-0">
                  {cat.sortOrder}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-stone-900 text-sm">{cat.name}</p>
                    {!cat.isVisible && (
                      <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>
                  {cat.description && (
                    <p className="text-xs text-stone-400 mt-0.5">{cat.description}</p>
                  )}
                  <p className="text-xs text-stone-400 mt-0.5">
                    {cat._count.menuItems} item{cat._count.menuItems !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleVisible(cat)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                      cat.isVisible
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                    }`}
                  >
                    {cat.isVisible ? "Visible" : "Hidden"}
                  </button>
                  <button
                    onClick={() => openEdit(cat)}
                    className="text-xs text-stone-500 hover:text-stone-800 px-2 py-1.5 rounded-lg hover:bg-stone-100 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
