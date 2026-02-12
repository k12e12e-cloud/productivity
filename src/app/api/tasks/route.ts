import { NextRequest, NextResponse } from "next/server";
import { getAllTasks, createTask, getTasksDueSoon } from "@/db/queries/tasks";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const dueSoon = searchParams.get("dueSoon");

    if (dueSoon === "true") {
      const tasks = getTasksDueSoon(7);
      return NextResponse.json(tasks);
    }

    const tasks = getAllTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (body.title.length > 200) {
      return NextResponse.json({ error: "title must be 200 characters or less" }, { status: 400 });
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

    const task = createTask({ ...body, title: body.title.trim() });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
