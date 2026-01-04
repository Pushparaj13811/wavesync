import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  try {
    const audioRes = await fetch(url);

    if (!audioRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch audio" },
        { status: audioRes.status },
      );
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      audioRes.headers.get("Content-Type") || "audio/mpeg",
    );
    const contentLength = audioRes.headers.get("Content-Length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=86400");

    return new NextResponse(audioRes.body, { status: 200, headers });
  } catch {
    return NextResponse.json(
      { error: "Failed to proxy audio" },
      { status: 500 },
    );
  }
}
