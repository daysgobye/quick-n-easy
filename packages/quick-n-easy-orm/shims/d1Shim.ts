import type { GenericDB } from "../quickNEasyOrm";

export function createD1DB(d1db: any): GenericDB {
    return {
        query: (sql: string, ...params: any[]) => {
            return {
                all: async () => {
                    const result = await d1db.prepare(sql).bind(...params).all();
                    return result.results;
                },
                get: (id: string) => {
                    return d1db.prepare(sql).bind(id).first();
                },
                run: (...params: any[]) => {
                    return d1db.prepare(sql).bind(...params).run();
                },
            };
        },

        close: () => {
        }
    };
}