"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks } from "@/hooks/use-tasks";
import { KANBAN_COLUMNS, STATUS_LABELS } from "@/lib/constants";
import type { Task, Priority, TaskStatus } from "@/types";
import { Trash2, Loader2 } from "lucide-react";

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
}: TaskDetailDialogProps) {
  const { updateTask, deleteTask } = useTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("P1");
  const [status, setStatus] = useState<TaskStatus>("BACKLOG");
  const [dueDate, setDueDate] = useState("");
  const [timeEstimate, setTimeEstimate] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate ?? "");
      setTimeEstimate(task.timeEstimateMinutes?.toString() ?? "");
      setError("");
      setIsSaving(false);
      setIsDeleting(false);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      setError("제목을 입력하세요");
      return;
    }
    if (timeEstimate) {
      const mins = parseInt(timeEstimate);
      if (isNaN(mins) || mins < 0 || mins > 1440) {
        setError("예상 시간은 0~1440분 사이여야 합니다");
        return;
      }
    }
    try {
      setError("");
      setIsSaving(true);
      await updateTask(task.id, {
        title: title.trim(),
        description: description || null,
        priority,
        status,
        dueDate: dueDate || null,
        timeEstimateMinutes: timeEstimate ? parseInt(timeEstimate) : null,
      });
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("이 태스크를 삭제하시겠습니까?")) return;
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      onOpenChange(false);
    } catch {
      setError("삭제 실패");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>태스크 상세</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            maxLength={200}
          />

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명 (선택)"
            rows={3}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">우선순위</label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as Priority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P0">P0 긴급</SelectItem>
                  <SelectItem value="P1">P1 중요</SelectItem>
                  <SelectItem value="P2">P2 일반</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">상태</label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KANBAN_COLUMNS.map((col) => (
                    <SelectItem key={col} value={col}>
                      {STATUS_LABELS[col]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">마감일</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                예상 시간 (분)
              </label>
              <Input
                type="number"
                value={timeEstimate}
                onChange={(e) => setTimeEstimate(e.target.value)}
                placeholder="60"
                min="0"
                max="1440"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex justify-between">
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting || isSaving}>
              {isDeleting ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="mr-1 h-3 w-3" />
              )}
              {isDeleting ? "삭제중..." : "삭제"}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isSaving || isDeleting}
              >
                취소
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving || isDeleting}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    저장중...
                  </>
                ) : (
                  "저장"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
