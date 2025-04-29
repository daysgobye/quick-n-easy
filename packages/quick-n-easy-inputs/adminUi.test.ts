import { describe, expect, test } from "bun:test";
import { AdminUI } from "./adminUi";

import { SimpleORM, type DatabaseDeclaration } from "quick-n-easy-orm/quickNEasyOrm";
import { createBunSqliteDB } from "quick-n-easy-orm/shims/bunSqliteShim";

const dbDeclaration: DatabaseDeclaration = {
    post: {
        title: "text",
        body: "long text",
        author: { type: "one-to-one", ref: "user" },
        image: "image",
    },
    user: {
        email: "text",
        password: "text",
        posts: { type: "one-to-many", ref: "post" },
    }
};

const orm = new SimpleORM(createBunSqliteDB(":memory:"), dbDeclaration);
const adminUI = new AdminUI(dbDeclaration, orm);

describe("AdminUI", () => {
    test("should register custom renderers", async () => {
        const customRenderer = async (name: string) => `<input type='text' id='${name}' name='${name}' />`;
        adminUI.registerRenderers({ "image": customRenderer });

        const inputHtml = await adminUI.getInput("test", "image");
        expect(inputHtml).toContain("<input type='text' id='test' name='test' />");
    });

    test("should generate form HTML", async () => {
        const formHtml = await adminUI.generateForm("user", "/api/users");
        expect(formHtml).toContain("post");
        expect(formHtml).toContain("/api/users");

        expect(formHtml).toContain('<label for="email">email</label>');
        expect(formHtml).toContain('<input type="text" id="email" name="email" />');
    });

    test("should handle unknown table names", async () => {
        try {
            await adminUI.generateForm("unknown", "/api/unknown");
            expect(true).toBe(false); // Should not reach here
        } catch (error) {
            //@ts-ignore
            expect(error.message).toContain("Unknown table");
        }
    });

});