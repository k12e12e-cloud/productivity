import { db, schema } from "@/db";
import { eq, and, asc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { Priority, TaskStatus } from "@/types";

export function getAllTasks() {
  return db.select().from(schema.tasks).orderBy(asc(schema.tasks.sortOrder)).all();
}

export function getTasksByStatus(status: TaskStatus) {
  return db
    .select()
    .from(schema.tasks)
    .where(eq(schema.tasks.status, status))
    .orderBy(asc(schema.tasks.sortOrder))
    .all();
}

export function getTaskById(id: string) {
  return db.select().from(schema.tasks).where(eq(schema.tasks.id, id)).get();
}

export function createTask(data: {
  title: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  projectId?: string;
  contextTags?: string[];
  dueDate?: string;
  timeEstimateMinutes?: number;
  blockType?: "deep" | "shallow";
}) {
  const id = nanoid();
  const maxOrder = db
    .select({ max: sql<number>`COALESCE(MAX(sort_order), 0)` })
    .from(schema.tasks)
    .where(eq(schema.tasks.status, data.status ?? "BACKLOG"))
    .get();

  return db
    .insert(schema.tasks)
    .values({
      id,
      title: data.title,
      description: data.description ?? null,
      priority: data.priority ?? "P1",
      status: data.status ?? "BACKLOG",
      projectId: data.projectId ?? null,
      contextTags: data.contextTags ?? [],
      dueDate: data.dueDate ?? null,
      timeEstimateMinutes: data.timeEstimateMinutes ?? null,
      blockType: data.blockType ?? null,
      sortOrder: (maxOrder?.max ?? 0) + 1,
    })
    .returning()
    .get();
}

export function updateTask(
  id: string,
  data: Partial<{
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
  }>
) {
  return db
    .update(schema.tasks)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(schema.tasks.id, id))
    .returning()
    .get();
}

export function deleteTask(id: string) {
  return db.delete(schema.tasks).where(eq(schema.tasks.id, id)).run();
}

export function countTasksByStatus(status: TaskStatus) {
  const result = db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.tasks)
    .where(eq(schema.tasks.status, status))
    .get();
  return result?.count ?? 0;
}

export function getTasksDueSoon(days: number = 7) {
  const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const futureDate = future.toISOString().split("T")[0]; // "YYYY-MM-DD"
  return db
    .select()
    .from(schema.tasks)
    .where(
      and(
        sql`${schema.tasks.dueDate} IS NOT NULL`,
        sql`${schema.tasks.dueDate} <= ${futureDate}`,
        sql`${schema.tasks.status} != 'DONE'`
      )
    )
    .orderBy(asc(schema.tasks.dueDate))
    .all();
}
