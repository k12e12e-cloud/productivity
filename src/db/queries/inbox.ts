import { db, schema } from "@/db";
import { eq, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export function getAllInboxItems() {
  return db
    .select()
    .from(schema.inboxItems)
    .orderBy(desc(schema.inboxItems.createdAt))
    .all();
}

export function getUnprocessedInboxItems() {
  return db
    .select()
    .from(schema.inboxItems)
    .where(eq(schema.inboxItems.processed, false))
    .orderBy(desc(schema.inboxItems.createdAt))
    .all();
}

export function getProcessedInboxItems() {
  return db
    .select()
    .from(schema.inboxItems)
    .where(eq(schema.inboxItems.processed, true))
    .orderBy(desc(schema.inboxItems.createdAt))
    .all();
}

export function createInboxItem(rawInput: string) {
  const id = nanoid();
  return db
    .insert(schema.inboxItems)
    .values({ id, rawInput })
    .returning()
    .get();
}

export function updateInboxItem(
  id: string,
  data: Partial<{
    processed: boolean;
    classificationResult: unknown;
    taskId: string | null;
  }>
) {
  return db
    .update(schema.inboxItems)
    .set(data)
    .where(eq(schema.inboxItems.id, id))
    .returning()
    .get();
}

export function countUnprocessedInbox() {
  const result = db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.inboxItems)
    .where(eq(schema.inboxItems.processed, false))
    .get();
  return result?.count ?? 0;
}
