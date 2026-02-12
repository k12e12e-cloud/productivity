"use client";

import { TodaySummary } from "./today-summary";
import { KanbanMini } from "./kanban-mini";
import { InboxCount } from "./inbox-count";
import { UpcomingDeadlines } from "./upcoming-deadlines";

export function DashboardView() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InboxCount />
        <KanbanMini />
        <UpcomingDeadlines />
      </div>
      <TodaySummary />
    </div>
  );
}
