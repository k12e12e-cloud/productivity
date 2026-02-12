"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";
import { PriorityBadge } from "@/components/shared/priority-badge";
import type { Task } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function UpcomingDeadlines() {
  const { data: tasks } = useSWR<Task[]>(
    "/api/tasks?dueSoon=true",
    fetcher,
    { fallbackData: [] }
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="h-4 w-4" />
          다가오는 마감
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(tasks ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            7일 내 마감 태스크 없음
          </p>
        ) : (
          <ul className="space-y-2">
            {(tasks ?? []).slice(0, 5).map((task) => (
              <li key={task.id} className="flex items-center gap-2 text-sm">
                <PriorityBadge priority={task.priority} />
                <span className="truncate flex-1">{task.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {task.dueDate?.slice(5)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
