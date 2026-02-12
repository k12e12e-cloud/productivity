"use client";

import useSWR from "swr";
import { useState, useCallback } from "react";
import type { ChatMessage } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useChat() {
  const { data: messages, mutate } = useSWR<ChatMessage[]>(
    "/api/chat",
    fetcher,
    { fallbackData: [] }
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      // Optimistically add user message
      const userMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        metadata: null,
        createdAt: new Date().toISOString(),
      };
      mutate([...(messages ?? []), userMsg], false);

      setIsStreaming(true);
      setStreamingContent("");
      setError(null);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
        });

        if (!res.ok) throw new Error("Failed to send message");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === "text_delta") {
                  accumulated += parsed.text;
                  setStreamingContent(accumulated);
                }
              } catch {
                // skip non-JSON lines
              }
            }
          }
        }

        // Refresh messages from server
        mutate();
      } catch (err) {
        console.error("Chat error:", err);
        setError(err instanceof Error ? err.message : "메시지 전송 실패");
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
      }
    },
    [messages, mutate]
  );

  return {
    messages: messages ?? [],
    sendMessage,
    isStreaming,
    streamingContent,
    error,
  };
}
