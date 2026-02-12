import { db, schema } from "@/db";
import { eq, and, asc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { BlockType } from "@/types";

export function getTimeBlocksByDate(date: string) {
  return db
    .select()
    .from(schema.timeBlocks)
    .where(eq(schema.timeBlocks.date, date))
    .orderBy(asc(schema.timeBlocks.startTime))
    .all();
}

export function createTimeBlock(data: {
  date: string;
  startTime: string;
  endTime: string;
  taskId?: string;
  blockType?: BlockType;
  label: string;
}) {
  const id = nanoid();
  const maxOrder = db
    .select({ max: sql<number>`COALESCE(MAX(sort_order), 0)` })
    .from(schema.timeBlocks)
    .where(eq(schema.timeBlocks.date, data.date))
    .get();

  return db
    .insert(schema.timeBlocks)
    .values({
      id,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      taskId: data.taskId ?? null,
      blockType: data.blockType ?? "deep",
      label: data.label,
      sortOrder: (maxOrder?.max ?? 0) + 1,
    })
    .returning()
    .get();
}

export function updateTimeBlock(
  id: string,
  data: Partial<{
    startTime: string;
    endTime: string;
    taskId: string | null;
    blockType: BlockType;
    label: string;
    sortOrder: number;
  }>
) {
  return db
    .update(schema.timeBlocks)
    .set(data)
    .where(eq(schema.timeBlocks.id, id))
    .returning()
    .get();
}

export function deleteTimeBlock(id: string) {
  return db.delete(schema.timeBlocks).where(eq(schema.timeBlocks.id, id)).run();
}

export function deleteTimeBlocksByDate(date: string) {
  return db
    .delete(schema.timeBlocks)
    .where(eq(schema.timeBlocks.date, date))
    .run();
}
