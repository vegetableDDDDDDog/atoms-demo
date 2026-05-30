import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { publishVersion } from "@/features/publish/publishService";
import { createGenerationRun } from "./generationService";
import { prisma } from "@/lib/prisma";

describe("generation and publish services", () => {
  beforeEach(async () => {
    await prisma.publishRecord.deleteMany();
    await prisma.appVersion.deleteMany();
    await prisma.agentStep.deleteMany();
    await prisma.generationRun.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates a completed run with ordered agent steps and a generated version", async () => {
    const run = await createGenerationRun({
      prompt: "Build a customer booking manager",
      mode: "team"
    });

    expect(run?.status).toBe("completed");
    expect(run?.steps.map((step) => step.agent)).toEqual(["Mike", "Emma", "Bob", "Alex", "QA"]);
    expect(run?.versions[0]?.title).toBe("Customer Booking Manager");
    expect(run?.project.status).toBe("ready");
  });

  it("creates localized Chinese steps and versions when locale is zh", async () => {
    const run = await createGenerationRun({
      prompt: "生成一个客户预约管理应用",
      mode: "team",
      locale: "zh"
    });

    expect(run?.steps[0]?.title).toBe("协调构建");
    expect(run?.versions[0]?.title).toBe("客户预约管理");
    expect(run?.versions[0]?.html).toContain("新增记录");
  });

  it("publishes the generated version with a stable slug", async () => {
    const run = await createGenerationRun({
      prompt: "Build a customer booking manager",
      mode: "team"
    });

    const publish = await publishVersion(run?.versions[0]?.id ?? "");

    expect(publish.slug).toBe("customer-booking-manager");
    expect(publish.isActive).toBe(true);
  });
});
