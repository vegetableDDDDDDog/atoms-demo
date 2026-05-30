import { createAgentPlan } from "@/features/agents/orchestrator";
import { buildGeneratedApp } from "@/features/generator/buildGeneratedApp";
import type { BuildMode } from "@/features/generator/types";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";

type CreateRunInput = {
  prompt: string;
  projectId?: string;
  mode?: BuildMode;
  previousVersionId?: string;
  fixRequested?: boolean;
};

function projectNameFromPrompt(prompt: string) {
  const cleaned = prompt.replace(/\s+/g, " ").trim();
  return cleaned.length > 42 ? `${cleaned.slice(0, 42)}...` : cleaned || "Untitled Atoms App";
}

export async function createGenerationRun(input: CreateRunInput) {
  const user = await getDemoUser();
  const mode = input.mode ?? "team";
  const prompt = input.prompt.trim();

  if (!prompt) {
    throw new Error("Prompt is required");
  }

  const project = input.projectId
    ? await prisma.project.update({
        where: { id: input.projectId },
        data: { prompt, mode, status: "generating" }
      })
    : await prisma.project.create({
        data: {
          userId: user.id,
          name: projectNameFromPrompt(prompt),
          prompt,
          mode,
          status: "generating"
        }
      });

  const run = await prisma.generationRun.create({
    data: {
      projectId: project.id,
      inputPrompt: prompt,
      mode,
      status: "running"
    }
  });

  const agentSteps = createAgentPlan(prompt, input.fixRequested);
  await prisma.agentStep.createMany({
    data: agentSteps.map((step) => ({
      runId: run.id,
      agent: step.agent,
      title: step.title,
      status: step.status,
      content: step.content,
      order: step.order
    }))
  });

  const generated = buildGeneratedApp({
    prompt,
    mode,
    previousVersionId: input.previousVersionId,
    fixRequested: input.fixRequested
  });

  const latestVersion = await prisma.appVersion.findFirst({
    where: { projectId: project.id },
    orderBy: { versionNumber: "desc" }
  });

  const version = await prisma.appVersion.create({
    data: {
      projectId: project.id,
      runId: run.id,
      versionNumber: (latestVersion?.versionNumber ?? 0) + 1,
      title: generated.title,
      description: generated.description,
      appType: generated.appType,
      html: generated.html,
      css: generated.css,
      js: generated.js
    }
  });

  await prisma.generationRun.update({
    where: { id: run.id },
    data: {
      status: "completed",
      selectedVersionId: version.id,
      completedAt: new Date()
    }
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { status: "ready" }
  });

  return getRunDetail(run.id);
}

export async function getRunDetail(id: string) {
  return prisma.generationRun.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { order: "asc" } },
      versions: { orderBy: { versionNumber: "desc" } },
      project: true
    }
  });
}
