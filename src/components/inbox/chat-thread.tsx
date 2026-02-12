"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";
import { Code, Zap } from "lucide-react";

const JSON_BLOCK_RE = /```json\s*[\s\S]*?```/g;

function splitJsonBlocks(text: string) {
  const match = text.match(JSON_BLOCK_RE);
  if (!match) return { visible: text, json: null };
  const visible = text.replace(JSON_BLOCK_RE, "").trimEnd();
  return { visible, json: match.join("\n") };
}

// Claude Sonnet 4.5 pricing on OpenRouter ($/M tokens)
const INPUT_COST_PER_M = 3;
const OUTPUT_COST_PER_M = 15;

function formatCost(prompt: number, completion: number) {
  const cost =
    (prompt * INPUT_COST_PER_M + completion * OUTPUT_COST_PER_M) / 1_000_000;
  return cost < 0.01
    ? `$${cost.toFixed(4)}`
    : `$${cost.toFixed(3)}`;
}

interface AssistantMessageProps {
  content: string;
  metadata: Record<string, unknown> | null;
}

function AssistantMessage({ content, metadata }: AssistantMessageProps) {
  const { visible, json } = splitJsonBlocks(content);
  const [showJson, setShowJson] = useState(false);
  const [showUsage, setShowUsage] = useState(false);

  const usage = (metadata?.usage as { prompt_tokens: number; completion_tokens: number } | undefined) ?? null;

  return (
    <div className="mr-8">
      <div className="rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed">
        <div className="whitespace-pre-wrap">{visible}</div>
      </div>
      <div className="mt-1 ml-1 flex items-center gap-3">
        {json && (
          <div>
            <button
              onClick={() => setShowJson((v) => !v)}
              className={cn(
                "flex items-center gap-1 text-[10px] transition-colors",
                showJson
                  ? "text-muted-foreground"
                  : "text-muted-foreground/40 hover:text-muted-foreground"
              )}
            >
              <Code className="h-3 w-3" />
              <span>{showJson ? "분류 정보 숨기기" : "분류 정보"}</span>
            </button>
          </div>
        )}
        {usage && (
          <div>
            <button
              onClick={() => setShowUsage((v) => !v)}
              className={cn(
                "flex items-center gap-1 text-[10px] transition-colors",
                showUsage
                  ? "text-muted-foreground"
                  : "text-muted-foreground/40 hover:text-muted-foreground"
              )}
            >
              <Zap className="h-3 w-3" />
              <span>
                {showUsage
                  ? "사용량 숨기기"
                  : formatCost(usage.prompt_tokens, usage.completion_tokens)}
              </span>
            </button>
          </div>
        )}
      </div>
      {showJson && json && (
        <pre className="mt-1 ml-1 rounded border border-border bg-card p-2 text-[11px] text-muted-foreground overflow-x-auto">
          {json.replace(/```json\n?/g, "").replace(/```/g, "").trim()}
        </pre>
      )}
      {showUsage && usage && (
        <div className="mt-1 ml-1 rounded border border-border bg-card p-2 text-[11px] text-muted-foreground">
          <span>입력: {usage.prompt_tokens.toLocaleString()}토큰</span>
          <span className="mx-2">|</span>
          <span>출력: {usage.completion_tokens.toLocaleString()}토큰</span>
          <span className="mx-2">|</span>
          <span>비용: {formatCost(usage.prompt_tokens, usage.completion_tokens)}</span>
        </div>
      )}
    </div>
  );
}

export function ChatThread() {
  const { messages, isStreaming, streamingContent } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Hide JSON from streaming content too
  const streamVisible = streamingContent
    ? splitJsonBlocks(streamingContent).visible
    : "";

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 p-4">
        {messages.length === 0 && !isStreaming && (
          <p className="text-center text-sm text-muted-foreground py-8">
            무엇이든 입력하세요. AI가 분류하고 태스크를 생성합니다.
          </p>
        )}

        {messages.map((msg) =>
          msg.role === "assistant" ? (
            <AssistantMessage key={msg.id} content={msg.content} metadata={msg.metadata} />
          ) : (
            <div
              key={msg.id}
              className="ml-8 rounded-lg bg-primary px-3 py-2 text-sm leading-relaxed text-primary-foreground"
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          )
        )}

        {isStreaming && streamVisible && (
          <div className="mr-8 rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed">
            <div className="whitespace-pre-wrap">{streamVisible}</div>
          </div>
        )}

        {isStreaming && !streamVisible && (
          <div className="mr-8 rounded-lg bg-muted px-3 py-2 text-sm">
            <span className="animate-pulse">생각 중...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
