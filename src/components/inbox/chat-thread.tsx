"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";

export function ChatThread() {
  const { messages, isStreaming, streamingContent } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 p-4">
        {messages.length === 0 && !isStreaming && (
          <p className="text-center text-sm text-muted-foreground py-8">
            무엇이든 입력하세요. AI가 분류하고 태스크를 생성합니다.
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "rounded-lg px-3 py-2 text-sm leading-relaxed",
              msg.role === "user"
                ? "ml-8 bg-primary text-primary-foreground"
                : "mr-8 bg-muted text-foreground"
            )}
          >
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="mr-8 rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed">
            <div className="whitespace-pre-wrap">{streamingContent}</div>
          </div>
        )}

        {isStreaming && !streamingContent && (
          <div className="mr-8 rounded-lg bg-muted px-3 py-2 text-sm">
            <span className="animate-pulse">생각 중...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
