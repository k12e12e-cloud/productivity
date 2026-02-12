"use client";

import { useTasks } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  selectedTags: string[];
  onChangeSelectedTags: (tags: string[]) => void;
}

export function TagFilter({ selectedTags, onChangeSelectedTags }: TagFilterProps) {
  const { tasks } = useTasks();

  // Collect all unique tags
  const allTags = Array.from(
    new Set(tasks.flatMap((t) => t.contextTags ?? []))
  ).sort();

  if (allTags.length === 0) return null;

  const toggle = (tag: string) => {
    onChangeSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag]
    );
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {selectedTags.length > 0 && (
        <button
          onClick={() => onChangeSelectedTags([])}
          className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          전체
        </button>
      )}
      {allTags.map((tag) => (
        <button
          key={tag}
          onClick={() => toggle(tag)}
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
            selectedTags.includes(tag)
              ? "border-primary bg-primary/20 text-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
