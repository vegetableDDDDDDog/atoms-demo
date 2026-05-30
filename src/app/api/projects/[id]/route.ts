import { getProjectDetail } from "@/features/projects/projectService";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const project = await getProjectDetail(params.id);
  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }
  return NextResponse.json({ project });
}
