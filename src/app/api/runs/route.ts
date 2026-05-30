import { createGenerationRun } from "@/features/runs/generationService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    prompt?: string;
    projectId?: string;
    previousVersionId?: string;
    mode?: "team" | "engineer" | "race";
  };

  const run = await createGenerationRun({
    prompt: body.prompt ?? "",
    projectId: body.projectId,
    previousVersionId: body.previousVersionId,
    mode: body.mode ?? "team"
  });

  return NextResponse.json({ run }, { status: 201 });
}
