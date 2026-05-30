import { listProjects } from "@/features/projects/projectService";
import { resolveLocale } from "@/features/i18n/dictionary";
import { createGenerationRun } from "@/features/runs/generationService";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ projects: await listProjects() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: string; mode?: "team" | "engineer" | "race"; locale?: unknown };
  const run = await createGenerationRun({ prompt: body.prompt ?? "", mode: body.mode ?? "team", locale: resolveLocale(body.locale) });
  return NextResponse.json({ run }, { status: 201 });
}
