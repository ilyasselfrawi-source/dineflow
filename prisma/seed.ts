import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding DineFlow database...");

  // ── Restaurant Settings ──────────────────────────────────────────────
  const settings = await prisma.restaurantSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      restaurantName: "Bella Vista Bistro",
      currency: "USD",
      currencySymbol: "$",
      isOpen: true,
      welcomeMessage: "Welcome! Scan, order, and enjoy your meal.",
      taxRate: 8.5,
      serviceCharge: 0,
      wifiSsid: "BellaVista_Guest",
      wifiPassword: "welcome2024",
      showWifi: true,
      primaryColor: "#e85d04",
    },
  });
  console.log("✅ Restaurant settings created");

  // ── Admin User ───────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@dineflow.com" },
    update: {},
    create: {
      email: "admin@dineflow.com",
      name: "Restaurant Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  // ── Staff User ───────────────────────────────────────────────────────
  const staffPassword = await bcrypt.hash("staff123", 12);
  const staff = await prisma.user.upsert({
    where: { email: "staff@dineflow.com" },
    update: {},
    create: {
      email: "staff@dineflow.com",
      name: "Staff Member",
      passwordHash: staffPassword,
      role: "STAFF",
    },
  });
  console.log("✅ Users created (admin + staff)");

  // ── Tables ───────────────────────────────────────────────────────────
  const tableData = [
    { number: "T1", slug: "table-t1" },
    { number: "T2", slug: "table-t2-" },
    { number: "T3", slug: "table-t3-" },
    { number: "T4", slug: "table-t4-" },
    { number: "T5", slug: "table-t5-" },
    { number: "T6", slug: "table-t6-" },
    { number: "Bar 1", slug: "bar-1-" },
    { number: "Bar 2", slug: "bar-2-" },
    { number: "Patio 1", slug: "patio-1-" },
    { number: "Patio 2", slug: "patio-2-" + nanoid(8), isActive: false },
  ];

  const tables: any[] = [];
  for (const t of tableData) {
    const table = await prisma.table.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        number: t.number,
        slug: t.slug,
        isActive: t.isActive !== false,
      },
    });
    tables.push(table);
  }
  console.log(`✅ ${tables.length} tables created`);

  // ── Categories ───────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: "cat-starters" },
      update: {},
      create: { id: "cat-starters", name: "Starters", description: "Begin your journey", sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { id: "cat-mains" },
      update: {},
      create: { id: "cat-mains", name: "Main Courses", description: "Hearty and satisfying", sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { id: "cat-pizza" },
      update: {},
      create: { id: "cat-pizza", name: "Pizza", description: "Wood-fired perfection", sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { id: "cat-sides" },
      update: {},
      create: { id: "cat-sides", name: "Sides", description: "Perfect companions", sortOrder: 4 },
    }),
    prisma.category.upsert({
      where: { id: "cat-drinks" },
      update: {},
      create: { id: "cat-drinks", name: "Drinks", description: "Beverages & cocktails", sortOrder: 5 },
    }),
    prisma.category.upsert({
      where: { id: "cat-desserts" },
      update: {},
      create: { id: "cat-desserts", name: "Desserts", description: "Sweet endings", sortOrder: 6 },
    }),
  ]);
  console.log(`✅ ${categories.length} categories created`);

  // ── Menu Items ───────────────────────────────────────────────────────

  // Starters
  const Couscous = await prisma.menuItem.upsert({
  where: { id: "item-Couscous" },
  update: {
    name: "Couscous",
    description: "a moroccan trditional plate with seven vegetablese an chekpeese and chiken",
    basePrice: 4,
    categoryId: "cat-starters",
    isFeatured: true,
    sortOrder: 1,
  },
  create: {
    id: "item-Couscous",
    name: "Couscous",
    description: "a moroccan trditional plate with seven vegetablese an chekpeese and chiken",
    basePrice: 4,
    categoryId: "cat-starters",
    isFeatured: true,
    sortOrder: 1,
  },
});
  const calamari = await prisma.menuItem.upsert({
    where: { id: "item-calamari" },
    update: {},
    create: {
      id: "item-calamari",
      name: "Crispy Calamari",
      description: "Lightly battered and fried squid rings with marinara sauce and lemon wedge",
      basePrice: 14.0,
      categoryId: "cat-starters",
      sortOrder: 2,
    },
  });

  const soupOfDay = await prisma.menuItem.upsert({
    where: { id: "item-soup" },
    update: {},
    create: {
      id: "item-soup",
      name: "Soup of the Day",
      description: "Ask your server for today's selection, served with artisan bread",
      basePrice: 8.0,
      categoryId: "cat-starters",
      sortOrder: 3,
    },
  });

  // Main Courses
  const pasta = await prisma.menuItem.upsert({
    where: { id: "item-pasta-carbonara" },
    update: {},
    create: {
      id: "item-pasta-carbonara",
      name: "Spaghetti Carbonara",
      description: "Classic Roman carbonara with guanciale, egg yolk, Pecorino Romano, and black pepper",
      basePrice: 18.5,
      categoryId: "cat-mains",
      isFeatured: true,
      sortOrder: 1,
    },
  });

  const salmon = await prisma.menuItem.upsert({
    where: { id: "item-salmon" },
    update: {},
    create: {
      id: "item-salmon",
      name: "Pan-Seared Salmon",
      description: "Atlantic salmon fillet with lemon butter sauce, capers, and seasonal vegetables",
      basePrice: 26.0,
      categoryId: "cat-mains",
      sortOrder: 2,
    },
  });

  const ribeye = await prisma.menuItem.upsert({
    where: { id: "item-ribeye" },
    update: {},
    create: {
      id: "item-ribeye",
      name: "Ribeye Steak 300g",
      description: "Prime aged ribeye with garlic butter, roasted bone marrow, and watercress",
      basePrice: 42.0,
      categoryId: "cat-mains",
      sortOrder: 3,
    },
  });

  const risotto = await prisma.menuItem.upsert({
    where: { id: "item-risotto" },
    update: {},
    create: {
      id: "item-risotto",
      name: "Wild Mushroom Risotto",
      description: "Arborio rice with porcini, shiitake, and truffle oil, finished with Parmigiano Reggiano",
      basePrice: 19.0,
      categoryId: "cat-mains",
      sortOrder: 4,
    },
  });

  // Pizza
  const margherita = await prisma.menuItem.upsert({
    where: { id: "item-margherita" },
    update: {},
    create: {
      id: "item-margherita",
      name: "Margherita",
      description: "San Marzano tomato, fior di latte mozzarella, fresh basil, extra virgin olive oil",
      basePrice: 16.0,
      categoryId: "cat-pizza",
      isFeatured: true,
      sortOrder: 1,
    },
  });

  const prosciutto = await prisma.menuItem.upsert({
    where: { id: "item-prosciutto-pizza" },
    update: {},
    create: {
      id: "item-prosciutto-pizza",
      name: "Prosciutto e Rucola",
      description: "Mozzarella, prosciutto di Parma, rocket, shaved Parmigiano, and cherry tomatoes",
      basePrice: 20.0,
      categoryId: "cat-pizza",
      sortOrder: 2,
    },
  });

  // Sides
  const fries = await prisma.menuItem.upsert({
    where: { id: "item-fries" },
    update: {},
    create: {
      id: "item-fries",
      name: "Truffle Fries",
      description: "Crispy fries with truffle oil, Parmigiano, and fresh herbs",
      basePrice: 7.5,
      categoryId: "cat-sides",
      sortOrder: 1,
    },
  });

  const salad = await prisma.menuItem.upsert({
    where: { id: "item-salad" },
    update: {},
    create: {
      id: "item-salad",
      name: "Garden Salad",
      description: "Mixed greens, cucumber, cherry tomatoes, olives, red onion, house vinaigrette",
      basePrice: 9.0,
      categoryId: "cat-sides",
      sortOrder: 2,
    },
  });

  // Drinks
  const espresso = await prisma.menuItem.upsert({
    where: { id: "item-espresso" },
    update: {},
    create: {
      id: "item-espresso",
      name: "Espresso",
      description: "Single or double shot of our house blend",
      basePrice: 3.5,
      categoryId: "cat-drinks",
      sortOrder: 1,
    },
  });

  const softDrink = await prisma.menuItem.upsert({
    where: { id: "item-soft-drink" },
    update: {},
    create: {
      id: "item-soft-drink",
      name: "Soft Drinks",
      description: "Coca-Cola, Diet Coke, Sprite, Fanta, or Ginger Beer",
      basePrice: 4.5,
      categoryId: "cat-drinks",
      sortOrder: 2,
    },
  });

  const sparkling = await prisma.menuItem.upsert({
    where: { id: "item-sparkling" },
    update: {},
    create: {
      id: "item-sparkling",
      name: "Sparkling Water 500ml",
      description: "San Pellegrino sparkling mineral water",
      basePrice: 4.0,
      categoryId: "cat-drinks",
      sortOrder: 3,
    },
  });

  const wine = await prisma.menuItem.upsert({
    where: { id: "item-house-wine" },
    update: {},
    create: {
      id: "item-house-wine",
      name: "House Wine",
      description: "Curated selection of red, white, or rosé by the glass",
      basePrice: 10.0,
      categoryId: "cat-drinks",
      sortOrder: 4,
    },
  });

  // Desserts
  const tiramisu = await prisma.menuItem.upsert({
    where: { id: "item-tiramisu" },
    update: {},
    create: {
      id: "item-tiramisu",
      name: "Tiramisù",
      description: "Classic Italian dessert with mascarpone, espresso-soaked ladyfingers, and cocoa",
      basePrice: 9.5,
      categoryId: "cat-desserts",
      isFeatured: true,
      sortOrder: 1,
    },
  });

  const panna = await prisma.menuItem.upsert({
    where: { id: "item-panna-cotta" },
    update: {},
    create: {
      id: "item-panna-cotta",
      name: "Panna Cotta",
      description: "Vanilla bean panna cotta with seasonal berry coulis",
      basePrice: 8.5,
      categoryId: "cat-desserts",
      sortOrder: 2,
    },
  });

  console.log("✅ Menu items created");

  // ── Option Groups ────────────────────────────────────────────────────

  // Steak cooking preference
  await prisma.optionGroup.upsert({
    where: { id: "og-steak-cooking" },
    update: {},
    create: {
      id: "og-steak-cooking",
      name: "Cooking Preference",
      required: true,
      minSelect: 1,
      maxSelect: 1,
      menuItemId: "item-ribeye",
      options: {
        create: [
          { name: "Rare", priceModifier: 0, sortOrder: 1 },
          { name: "Medium Rare", priceModifier: 0, sortOrder: 2 },
          { name: "Medium", priceModifier: 0, sortOrder: 3 },
          { name: "Medium Well", priceModifier: 0, sortOrder: 4 },
          { name: "Well Done", priceModifier: 0, sortOrder: 5 },
        ],
      },
    },
  });

  // Pizza size
  await prisma.optionGroup.upsert({
    where: { id: "og-pizza-size" },
    update: {},
    create: {
      id: "og-pizza-size",
      name: "Size",
      required: true,
      minSelect: 1,
      maxSelect: 1,
      menuItemId: "item-margherita",
      options: {
        create: [
          { name: "Regular (10\")", priceModifier: 0, sortOrder: 1 },
          { name: "Large (12\")", priceModifier: 4, sortOrder: 2 },
        ],
      },
    },
  });

  // Pasta portion size
  await prisma.optionGroup.upsert({
    where: { id: "og-pasta-portion" },
    update: {},
    create: {
      id: "og-pasta-portion",
      name: "Portion",
      required: false,
      minSelect: 0,
      maxSelect: 1,
      menuItemId: "item-pasta-carbonara",
      options: {
        create: [
          { name: "Regular", priceModifier: 0, sortOrder: 1 },
          { name: "Large", priceModifier: 3.5, sortOrder: 2 },
        ],
      },
    },
  });

  // Wine color
  await prisma.optionGroup.upsert({
    where: { id: "og-wine-color" },
    update: {},
    create: {
      id: "og-wine-color",
      name: "Wine Type",
      required: true,
      minSelect: 1,
      maxSelect: 1,
      menuItemId: "item-house-wine",
      options: {
        create: [
          { name: "Red", priceModifier: 0, sortOrder: 1 },
          { name: "White", priceModifier: 0, sortOrder: 2 },
          { name: "Rosé", priceModifier: 0, sortOrder: 3 },
        ],
      },
    },
  });

  // Espresso shots
  await prisma.optionGroup.upsert({
    where: { id: "og-espresso-shots" },
    update: {},
    create: {
      id: "og-espresso-shots",
      name: "Shots",
      required: true,
      minSelect: 1,
      maxSelect: 1,
      menuItemId: "item-espresso",
      options: {
        create: [
          { name: "Single", priceModifier: 0, sortOrder: 1 },
          { name: "Double", priceModifier: 1, sortOrder: 2 },
        ],
      },
    },
  });

  console.log("✅ Option groups created");

  // ── Extras ───────────────────────────────────────────────────────────

  // Pizza extras
  await prisma.menuItemExtra.createMany({
    data: [
      { id: "extra-extra-cheese", name: "Extra Mozzarella", price: 2.0, menuItemId: "item-margherita", sortOrder: 1 },
      { id: "extra-prosciutto-add", name: "Add Prosciutto", price: 4.0, menuItemId: "item-margherita", sortOrder: 2 },
      { id: "extra-mushrooms-add", name: "Add Mushrooms", price: 2.5, menuItemId: "item-margherita", sortOrder: 3 },
    ],
    
  });

  // Steak extras
  await prisma.menuItemExtra.createMany({
    data: [
      { id: "extra-side-salad", name: "Add Garden Salad", price: 6.0, menuItemId: "item-ribeye", sortOrder: 1 },
      { id: "extra-peppercorn", name: "Peppercorn Sauce", price: 3.0, menuItemId: "item-ribeye", sortOrder: 2 },
      { id: "extra-bearnaise", name: "Béarnaise Sauce", price: 3.0, menuItemId: "item-ribeye", sortOrder: 3 },
    ],
    
  });

  // Pasta extras
  await prisma.menuItemExtra.createMany({
    data: [
      { id: "extra-extra-bacon", name: "Extra Guanciale", price: 3.0, menuItemId: "item-pasta-carbonara", sortOrder: 1 },
      { id: "extra-add-truffle", name: "Truffle Oil Drizzle", price: 4.5, menuItemId: "item-pasta-carbonara", sortOrder: 2 },
    ],
    
  });

  console.log("✅ Extras created");

  // ── Sample Orders ────────────────────────────────────────────────────
  const table1 = tables[0];
  const table2 = tables[1];

  const sampleOrder1 = await prisma.order.upsert({
    where: { orderNumber: "DF-0001" },
    update: {},
    create: {
      orderNumber: "DF-0001",
      tableId: table1.id,
      customerName: "Marco",
      status: "PREPARING",
      subtotal: 60.0,
      taxAmount: 5.1,
      serviceAmount: 0,
      total: 65.1,
      items: {
        create: [
          {
            menuItemId: "item-margherita",
            itemNameSnapshot: "Margherita",
            basePriceSnapshot: 16.0,
            quantity: 1,
            notes: "Extra crispy please",
            selectedOptions: JSON.stringify([{ groupName: "Size", optionName: "Large (12\")", priceModifier: 4 }]),
            selectedExtras: JSON.stringify([{ name: "Extra Mozzarella", price: 2.0 }]),
            lineTotal: 22.0,
          },
          {
            menuItemId: "item-pasta-carbonara",
            itemNameSnapshot: "Spaghetti Carbonara",
            basePriceSnapshot: 18.5,
            quantity: 2,
            notes: "",
            selectedOptions: JSON.stringify([{ groupName: "Portion", optionName: "Regular", priceModifier: 0 }]),
            selectedExtras: null,
            lineTotal: 37.0,
          },
        ],
      },
    },
  });

  const sampleOrder2 = await prisma.order.upsert({
    where: { orderNumber: "DF-0002" },
    update: {},
    create: {
      orderNumber: "DF-0002",
      tableId: table2.id,
      status: "NEW",
      subtotal: 54.5,
      taxAmount: 4.63,
      serviceAmount: 0,
      total: 59.13,
      items: {
        create: [
          {
            menuItemId: "item-ribeye",
            itemNameSnapshot: "Ribeye Steak 300g",
            basePriceSnapshot: 42.0,
            quantity: 1,
            notes: "",
            selectedOptions: JSON.stringify([{ groupName: "Cooking Preference", optionName: "Medium Rare", priceModifier: 0 }]),
            selectedExtras: JSON.stringify([{ name: "Peppercorn Sauce", price: 3.0 }]),
            lineTotal: 45.0,
          },
          {
            menuItemId: "item-house-wine",
            itemNameSnapshot: "House Wine",
            basePriceSnapshot: 10.0,
            quantity: 1,
            selectedOptions: JSON.stringify([{ groupName: "Wine Type", optionName: "Red", priceModifier: 0 }]),
            selectedExtras: null,
            lineTotal: 10.0,
          },
        ],
      },
    },
  });

  // Status history for sample orders
  await prisma.orderStatusHistory.createMany({
    data: [
      { orderId: sampleOrder1.id, status: "NEW", changedBy: "customer" },
      { orderId: sampleOrder1.id, status: "CONFIRMED", changedBy: admin.id },
      { orderId: sampleOrder1.id, status: "PREPARING", changedBy: admin.id },
      { orderId: sampleOrder2.id, status: "NEW", changedBy: "customer" },
    ],
   
  });

  console.log("✅ Sample orders created");
  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Login credentials:");
  console.log("   Admin → admin@dineflow.com / admin123");
  console.log("   Staff → staff@dineflow.com / staff123");
  console.log(`\n📊 Created ${tables.length} tables, ${categories.length} categories`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
