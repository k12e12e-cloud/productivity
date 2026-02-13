"use client";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { KnowledgeEntryCard } from "./knowledge-entry-card";
import type { KnowledgeEntry } from "@/types";

interface KnowledgeEntryListProps {
  entries: KnowledgeEntry[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeId: string | null;
  onSelectEntry: (entry: KnowledgeEntry) => void;
}

export function KnowledgeEntryList({
  entries,
  searchQuery,
  onSearchChange,
  activeId,
  onSelectEntry,
}: KnowledgeEntryListProps) {
  return (
    <div className="w-72 shrink-0 border-r border-border flex flex-col">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="검색..."
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {entries.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              {searchQuery ? "검색 결과 없음" : "지식 노트가 없습니다"}
            </p>
          )}
          {entries.map((entry) => (
            <KnowledgeEntryCard
              key={entry.id}
              entry={entry}
              isActive={activeId === entry.id}
              onClick={() => onSelectEntry(entry)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
