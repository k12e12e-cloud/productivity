"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { TimeBlock } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function TodaySummary() {
  const today = new Date().toISOString().split("T")[0];
  const { data: blocks } = useSWR<TimeBlock[]>(
    `/api/time-blocks?date=${today}`,
    fetcher,
    { fallbackData: [] }
  );

  const deepMinutes = (blocks ?? [])
    .filter((b) => b.blockType === "deep")
    .reduce((sum, b) => {
      const [sh, sm] = b.startTime.split(":").map(Number);
      const [eh, em] = b.endTime.split(":").map(Number);
      return sum + (eh * 60 + em - sh * 60 - sm);
    }, 0);

  const totalBlocks = blocks?.length ?? 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          오늘의 스케줄
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalBlocks === 0 ? (
          <p className="text-sm text-muted-foreground">
            아직 타임블록이 없습니다. 스케줄 페이지에서 생성하세요.
          </p>
        ) : (
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-2xl font-bold">{totalBlocks}</span>
              <span className="text-muted-foreground ml-1">블록</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-blue-400">
                {Math.round(deepMinutes / 60 * 10) / 10}h
              </span>
              <span className="text-muted-foreground ml-1">딥워크</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
