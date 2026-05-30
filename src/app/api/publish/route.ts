import { publishVersion } from "@/features/publish/publishService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { versionId?: string };
  if (!body.versionId) {
    return NextResponse.json({ message: "versionId is required" }, { status: 400 });
  }

  const publish = await publishVersion(body.versionId);
  return NextResponse.json({
    publish,
    url: `/p/${publish.slug}`
  });
}
