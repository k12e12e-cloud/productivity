import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export function getSetting(key: string): string | null {
  const row = db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, key))
    .get();
  return row?.value ?? null;
}

export function setSetting(key: string, value: string) {
  const existing = getSetting(key);
  if (existing !== null) {
    db.update(schema.settings)
      .set({ value, updatedAt: new Date().toISOString() })
      .where(eq(schema.settings.key, key))
      .run();
  } else {
    db.insert(schema.settings)
      .values({ key, value, updatedAt: new Date().toISOString() })
      .run();
  }
}
