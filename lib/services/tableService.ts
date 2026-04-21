import { prisma } from "@/lib/db/prisma";
import { CreateTableInput, UpdateTableInput } from "@/lib/validators/menu";
import { nanoid } from "nanoid";

function generateTableSlug(number: string): string {
  const sanitized = number.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return `${sanitized}-${nanoid(10)}`;
}

export async function getAllTables() {
  return prisma.table.findMany({
    orderBy: { number: "asc" },
    include: {
      _count: { select: { orders: true } },
    },
  });
}

export async function getTableBySlug(slug: string) {
  return prisma.table.findUnique({
    where: { slug },
  });
}

export async function getTableById(id: string) {
  return prisma.table.findUnique({
    where: { id },
  });
}

export async function createTable(input: CreateTableInput) {
  const slug = generateTableSlug(input.number);
  return prisma.table.create({
    data: {
      number: input.number,
      slug,
      notes: input.notes,
      isActive: input.isActive,
    },
  });
}

export async function updateTable(id: string, input: UpdateTableInput) {
  return prisma.table.update({
    where: { id },
    data: input,
  });
}

export async function deleteTable(id: string) {
  // Check if table has orders
  const orderCount = await prisma.order.count({ where: { tableId: id } });
  if (orderCount > 0) {
    throw new Error("TABLE_HAS_ORDERS");
  }
  return prisma.table.delete({ where: { id } });
}

export async function regenerateTableSlug(id: string) {
  const table = await prisma.table.findUnique({ where: { id } });
  if (!table) throw new Error("TABLE_NOT_FOUND");

  const newSlug = generateTableSlug(table.number);
  return prisma.table.update({
    where: { id },
    data: { slug: newSlug },
  });
}
