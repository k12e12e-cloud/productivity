import type { ClassificationResult } from "@/types";

export function extractClassification(
  text: string
): ClassificationResult | null {
  // Try to find JSON block in the response
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[1].trim());
    const classification = parsed.classification;
    if (!classification) return null;

    return {
      title: classification.title,
      priority: classification.priority,
      contextTags: classification.contextTags ?? [],
      timeEstimateMinutes: classification.timeEstimateMinutes ?? 60,
      blockType: classification.blockType ?? "deep",
      projectSuggestion: classification.projectSuggestion,
      reasoning: classification.reasoning ?? "",
    };
  } catch {
    return null;
  }
}

export function extractSchedule(
  text: string
): Array<{
  startTime: string;
  endTime: string;
  taskId: string | null;
  blockType: "deep" | "shallow" | "break";
  label: string;
}> | null {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[1].trim());
    return parsed.timeBlocks ?? null;
  } catch {
    return null;
  }
}
