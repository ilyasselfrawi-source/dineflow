import { getOrders } from "@/lib/services/orderService";
import { getSettings } from "@/lib/services/settingsService";
import { getAllTables } from "@/lib/services/tableService";
import OrdersClient from "@/components/admin/OrdersClient";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; tableId?: string };
}) {
  const [orders, settings, tables] = await Promise.all([
    getOrders({
      status: searchParams.status || undefined,
      tableId: searchParams.tableId || undefined,
      limit: 100,
    }),
    getSettings(),
    getAllTables(),
  ]);

  return (
    <OrdersClient
      initialOrders={orders as any}
      settings={{ currencySymbol: settings.currencySymbol }}
      tables={tables.map((t) => ({ id: t.id, number: t.number }))}
      initialFilters={{
        status: searchParams.status || "",
        tableId: searchParams.tableId || "",
      }}
    />
  );
}
