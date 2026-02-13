export const WIP_LIMIT = 3;

export const PRIORITY_LABELS: Record<string, string> = {
  P0: "긴급",
  P1: "중요",
  P2: "일반",
};

export const STATUS_LABELS: Record<string, string> = {
  BACKLOG: "백로그",
  TODAY: "오늘",
  IN_PROGRESS: "진행중",
  DONE: "완료",
};

export const BLOCK_TYPE_LABELS: Record<string, string> = {
  deep: "딥워크",
  shallow: "셸로우",
  break: "휴식",
};

export const KANBAN_COLUMNS = ["BACKLOG", "TODAY", "IN_PROGRESS", "DONE"] as const;

export const KNOWLEDGE_SOURCE_LABELS: Record<string, string> = {
  manual: "직접 작성",
  "ai-chat": "AI 대화",
  import: "가져오기",
};
