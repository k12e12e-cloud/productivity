import type { ClassificationResult, TaskUpdateAction } from "@/types";

function parseJsonBlock(text: string): Record<string, unknown> | null {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[1].trim());
  } catch {
    return null;
  }
}

export function extractClassification(
  text: string
): ClassificationResult | null {
  const parsed = parseJsonBlock(text);
  if (!parsed) return null;

  const classification = parsed.classification as Record<string, unknown> | undefined;
  if (!classification) return null;

  const validStatuses = ["BACKLOG", "TODAY", "IN_PROGRESS", "DONE"];
  return {
    title: classification.title as string,
    priority: classification.priority as ClassificationResult["priority"],
    status: validStatuses.includes(classification.status as string)
      ? (classification.status as ClassificationResult["status"])
      : undefined,
    contextTags: (classification.contextTags as string[]) ?? [],
    timeEstimateMinutes: (classification.timeEstimateMinutes as number) ?? 60,
    blockType: (classification.blockType as ClassificationResult["blockType"]) ?? "deep",
    projectSuggestion: classification.projectSuggestion as string | undefined,
    reasoning: (classification.reasoning as string) ?? "",
  };
}

export function extractTaskUpdates(text: string): TaskUpdateAction[] {
  const parsed = parseJsonBlock(text);
  if (!parsed) return [];

  const updates = parsed.taskUpdates;
  if (!Array.isArray(updates)) return [];

  const validStatuses = ["BACKLOG", "TODAY", "IN_PROGRESS", "DONE"];
  const validPriorities = ["P0", "P1", "P2"];

  return updates
    .filter((u: unknown) => {
      const item = u as Record<string, unknown>;
      return item && typeof item.taskId === "string";
    })
    .map((u: unknown) => {
      const item = u as Record<string, unknown>;
      const action: TaskUpdateAction = { taskId: item.taskId as string };
      if (typeof item.title === "string") action.title = item.title;
      if (validPriorities.includes(item.priority as string))
        action.priority = item.priority as TaskUpdateAction["priority"];
      if (validStatuses.includes(item.status as string))
        action.status = item.status as TaskUpdateAction["status"];
      if (typeof item.projectSuggestion === "string")
        action.projectSuggestion = item.projectSuggestion;
      if (typeof item.dueDate === "string") action.dueDate = item.dueDate;
      if (Array.isArray(item.contextTags))
        action.contextTags = item.contextTags as string[];
      return action;
    });
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
