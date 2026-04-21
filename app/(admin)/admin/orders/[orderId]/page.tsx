import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/services/orderService";
import { getSettings } from "@/lib/services/settingsService";
import OrderDetailClient from "@/components/admin/OrderDetailClient";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const [order, settings] = await Promise.all([
    getOrderById(params.orderId),
    getSettings(),
  ]);

  if (!order) notFound();

  return (
    <OrderDetailClient
      order={order as any}
      currencySymbol={settings.currencySymbol}
    />
  );
}
