import { NextRequest, NextResponse } from "next/server";
import { searchKnowledge, createKnowledge } from "@/db/queries/knowledge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || undefined;
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : undefined;

    const entries = searchKnowledge(q, tags);
    return NextResponse.json(entries);
  } catch (error) {
    console.error("GET /api/knowledge error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (!body.content || typeof body.content !== "string") {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }
    if (body.source && !["manual", "ai-chat", "import"].includes(body.source)) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }

    const entry = createKnowledge({
      title: body.title.trim(),
      content: body.content,
      tags: Array.isArray(body.tags) ? body.tags : [],
      source: body.source,
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("POST /api/knowledge error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
