"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useTimeBlocks } from "@/hooks/use-time-blocks";

export function GenerateButton() {
  const today = new Date().toISOString().split("T")[0];
  const { mutate } = useTimeBlocks(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isGeneratingRef = useRef(false);

  const handleGenerate = async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/schedule/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "생성 실패");
        return;
      }

      mutate();
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
      isGeneratingRef.current = false;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-400">{error}</span>}
      <Button onClick={handleGenerate} disabled={loading} size="sm">
        {loading ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-1 h-4 w-4" />
        )}
        Auto-generate
      </Button>
    </div>
  );
}
