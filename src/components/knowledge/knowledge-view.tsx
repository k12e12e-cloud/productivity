"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { useKnowledge } from "@/hooks/use-knowledge";
import { KnowledgeTagSidebar } from "./knowledge-tag-sidebar";
import { KnowledgeEntryList } from "./knowledge-entry-list";
import { KnowledgeEntryDetail } from "./knowledge-entry-detail";
import { KnowledgeCreateDialog } from "./knowledge-create-dialog";
import type { KnowledgeEntry } from "@/types";

export function KnowledgeView() {
  const {
    entries,
    allTags,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    createEntry,
    updateEntry,
    deleteEntry,
  } = useKnowledge();

  const [activeEntry, setActiveEntry] = useState<KnowledgeEntry | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Keep active entry in sync with latest data
  const currentEntry = useMemo(() => {
    if (!activeEntry) return null;
    return entries.find((e) => e.id === activeEntry.id) ?? null;
  }, [activeEntry, entries]);

  // Related entries: share at least one tag with the current entry
  const relatedEntries = useMemo(() => {
    if (!currentEntry) return [];
    const tags = new Set(currentEntry.tags);
    return entries.filter(
      (e) => e.id !== currentEntry.id && e.tags.some((t) => tags.has(t))
    );
  }, [currentEntry, entries]);

  const handleSelectEntry = (entry: KnowledgeEntry) => {
    setActiveEntry(entry);
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
    if (activeEntry?.id === id) {
      setActiveEntry(null);
    }
  };

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">지식베이스</h1>
            <span className="text-sm text-muted-foreground">
              {entries.length}개 노트
            </span>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            새 노트
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <KnowledgeTagSidebar
            allTags={allTags}
            selectedTags={selectedTags}
            onChangeSelectedTags={setSelectedTags}
          />

          <KnowledgeEntryList
            entries={entries}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeId={currentEntry?.id ?? null}
            onSelectEntry={handleSelectEntry}
          />

          {currentEntry ? (
            <KnowledgeEntryDetail
              entry={currentEntry}
              relatedEntries={relatedEntries}
              onUpdate={updateEntry}
              onDelete={handleDelete}
              onSelectEntry={handleSelectEntry}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              노트를 선택하세요
            </div>
          )}
        </div>
      </div>

      <KnowledgeCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={createEntry}
      />
    </>
  );
}
