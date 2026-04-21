import { prisma } from "@/lib/db/prisma";
import { UpdateSettingsInput } from "@/lib/validators/menu";

export async function getSettings() {
  let settings = await prisma.restaurantSettings.findFirst();
  if (!settings) {
    settings = await prisma.restaurantSettings.create({
      data: { id: "default" },
    });
  }
  return settings;
}

export async function updateSettings(input: UpdateSettingsInput) {
  const existing = await prisma.restaurantSettings.findFirst();
  if (existing) {
    return prisma.restaurantSettings.update({
      where: { id: existing.id },
      data: input,
    });
  }
  return prisma.restaurantSettings.create({
    data: { id: "default", ...input },
  });
}
