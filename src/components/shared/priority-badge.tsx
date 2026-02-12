import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Priority } from "@/types";

const PRIORITY_STYLES: Record<Priority, string> = {
  P0: "bg-red-500/20 text-red-400 border-red-500/30",
  P1: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  P2: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  P0: "P0 긴급",
  P1: "P1 중요",
  P2: "P2 일반",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs px-1.5 py-0", PRIORITY_STYLES[priority])}
    >
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}
