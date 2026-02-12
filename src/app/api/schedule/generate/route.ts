import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";
import { SCHEDULE_SYSTEM_PROMPT } from "@/lib/prompts";
import { extractSchedule } from "@/lib/classify";
import { getTasksByStatus } from "@/db/queries/tasks";
import {
  createTimeBlock,
  deleteTimeBlocksByDate,
} from "@/db/queries/time-blocks";

export async function POST(request: NextRequest) {
  const { date } = await request.json();
  const targetDate = date || new Date().toISOString().split("T")[0];

  // Get today's tasks (TODAY + IN_PROGRESS)
  const todayTasks = [
    ...getTasksByStatus("TODAY"),
    ...getTasksByStatus("IN_PROGRESS"),
  ];

  if (todayTasks.length === 0) {
    return NextResponse.json(
      { error: "스케줄할 태스크가 없습니다. TODAY 또는 IN_PROGRESS 태스크를 먼저 추가하세요." },
      { status: 400 }
    );
  }

  const taskList = todayTasks
    .map(
      (t) =>
        `- [${t.id}] ${t.title} (${t.priority}, ${t.blockType ?? "deep"}, ${t.timeEstimateMinutes ?? 60}분)`
    )
    .join("\n");

  const client = getAnthropicClient();

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: SCHEDULE_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `오늘(${targetDate}) 처리할 태스크:\n${taskList}\n\n최적의 타임블록 스케줄을 JSON으로 생성해주세요.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const schedule = extractSchedule(text);

    if (!schedule) {
      return NextResponse.json(
        { error: "스케줄 생성 실패 - AI 응답을 파싱할 수 없음" },
        { status: 500 }
      );
    }

    // Clear existing blocks for the day
    deleteTimeBlocksByDate(targetDate);

    // Create new blocks
    const created = [];
    for (const block of schedule) {
      const tb = createTimeBlock({
        date: targetDate,
        startTime: block.startTime,
        endTime: block.endTime,
        taskId: block.taskId ?? undefined,
        blockType: block.blockType,
        label: block.label,
      });
      created.push(tb);
    }

    return NextResponse.json({ blocks: created });
  } catch (error) {
    console.error("Schedule generation error:", error);
    return NextResponse.json(
      { error: "스케줄 생성 중 오류 발생" },
      { status: 500 }
    );
  }
}
