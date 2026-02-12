"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimeBlock } from "@/types";

const BLOCK_COLORS = {
  deep: "bg-blue-500/20 border-blue-500/40 text-blue-300",
  shallow: "bg-zinc-500/20 border-zinc-500/40 text-zinc-300",
  break: "bg-green-500/20 border-green-500/40 text-green-300",
};

interface TimeBlockItemProps {
  block: TimeBlock;
  onDelete: (id: string) => void;
}

export function TimeBlockItem({ block, onDelete }: TimeBlockItemProps) {
  const [startH, startM] = block.startTime.split(":").map(Number);
  const [endH, endM] = block.endTime.split(":").map(Number);
  const durationMinutes = endH * 60 + endM - (startH * 60 + startM);

  // Each 30-min slot = 60px height
  const top = ((startH - 6) * 60 + startM) * 2; // px from 06:00
  const height = Math.max(durationMinutes * 2, 24); // min height

  return (
    <div
      className={cn(
        "absolute left-16 right-2 rounded-md border px-2 py-1 text-xs",
        BLOCK_COLORS[block.blockType]
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <span className="font-medium">{block.label}</span>
          <div className="text-[10px] opacity-70">
            {block.startTime} - {block.endTime}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
          onClick={() => {
            if (window.confirm("이 타임블록을 삭제하시겠습니까?")) {
              onDelete(block.id);
            }
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
