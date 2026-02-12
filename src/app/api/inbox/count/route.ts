import { NextResponse } from "next/server";
import { countUnprocessedInbox } from "@/db/queries/inbox";

export async function GET() {
  try {
    const count = countUnprocessedInbox();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("GET /api/inbox/count error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
