import { db, schema } from "@/db";
import { eq, desc, sql, like, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { KnowledgeSource } from "@/types";

export function getAllKnowledge() {
  return db
    .select()
    .from(schema.knowledgeEntries)
    .orderBy(desc(schema.knowledgeEntries.updatedAt))
    .all();
}

export function getKnowledgeById(id: string) {
  return db
    .select()
    .from(schema.knowledgeEntries)
    .where(eq(schema.knowledgeEntries.id, id))
    .get();
}

export function searchKnowledge(query?: string, tags?: string[]) {
  let results = db
    .select()
    .from(schema.knowledgeEntries)
    .orderBy(desc(schema.knowledgeEntries.updatedAt));

  if (query && query.trim()) {
    const q = `%${query.trim()}%`;
    results = results.where(
      or(
        like(schema.knowledgeEntries.title, q),
        like(schema.knowledgeEntries.content, q)
      )
    ) as typeof results;
  }

  const all = results.all();

  if (tags && tags.length > 0) {
    return all.filter((entry) => {
      const entryTags = entry.tags as string[];
      return tags.some((tag) => entryTags.includes(tag));
    });
  }

  return all;
}

export function createKnowledge(data: {
  title: string;
  content: string;
  tags?: string[];
  source?: KnowledgeSource;
}) {
  const id = nanoid();
  return db
    .insert(schema.knowledgeEntries)
    .values({
      id,
      title: data.title,
      content: data.content,
      tags: data.tags ?? [],
      source: data.source ?? "manual",
    })
    .returning()
    .get();
}

export function updateKnowledge(
  id: string,
  data: Partial<{
    title: string;
    content: string;
    tags: string[];
    source: KnowledgeSource;
  }>
) {
  return db
    .update(schema.knowledgeEntries)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(schema.knowledgeEntries.id, id))
    .returning()
    .get();
}

export function deleteKnowledge(id: string) {
  return db
    .delete(schema.knowledgeEntries)
    .where(eq(schema.knowledgeEntries.id, id))
    .run();
}

export function getRecentKnowledge(limit: number = 10) {
  return db
    .select()
    .from(schema.knowledgeEntries)
    .orderBy(desc(schema.knowledgeEntries.updatedAt))
    .limit(limit)
    .all();
}

export function getAllKnowledgeTags(): string[] {
  const entries = db
    .select({ tags: schema.knowledgeEntries.tags })
    .from(schema.knowledgeEntries)
    .all();

  const tagSet = new Set<string>();
  for (const entry of entries) {
    const tags = entry.tags as string[];
    for (const tag of tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

export function countKnowledgeEntries() {
  const result = db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.knowledgeEntries)
    .get();
  return result?.count ?? 0;
}
