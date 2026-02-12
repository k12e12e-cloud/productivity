import { NextRequest, NextResponse } from "next/server";
import {
  getAllInboxItems,
  getProcessedInboxItems,
  getUnprocessedInboxItems,
  createInboxItem,
} from "@/db/queries/inbox";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const processed = searchParams.get("processed");

    if (processed === "true") {
      return NextResponse.json(getProcessedInboxItems());
    }
    if (processed === "false") {
      return NextResponse.json(getUnprocessedInboxItems());
    }

    return NextResponse.json(getAllInboxItems());
  } catch (error) {
    console.error("GET /api/inbox error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.rawInput || typeof body.rawInput !== "string" || !body.rawInput.trim()) {
      return NextResponse.json({ error: "rawInput is required" }, { status: 400 });
    }
    if (body.rawInput.length > 2000) {
      return NextResponse.json({ error: "rawInput must be 2000 characters or less" }, { status: 400 });
    }

    const item = createInboxItem(body.rawInput.trim());
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/inbox error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
