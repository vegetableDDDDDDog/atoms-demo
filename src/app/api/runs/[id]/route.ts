import { getRunDetail } from "@/features/runs/generationService";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const run = await getRunDetail(params.id);
  if (!run) {
    return NextResponse.json({ message: "Run not found" }, { status: 404 });
  }
  return NextResponse.json({ run });
}
