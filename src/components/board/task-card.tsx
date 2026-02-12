"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { GripVertical, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-pointer p-3 hover:border-primary/50 transition-colors",
        isDragging && "opacity-50 shadow-lg"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-sm font-medium leading-tight">{task.title}</p>

          <div className="flex flex-wrap items-center gap-1.5">
            <PriorityBadge priority={task.priority} />

            {task.timeEstimateMinutes && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {task.timeEstimateMinutes}m
              </span>
            )}

            {task.contextTags?.map((tag) => (
              <span
                key={tag}
                className="rounded bg-accent px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {task.dueDate && (
            <p className="text-xs text-muted-foreground">
              마감: {task.dueDate}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
