"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_CONFIG,
  ORDER_STATUS_TRANSITIONS,
} from "@/lib/utils/formatters";

interface OrderItem {
  id: string;
  itemNameSnapshot: string;
  basePriceSnapshot: number;
  quantity: number;
  notes: string | null;
  selectedOptions: string | null;
  selectedExtras: string | null;
  lineTotal: number;
}

interface StatusHistory {
  id: string;
  status: string;
  createdAt: string;
  changedBy: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  serviceAmount: number;
  total: number;
  customerName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  table: { id: string; number: string };
  items: OrderItem[];
  statusHistory: StatusHistory[];
}

interface Props {
  order: Order;
  currencySymbol: string;
}

export default function OrderDetailClient({ order: initialOrder, currencySymbol }: Props) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [updating, setUpdating] = useState(false);
  const sym = currencySymbol;

  const cfg = ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.NEW;
  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status] ?? [];

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder((prev) => ({ ...prev, status: updated.status }));
        router.refresh();
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back */}
      <Link href="/admin/orders" className="text-sm text-stone-500 hover:text-stone-800 flex items-center gap-1.5 mb-5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-2xl font-bold text-stone-900">{order.orderNumber}</h1>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${cfg.color} ${cfg.bg}`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-stone-500 text-sm">
            {order.table.number}
            {order.customerName ? ` · ${order.customerName}` : ""}
            {" · "}
            {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Status actions */}
        {nextStatuses.length > 0 && (
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            {nextStatuses.map((ns) => {
              const nsCfg = ORDER_STATUS_CONFIG[ns];
              const isCancelBtn = ns === "CANCELLED";
              return (
                <button
                  key={ns}
                  onClick={() => updateStatus(ns)}
                  disabled={updating}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${
                    isCancelBtn
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-stone-900 text-white hover:bg-stone-700"
                  }`}
                >
                  {updating ? "…" : `Mark ${nsCfg?.label ?? ns}`}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Order items */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="px-5 py-3.5 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Items</h2>
        </div>
        <div className="divide-y divide-stone-50">
          {order.items.map((item) => {
            const options: any[] = item.selectedOptions ? JSON.parse(item.selectedOptions) : [];
            const extras: any[] = item.selectedExtras ? JSON.parse(item.selectedExtras) : [];
            return (
              <div key={item.id} className="px-5 py-4">
                <div className="flex justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded">
                        ×{item.quantity}
                      </span>
                      <span className="font-semibold text-stone-900">{item.itemNameSnapshot}</span>
                    </div>
                    {options.length > 0 && (
                      <p className="text-sm text-stone-500 mt-1">
                        {options.map((o: any) => o.optionName).join(", ")}
                      </p>
                    )}
                    {extras.length > 0 && (
                      <p className="text-sm text-stone-500">
                        + {extras.map((e: any) => e.name).join(", ")}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 mt-2 inline-block">
                        📝 {item.notes}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-stone-900 flex-shrink-0">
                    {formatCurrency(item.lineTotal, sym)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="bg-stone-50 px-5 py-4 space-y-2 border-t border-stone-100">
          <div className="flex justify-between text-sm text-stone-500">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal, sym)}</span>
          </div>
          {order.taxAmount > 0 && (
            <div className="flex justify-between text-sm text-stone-500">
              <span>Tax</span>
              <span>{formatCurrency(order.taxAmount, sym)}</span>
            </div>
          )}
          {order.serviceAmount > 0 && (
            <div className="flex justify-between text-sm text-stone-500">
              <span>Service charge</span>
              <span>{formatCurrency(order.serviceAmount, sym)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-stone-900 text-base pt-2 border-t border-stone-200">
            <span>Total</span>
            <span>{formatCurrency(order.total, sym)}</span>
          </div>
        </div>
      </div>

      {/* Status history */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Status History</h2>
        </div>
        <div className="px-5 py-4">
          <div className="relative">
            {order.statusHistory.map((h, i) => {
              const hCfg = ORDER_STATUS_CONFIG[h.status];
              return (
                <div key={h.id} className="flex gap-3 pb-4 relative">
                  {i < order.statusHistory.length - 1 && (
                    <div className="absolute left-3 top-6 w-0.5 h-full bg-stone-100" />
                  )}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${hCfg?.bg ?? "bg-stone-100"}`}>
                    <div className={`w-2 h-2 rounded-full ${hCfg?.color.replace("text-", "bg-") ?? "bg-stone-400"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800">{hCfg?.label ?? h.status}</p>
                    <p className="text-xs text-stone-400">{formatDate(h.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
