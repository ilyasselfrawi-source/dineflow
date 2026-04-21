import { getAllCategoriesAdmin } from "@/lib/services/menuService";
import CategoriesClient from "@/components/admin/CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getAllCategoriesAdmin();
  return <CategoriesClient initialCategories={categories as any} />;
}
