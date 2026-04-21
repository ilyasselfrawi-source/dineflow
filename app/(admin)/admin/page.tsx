import { getDashboardStats } from "@/lib/services/orderService";
import { getSettings } from "@/lib/services/settingsService";
import { getOrders } from "@/lib/services/orderService";
import { formatCurrency, formatTime, ORDER_STATUS_CONFIG } from "@/lib/utils/formatters";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, settings, recentOrders] = await Promise.all([
    getDashboardStats(),
    getSettings(),
    getOrders({ limit: 8 }),
  ]);

  const sym = settings.currencySymbol;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-stone-500 text-sm mt-0.5">{settings.restaurantName}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          settings.isOpen
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${settings.isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          {settings.isOpen ? "Open" : "Closed"}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Orders Today"
          value={stats.totalToday}
          icon="📋"
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          label="Active Orders"
          value={stats.activeOrders}
          icon="🔥"
          color="bg-orange-50 text-orange-700"
          highlight={stats.activeOrders > 0}
        />
        <StatCard
          label="Completed Today"
          value={stats.completedToday}
          icon="✅"
          color="bg-green-50 text-green-700"
        />
        <StatCard
          label="Active Tables"
          value={stats.tables}
          icon="🪑"
          color="bg-purple-50 text-purple-700"
        />
        <StatCard
          label="Menu Items"
          value={stats.menuItems}
          icon="🍽️"
          color="bg-stone-50 text-stone-700"
        />
        <div className="bg-stone-900 rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Revenue Today</p>
          <p className="font-display text-2xl font-bold text-white mt-2">
            {formatCurrency(stats.revenueToday, sym)}
          </p>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-orange-500 font-medium hover:text-orange-600">
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {recentOrders.map((order) => {
              const statusCfg = ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.NEW;
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900 text-sm">{order.orderNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.color} ${statusCfg.bg}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {order.table.number} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      {order.customerName ? ` · ${order.customerName}` : ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-stone-900 text-sm">{formatCurrency(order.total, sym)}</p>
                    <p className="text-xs text-stone-400">{formatTime(order.createdAt)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm ${highlight ? "ring-2 ring-orange-200" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`font-display text-3xl font-bold ${color.split(" ")[1]}`}>{value}</p>
    </div>
  );
}
