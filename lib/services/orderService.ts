import { prisma } from "@/lib/db/prisma";
import { SubmitOrderInput } from "@/lib/validators/order";
import { sseEmitter } from "@/lib/sse/sseEmitter";

// Generate human-readable order number
async function generateOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  return `DF-${String(count + 1).padStart(4, "0")}`;
}

export async function submitOrder(input: SubmitOrderInput) {
  // 1. Verify table exists and is active
  const table = await prisma.table.findUnique({
    where: { slug: input.tableSlug },
  });

  if (!table) {
    throw new Error("TABLE_NOT_FOUND");
  }
  if (!table.isActive) {
    throw new Error("TABLE_INACTIVE");
  }

  // 2. Check restaurant is open
  const settings = await prisma.restaurantSettings.findFirst();
  if (!settings?.isOpen) {
    throw new Error("RESTAURANT_CLOSED");
  }

  // 3. Check for duplicate submission token
  const existing = await prisma.order.findUnique({
    where: { submissionToken: input.submissionToken },
  });
  if (existing) {
    return existing; // Idempotent - return existing order
  }

  // 4. Load and validate all menu items from DB (never trust client prices)
  const menuItemIds = input.items.map((i) => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    include: {
      optionGroups: { include: { options: true } },
      extras: true,
    },
  });

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  // 5. Validate each cart item and calculate totals
  let subtotal = 0;
  const validatedItems: {
    menuItemId: string;
    itemNameSnapshot: string;
    basePriceSnapshot: number;
    quantity: number;
    notes: string;
    selectedOptions: string;
    selectedExtras: string;
    lineTotal: number;
    extras: { extraName: string; extraPrice: number; quantity: number }[];
  }[] = [];

  for (const cartItem of input.items) {
    const menuItem = menuItemMap.get(cartItem.menuItemId);

    if (!menuItem) {
      throw new Error(`ITEM_NOT_FOUND:${cartItem.menuItemId}`);
    }
    if (!menuItem.isAvailable || !menuItem.isVisible) {
      throw new Error(`ITEM_UNAVAILABLE:${menuItem.name}`);
    }

    let itemPrice = menuItem.basePrice;

    // Validate and price options from DB
    const validatedOptions: {
      groupName: string;
      optionName: string;
      priceModifier: number;
    }[] = [];

    for (const selectedOption of cartItem.selectedOptions) {
      const group = menuItem.optionGroups.find((g) => g.id === selectedOption.groupId);
      if (!group) continue;

      const option = group.options.find((o) => o.id === selectedOption.optionId);
      if (!option) continue;

      // Use DB price, not client price
      itemPrice += option.priceModifier;
      validatedOptions.push({
        groupName: group.name,
        optionName: option.name,
        priceModifier: option.priceModifier,
      });
    }

    // Validate and price extras from DB
    const validatedExtras: {
      extraId: string;
      name: string;
      price: number;
      quantity: number;
    }[] = [];

    for (const selectedExtra of cartItem.selectedExtras) {
      const extra = menuItem.extras.find((e) => e.id === selectedExtra.extraId);
      if (!extra || !extra.isAvailable) continue;

      // Use DB price
      itemPrice += extra.price * selectedExtra.quantity;
      validatedExtras.push({
        extraId: extra.id,
        name: extra.name,
        price: extra.price,
        quantity: selectedExtra.quantity,
      });
    }

    const lineTotal = itemPrice * cartItem.quantity;
    subtotal += lineTotal;

    validatedItems.push({
      menuItemId: cartItem.menuItemId,
      itemNameSnapshot: menuItem.name,
      basePriceSnapshot: menuItem.basePrice,
      quantity: cartItem.quantity,
      notes: cartItem.notes || "",
      selectedOptions: JSON.stringify(validatedOptions),
      selectedExtras: JSON.stringify(validatedExtras),
      lineTotal,
      extras: validatedExtras.map((e) => ({
        extraName: e.name,
        extraPrice: e.price,
        quantity: e.quantity,
      })),
    });
  }

  // 6. Calculate tax and service charge from settings
  const taxRate = settings?.taxRate ?? 0;
  const serviceRate = settings?.serviceCharge ?? 0;
  const taxAmount = parseFloat((subtotal * (taxRate / 100)).toFixed(2));
  const serviceAmount = parseFloat((subtotal * (serviceRate / 100)).toFixed(2));
  const total = parseFloat((subtotal + taxAmount + serviceAmount).toFixed(2));

  // 7. Create order in a transaction
  const orderNumber = await generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        tableId: table.id,
        customerName: input.customerName?.trim() || null,
        status: "NEW",
        subtotal: parseFloat(subtotal.toFixed(2)),
        taxAmount,
        serviceAmount,
        total,
        submissionToken: input.submissionToken,
        items: {
          create: validatedItems.map((item) => ({
            menuItemId: item.menuItemId,
            itemNameSnapshot: item.itemNameSnapshot,
            basePriceSnapshot: item.basePriceSnapshot,
            quantity: item.quantity,
            notes: item.notes,
            selectedOptions: item.selectedOptions,
            selectedExtras: item.selectedExtras,
            lineTotal: item.lineTotal,
            extras: {
              create: item.extras,
            },
          })),
        },
        statusHistory: {
          create: [{ status: "NEW", changedBy: "customer" }],
        },
      },
      include: {
        table: true,
        items: true,
      },
    });

    return newOrder;
  });

  // 8. Emit SSE event to staff
  sseEmitter.emit({
    type: "NEW_ORDER",
    payload: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableNumber: table.number,
      total: order.total,
      createdAt: order.createdAt,
    },
  });

  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  userId: string
) {
  const validStatuses = [
    "NEW", "CONFIRMED", "PREPARING", "READY", "SERVED", "COMPLETED", "CANCELLED",
  ];
  if (!validStatuses.includes(status)) {
    throw new Error("INVALID_STATUS");
  }

  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status },
      include: { table: true },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status,
        changedBy: userId,
      },
    });

    return updated;
  });

  sseEmitter.emit({
    type: "ORDER_UPDATED",
    payload: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableNumber: order.table.number,
      status: order.status,
    },
  });

  return order;
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      table: true,
      items: {
        include: { extras: true },
      },
      statusHistory: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getOrders(filters?: {
  status?: string;
  tableId?: string;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.tableId) where.tableId = filters.tableId;

  return prisma.order.findMany({
    where,
    include: {
      table: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: filters?.limit ?? 50,
    skip: filters?.offset ?? 0,
  });
}

export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalToday, activeOrders, completedToday, tables, menuItems] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { status: { in: ["NEW", "CONFIRMED", "PREPARING", "READY"] } } }),
    prisma.order.count({ where: { status: "COMPLETED", createdAt: { gte: today } } }),
    prisma.table.count({ where: { isActive: true } }),
    prisma.menuItem.count({ where: { isAvailable: true, isVisible: true } }),
  ]);

  const revenueToday = await prisma.order.aggregate({
    where: { createdAt: { gte: today }, status: { not: "CANCELLED" } },
    _sum: { total: true },
  });

  return {
    totalToday,
    activeOrders,
    completedToday,
    tables,
    menuItems,
    revenueToday: revenueToday._sum.total ?? 0,
  };
}
