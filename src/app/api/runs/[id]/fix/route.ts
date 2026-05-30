import { createGenerationRun, getRunDetail } from "@/features/runs/generationService";
import { NextResponse } from "next/server";

export async function POST(_: Request, { params }: { params: { id: string } }) {
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
    fixRequested: true
  });

  return NextResponse.json({ run }, { status: 201 });
}
