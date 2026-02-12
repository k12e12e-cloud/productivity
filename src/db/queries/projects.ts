import { db, schema } from "@/db";
import { eq, asc } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { ProjectStatus } from "@/types";

export function getAllProjects() {
  return db.select().from(schema.projects).orderBy(asc(schema.projects.name)).all();
}

export function getProjectById(id: string) {
  return db.select().from(schema.projects).where(eq(schema.projects.id, id)).get();
}

export function createProject(data: {
  name: string;
  description?: string;
  status?: ProjectStatus;
  okrAlignment?: string;
}) {
  const id = nanoid();
  return db
    .insert(schema.projects)
    .values({
      id,
      name: data.name,
      description: data.description ?? null,
      status: data.status ?? "active",
      okrAlignment: data.okrAlignment ?? null,
    })
    .returning()
    .get();
}

export function updateProject(
  id: string,
  data: Partial<{
    name: string;
    description: string | null;
    status: ProjectStatus;
    okrAlignment: string | null;
  }>
) {
  return db
    .update(schema.projects)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(schema.projects.id, id))
    .returning()
    .get();
}

export function deleteProject(id: string) {
  return db.delete(schema.projects).where(eq(schema.projects.id, id)).run();
}
