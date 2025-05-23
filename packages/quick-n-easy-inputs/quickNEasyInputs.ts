import type { ColumnType, QuickNEasyORM, DatabaseDeclaration, DbRecord } from "quick-n-easy-orm/quickNEasyOrm";

export type RendererFunc = (
    columnName: string,
    columnType: ColumnType,
    orm: QuickNEasyORM,
    value?: any
) => Promise<string>;


/**
 * A renderer function that returns an HTML input string for a given column.
 */

export class QuickNEasyInputs {
    private declaration: DatabaseDeclaration;
    private orm: QuickNEasyORM;
    private renderers: Record<string, RendererFunc>;
    styles: boolean = true;
    /**
     * Initialize QuickNEasyInputs with a given ORM instance.
     * @param orm The ORM instance to use
     */
    constructor(orm: QuickNEasyORM) {
        this.declaration = orm.declaration;
        this.orm = orm;
        this.renderers = {};
        this.registerDefaultRenderers();
    }

    /**
     * Allow user to override or add custom renderers for specific types.
     */
    public registerRenderers(custom: Record<string, RendererFunc>) {
        Object.assign(this.renderers, custom);
    }

    /**
     * Get the input HTML for a single column by delegating to the appropriate renderer.
     */
    public async getInput(columnName: string, columnType: ColumnType, value?: any): Promise<string> {
        const typeKey = typeof columnType === "object" ? columnType.type : columnType;
        const renderer = this.renderers[typeKey] || this.renderers["default"];
        return await renderer(columnName, columnType, this.orm, value);
    }

    /**
     * Generate an HTML form for a given table using default or custom renderers.
     * @param tableName Name of the table to build the form for
     * @param apiEndpoint The form's action URL
     * @param record Optional record with values to pre-fill the form
     */
    public async generateForm(tableName: string, apiEndpoint: string, record?: Record<string, any>): Promise<string> {
        const tableDecl = this.declaration[tableName];
        if (!tableDecl) throw new Error(`Unknown table: ${tableName}`);

        let formHtml = this.styles ? `
        <style>
  form { max-width: 600px; margin: 1em auto; padding: 1em; border: 1px solid #ccc; border-radius: 4px; }
  label { display: block; margin-top: 0.75em; font-weight: bold; }
  input, textarea, select { width: 100%; padding: 0.5em; margin-top: 0.25em; box-sizing: border-box; }
  button { margin-top: 1em; padding: 0.75em 1.5em; border: none; border-radius: 4px; background: #007bff; color: white; cursor: pointer; }
  button:hover { background: #0056b3; }
  </style>
  `: "";

        formHtml += `<form action="${apiEndpoint}" method="post">
  `;

        for (const [columnName, columnType] of Object.entries(tableDecl)) {
            const value = record ? record[columnName] : undefined;
            const inputHtml = await this.getInput(columnName, columnType, value);
            formHtml += `  <label for="${columnName}">${columnName}</label>\n  ${inputHtml}\n`;
        }

        formHtml += `  <button type="submit">Submit</button>\n</form>`;
        return formHtml;
    }

    /**
     * Registers default renderers for primitive and relation types.
     */
    private registerDefaultRenderers() {
        // text: single-line input
        this.renderers["text"] = async (name, _, __, value) =>
            `\<input type="text" id="${name}" name="${name}" value="${value || ''}" \/>`;

        // long text: textarea
        this.renderers["long text"] = async (name, _, __, value) =>
            `\<textarea id="${name}" name="${name}" rows="4"\>${value || ''}\<\/textarea\>`;

        // image: single-line input (URL or path)
        this.renderers["image"] = async (name, _, __, value) =>
            `\<input type="text" id="${name}" name="${name}" value="${value || ''}" \/>`;

        // json: textarea
        this.renderers["json"] = async (name, _, __, value) => {
            const jsonValue = value ? JSON.stringify(value, null, 2) : '';
            return `\<textarea id="${name}" name="${name}" rows="4"\>${jsonValue}\<\/textarea\>`;
        };

        // date
        this.renderers["date"] = async (name, _, __, value) =>
            `\<input type="date" id="${name}" name="${name}" value="${value || ''}" \/>`;

        // number
        this.renderers["number"] = async (name, _, __, value) =>
            `\<input type="number" id="${name}" name="${name}" value="${value !== undefined ? value : ''}" \/>`;

        // bool
        this.renderers["bool"] = async (name, _, __, value) =>
            `\<input type="checkbox" id="${name}" name="${name}" ${value ? 'checked' : ''} \/>`;

        // one-to-one relationship select
        this.renderers["one-to-one"] = async (name, type, orm, value) => {
            if (typeof type !== "object" || !type.ref) throw new Error("Invalid one-to-one relation type");
            const rows = await orm.list(type.ref);
            const options = rows.map((r: DbRecord) =>
                `\<option value="${r.id}" ${value === r.id ? 'selected' : ''}\>${r.id}\<\/option\>`
            ).join("\n");
            return `\<select id="${name}" name="${name}"\>\n${options}\n\<\/select\>`;
        };

        // one-to-many relationship multiple select
        this.renderers["one-to-many"] = async (name, type, orm, value) => {
            if (typeof type !== "object" || !type.ref) throw new Error("Invalid one-to-many relation type");
            const rows = await orm.list(type.ref);
            const values = Array.isArray(value) ? value : [];
            const options = rows.map((r: DbRecord) =>
                `\<option value="${r.id}" ${values.includes(r.id) ? 'selected' : ''}\>${r.id}\<\/option\>`
            ).join("\n");
            return `\<select id="${name}" name="${name}" multiple\>\n${options}\n\<\/select\>`;
        };

        // fallback
        this.renderers["default"] = async (name, _, __, value) =>
            `\<input type="text" id="${name}" name="${name}" value="${value || ''}" \/>`;
    }
}
