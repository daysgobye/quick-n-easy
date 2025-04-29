
export type ColumnType = "text" | "long text" | "image" | "date" | "json" | "number" | "bool" | { type: "one-to-one" | "one-to-many", ref: string };
export type TableDeclaration = { [key: string]: ColumnType };
export type DatabaseDeclaration = Record<string, TableDeclaration>;

export type RawDbRecord = {
    id: string;
    metadata: string;
    createdAt: number;
    updatedAt: number;
    [key: string]: string | RawDbRecord[] | RawDbRecord | number | boolean;
};

export type DbRecord = {
    id: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: string | DbRecord[] | DbRecord | number | boolean | Date | Record<string, any>;
};

export type GenericDB = {
    query: (sql: string, ...params: any[]) => { all: () => Promise<any[]>; get: (id: string) => any; run: (...params: any[]) => void };
    close: () => void;
};


function randomUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function parseRawRecord(raw: RawDbRecord, tableDecl: TableDeclaration): DbRecord {
    const { id, metadata, createdAt, updatedAt, ...rest } = raw;
    let parsedMetadata = {};

    try {
        parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
    } catch (e) {
        //@ts-ignore
        console.warn(`Failed to parse metadata for record ${id}: ${e.message}`);
        // Use empty object as fallback
    }

    const parsedRecord: any = {
        id,
        metadata: parsedMetadata,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
    };

    for (const key in tableDecl) {
        const fieldType = tableDecl[key];
        const value = (rest as any)[key];

        if (typeof fieldType === "object") {
            parsedRecord[key] = value
        } else {
            switch (fieldType) {
                case "text":
                case "long text":
                case "image":
                    parsedRecord[key] = value ?? "";
                    break;
                case "date":
                    parsedRecord[key] = value ? new Date(value) : null;
                    break;
                case "json":
                    if (typeof value === "string") {
                        try {
                            parsedRecord[key] = JSON.parse(value);
                        } catch {
                            parsedRecord[key] = {};
                        }
                    } else if (typeof value === "object" && value !== null) {
                        parsedRecord[key] = value;
                    } else {
                        parsedRecord[key] = {};
                    }
                    break;
                case "number":
                    parsedRecord[key] = typeof value === "number" ? value : value !== undefined ? Number(value) : 0;
                    break;
                case "bool":
                    parsedRecord[key] = value === 1 || value === true;
                    break;
                default:
                    parsedRecord[key] = value;
            }
        }
    }

    return parsedRecord;
}

function defaultValue(column: ColumnType): any {
    if (typeof column === "object") return null;
    switch (column) {
        case "text":
        case "long text":
        case "image":
            return "";
        case "date":
            return new Date();
        case "json":
            return {};
        case "number":
            return 0;
        case "bool":
            return false;
        default:
            return null;
    }
}

function validateRecord(tableDecl: TableDeclaration, record: any) {
    for (const key in record) {
        // Skip system fields
        if (["id", "metadata", "createdAt", "updatedAt"].includes(key)) {
            continue;
        }

        const expected = tableDecl[key];
        const value = record[key];

        if (!expected) {
            throw new Error(`Unexpected field "${key}"`);
        }
        if (typeof expected === "object") {
            // Handle relationship fields - allow string references, null, or arrays of objects (for one-to-many)
            if (typeof value === "string" || value === null) {
                // This is fine - string reference or null
                continue;
            } else if (Array.isArray(value) && expected.type === "one-to-many") {
                // This is fine - array of related objects for one-to-many relationship
                continue;
            } else if (typeof value === "object" && value !== null && expected.type === "one-to-one") {
                // This is fine - related object for one-to-one relationship
                continue;
            } else {
                throw new Error(`Field "${key}" should be a string reference id, null, or a valid relationship object`);
            }
        } else {
            switch (expected) {
                case "text":
                case "long text":
                case "image":
                    if (typeof value !== "string") throw new Error(`Field "${key}" should be a string`);
                    break;
                case "date":
                    if (!(value instanceof Date)) throw new Error(`Field "${key}" should be a Date`);
                    break;
                case "json":
                    if (typeof value !== "object" || value === null) throw new Error(`Field "${key}" should be an object`);
                    break;
                case "number":
                    if (typeof value !== "number") throw new Error(`Field "${key}" should be a number`);
                    break;
                case "bool":
                    if (typeof value !== "boolean") throw new Error(`Field "${key}" should be a boolean`);
                    break;
            }
        }
    }
}

function fillMissingFields(tableDecl: TableDeclaration, record: any): any {
    const newRecord = { ...record };
    for (const key in tableDecl) {
        if (!(key in newRecord)) {
            newRecord[key] = defaultValue(tableDecl[key]);
        }
    }
    return newRecord;
}

