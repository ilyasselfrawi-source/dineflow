"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatCurrency, formatTime, ORDER_STATUS_CONFIG } from "@/lib/utils/formatters";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  customerName: string | null;
  table: { id: string; number: string };
  items: { id: string }[];
}

interface Props {
  initialOrders: Order[];
  settings: { currencySymbol: string };
  tables: { id: string; number: string }[];
  initialFilters: { status: string; tableId: string };
}

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "New", value: "NEW" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready", value: "READY" },
  { label: "Served", value: "SERVED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function OrdersClient({
  initialOrders,
  settings,
  tables,
  initialFilters,
}: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState(initialFilters.status);
  const [tableFilter, setTableFilter] = useState(initialFilters.tableId);
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const sym = settings.currencySymbol;

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (tableFilter) params.set("tableId", tableFilter);
      params.set("limit", "100");

      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) return;

      const data: Order[] = await res.json();

      // تنبيه إلا تزاد شي order جديد
      if (data.length > orders.length) {
        setHasNewOrder(true);

        try {
          const AudioCtx =
            window.AudioContext ||
            (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

          if (AudioCtx) {
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
          }
        } catch {}

        setTimeout(() => setHasNewOrder(false), 3000);
      }

      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  }, [statusFilter, tableFilter, orders.length]);

  // أول تحميل + ملي يتبدلو الفلاتر
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto refresh كل 3 ثواني
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Orders</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {orders.length} result{orders.length !== 1 ? "s" : ""}
          </p>
        </div>

        {hasNewOrder && (
          <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium animate-bounce-subtle">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            New order received!
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1.5 bg-white rounded-xl p-1.5 shadow-sm flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-stone-900 text-white"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={tableFilter}
          onChange={(e) => setTableFilter(e.target.value)}
          className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-orange-300 shadow-sm"
        >
          <option value="">All tables</option>
          {tables.map((t) => (
            <option key={t.id} value={t.id}>
              {t.number}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
              />
            </svg>
            <p className="font-medium text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-50">
                {orders.map((order) => {
                  const cfg = ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.NEW;

                  return (
                    <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-stone-900 text-sm">{order.orderNumber}</p>
                        {order.customerName && (
                          <p className="text-xs text-stone-400">{order.customerName}</p>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="text-sm font-medium text-stone-700">
                          {order.table.number}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color} ${cfg.bg}`}
                        >
                          {cfg.label}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-sm text-stone-600">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-stone-900 text-sm">
                          {formatCurrency(order.total, sym)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-stone-400">
                        {formatTime(order.createdAt)}
                      </td>

                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-xs font-medium text-orange-500 hover:text-orange-700"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}