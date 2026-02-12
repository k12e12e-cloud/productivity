"use client";

import useSWR from "swr";
import { useCallback } from "react";
import type { Task, TaskStatus, Priority } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useTasks() {
  const { data: tasks, mutate } = useSWR<Task[]>("/api/tasks", fetcher, {
    fallbackData: [],
    refreshInterval: 5000,
  });

  const createTask = useCallback(
    async (data: {
      title: string;
      description?: string;
      priority?: Priority;
      status?: TaskStatus;
    }) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const task = await res.json();
      mutate([...(tasks ?? []), task], false);
      return task;
    },
    [tasks, mutate]
  );

  const updateTask = useCallback(
    async (
      id: string,
      data: Partial<{
        title: string;
        description: string | null;
        priority: Priority;
        status: TaskStatus;
        sortOrder: number;
        dueDate: string | null;
        timeEstimateMinutes: number | null;
        blockType: "deep" | "shallow" | null;
        contextTags: string[];
        projectId: string | null;
      }>
    ) => {
      // Optimistic update
      const optimistic = (tasks ?? []).map((t) =>
        t.id === id ? { ...t, ...data } : t
      );
      mutate(optimistic, false);

      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        // Revert on error
        mutate();
        const error = await res.json();
        throw new Error(error.error || "Failed to update task");
      }

      mutate();
    },
    [tasks, mutate]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      mutate(
        (tasks ?? []).filter((t) => t.id !== id),
        false
      );
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        mutate();
        throw new Error("Failed to delete task");
      }
      mutate();
    },
    [tasks, mutate]
  );

  return {
    tasks: tasks ?? [],
    createTask,
    updateTask,
    deleteTask,
    mutate,
  };
}
