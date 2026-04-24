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
  const [newOrderPopup, setNewOrderPopup] = useState(false);
  const sym = settings.currencySymbol;

  const playNotificationSound = () => {
    try {
      const audio = new Audio("/notification.wav");
      audio.volume = 1;
      audio.play().catch(() => {});
    } catch {}
  };

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

      if (data.length > orders.length) {
        setHasNewOrder(true);
        setNewOrderPopup(true);
        playNotificationSound();

        setTimeout(() => setHasNewOrder(false), 3000);
      }

      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  }, [statusFilter, tableFilter, orders.length]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {newOrderPopup && (
        <div className="fixed top-6 right-6 z-50 bg-white shadow-2xl border border-orange-200 rounded-2xl p-5 w-80">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
            <h3 className="font-bold text-stone-900">New Order Received</h3>
          </div>

          <p className="text-sm text-stone-600 mb-4">
            A new order has been placed. Check the orders list now.
          </p>

          <button
            onClick={() => setNewOrderPopup(false)}
            className="w-full bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
          >
            OK
          </button>
        </div>
      )}

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
            <p className="font-medium text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Table</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Items</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Time</th>
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
                        <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color} ${cfg.bg}`}>
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