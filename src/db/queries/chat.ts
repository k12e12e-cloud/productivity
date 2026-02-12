import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { ChatRole } from "@/types";

export function getChatMessages(limit: number = 50) {
  return db
    .select()
    .from(schema.chatMessages)
    .orderBy(desc(schema.chatMessages.createdAt))
    .limit(limit)
    .all()
    .reverse();
}

export function createChatMessage(data: {
  role: ChatRole;
  content: string;
  metadata?: Record<string, unknown>;
}) {
  const id = nanoid();
  return db
    .insert(schema.chatMessages)
    .values({
      id,
      role: data.role,
      content: data.content,
      metadata: data.metadata ?? null,
    })
    .returning()
    .get();
}
