"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface KnowledgeCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { title: string; content: string; tags?: string[] }) => Promise<unknown>;
}

export function KnowledgeCreateDialog({
  open,
  onOpenChange,
  onCreate,
}: KnowledgeCreateDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("제목을 입력하세요");
      return;
    }
    if (!content.trim()) {
      setError("내용을 입력하세요");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await onCreate({ title: title.trim(), content: content.trim(), tags });
      setTitle("");
      setContent("");
      setTagsInput("");
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "생성 실패");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 지식 노트</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목 (핵심 아이디어)"
            maxLength={200}
          />

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용 (마크다운 지원)"
            rows={6}
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

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  생성중...
                </>
              ) : (
                "생성"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
