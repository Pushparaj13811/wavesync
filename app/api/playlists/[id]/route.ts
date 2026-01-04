import { NextRequest, NextResponse } from "next/server";
import { playlists } from "@/data/playlists";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const playlist = playlists.find((p) => p.id === id);

  if (!playlist) {
    return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
  }

  return NextResponse.json(playlist);
}
