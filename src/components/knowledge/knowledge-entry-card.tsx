"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { KNOWLEDGE_SOURCE_LABELS } from "@/lib/constants";
import type { KnowledgeEntry } from "@/types";

interface KnowledgeEntryCardProps {
  entry: KnowledgeEntry;
  isActive: boolean;
  onClick: () => void;
}

export function KnowledgeEntryCard({
  entry,
  isActive,
  onClick,
}: KnowledgeEntryCardProps) {
  const preview =
    entry.content.length > 100
      ? entry.content.slice(0, 100) + "..."
      : entry.content;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer p-3 transition-colors hover:border-primary/50",
        isActive && "border-primary bg-accent/30"
      )}
    >
      <div className="space-y-1.5">
        <p className="text-sm font-medium leading-tight">{entry.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{preview}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">
            {KNOWLEDGE_SOURCE_LABELS[entry.source] ?? entry.source}
          </span>
          {entry.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
