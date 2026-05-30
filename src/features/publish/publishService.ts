import { prisma } from "@/lib/prisma";
import { createBaseSlug } from "./slug";

export async function publishVersion(versionId: string) {
  const version = await prisma.appVersion.findUnique({
    where: { id: versionId },
    include: { project: true }
  });

  if (!version) {
    throw new Error("Version not found");
  }

  const baseSlug = createBaseSlug(version.title);
  let slug = baseSlug;
  let suffix = 2;

  while (await prisma.publishRecord.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  await prisma.publishRecord.updateMany({
    where: { projectId: version.projectId },
    data: { isActive: false }
  });

  return prisma.publishRecord.create({
    data: {
      projectId: version.projectId,
      versionId: version.id,
      slug,
      isActive: true
    }
  });
}

export async function getPublishedVersion(slug: string) {
  return prisma.publishRecord.findUnique({
    where: { slug },
    include: { version: true, project: true }
  });
}
