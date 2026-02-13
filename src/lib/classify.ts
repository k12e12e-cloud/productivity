import type { ClassificationResult, TaskUpdateAction, KnowledgeAction } from "@/types";

function parseJsonBlock(text: string): Record<string, unknown> | null {
  const startIdx = text.indexOf("```json");
  if (startIdx === -1) return null;

  const lineStart = text.indexOf("\n", startIdx);
  if (lineStart === -1) return null;

  // Find the opening { after ```json
  const braceStart = text.indexOf("{", lineStart);
  if (braceStart === -1) return null;

  // Use brace-counting to find the matching closing }, ignoring nested code blocks in strings
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = braceStart; i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === "\\") {
      if (inString) escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const candidate = text.slice(braceStart, i + 1);
        try {
          return JSON.parse(candidate);
        } catch {
          return null;
        }
      }
    }
  }

  return null;
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

export function extractKnowledgeActions(text: string): KnowledgeAction[] {
  const parsed = parseJsonBlock(text);
  if (!parsed) return [];

  const actions = parsed.knowledgeActions;
  if (!Array.isArray(actions)) return [];

  return actions
    .filter((a: unknown) => {
      const item = a as Record<string, unknown>;
      if (!item) return false;
      if (item.action === "create") {
        return typeof item.title === "string" && typeof item.content === "string";
      }
      if (item.action === "update") {
        return typeof item.id === "string" && (typeof item.title === "string" || typeof item.content === "string");
      }
      return false;
    })
    .map((a: unknown) => {
      const item = a as Record<string, unknown>;
      return {
        action: item.action as "create" | "update",
        id: typeof item.id === "string" ? item.id : undefined,
        title: (item.title as string) ?? "",
        content: (item.content as string) ?? "",
        tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
      };
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
  const parsed = parseJsonBlock(text);
  if (!parsed) return null;
  return (parsed.timeBlocks as ReturnType<typeof extractSchedule>) ?? null;
}
