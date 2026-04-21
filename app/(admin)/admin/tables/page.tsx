import { getAllTables } from "@/lib/services/tableService";
import { getSettings } from "@/lib/services/settingsService";
import TablesClient from "@/components/admin/TablesClient";

export const dynamic = "force-dynamic";

export default async function TablesPage() {
  const [tables, settings] = await Promise.all([
    getAllTables(),
    getSettings(),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <TablesClient
      initialTables={tables as any}
      baseUrl={baseUrl}
      restaurantName={settings.restaurantName}
    />
  );
}
