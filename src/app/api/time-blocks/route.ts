import { NextRequest, NextResponse } from "next/server";
import {
  getTimeBlocksByDate,
  createTimeBlock,
  deleteTimeBlocksByDate,
} from "@/db/queries/time-blocks";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const date = searchParams.get("date");
    if (!date) {
      return NextResponse.json(
        { error: "date parameter required" },
        { status: 400 }
      );
    }
    const blocks = getTimeBlocksByDate(date);
    return NextResponse.json(blocks);
  } catch (error) {
    console.error("GET /api/time-blocks error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.date || !DATE_REGEX.test(body.date)) {
      return NextResponse.json({ error: "Valid date (YYYY-MM-DD) is required" }, { status: 400 });
    }
    if (!body.startTime || !TIME_REGEX.test(body.startTime)) {
      return NextResponse.json({ error: "Valid startTime (HH:MM) is required" }, { status: 400 });
    }
    if (!body.endTime || !TIME_REGEX.test(body.endTime)) {
      return NextResponse.json({ error: "Valid endTime (HH:MM) is required" }, { status: 400 });
    }
    if (body.endTime <= body.startTime) {
      return NextResponse.json({ error: "endTime must be after startTime" }, { status: 400 });
    }
    if (!body.label || typeof body.label !== "string" || !body.label.trim()) {
      return NextResponse.json({ error: "label is required" }, { status: 400 });
    }
    if (body.blockType && !["deep", "shallow", "break"].includes(body.blockType)) {
      return NextResponse.json({ error: "Invalid blockType" }, { status: 400 });
    }

    const block = createTimeBlock({ ...body, label: body.label.trim() });
    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    console.error("POST /api/time-blocks error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const date = searchParams.get("date");
    if (!date) {
      return NextResponse.json(
        { error: "date parameter required" },
        { status: 400 }
      );
    }
    deleteTimeBlocksByDate(date);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/time-blocks error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
