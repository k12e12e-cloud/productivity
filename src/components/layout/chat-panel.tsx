"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatThread } from "@/components/inbox/chat-thread";
import { ChatInput } from "@/components/inbox/chat-input";

export function ChatPanel() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Toggle button */}
      {!open && (
        <Button
          size="icon"
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
          onClick={() => setOpen(true)}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-40 flex h-screen w-96 flex-col border-l border-border bg-card transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <span className="text-sm font-semibold">AI 어시스턴트</span>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatThread />
        </div>

        <div className="border-t border-border p-3">
          <ChatInput />
        </div>
      </div>
    </>
  );
}
