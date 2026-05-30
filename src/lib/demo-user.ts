import { prisma } from "@/lib/prisma";

export const DEMO_USER_EMAIL = "demo@atoms-mini.local";

export async function getDemoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      name: "Demo Builder"
    }
  });
}
