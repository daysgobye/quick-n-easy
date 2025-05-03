import { Hono } from "hono";
import type { DatabaseDeclaration, QuickNEasyORM } from "quick-n-easy-orm/quickNEasyOrm";
import { makeDocsRoute, makeAdminRoute } from "./view";



export class QuickNEasyAPI {

    orm: QuickNEasyORM;
    app: Hono;
    declaration: DatabaseDeclaration
    tableNames: string[];
    constructor(app: Hono, orm: QuickNEasyORM) {
        this.orm = orm;
        this.app = app;
        this.declaration = orm.declaration;
        this.tableNames = Object.keys(orm.declaration);
        this.registerApiRoutes();
    }

    registerApiRoutes() {
        makeDocsRoute(this)
        makeAdminRoute(this)
        for (const tableName of this.tableNames) {
            // List all records
            this.app.get(`/api/${tableName}`, async (c) => {
                try {
                    const records = await this.orm.list(tableName);
                    return c.json(records);
                } catch (e) {
                    //@ts-ignore
                    return c.json({ error: e.message }, 500);
                }
            });
            // Create a record
            this.app.post(`/api/${tableName}`, async (c) => {
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

                    const record = await this.orm.insert(tableName, data);
                    return c.json(record, 201);
                } catch (e) {
                    //@ts-ignore
                    return c.json({ error: e.message }, 400);
                }
            });
            // Get a single record
            this.app.get(`/api/${tableName}/:id`, async (c) => {
                try {
                    const id = c.req.param("id");
                    const record = await this.orm.get(id);
                    return c.json(record);
                } catch (e) {
                    //@ts-ignore
                    return c.json({ error: e.message }, 404);
                }
            });
            // Delete a record
            this.app.delete(`/api/${tableName}/:id`, async (c) => {
                try {
                    const id = c.req.param("id");
                    await this.orm.delete(id);
                    return c.json({ success: true });
                } catch (e) {
                    //@ts-ignore
                    return c.json({ error: e.message }, 404);
                }
            });
            // Update a record
            this.app.put(`/api/${tableName}/:id`, async (c) => {
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

                    const record = await this.orm.update({ ...data, id });
                    return c.json(record);
                } catch (e) {
                    //@ts-ignore
                    return c.json({ error: e.message }, 400);
                }
            });
        }
    }
}
