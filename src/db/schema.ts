import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", { enum: ["active", "completed", "on_hold"] })
    .notNull()
    .default("active"),
  okrAlignment: text("okr_alignment"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority", { enum: ["P0", "P1", "P2"] })
    .notNull()
    .default("P1"),
  status: text("status", {
    enum: ["BACKLOG", "TODAY", "IN_PROGRESS", "DONE"],
  })
    .notNull()
    .default("BACKLOG"),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  contextTags: text("context_tags", { mode: "json" })
    .notNull()
    .$type<string[]>()
    .default([]),
  dueDate: text("due_date"),
  timeEstimateMinutes: integer("time_estimate_minutes"),
  blockType: text("block_type", { enum: ["deep", "shallow"] }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
}, (t) => [
  index("idx_tasks_status").on(t.status),
  index("idx_tasks_due_date").on(t.dueDate),
  index("idx_tasks_project_id").on(t.projectId),
]);

export const inboxItems = sqliteTable("inbox_items", {
  id: text("id").primaryKey(),
  rawInput: text("raw_input").notNull(),
  processed: integer("processed", { mode: "boolean" }).notNull().default(false),
  classificationResult: text("classification_result", { mode: "json" }),
  taskId: text("task_id").references(() => tasks.id, { onDelete: "set null" }),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
}, (t) => [
  index("idx_inbox_processed_created").on(t.processed, t.createdAt),
]);

export const timeBlocks = sqliteTable("time_blocks", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  taskId: text("task_id").references(() => tasks.id, { onDelete: "set null" }),
  blockType: text("block_type", { enum: ["deep", "shallow", "break"] })
    .notNull()
    .default("deep"),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
}, (t) => [
  index("idx_timeblocks_date_start").on(t.date, t.startTime),
]);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const knowledgeEntries = sqliteTable("knowledge_entries", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags", { mode: "json" })
    .notNull()
    .$type<string[]>()
    .default([]),
  source: text("source", { enum: ["manual", "ai-chat", "import"] })
    .notNull()
    .default("manual"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
}, (t) => [
  index("idx_knowledge_updated").on(t.updatedAt),
  index("idx_knowledge_source").on(t.source),
]);

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  metadata: text("metadata", { mode: "json" }),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
}, (t) => [
  index("idx_chat_created").on(t.createdAt),
]);
