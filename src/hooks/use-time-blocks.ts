"use client";

import useSWR from "swr";
import { useCallback } from "react";
import type { TimeBlock, BlockType } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useTimeBlocks(date: string) {
  const { data: blocks, mutate } = useSWR<TimeBlock[]>(
    `/api/time-blocks?date=${date}`,
    fetcher,
    { fallbackData: [] }
  );

  const createBlock = useCallback(
    async (data: {
      startTime: string;
      endTime: string;
      taskId?: string;
      blockType?: BlockType;
      label: string;
    }) => {
      const res = await fetch("/api/time-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, date }),
      });
      if (!res.ok) throw new Error("Failed to create time block");
      mutate();
    },
    [date, mutate]
  );

  const updateBlock = useCallback(
    async (
      id: string,
      data: Partial<{
        startTime: string;
        endTime: string;
        taskId: string | null;
        blockType: BlockType;
        label: string;
      }>
    ) => {
      const res = await fetch(`/api/time-blocks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update time block");
      mutate();
    },
    [mutate]
  );

  const deleteBlock = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/time-blocks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete time block");
      mutate();
    },
    [mutate]
  );

  const clearDay = useCallback(async () => {
    const res = await fetch(`/api/time-blocks?date=${date}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to clear day");
    mutate();
  }, [date, mutate]);

  return {
    blocks: blocks ?? [],
    createBlock,
    updateBlock,
    deleteBlock,
    clearDay,
    mutate,
  };
}