function stripExtraFields(tableDecl: TableDeclaration, record: any): any {
    const stripped: any = {};
    for (const key in record) {
        if (key in tableDecl || ["id", "metadata", "createdAt", "updatedAt"].includes(key)) {
            stripped[key] = record[key];
        }
    }
    return stripped;
}

function prepareRecordForStorage(tableDecl: TableDeclaration, record: any): any {
    const prepared = { ...record };

    for (const key in tableDecl) {
        const fieldType = tableDecl[key];
        const value = record[key];

        if (typeof fieldType === "object") {
            if (value === null) {
                // Keep null as is
                prepared[key] = null;
            } else if (typeof value === "string") {
                // Keep string references as is
                prepared[key] = value;
            } else if (Array.isArray(value) && fieldType.type === "one-to-many") {
                // Convert array of objects to array of IDs, then to JSON string
                const ids = value.map(item => typeof item === "string" ? item : item.id);
                prepared[key] = JSON.stringify(ids);
            } else if (typeof value === "object" && fieldType.type === "one-to-one") {
                // Convert object to its ID
                prepared[key] = value.id;
            }
        } else if (fieldType === "bool") {
            prepared[key] = value ? 1 : 0;
        } else {
            if (value === null || value === undefined) {
                prepared[key] = null;
            } else if (fieldType === "date" && value instanceof Date) {
                prepared[key] = value.getTime();
            } else if (fieldType === "json") {
                prepared[key] = JSON.stringify(value);
            }
        }
    }

    return prepared;
}

export class QuickNEasyORM {
    private db: GenericDB;
    private declaration: DatabaseDeclaration;

    constructor(db: GenericDB, declaration: DatabaseDeclaration) {
        this.db = db;
        this.declaration = declaration;
        this.initializeTables();
        this.checkAndRunMigrations();

    }

    private async checkAndRunMigrations() {
        for (const tableName in this.declaration) {
            const tableDecl = this.declaration[tableName];
            const result = await this.db.query(`PRAGMA table_info(${tableName})`).all();
            const existingColumns = new Set(result.map((row: any) => row.name));

            for (const fieldName in tableDecl) {
                if (!existingColumns.has(fieldName)) {
                    const fieldType = tableDecl[fieldName];
                    let sqlType: string;
                    if (typeof fieldType === "object") {
                        sqlType = "TEXT";
                    } else {
                        switch (fieldType) {
                            case "text":
                            case "long text":
                            case "image":
                            case "json":
                                sqlType = "TEXT";
                                break;
                            case "date":
                                sqlType = "INTEGER";
                                break;
                            case "number":
                                sqlType = "REAL";
                                break;
                            case "bool":
                                sqlType = "INTEGER";
                                break;
                            default:
                                sqlType = "TEXT";
                        }
                    }

                    console.log(`🛠️ Adding missing column ${fieldName} to table ${tableName}`);
                    await this.db.query(`ALTER TABLE ${tableName} ADD COLUMN ${fieldName} ${sqlType}`).run();
                    await this.db.query("PRAGMA schema_version").all();

                }
            }
        }
    }

