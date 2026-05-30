import { resolveLocale } from "@/features/i18n/dictionary";
import { createGenerationRun } from "@/features/runs/generationService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    prompt?: string;
    projectId?: string;
    previousVersionId?: string;
    mode?: "team" | "engineer" | "race";
    locale?: unknown;
  };

  const run = await createGenerationRun({
    prompt: body.prompt ?? "",
    projectId: body.projectId,
    previousVersionId: body.previousVersionId,
    mode: body.mode ?? "team",
    locale: resolveLocale(body.locale)
  });

  return NextResponse.json({ run }, { status: 201 });
}
