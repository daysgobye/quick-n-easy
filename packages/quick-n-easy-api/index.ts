import { Context, Hono } from "hono";
import type { DatabaseDeclaration, QuickNEasyORM } from "quick-n-easy-orm/quickNEasyOrm";
import { makeDocsRoute, makeAdminRoute } from "./view";

export class QuickNEasyAPI {
    app: Hono;
    declaration: DatabaseDeclaration
    tableNames: string[];
    userName: string = "admin";
    password: string | undefined;
    getDb: (c: Context) => QuickNEasyORM
    constructor(app: Hono, declaration: DatabaseDeclaration, getDb: (c: Context) => QuickNEasyORM, password?: string, userName?: string) {
        this.app = app;
        this.declaration = declaration;
        this.tableNames = Object.keys(declaration);
        this.getDb = getDb
        this.registerApiRoutes();
        if (password) {
            this.password = password;
        }
        if (userName) {
            this.userName = userName;
        }

    }

    registerApiRoutes() {
        makeDocsRoute(this)
        makeAdminRoute(this)
        for (const tableName of this.tableNames) {
            // List all records
            this.app.get(`/api/${tableName}`, async (c) => {
                const orm = this.getDb(c)

                try {
                    const records = await orm.list(tableName);
                    return c.json(records);
                } catch (e) {
                    //@ts-ignore
                    return c.json({ error: e.message }, 500);
                }
            });
            // Create a record
            this.app.post(`/api/${tableName}`, async (c) => {
                const orm = this.getDb(c)


                try {
                    let data: Record<string, any>;
                    const contentType = c.req.header('content-type') || '';

                    if (contentType.includes('application/json')) {
                        data = await c.req.json();
                    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
                        const formData = await c.req.formData();
                        data = {};
                        for (const [key, value] of formData.entries()) {
                            data[key] = value;
                        }
                    } else {
                        // Default to JSON if content type is not specified
                        data = await c.req.json();
                    }

                    const record = await orm.insert(tableName, data);
                    return c.json(record, 201);
                } catch (e) {
                    //@ts-ignore
                    return c.json({ error: e.message }, 400);
                }
            });
            // Get a single record
            this.app.get(`/api/${tableName}/:id`, async (c) => {
                const orm = this.getDb(c)


                try {
                    const id = c.req.param("id");
                    const record = await orm.get(id);
                    return c.json(record);
                } catch (e) {
                    //@ts-ignore
                    return c.json({ error: e.message }, 404);
                }
            });
            // Delete a record
            this.app.delete(`/api/${tableName}/:id`, async (c) => {
                const orm = this.getDb(c)


                try {
                    const id = c.req.param("id");
                    await orm.delete(id);
                    return c.json({ success: true });
                } catch (e) {
                    //@ts-ignore
                    return c.json({ error: e.message }, 404);
                }
            });
            // Update a record
            this.app.put(`/api/${tableName}/:id`, async (c) => {
                const orm = this.getDb(c)


                try {
                    const id = c.req.param("id");
                    let data: Record<string, any>;
                    const contentType = c.req.header('content-type') || '';

                    if (contentType.includes('application/json')) {
                        data = await c.req.json();
                    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
                        const formData = await c.req.formData();
                        data = {};
                        for (const [key, value] of formData.entries()) {
                            data[key] = value;
                        }
                    } else {
                        // Default to JSON if content type is not specified
                        data = await c.req.json();
                    }

                    const record = await orm.update({ ...data, id });
                    return c.json(record);
                } catch (e) {
                    //@ts-ignore
                    return c.json({ error: e.message }, 400);
                }
            });
        }
    }
}
