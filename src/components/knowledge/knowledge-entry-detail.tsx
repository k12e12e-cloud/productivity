"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KNOWLEDGE_SOURCE_LABELS } from "@/lib/constants";
import { Pencil, Trash2, Save, X, Loader2, Plus, Link as LinkIcon } from "lucide-react";
import type { KnowledgeEntry } from "@/types";

interface KnowledgeEntryDetailProps {
  entry: KnowledgeEntry;
  relatedEntries: KnowledgeEntry[];
  onUpdate: (id: string, data: Partial<{ title: string; content: string; tags: string[] }>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSelectEntry: (entry: KnowledgeEntry) => void;
}

export function KnowledgeEntryDetail({
  entry,
  relatedEntries,
  onUpdate,
  onDelete,
  onSelectEntry,
}: KnowledgeEntryDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [tagsInput, setTagsInput] = useState(entry.tags.join(", "));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsEditing(false);
    setTitle(entry.title);
    setContent(entry.content);
    setTagsInput(entry.tags.join(", "));
  }, [entry]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await onUpdate(entry.id, { title: title.trim(), content, tags });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("이 지식 노트를 삭제하시겠습니까?")) return;
    setIsDeleting(true);
    try {
      await onDelete(entry.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="border-b border-border p-3 flex items-center justify-between gap-2">
        {isEditing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm font-medium"
            placeholder="제목"
          />
        ) : (
          <h2 className="text-sm font-semibold truncate">{entry.title}</h2>
        )}

        <div className="flex items-center gap-1 shrink-0">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setTitle(entry.title);
                  setContent(entry.content);
                  setTagsInput(entry.tags.join(", "));
                }}
                disabled={isSaving}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isEditing ? (
            <>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용 (마크다운 지원)"
                rows={12}
                className="text-sm font-mono"
              />
              <div>
                <label className="text-xs text-muted-foreground">
                  태그 (쉼표 구분)
                </label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="태그1, 태그2, 태그3"
                  className="mt-1"
                />
              </div>
            </>
          ) : (
            <>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                {entry.content}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground mr-1">
                  {KNOWLEDGE_SOURCE_LABELS[entry.source] ?? entry.source}
                </span>
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>생성: {new Date(entry.createdAt).toLocaleString("ko-KR")}</p>
                <p>수정: {new Date(entry.updatedAt).toLocaleString("ko-KR")}</p>
              </div>

              {relatedEntries.length > 0 && (
                <div className="pt-2 border-t border-border space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <LinkIcon className="h-3 w-3" />
                    관련 노트
                  </div>
                  {relatedEntries.map((related) => (
                    <button
                      key={related.id}
                      onClick={() => onSelectEntry(related)}
                      className="w-full text-left rounded-md px-2 py-1.5 text-sm hover:bg-accent/50 transition-colors"
                    >
                      {related.title}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
