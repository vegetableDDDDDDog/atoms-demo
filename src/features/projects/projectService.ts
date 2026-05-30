import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";

export async function listProjects() {
  const user = await getDemoUser();
  return prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      publishes: { where: { isActive: true }, take: 1 }
    }
  });
}

export async function getProjectDetail(id: string) {
  const user = await getDemoUser();
  return prisma.project.findFirst({
    where: { id, userId: user.id },
    include: {
      versions: { orderBy: { versionNumber: "desc" } },
      runs: {
        orderBy: { createdAt: "desc" },
        include: { steps: { orderBy: { order: "asc" } } }
      },
      publishes: { where: { isActive: true } }
    }
  });
}
