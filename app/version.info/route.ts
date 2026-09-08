import { NextResponse } from "next/server";
import { versionInfoBody } from "@/lib/app-version";

export function GET() {
  return new NextResponse(versionInfoBody(), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
