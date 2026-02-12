"use client";

import useSWR from "swr";
import { useCallback } from "react";
import type { Project } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useProjects() {
  const { data: projects, mutate } = useSWR<Project[]>("/api/projects", fetcher, {
    fallbackData: [],
  });

  const createProject = useCallback(
    async (data: { name: string; description?: string }) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create project");
      mutate();
      return res.json();
    },
    [mutate]
  );

  const updateProject = useCallback(
    async (id: string, data: Partial<{ name: string; description: string | null; status: string }>) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update project");
      mutate();
    },
    [mutate]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      mutate();
    },
    [mutate]
  );

  return {
    projects: projects ?? [],
    createProject,
    updateProject,
    deleteProject,
    mutate,
  };
}
