import type { GenericDB } from "../simpleOrm";
import Database from 'better-sqlite3';


export function createBetterSqlite3DB(dbFilePath: string): GenericDB {
    const db = new Database(dbFilePath);

    return {
        //@ts-ignore
        query: (sql: string, ...params: any[]) => {
            // Check if the SQL starts with "PRAGMA"
            if (sql.startsWith("PRAGMA")) {
                // Handle PRAGMA statements differently
                return {
                    all: async () => db.pragma(sql),  // PRAGMA queries
                    get: (id: string) => db.pragma(sql), // No specific `get` method for PRAGMA, so we return the same result
                    run: (...params: any[]) => {
                        // PRAGMA statements usually don't require a run for parameters
                        return db.pragma(sql);
                    },
                };
            } else {
                // Regular queries (non-PRAGMA)
                const stmt = db.prepare(sql);
                return {
                    all: async () => stmt.all(...params),  // Returns all rows for SELECT queries
                    get: (id: string) => stmt.get(id),    // Returns a single row
                    run: (...params: any[]) => stmt.run(...params), // Executes the query without returning data (e.g., INSERT)
                };
            }
        },
        close: () => {
            db.close();  // Closes the database connection
        }
    };
}
