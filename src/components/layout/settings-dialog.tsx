"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Eye, EyeOff } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/settings")
        .then((r) => r.json())
        .then((data) => {
          setMaskedKey(data.openrouterApiKey);
          setHasKey(data.hasKey);
        })
        .catch(() => {});
      setNewKey("");
      setSaved(false);
    }
  }, [open]);

  async function handleSave() {
    if (!newKey.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openrouterApiKey: newKey.trim() }),
      });
      if (res.ok) {
        setSaved(true);
        setHasKey(true);
        const masked =
          newKey.trim().length > 8
            ? "••••••••" + newKey.trim().slice(-4)
            : "••••••••";
        setMaskedKey(masked);
        setNewKey("");
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>API 키 및 앱 설정을 관리합니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">OpenRouter API Key</label>
            {hasKey && maskedKey && (
              <p className="text-xs text-muted-foreground">
                현재 키: <span className="font-mono">{maskedKey}</span>
              </p>
            )}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder={hasKey ? "새 키로 변경..." : "sk-or-v1-..."}
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="pr-9 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!newKey.trim() || saving}
                className="shrink-0"
              >
                {saved ? (
                  <Check className="h-4 w-4" />
                ) : saving ? (
                  "..."
                ) : (
                  "Save"
                )}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground/60">
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-muted-foreground"
              >
                openrouter.ai/keys
              </a>
              에서 API 키를 발급받을 수 있습니다.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
