import { notFound, redirect } from "next/navigation";
import { getTableBySlug } from "@/lib/services/tableService";
import { getCategories } from "@/lib/services/menuService";
import { getSettings } from "@/lib/services/settingsService";
import MenuPage from "@/components/customer/MenuPage";

interface Props {
  params: { tableSlug: string };
}

export default async function TableMenuPage({ params }: Props) {
  const [table, settings] = await Promise.all([
    getTableBySlug(params.tableSlug),
    getSettings(),
  ]);

  // Invalid table slug
  if (!table) {
    redirect("/table-error");
  }

  // Inactive table
  if (!table.isActive) {
    redirect("/table-error?reason=inactive");
  }

  // Restaurant closed
  if (!settings.isOpen) {
    redirect(`/closed?table=${params.tableSlug}`);
  }

  // Load menu (only visible + available items for customer)
  const categories = await getCategories(false);

  return (
    <MenuPage
      table={table}
      categories={categories}
      settings={{
        restaurantName: settings.restaurantName,
        currencySymbol: settings.currencySymbol,
        currency: settings.currency,
        welcomeMessage: settings.welcomeMessage,
        wifiSsid: settings.showWifi ? (settings.wifiSsid ?? null) : null,
        wifiPassword: settings.showWifi ? (settings.wifiPassword ?? null) : null,
        primaryColor: settings.primaryColor,
        taxRate: settings.taxRate,
        serviceCharge: settings.serviceCharge,
        logoUrl: settings.logoUrl ?? null,
      }}
    />
  );
}

export async function generateMetadata({ params }: Props) {
  const table = await getTableBySlug(params.tableSlug);
  const settings = await getSettings();
  return {
    title: table
      ? `${settings.restaurantName} — ${table.number}`
      : "Menu",
    description: `Order from your table at ${settings.restaurantName}`,
  };
}
