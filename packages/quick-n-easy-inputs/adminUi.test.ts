import { describe, expect, test } from "bun:test";
import { QuickNEasyInputs } from "./quickNEasyInputs";

import { QuickNEasyORM, type DatabaseDeclaration } from "quick-n-easy-orm/quickNEasyOrm";
import { createDB } from "quick-n-easy-orm/shims/bunSqliteShim";

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

const orm = new QuickNEasyORM(createDB(":memory:"), dbDeclaration);
const adminUI = new QuickNEasyInputs(orm);

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
        expect(formHtml).toContain(' name="email"');
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

    test("should render inputs with values", async () => {
        const inputHtml = await adminUI.getInput("title", "text", "Sample Title");
        expect(inputHtml).toContain('value="Sample Title"');
    });

    test("should render checkbox as checked when value is true", async () => {
        const inputHtml = await adminUI.getInput("published", "bool", true);
        expect(inputHtml).toContain('checked');
    });

    test("should render checkbox as unchecked when value is false", async () => {
        const inputHtml = await adminUI.getInput("published", "bool", false);
        expect(inputHtml).not.toContain('checked');
    });

    test("should generate form with pre-filled values", async () => {
        const record = {
            email: "test@example.com",
            password: "password123"
        };

        const formHtml = await adminUI.generateForm("user", "/api/users", record);

        expect(formHtml).toContain('value="test@example.com"');
        expect(formHtml).toContain('value="password123"');
    });

    test("should handle JSON values correctly", async () => {
        const jsonValue = { key: "value", nested: { data: true } };
        const inputHtml = await adminUI.getInput("metadata", "json", jsonValue);

        expect(inputHtml).toContain(JSON.stringify(jsonValue, null, 2));
    });

    test("should handle one-to-one relationship with selected value", async () => {
        // Mock the orm.list method for this test
        const originalList = orm.list;
        //@ts-ignore
        orm.list = async () => [{ id: 1 }, { id: 2 }, { id: 3 }];

        try {
            const inputHtml = await adminUI.getInput("author", { type: "one-to-one", ref: "user" }, 2);
            expect(inputHtml).toContain('value="2" selected');
            expect(inputHtml).not.toContain('value="1" selected');
        } finally {
            // Restore original method
            orm.list = originalList;
        }
    });

    test("should handle one-to-many relationship with multiple selected values", async () => {
        // Mock the orm.list method for this test
        const originalList = orm.list;
        //@ts-ignore
        orm.list = async () => [{ id: 1 }, { id: 2 }, { id: 3 }];

        try {
            const inputHtml = await adminUI.getInput("posts", { type: "one-to-many", ref: "post" }, [1, 3]);
            expect(inputHtml).toContain('value="1" selected');
            expect(inputHtml).not.toContain('value="2" selected');
            expect(inputHtml).toContain('value="3" selected');
        } finally {
            // Restore original method
            orm.list = originalList;
        }
    });
});