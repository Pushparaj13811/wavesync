import { NextRequest, NextResponse } from "next/server";
import { tracks } from "@/data/tracks";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const track = tracks.find((t) => t.id === id);

  if (!track) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  return NextResponse.json(track);
}
