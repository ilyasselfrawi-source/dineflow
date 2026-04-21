// lib/utils/formatters.ts

export function formatCurrency(amount: number, symbol = "$"): string {
  return `${symbol}${amount.toFixed(2)}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  NEW: { label: "New", color: "text-blue-700", bg: "bg-blue-100" },
  CONFIRMED: { label: "Confirmed", color: "text-indigo-700", bg: "bg-indigo-100" },
  PREPARING: { label: "Preparing", color: "text-yellow-700", bg: "bg-yellow-100" },
  READY: { label: "Ready", color: "text-green-700", bg: "bg-green-100" },
  SERVED: { label: "Served", color: "text-teal-700", bg: "bg-teal-100" },
  COMPLETED: { label: "Completed", color: "text-gray-600", bg: "bg-gray-100" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bg: "bg-red-100" },
};

export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  NEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["SERVED"],
  SERVED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};
