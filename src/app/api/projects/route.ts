import { listProjects } from "@/features/projects/projectService";
import { createGenerationRun } from "@/features/runs/generationService";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ projects: await listProjects() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: string; mode?: "team" | "engineer" | "race" };
  const run = await createGenerationRun({ prompt: body.prompt ?? "", mode: body.mode ?? "team" });
  return NextResponse.json({ run }, { status: 201 });
}
