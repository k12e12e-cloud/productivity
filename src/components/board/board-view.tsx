"use client";

import { useState } from "react";
import { KanbanBoard } from "./kanban-board";
import { TagFilter } from "./tag-filter";
import { ProjectFilter } from "./project-filter";

export function BoardView() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4 space-y-3">
        <h1 className="text-lg font-semibold">칸반 보드</h1>
        <div className="flex flex-wrap items-center gap-3">
          <ProjectFilter
            selectedProjectId={selectedProjectId}
            onChangeProjectId={setSelectedProjectId}
          />
          <TagFilter selectedTags={selectedTags} onChangeSelectedTags={setSelectedTags} />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <KanbanBoard filterTags={selectedTags} filterProjectId={selectedProjectId} />
      </div>
    </div>
  );
}
