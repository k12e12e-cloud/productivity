import { NextResponse } from "next/server";
import { getAllKnowledgeTags } from "@/db/queries/knowledge";

export async function GET() {
  try {
    const tags = getAllKnowledgeTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error("GET /api/knowledge/tags error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
