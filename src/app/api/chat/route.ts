import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";
import { CLASSIFY_SYSTEM_PROMPT } from "@/lib/prompts";
import { extractClassification } from "@/lib/classify";
import { getChatMessages, createChatMessage } from "@/db/queries/chat";
import { createTask } from "@/db/queries/tasks";
import { createInboxItem, updateInboxItem } from "@/db/queries/inbox";

export async function GET() {
  try {
    const messages = getChatMessages();
    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /api/chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "message must be 5000 characters or less" }, { status: 400 });
    }

    // Save user message
    createChatMessage({ role: "user", content: message });

  // Create inbox item
  const inboxItem = createInboxItem(message);

  // Get recent messages for context
  const recentMessages = getChatMessages(20);
  const conversationHistory = recentMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const client = getAnthropicClient();

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";

      try {
        const response = await client.messages.create({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 1024,
          system: CLASSIFY_SYSTEM_PROMPT,
          messages: conversationHistory,
          stream: true,
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullResponse += text;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text_delta", text })}\n\n`
              )
            );
          }
        }

        // Save assistant message
        createChatMessage({
          role: "assistant",
          content: fullResponse,
        });

        // Try to extract classification and create task
        const classification = extractClassification(fullResponse);
        if (classification) {
          const task = createTask({
            title: classification.title,
            priority: classification.priority,
            contextTags: classification.contextTags,
            timeEstimateMinutes: classification.timeEstimateMinutes,
            blockType: classification.blockType,
          });

          updateInboxItem(inboxItem.id, {
            processed: true,
            classificationResult: classification,
            taskId: task.id,
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "task_created", task })}\n\n`
            )
          );
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        console.error("Chat API error:", error);
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: errorMsg })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
