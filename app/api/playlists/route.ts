import { NextResponse } from "next/server";
import { playlists } from "@/data/playlists";

export async function GET() {
  const summaries = playlists.map(({ tracks: _t, ...rest }) => rest);
  return NextResponse.json({ playlists: summaries });
}
