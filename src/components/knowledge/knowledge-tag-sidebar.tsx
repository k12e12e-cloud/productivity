"use client";

import { cn } from "@/lib/utils";
import { Tag } from "lucide-react";

interface KnowledgeTagSidebarProps {
  allTags: string[];
  selectedTags: string[];
  onChangeSelectedTags: (tags: string[]) => void;
}

export function KnowledgeTagSidebar({
  allTags,
  selectedTags,
  onChangeSelectedTags,
}: KnowledgeTagSidebarProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChangeSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      onChangeSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="w-48 shrink-0 border-r border-border p-3 space-y-2 overflow-y-auto">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-2 pb-1">
        <Tag className="h-3.5 w-3.5" />
        태그
      </div>

      {selectedTags.length > 0 && (
        <button
          onClick={() => onChangeSelectedTags([])}
          className="w-full text-left rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          필터 초기화
        </button>
      )}

      {allTags.length === 0 && (
        <p className="px-2 text-xs text-muted-foreground">태그 없음</p>
      )}

      {allTags.map((tag) => (
        <button
          key={tag}
          onClick={() => toggleTag(tag)}
          className={cn(
            "w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors",
            selectedTags.includes(tag)
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
