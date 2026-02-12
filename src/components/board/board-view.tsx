"use client";

import { KanbanBoard } from "./kanban-board";

export function BoardView() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <h1 className="text-lg font-semibold">칸반 보드</h1>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <KanbanBoard />
      </div>
    </div>
  );
}
