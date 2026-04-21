import { getAllMenuItemsAdmin } from "@/lib/services/menuService";
import { getAllCategoriesAdmin } from "@/lib/services/menuService";
import MenuItemsClient from "@/components/admin/MenuItemsClient";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [items, categories] = await Promise.all([
    getAllMenuItemsAdmin(),
    getAllCategoriesAdmin(),
  ]);

  return <MenuItemsClient initialItems={items as any} categories={categories as any} />;
}
