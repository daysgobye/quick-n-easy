import { Database } from "bun:sqlite";
import type { GenericDB } from "../quickNEasyOrm";

export function createBunSqliteDB(...args: any[]): GenericDB {
    const db = new Database(...args);
    return {
        query: (sql: string, ...params: any[]) => {
            const stmt = db.query(sql);
            return {
                all: async () => stmt.all(...params),  // Returns all rows for a SELECT query
                get: (id: string) => stmt.get(id),    // Returns a single row
                run: (...params: any[]) => stmt.run(...params), // Executes the query without returning data (e.g., for INSERT)
            };
        },

        close: () => db.close()
    };
}