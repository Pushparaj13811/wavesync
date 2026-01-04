import { NextRequest, NextResponse } from "next/server";
import { tracks } from "@/data/tracks";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre");
  const search = searchParams.get("search");

  let filtered = [...tracks];

  if (genre) {
    filtered = filtered.filter((t) => t.genre === genre);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.name.toLowerCase().includes(q),
    );
  }

  return NextResponse.json({ tracks: filtered, total: filtered.length });
}
