"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import type { KnowledgeEntry } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function RecentKnowledge() {
  const { data: entries } = useSWR<KnowledgeEntry[]>(
    "/api/knowledge",
    fetcher,
    { fallbackData: [] }
  );

  const recent = (entries ?? []).slice(0, 5);

  return (
    <Link href="/knowledge">
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4" />
            지식베이스
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm mb-2">
            <span className="text-2xl font-bold">{entries?.length ?? 0}</span>
            <span className="text-muted-foreground ml-1">노트</span>
          </div>
          {recent.length > 0 && (
            <div className="space-y-1">
              {recent.map((entry) => (
                <p
                  key={entry.id}
                  className="text-xs text-muted-foreground truncate"
                >
                  {entry.title}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
