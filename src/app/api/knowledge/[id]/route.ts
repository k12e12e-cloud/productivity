import { NextRequest, NextResponse } from "next/server";
import {
  getKnowledgeById,
  updateKnowledge,
  deleteKnowledge,
} from "@/db/queries/knowledge";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entry = getKnowledgeById(id);
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(entry);
  } catch (error) {
    console.error("GET /api/knowledge/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
      }
    }
    if (body.source && !["manual", "ai-chat", "import"].includes(body.source)) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }

    const entry = updateKnowledge(id, body);
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(entry);
  } catch (error) {
    console.error("PATCH /api/knowledge/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = getKnowledgeById(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    deleteKnowledge(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/knowledge/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
