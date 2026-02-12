"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Kanban } from "lucide-react";
import { KANBAN_COLUMNS, STATUS_LABELS } from "@/lib/constants";
import type { Task } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function KanbanMini() {
  const { data: tasks } = useSWR<Task[]>("/api/tasks", fetcher, {
    fallbackData: [],
  });

  const counts = KANBAN_COLUMNS.reduce(
    (acc, col) => {
      acc[col] = (tasks ?? []).filter((t) => t.status === col).length;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Kanban className="h-4 w-4" />
          칸반 보드
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          {KANBAN_COLUMNS.map((col) => (
            <div key={col}>
              <div className="text-2xl font-bold">{counts[col]}</div>
              <div className="text-xs text-muted-foreground">
                {STATUS_LABELS[col]}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
