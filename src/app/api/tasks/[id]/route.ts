import { NextRequest, NextResponse } from "next/server";
import {
  getTaskById,
  updateTask,
  deleteTask,
  countTasksByStatus,
} from "@/db/queries/tasks";
import { WIP_LIMIT } from "@/lib/constants";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = getTaskById(id);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(task);
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);
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
      if (body.title.length > 200) {
        return NextResponse.json({ error: "title must be 200 characters or less" }, { status: 400 });
      }
    }
    if (body.priority && !["P0", "P1", "P2"].includes(body.priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }
    if (body.status && !["BACKLOG", "TODAY", "IN_PROGRESS", "DONE"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (body.timeEstimateMinutes != null && (typeof body.timeEstimateMinutes !== "number" || body.timeEstimateMinutes < 0 || body.timeEstimateMinutes > 1440)) {
      return NextResponse.json({ error: "timeEstimateMinutes must be 0-1440" }, { status: 400 });
    }
    if (body.blockType && !["deep", "shallow"].includes(body.blockType)) {
      return NextResponse.json({ error: "blockType must be 'deep' or 'shallow'" }, { status: 400 });
    }

    // WIP limit check
    if (body.status === "IN_PROGRESS") {
      const current = getTaskById(id);
      if (current?.status !== "IN_PROGRESS") {
        const wipCount = countTasksByStatus("IN_PROGRESS");
        if (wipCount >= WIP_LIMIT) {
          return NextResponse.json(
            {
              error: `WIP 제한 초과: 현재 진행중 ${wipCount}개 (최대 ${WIP_LIMIT}개)`,
            },
            { status: 422 }
          );
        }
      }
    }

    const task = updateTask(id, body);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = getTaskById(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    deleteTask(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
