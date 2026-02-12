"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";

import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { TaskDetailDialog } from "./task-detail-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { KANBAN_COLUMNS } from "@/lib/constants";
import type { Task, TaskStatus } from "@/types";

interface KanbanBoardProps {
  filterTags?: string[];
  filterProjectId?: string;
}

export function KanbanBoard({ filterTags = [], filterProjectId = "" }: KanbanBoardProps) {
  const { tasks: allTasks, updateTask, createTask } = useTasks();

  const tasks = allTasks.filter((t) => {
    if (filterTags.length > 0 && !filterTags.some((tag) => t.contextTags?.includes(tag))) {
      return false;
    }
    if (filterProjectId && t.projectId !== filterProjectId) {
      return false;
    }
    return true;
  });
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const tasksByStatus = KANBAN_COLUMNS.reduce(
    (acc, col) => {
      acc[col] = tasks.filter((t) => t.status === col);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      setActiveTask(task ?? null);
    },
    [tasks]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      // handled in dragEnd
    },
    []
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as string;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Determine target column: over.id could be a column ID or a task ID
      let targetStatus: TaskStatus;
      let overTaskIndex = -1;
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        targetStatus = overTask.status;
        const columnTasks = tasks.filter((t) => t.status === targetStatus);
        overTaskIndex = columnTasks.findIndex((t) => t.id === over.id);
      } else if (KANBAN_COLUMNS.includes(over.id as TaskStatus)) {
        targetStatus = over.id as TaskStatus;
      } else {
        return;
      }

      const statusChanged = task.status !== targetStatus;
      const columnTasks = tasks.filter(
        (t) => t.status === targetStatus && t.id !== taskId
      );

      // Calculate new sortOrder
      let newSortOrder: number;
      if (overTaskIndex >= 0) {
        // Dropped on a specific task — insert at that position
        const sorted = columnTasks.sort((a, b) => a.sortOrder - b.sortOrder);
        if (overTaskIndex === 0) {
          newSortOrder = (sorted[0]?.sortOrder ?? 1) - 1;
        } else if (overTaskIndex >= sorted.length) {
          newSortOrder = (sorted[sorted.length - 1]?.sortOrder ?? 0) + 1;
        } else {
          newSortOrder = Math.floor(
            (sorted[overTaskIndex - 1].sortOrder + sorted[overTaskIndex].sortOrder) / 2
          );
          // If collision, reindex the whole column
          if (
            newSortOrder === sorted[overTaskIndex - 1].sortOrder ||
            newSortOrder === sorted[overTaskIndex].sortOrder
          ) {
            newSortOrder = overTaskIndex;
            // Reindex all tasks in column
            const reindexPromises = sorted.map((t, i) => {
              const order = i >= overTaskIndex ? i + 1 : i;
              if (t.sortOrder !== order) {
                return updateTask(t.id, { sortOrder: order });
              }
            });
            Promise.all(reindexPromises.filter(Boolean));
          }
        }
      } else {
        // Dropped on empty column or column header — append at end
        const sorted = columnTasks.sort((a, b) => a.sortOrder - b.sortOrder);
        newSortOrder = (sorted[sorted.length - 1]?.sortOrder ?? 0) + 1;
      }

      const updates: Partial<{ status: TaskStatus; sortOrder: number }> = {
        sortOrder: newSortOrder,
      };
      if (statusChanged) {
        updates.status = targetStatus;
      }

      if (statusChanged || task.sortOrder !== newSortOrder) {
        try {
          await updateTask(taskId, updates);
        } catch (e) {
          alert(e instanceof Error ? e.message : "이동 실패");
        }
      }
    },
    [tasks, updateTask]
  );

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  }, []);

  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = async () => {
    if (!newTitle.trim()) return;
    setIsAdding(true);
    try {
      await createTask({ title: newTitle.trim() });
      setNewTitle("");
      setShowAddForm(false);
    } catch {
      // Error handled by hook
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <div className="mb-4">
        {showAddForm ? (
          <div className="flex gap-2 max-w-md">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="새 태스크 제목..."
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              maxLength={200}
              disabled={isAdding}
              autoFocus
            />
            <Button size="sm" onClick={handleAddTask} disabled={isAdding}>
              {isAdding ? "추가중..." : "추가"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              취소
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            태스크 추가
          </Button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-[calc(100vh-200px)]">
          {KANBAN_COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <TaskDetailDialog
        task={selectedTask}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
