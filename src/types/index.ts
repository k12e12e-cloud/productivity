export type Priority = "P0" | "P1" | "P2";
export type TaskStatus = "BACKLOG" | "TODAY" | "IN_PROGRESS" | "DONE";
export type BlockType = "deep" | "shallow" | "break";
export type ProjectStatus = "active" | "completed" | "on_hold";
export type ChatRole = "user" | "assistant";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  okrAlignment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  projectId: string | null;
  contextTags: string[];
  dueDate: string | null;
  timeEstimateMinutes: number | null;
  blockType: "deep" | "shallow" | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface InboxItem {
  id: string;
  rawInput: string;
  processed: boolean;
  classificationResult: ClassificationResult | null;
  taskId: string | null;
  createdAt: string;
}

export interface ClassificationResult {
  title: string;
  priority: Priority;
  contextTags: string[];
  timeEstimateMinutes: number;
  blockType: "deep" | "shallow";
  projectSuggestion?: string;
  reasoning: string;
}

export interface TimeBlock {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  taskId: string | null;
  blockType: BlockType;
  label: string;
  sortOrder: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
