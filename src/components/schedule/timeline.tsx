"use client";

import { useTimeBlocks } from "@/hooks/use-time-blocks";
import { TimeBlockItem } from "./time-block-item";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 to 22:00

export function Timeline() {
  const today = new Date().toISOString().split("T")[0];
  const { blocks, deleteBlock } = useTimeBlocks(today);

  return (
    <div className="relative" style={{ height: `${17 * 120}px` }}>
      {/* Hour grid lines */}
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="absolute left-0 right-0 border-t border-border"
          style={{ top: `${(hour - 6) * 120}px` }}
        >
          <span className="absolute -top-2.5 left-0 text-xs text-muted-foreground w-12 text-right pr-2">
            {String(hour).padStart(2, "0")}:00
          </span>
        </div>
      ))}

      {/* Half-hour grid lines */}
      {HOURS.map((hour) => (
        <div
          key={`${hour}-30`}
          className="absolute left-16 right-0 border-t border-border/30"
          style={{ top: `${(hour - 6) * 120 + 60}px` }}
        />
      ))}

      {/* Time blocks */}
      {blocks.map((block) => (
        <TimeBlockItem key={block.id} block={block} onDelete={deleteBlock} />
      ))}

      {blocks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            타임블록이 없습니다. Auto-generate 버튼을 눌러 자동 생성하세요.
          </p>
        </div>
      )}
    </div>
  );
}
