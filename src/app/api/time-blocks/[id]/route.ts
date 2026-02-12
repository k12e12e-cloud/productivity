import { NextRequest, NextResponse } from "next/server";
import { updateTimeBlock, deleteTimeBlock } from "@/db/queries/time-blocks";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const block = updateTimeBlock(id, body);
    if (!block)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(block);
  } catch (error) {
    console.error("PATCH /api/time-blocks/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = deleteTimeBlock(id);
    if (result.changes === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/time-blocks/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
