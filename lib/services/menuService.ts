import { prisma } from "@/lib/db/prisma";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateMenuItemInput,
  UpdateMenuItemInput,
} from "@/lib/validators/menu";

// ── Categories ───────────────────────────────────────────────────────

export async function getCategories(includeHidden = false) {
  return prisma.category.findMany({
    where: includeHidden ? {} : { isVisible: true },
    include: {
      menuItems: {
        where: includeHidden ? {} : { isVisible: true, isAvailable: true },
        orderBy: { sortOrder: "asc" },
        include: {
          optionGroups: { include: { options: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
          extras: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAllCategoriesAdmin() {
  return prisma.category.findMany({
    include: {
      _count: { select: { menuItems: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createCategory(input: CreateCategoryInput) {
  return prisma.category.create({ data: input });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  return prisma.category.update({ where: { id }, data: input });
}

export async function deleteCategory(id: string) {
  const count = await prisma.menuItem.count({ where: { categoryId: id } });
  if (count > 0) throw new Error("CATEGORY_HAS_ITEMS");
  return prisma.category.delete({ where: { id } });
}

// ── Menu Items ───────────────────────────────────────────────────────

export async function getAllMenuItemsAdmin() {
  return prisma.menuItem.findMany({
    include: {
      category: true,
      optionGroups: { include: { options: true } },
      extras: true,
    },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });
}

export async function getMenuItemById(id: string) {
  return prisma.menuItem.findUnique({
    where: { id },
    include: {
      category: true,
      optionGroups: {
        include: { options: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
      extras: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function createMenuItem(input: CreateMenuItemInput) {
  const { optionGroups, extras, ...itemData } = input;

  return prisma.menuItem.create({
    data: {
      ...itemData,
      imageUrl: itemData.imageUrl || null,
      optionGroups: {
        create: optionGroups.map((group) => ({
          name: group.name,
          required: group.required,
          minSelect: group.minSelect,
          maxSelect: group.maxSelect,
          sortOrder: group.sortOrder,
          options: {
            create: group.options.map((opt) => ({
              name: opt.name,
              priceModifier: opt.priceModifier,
              sortOrder: opt.sortOrder,
            })),
          },
        })),
      },
      extras: {
        create: extras.map((e) => ({
          name: e.name,
          price: e.price,
          isAvailable: e.isAvailable,
          sortOrder: e.sortOrder,
        })),
      },
    },
    include: {
      optionGroups: { include: { options: true } },
      extras: true,
    },
  });
}

export async function updateMenuItem(id: string, input: UpdateMenuItemInput) {
  const { optionGroups, extras, ...itemData } = input;

  // Simple update - in production, handle option group delta carefully
  return prisma.menuItem.update({
    where: { id },
    data: {
      ...itemData,
      imageUrl: itemData.imageUrl === "" ? null : itemData.imageUrl,
    },
  });
}

export async function toggleMenuItemAvailability(id: string, isAvailable: boolean) {
  return prisma.menuItem.update({
    where: { id },
    data: { isAvailable },
  });
}

export async function deleteMenuItem(id: string) {
  return prisma.menuItem.delete({ where: { id } });
}
