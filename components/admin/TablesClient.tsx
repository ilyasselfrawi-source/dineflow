"use client";

import { useState } from "react";
import QRModal from "./QRModal";

interface Table {
  id: string;
  number: string;
  slug: string;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  _count: { orders: number };
}

interface Props {
  initialTables: Table[];
  baseUrl: string;
  restaurantName: string;
}

export default function TablesClient({ initialTables, baseUrl, restaurantName }: Props) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [qrTable, setQrTable] = useState<Table | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formNumber, setFormNumber] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refreshTables = async () => {
    const res = await fetch("/api/admin/tables");
    if (res.ok) setTables(await res.json());
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumber.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: formNumber.trim(), notes: formNotes.trim(), isActive: true }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to create table.");
        return;
      }
      setFormNumber("");
      setFormNotes("");
      setShowForm(false);
      await refreshTables();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (table: Table) => {
    const res = await fetch(`/api/admin/tables/${table.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !table.isActive }),
    });
    if (res.ok) await refreshTables();
  };

  const handleDelete = async (table: Table) => {
    if (!confirm(`Delete ${table.number}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/tables/${table.id}`, { method: "DELETE" });
    if (res.ok) {
      await refreshTables();
    } else {
      const d = await res.json();
      alert(d.error || "Failed to delete.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Tables & QR</h1>
          <p className="text-stone-500 text-sm mt-0.5">{tables.length} total · {tables.filter(t => t.isActive).length} active</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-700 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Table
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border-2 border-orange-200">
          <h3 className="font-semibold text-stone-900 mb-4">New Table</h3>
          <form onSubmit={handleCreate} className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-stone-500 mb-1">Table Number / Label *</label>
              <input
                value={formNumber}
                onChange={(e) => setFormNumber(e.target.value)}
                placeholder="e.g. T7, Bar 3, Patio 1"
                maxLength={20}
                required
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-stone-500 mb-1">Notes (optional)</label>
              <input
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="e.g. Window seat"
                maxLength={200}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            {error && <p className="w-full text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 items-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {saving ? "Creating…" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(""); }}
                className="text-stone-500 px-4 py-2.5 rounded-xl text-sm hover:bg-stone-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tables grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`bg-white rounded-2xl shadow-sm p-5 border-2 transition-colors ${
              table.isActive ? "border-transparent" : "border-stone-200 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-lg">{table.number}</h3>
                {table.notes && (
                  <p className="text-xs text-stone-400 mt-0.5">{table.notes}</p>
                )}
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                table.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-stone-100 text-stone-500"
              }`}>
                {table.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="text-xs text-stone-400 mb-4 font-mono truncate">
              {baseUrl}/menu/{table.slug}
            </p>

            <p className="text-xs text-stone-500 mb-4">
              {table._count.orders} order{table._count.orders !== 1 ? "s" : ""} total
            </p>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setQrTable(table)}
                className="flex items-center gap-1.5 bg-orange-500 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-orange-600 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5z" />
                </svg>
                QR Code
              </button>
              <button
                onClick={() => toggleActive(table)}
                className="flex-1 border border-stone-200 text-stone-600 px-3 py-2 rounded-lg text-xs font-medium hover:bg-stone-50 transition"
              >
                {table.isActive ? "Deactivate" : "Activate"}
              </button>
              {table._count.orders === 0 && (
                <button
                  onClick={() => handleDelete(table)}
                  className="text-red-400 hover:text-red-600 p-2 rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* QR Modal */}
      {qrTable && (
        <QRModal
          table={qrTable}
          baseUrl={baseUrl}
          restaurantName={restaurantName}
          onClose={() => setQrTable(null)}
          onRegenerateSlug={async () => {
            await fetch(`/api/admin/tables/${qrTable.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "regenerate_slug" }),
            });
            await refreshTables();
            setQrTable(null);
          }}
        />
      )}
    </div>
  );
}
