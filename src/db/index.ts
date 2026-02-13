import { drizzle } from "drizzle-orm/better-sqlite3";
import { getDb, schema } from "./connection";

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export { schema };