    private initializeTables() {
        for (const tableName in this.declaration) {
            const fields = [
                `id TEXT PRIMARY KEY`,
                `metadata TEXT`,
                `createdAt INTEGER`,
                `updatedAt INTEGER`
            ];

            const tableDecl = this.declaration[tableName];
            for (const fieldName in tableDecl) {
                const fieldType = tableDecl[fieldName];
                if (typeof fieldType === "object") {
                    // one-to-one, one-to-many just store as TEXT
                    fields.push(`${fieldName} TEXT`);
                } else {
                    switch (fieldType) {
                        case "text":
                        case "long text":
                        case "image":
                        case "json":
                            fields.push(`${fieldName} TEXT`);
                            break;
                        case "date":
                            fields.push(`${fieldName} INTEGER`);
                            break;
                        case "number":
                            fields.push(`${fieldName} REAL`);
                            break;
                        case "bool":
                            fields.push(`${fieldName} INTEGER`);
                            break;
                    }
                }
            }

            const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${fields.join(", ")})`;
            this.db.query(sql).run();
            console.log(`✅ Table ready: ${tableName}`);
        }
    }


    // Find fields in a table that reference another table
    private findReferenceFields(tableName: string, refTableName: string): string[] {
        const tableDecl = this.declaration[tableName];
        if (!tableDecl) return [];

        const refFields: string[] = [];
        for (const fieldName in tableDecl) {
            const fieldType = tableDecl[fieldName];
            if (typeof fieldType === "object" && fieldType.ref === refTableName) {
                refFields.push(fieldName);
            }
        }
        return refFields;
    }

    // Update the owner record when a reference is created
    private async updateReferenceOwner(tableName: string, recordId: string, data: any): Promise<void> {
        for (const fieldName in data) {
            const value = data[fieldName];
            if (!value || typeof value !== "string" || !value.includes("_")) continue;

            const fieldType = this.declaration[tableName][fieldName];
            if (typeof fieldType !== "object" || !fieldType.ref) continue;

            const [refTableName] = value.split("_");
            if (refTableName !== fieldType.ref) continue;

            console.log(`Updating reference owner: ${tableName} ${recordId} ${fieldName} ${value} ${refTableName}`)

            // Find fields in the referenced table that point back to this table
            const backRefFields = this.findReferenceFields(fieldType.ref, tableName);

            for (const backRefField of backRefFields) {
                const refTableDecl = this.declaration[fieldType.ref];
                const backRefType = refTableDecl[backRefField];

                if (typeof backRefType === "object") {
                    try {
                        // Get the referenced record
                        const refRecord = await this.get(value, false);

                        // Check if refRecord has an id before proceeding
                        if (!refRecord || !refRecord.id) {
                            console.warn(`Referenced record ${value} is missing or has no ID. Skipping bidirectional update.`);
                            continue;
                        }

                        // Update the reference based on relationship type
                        if (backRefType.type === "one-to-one") {
                            // For one-to-one, set the reference to this record's ID
                            refRecord[backRefField] = recordId;
                        } else if (backRefType.type === "one-to-many") {
                            // For one-to-many, we need to handle arrays
                            // This is stored as a JSON string in the database
                            let currentRefs: string[] = [];
                            try {
                                if (refRecord[backRefField] && typeof refRecord[backRefField] === "string") {
                                    currentRefs = JSON.parse(refRecord[backRefField]);
                                }
                            } catch (e) {
                                //@ts-ignore
                                console.warn(`Failed to parse references for ${backRefField}: ${e.message}`);
                            }

                            if (!Array.isArray(currentRefs)) {
                                currentRefs = [];
                            }

                            // Add this record's ID if not already present
                            if (!currentRefs.includes(recordId)) {
                                currentRefs.push(recordId);
                                refRecord[backRefField] = JSON.stringify(currentRefs);
                            }
                        }

                        // Update the referenced record
                        console.log(`Updating referenced record: ${fieldType.ref} ${refRecord.id} ${backRefField} ${recordId}`, refRecord)
                        await this.update(refRecord);
                    } catch (e) {
                        //@ts-ignore
                        console.warn(`Error updating reference owner: ${e.message}`);
                        // Continue with other references instead of failing the entire operation
                    }
                }
            }
        }
    }

    // Fetch related records up to specified depth
    private async fetchRelations(
        record: DbRecord,
        depth: number = 2,
        currentDepth: number = 0,
        visited: Set<string> = new Set<string>()
    ): Promise<DbRecord> {
        if (currentDepth >= depth || record.id === undefined) return record;

        // Add this record to visited set to prevent infinite recursion
        visited.add(record.id);

        const [tableName] = record.id.split("_");
        const tableDecl = this.declaration[tableName];

        const result = { ...record };

        for (const fieldName in tableDecl) {
            const fieldType = tableDecl[fieldName];

            if (typeof fieldType === "object" && fieldType.ref) {
                const refValue = record[fieldName];

                if (fieldType.type === "one-to-one" && typeof refValue === "string" && refValue) {
                    // Skip if we've already visited this record
                    if (visited.has(refValue)) continue;

                    try {
                        // Fetch the referenced record
                        const refRecord = await this.get(refValue, false); // Pass false to avoid recursive fetching
                        // Recursively fetch its relations with the same visited set
                        result[fieldName] = await this.fetchRelations(refRecord, depth, currentDepth + 1, visited);
                    } catch (e) {
                        //@ts-ignore

                        console.warn(`Failed to fetch relation ${fieldName}: ${e.message}`);
                    }
                } else if (fieldType.type === "one-to-many" && typeof refValue === "string" && refValue) {
                    try {
                        // Parse the array of references
                        let refs: string[] = [];
                        try {
                            refs = JSON.parse(refValue);
                        } catch {
                            // If not valid JSON, treat as a single ID
                            if (refValue) refs = [refValue];
                        }

                        if (Array.isArray(refs)) {
                            const refRecords: DbRecord[] = [];

                            for (const refId of refs) {
                                if (typeof refId === "string" && refId) {
                                    // Skip if we've already visited this record
                                    if (visited.has(refId)) continue;

                                    try {
                                        const refRecord = await this.get(refId, false); // Pass false to avoid recursive fetching
                                        // Recursively fetch relations with the same visited set
                                        refRecords.push(await this.fetchRelations(refRecord, depth, currentDepth + 1, visited));
                                    } catch (e) {
                                        //@ts-ignore

                                        console.warn(`Failed to fetch relation item ${refId}: ${e.message}`);
                                    }
                                }
                            }

                            result[fieldName] = refRecords;
                        }
                    } catch (e) {
                        //@ts-ignore

                        console.warn(`Failed to process one-to-many relation ${fieldName}: ${e.message}`);
                    }
                }
            }
        }

        return result;
    }

    async get(id: string, fetchRelations: boolean = true): Promise<DbRecord> {
        const [tableName] = id.split("_");
        const tableDecl = this.declaration[tableName];

        const result = await this.db.query(`SELECT * FROM ${tableName} WHERE id = ?`).get(id) as RawDbRecord;
        if (!result) throw new Error(`Record with id ${id} not found`);

        const complete = fillMissingFields(tableDecl, result);
        const parsed = parseRawRecord(complete, tableDecl);

        // Fetch relations up to 2 levels deep if requested
        return fetchRelations ? this.fetchRelations(parsed) : parsed;
    }

    async list(tableName: string, fetchRelations: boolean = true): Promise<DbRecord[]> {
        const results: RawDbRecord[] = await this.db.query(`SELECT * FROM ${tableName}`).all();
        const tableDecl = this.declaration[tableName];
        const parsedResults = results.map(row => {
            const complete = fillMissingFields(tableDecl, row);

            return parseRawRecord(complete, tableDecl);
        });

        // Fetch relations for each record if requested
        if (fetchRelations) {
            const withRelations = await Promise.all(
                parsedResults.map(record => this.fetchRelations(record))
            );
            return withRelations;
        }

        return parsedResults;
    }

    async delete(id: string): Promise<void> {
        const [tableName] = id.split("_");
        this.db.query(`DELETE FROM ${tableName} WHERE id = ?`).run(id);
    }

    async insert(tableName: string, data: any): Promise<DbRecord> {
        const tableDecl = this.declaration[tableName];
        if (!tableDecl) throw new Error(`Unknown table: ${tableName}`);

        validateRecord(tableDecl, data);
        const id = `${tableName}_${randomUUID()}`;
        const now = Date.now();
        const metadata = JSON.stringify({});

        const preparedRecord = prepareRecordForStorage(tableDecl, data);
        const fullData = {
            id,
            metadata,
            createdAt: now,
            updatedAt: now,
            ...fillMissingFields(tableDecl, preparedRecord)
        };
        const keys = Object.keys(fullData);
        const values = keys.map(k => {
            const val = fullData[k];
            return val instanceof Date ? val.getTime() : typeof val === "object" && !(val instanceof Date) ? JSON.stringify(val) : val;
        });

        const placeholders = keys.map(() => "?").join(", ");
        const sql = `INSERT INTO ${tableName} (${keys.join(", ")}) VALUES (${placeholders})`;
        this.db.query(sql).run(...values);

        // Update any referenced records to maintain bidirectional relationships
        await this.updateReferenceOwner(tableName, id, data);

        const record = parseRawRecord(fullData, tableDecl);
        return this.fetchRelations(record);
    }

    async update(record: any): Promise<DbRecord> {
        const id = record.id;
        if (!id) throw new Error("Missing id in record to update");

        const [tableName] = id.split("_");
        const tableDecl = this.declaration[tableName];
        if (!tableDecl) throw new Error(`Unknown table: ${tableName}`);

        validateRecord(tableDecl, record);

        // First strip extra fields, then prepare relations for storage
        const strippedRecord = stripExtraFields(tableDecl, record);
        const preparedRecord = prepareRecordForStorage(tableDecl, strippedRecord);
        const cleanedRecord = fillMissingFields(tableDecl, preparedRecord);
        cleanedRecord.updatedAt = Date.now();

        const updates = Object.keys(cleanedRecord).map(key => `${key} = ?`).join(", ");
        const values = Object.keys(cleanedRecord).map(k => {
            const val = cleanedRecord[k];
            return val instanceof Date ? val.getTime() : typeof val === "object" && !(val instanceof Date) ? JSON.stringify(val) : val;
        });

        const sql = `UPDATE ${tableName} SET ${updates} WHERE id = ?`;
        this.db.query(sql).run(...values, id);

        // Update any referenced records to maintain bidirectional relationships
        // We need to extract string references from the original record for updateReferenceOwner
        const referencesForUpdate: Record<string, string> = {};
        for (const key in tableDecl) {
            const fieldType = tableDecl[key];
            if (typeof fieldType === "object") {
                const value = record[key];
                if (typeof value === "string") {
                    referencesForUpdate[key] = value;
                } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                    referencesForUpdate[key] = value.id;
                }
            }
        }

        await this.updateReferenceOwner(tableName, id, referencesForUpdate);

        const parsedRecord = parseRawRecord(cleanedRecord as RawDbRecord, tableDecl);
        return this.fetchRelations(parsedRecord);
    }
}

