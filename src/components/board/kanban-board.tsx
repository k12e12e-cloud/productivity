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
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { TaskDetailDialog } from "./task-detail-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { KANBAN_COLUMNS } from "@/lib/constants";
import type { Task, TaskStatus } from "@/types";

export function KanbanBoard() {
  const { tasks, updateTask, createTask } = useTasks();
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
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        targetStatus = overTask.status;
      } else if (KANBAN_COLUMNS.includes(over.id as TaskStatus)) {
        targetStatus = over.id as TaskStatus;
      } else {
        return;
      }

      if (task.status !== targetStatus) {
        try {
          await updateTask(taskId, { status: targetStatus });
        } catch (e) {
          // WIP limit or other error - revert handled by useTasks
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
