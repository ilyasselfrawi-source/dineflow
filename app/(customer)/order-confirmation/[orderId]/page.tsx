import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/services/orderService";
import { getSettings } from "@/lib/services/settingsService";
import { formatCurrency } from "@/lib/utils/formatters";

interface Props {
  params: { orderId: string };
}

export default async function OrderConfirmationPage({ params }: Props) {
  const [order, settings] = await Promise.all([
    getOrderById(params.orderId),
    getSettings(),
  ]);

  if (!order) notFound();

  const sym = settings.currencySymbol;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-start px-4 pt-12 pb-24">
      {/* Success animation */}
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce-subtle">
        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="font-display text-3xl font-bold text-stone-900 mb-2 text-center">
        Order Placed!
      </h1>
      <p className="text-stone-500 text-center mb-8 max-w-xs">
        Your order has been received. Our team will take care of it shortly.
      </p>

      {/* Order card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-stone-900 text-white px-5 py-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wider">Order</p>
            <p className="text-xl font-bold font-display">{order.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-400 uppercase tracking-wider">Table</p>
            <p className="text-xl font-bold">{order.table.number}</p>
          </div>
        </div>

        {/* Items */}
        <div className="px-5 py-4 space-y-3">
          {order.items.map((item) => {
            const options: any[] = item.selectedOptions ? JSON.parse(item.selectedOptions) : [];
            const extras: any[] = item.selectedExtras ? JSON.parse(item.selectedExtras) : [];
            return (
              <div key={item.id} className="flex justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-900 text-sm">
                    <span className="text-brand-500 font-bold">{item.quantity}×</span>{" "}
                    {item.itemNameSnapshot}
                  </p>
                  {options.length > 0 && (
                    <p className="text-xs text-stone-400 mt-0.5">
                      {options.map((o) => o.optionName).join(", ")}
                    </p>
                  )}
                  {extras.length > 0 && (
                    <p className="text-xs text-stone-400">
                      + {extras.map((e) => e.name).join(", ")}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-xs text-stone-400 italic">"{item.notes}"</p>
                  )}
                </div>
                <p className="text-sm font-medium text-stone-700 flex-shrink-0">
                  {formatCurrency(item.lineTotal, sym)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="border-t border-stone-100 px-5 py-4 space-y-1">
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
          <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-100">
            <span>Total</span>
            <span>{formatCurrency(order.total, sym)}</span>
          </div>
        </div>

        {/* Status */}
        <div className="bg-amber-50 border-t border-amber-100 px-5 py-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-sm text-amber-800 font-medium">Waiting for confirmation</p>
        </div>
      </div>

      {/* Customer name */}
      {order.customerName && (
        <p className="mt-4 text-stone-500 text-sm">
          Thanks, <span className="font-medium text-stone-700">{order.customerName}</span>!
        </p>
      )}

      <p className="mt-8 text-center text-xs text-stone-400 max-w-xs">
        Please keep this page open or take note of your order number. Your server will bring your items to {order.table.number}.
      </p>

      {/* Back to menu link */}
      <Link
        href={`/menu/${order.table.slug}`}
        className="mt-6 text-sm text-brand-500 font-medium underline underline-offset-2"
      >
        ← Order more items
      </Link>
    </div>
  );
}
