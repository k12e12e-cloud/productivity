"use client";

import {
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, WIP_LIMIT } from "@/lib/constants";
import type { Task, TaskStatus } from "@/types";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function KanbanColumn({ status, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const isWipWarning = status === "IN_PROGRESS" && tasks.length >= WIP_LIMIT;

  return (
    <div
      className={cn(
        "flex h-full w-72 shrink-0 flex-col rounded-lg border border-border bg-card/50",
        isOver && "border-primary/50 bg-accent/30"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span className="text-sm font-semibold">{STATUS_LABELS[status]}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {tasks.length}
        </span>
        {isWipWarning && (
          <span className="ml-auto text-xs text-red-400">
            WIP {WIP_LIMIT}
          </span>
        )}
      </div>

      {/* Task list */}
      <ScrollArea className="flex-1">
        <div ref={setNodeRef} className="min-h-[100px] space-y-2 p-2">
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))}
          </SortableContext>

          {tasks.length === 0 && (
            <p className="py-8 text-center text-xs text-muted-foreground">
              비어 있음
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
