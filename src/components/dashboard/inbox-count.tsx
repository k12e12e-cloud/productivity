"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox } from "lucide-react";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function InboxCount() {
  const { data } = useSWR<{ count: number }>(
    "/api/inbox/count",
    fetcher,
    { fallbackData: { count: 0 } }
  );

  return (
    <Link href="/inbox">
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Inbox className="h-4 w-4" />
            인박스
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <span className="text-2xl font-bold">{data?.count ?? 0}</span>
            <span className="text-muted-foreground ml-1">미처리</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
