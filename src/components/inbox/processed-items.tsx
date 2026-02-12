"use client";

import useSWR from "swr";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { ArrowRight } from "lucide-react";
import type { InboxItem } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ProcessedItems() {
  const { data: items } = useSWR<InboxItem[]>(
    "/api/inbox?processed=true",
    fetcher,
    { fallbackData: [] }
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <h2 className="text-sm font-semibold">처리된 항목</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {(items ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 처리된 항목이 없습니다.</p>
          ) : (
            (items ?? []).map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-border p-3 text-sm space-y-1 overflow-hidden"
              >
                <p className="text-muted-foreground line-clamp-2 break-words">
                  {item.rawInput}
                </p>
                {item.classificationResult && (
                  <div className="flex items-center gap-2 min-w-0">
                    <PriorityBadge
                      priority={
                        (item.classificationResult as { priority: "P0" | "P1" | "P2" }).priority
                      }
                    />
                    <span className="truncate min-w-0">
                      {(item.classificationResult as { title: string }).title}
                    </span>
                    {item.taskId ? (
                      <Link
                        href="/board"
                        className="ml-auto shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        title="칸반 보드에서 보기"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <span className="ml-auto shrink-0 text-[10px] text-muted-foreground/50">삭제됨</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
