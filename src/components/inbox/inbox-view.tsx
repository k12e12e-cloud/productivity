"use client";

import { ChatThread } from "./chat-thread";
import { ChatInput } from "./chat-input";
import { ProcessedItems } from "./processed-items";

export function InboxView() {
  return (
    <div className="flex h-full">
      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        <div className="border-b border-border p-4">
          <h1 className="text-lg font-semibold">인박스</h1>
          <p className="text-sm text-muted-foreground">
            업무를 입력하면 AI가 자동으로 분류하고 태스크를 생성합니다.
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatThread />
        </div>
        <div className="border-t border-border p-4">
          <ChatInput />
        </div>
      </div>

      {/* Processed items sidebar */}
      <div className="hidden w-80 border-l border-border lg:block">
        <ProcessedItems />
      </div>
    </div>
  );
}
