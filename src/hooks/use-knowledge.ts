"use client";

import useSWR from "swr";
import { useState, useCallback, useMemo } from "react";
import type { KnowledgeEntry } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useKnowledge() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    const qs = params.toString();
    return `/api/knowledge${qs ? `?${qs}` : ""}`;
  }, [searchQuery, selectedTags]);

  const { data: entries, mutate } = useSWR<KnowledgeEntry[]>(apiUrl, fetcher, {
    fallbackData: [],
    refreshInterval: 5000,
  });

  const { data: allTags } = useSWR<string[]>("/api/knowledge/tags", fetcher, {
    fallbackData: [],
    refreshInterval: 10000,
  });

  const createEntry = useCallback(
    async (data: { title: string; content: string; tags?: string[]; source?: string }) => {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create knowledge entry");
      const entry = await res.json();
      mutate([entry, ...(entries ?? [])], false);
      return entry;
    },
    [entries, mutate]
  );

  const updateEntry = useCallback(
    async (
      id: string,
      data: Partial<{ title: string; content: string; tags: string[] }>
    ) => {
      const optimistic = (entries ?? []).map((e) =>
        e.id === id ? { ...e, ...data } : e
      );
      mutate(optimistic, false);

      const res = await fetch(`/api/knowledge/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        mutate();
        throw new Error("Failed to update knowledge entry");
      }
      mutate();
    },
    [entries, mutate]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      mutate(
        (entries ?? []).filter((e) => e.id !== id),
        false
      );
      const res = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
      if (!res.ok) {
        mutate();
        throw new Error("Failed to delete knowledge entry");
      }
      mutate();
    },
    [entries, mutate]
  );

  return {
    entries: entries ?? [],
    allTags: allTags ?? [],
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    createEntry,
    updateEntry,
    deleteEntry,
    mutate,
  };
}
