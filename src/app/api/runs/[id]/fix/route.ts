import { createGenerationRun, getRunDetail } from "@/features/runs/generationService";
import { resolveLocale } from "@/features/i18n/dictionary";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json().catch(() => ({}))) as { locale?: unknown };
  const sourceRun = await getRunDetail(params.id);
  const sourceVersion = sourceRun?.versions[0];

  if (!sourceRun || !sourceVersion) {
    return NextResponse.json({ message: "Run or version not found" }, { status: 404 });
  }

  const run = await createGenerationRun({
    prompt: sourceRun.inputPrompt,
    projectId: sourceRun.projectId,
    previousVersionId: sourceVersion.id,
    mode: "team",
    locale: resolveLocale(body.locale),
    fixRequested: true
  });

  return NextResponse.json({ run }, { status: 201 });
}
