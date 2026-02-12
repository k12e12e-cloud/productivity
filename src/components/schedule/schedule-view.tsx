"use client";

import { Timeline } from "./timeline";
import { GenerateButton } from "./generate-button";

export function ScheduleView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h1 className="text-lg font-semibold">타임 블로킹</h1>
          <p className="text-sm text-muted-foreground">
            오늘의 일정을 시간 블록으로 관리합니다.
          </p>
        </div>
        <GenerateButton />
      </div>
      <div className="flex-1 overflow-auto p-4">
        <Timeline />
      </div>
    </div>
  );
}
