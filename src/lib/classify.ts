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

    const validStatuses = ["BACKLOG", "TODAY", "IN_PROGRESS", "DONE"];
    return {
      title: classification.title,
      priority: classification.priority,
      status: validStatuses.includes(classification.status) ? classification.status : undefined,
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
