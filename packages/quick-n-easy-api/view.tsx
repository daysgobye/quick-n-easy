import { html } from 'hono/html'
import type { QuickNEasyAPI } from '.'
import { TableDeclaration } from 'quick-n-easy-orm/quickNEasyOrm'
import { QuickNEasyInputs } from 'quick-n-easy-inputs/quickNEasyInputs'
export const Layout = (props: {
    title: string
    children?: any
}
) =>
    html`<!doctype html>
      <html>
        <head>
          <title>${props.title}</title>
        </head>
        <body>
          ${props.children}
        </body>
      </html>`
export type ColumnType = "text" | "long text" | "image" | "date" | "json" | "number" | "bool" | { type: "one-to-one" | "one-to-many", ref: string };

const genarateDataForTable = (tableSchemas: TableDeclaration) => {
    let tempData: Record<string, any> = {}
    for (const field in tableSchemas) {
        const fieldType: ColumnType = tableSchemas[field];
        if (fieldType instanceof Object) {
            if (fieldType.type === "one-to-one") {
                tempData[field] = {
                    id: "user_123",
                    updatedAt: new Date(),
                    createdAt: new Date(),

                }
            } else {
                tempData[field] = [{
                    id: "user_123",
                    updatedAt: new Date(),
                    createdAt: new Date(),

                }]
            }
        } else {

            switch (fieldType) {
                case "text":
                    tempData[field] = " My little text";
                    break;
                case "long text":
                    tempData[field] = "This is the body of the first post.";
                    break;
                case "image":
                    tempData[field] = "https://placekitten.com/400/400";
                    break;
                case "date":
                    tempData[field] = new Date();
                    break;
                case "json":
                    tempData[field] = { key: "value" };
                    break;
                case "number":
                    tempData[field] = 1;
                    break;
                case "bool":
                    tempData[field] = true;
                    break;
            }
        }
    }
    return tempData;
}

export const makeDocsRoute = (api: QuickNEasyAPI) => {
    api.app.get('/api', (c) => {
        const tables = api.tableNames;
        const tableSchemas = api.declaration;

        return c.html(
            <Layout title={''}>
                <>
                    <h1>API Documentation </h1>
                    < h2 > Available Tables </h2>
                    <ul>
                        {
                            tables.map(table => (
                                <li>
                                    {table}
                                    <ul>
                                        {
                                            Object.keys(tableSchemas[table]).map(field => (
                                                <li>
                                                    {field}:{typeof tableSchemas[table][field] === "object" ?
                                                        `${tableSchemas[table][field].type} > ${tableSchemas[table][field].ref}`
                                                        : tableSchemas[table][field]
                                                    }
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </li>
                            ))
                        }
                    </ul>

                    < h2 > Available Routes </h2>

                    {tables.map(table => (
                        <>

                            <h3>Table: {table} </h3>
                            < details >
                                <summary>GET /api/{table} - List all records </summary>
                                < pre >
                                    <code>
                                        {` fetch('/api/${table}').then(response => response.json()).then(data => console.log(data));
                                        `}
                                    </code>
                                </pre >
                            </details>
                            < details >
                                <summary>POST /api/{table} - Create a new record </summary>
                                < pre > <code>
                                    {` fetch('/api/{table}', {method: 'POST',headers: {'Content-Type': 'application/json'},body: ${JSON.stringify(genarateDataForTable(tableSchemas[table]), null, 2)}}).then(response => response.json()).then(data => console.log(data));`}
                                </code></pre >

                            </details>

                            < details >
                                <summary>GET /api/{table}/:id - Get a single record </summary>
                                <pre>
                                    <code>
                                        {`fetch('/api/${table}/1').then(response => response.json()).then(data => console.log(data)); 
                                    `}
                                    </code>
                                </pre>

                            </details>
                            < details >
                                <summary>PUT /api/{table}/: id - Update a record </summary>
                                <pre>
                                    <code>
                                        {` fetch('/api/${table}/1', {method: 'PUT',headers: {Content-Type': 'application/json'},body:${JSON.stringify(genarateDataForTable(tableSchemas[table]), null, 2)}}).then(response => response.json()).then(data => console.log(data)); `}
                                    </code>
                                </pre >
                            </details>

                            < details >
                                <summary>DELETE / api / {table} /: id - Delete a record </summary>
                                <pre>
                                    <code>
                                        {`fetch('/api/${table}/1', { method: 'DELETE'}).then(response => response.json()).then(data => console.log(data)); `}
                                    </code>
                                </pre>
                            </details>



                        </>
                    ))}
                </>

            </Layout>
        )
    });
}

export const makeAdminRoute = (api: QuickNEasyAPI) => {
    const inputs = new QuickNEasyInputs(api.orm)
    inputs.styles = false
    // Admin route for listing all tables
    api.app.get('/admin', (c) => {
        const tables = api.tableNames;

        return c.html(
            <Layout title={'Admin Dashboard'}>
                <>
                    <h1>Admin Dashboard</h1>
                    <h2>Available Tables</h2>
                    <ul>
                        {
                            tables.map(table => (
                                <li>
                                    <a href={`/admin/${table}`}>{table}</a>
                                </li>
                            ))
                        }
                    </ul>
                </>
            </Layout>
        )
    });

    // Admin routes for each table
    for (const table of api.tableNames) {
        // List view for a specific table
        api.app.get(`/admin/${table}`, async (c) => {
            try {
                const records = await api.orm.list(table);
                const tableSchema = api.declaration[table];

                return c.html(
                    <Layout title={`Admin - ${table}`}>
                        <>
                            <h1>{table} - Records</h1>
                            <p><a href="/admin">Back to Admin Dashboard</a></p>
                            <p><a href={`/admin/${table}/new`}>Create New {table}</a></p>

                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        {Object.keys(tableSchema).map(field => (
                                            <th>{field}</th>
                                        ))}
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((record: any) => (
                                        <tr>
                                            <td><a href={`/admin/${table}/${record.id}`}>{record.id}</a></td>
                                            {Object.keys(tableSchema).map(field => {
                                                const value = record[field];
                                                let displayValue = '';

                                                if (value === null || value === undefined) {
                                                    displayValue = '';
                                                } else if (value instanceof Date) {
                                                    displayValue = value.toISOString();
                                                } else if (typeof value === 'object') {
                                                    displayValue = JSON.stringify(value);
                                                } else {
                                                    displayValue = String(value);
                                                }

                                                return <td>{displayValue}</td>;
                                            })}
                                            <td>
                                                <a href={`/admin/${table}/${record.id}`}>Edit</a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    </Layout>
                );
            } catch (e) {
                return c.html(
                    <Layout title="Error">
                        <>
                            <h1>Error</h1>
                            <p>{String(e)}</p>
                            <p><a href="/admin">Back to Admin Dashboard</a></p>
                        </>
                    </Layout>
                );
            }
        });

        // Create new record form
        api.app.get(`/admin/${table}/new`, async (c) => {
            try {
                const tableSchema = api.declaration[table];
                const genaratedForm = await inputs.generateForm(table, `/admin/${table}/new`)

                return c.html(
                    <Layout title={`Create New ${table}`}>
                        <>
                            <h1>Create New {table}</h1>
                            <p><a href={`/admin/${table}`}>Back to {table} List</a></p>
                            <div dangerouslySetInnerHTML={{ __html: genaratedForm }}>
                            </div>
                        </>
                    </Layout>
                );
            } catch (e) {
                return c.html(
                    <Layout title="Error">
                        <>
                            <h1>Error</h1>
                            <p>{String(e)}</p>
                            <p><a href="/admin">Back to Admin Dashboard</a></p>
                        </>
                    </Layout>
                );
            }
        });

        // Handle new record submission
        api.app.post(`/admin/${table}/new`, async (c) => {
            try {
                const formData = await c.req.formData();
                const data: Record<string, any> = {};

                for (const [key, value] of formData.entries()) {
                    data[key] = value;
                }

                const record = await api.orm.insert(table, data);
                return c.redirect(`/admin/${table}`);
            } catch (e) {
                return c.html(
                    <Layout title="Error">
                        <>
                            <h1>Error</h1>
                            <p>{String(e)}</p>
                            <p><a href="/admin">Back to Admin Dashboard</a></p>
                        </>
                    </Layout>
                );
            }
        });

        // Edit record form
        api.app.get(`/admin/${table}/:id`, async (c) => {
            try {
                const id = c.req.param("id");
                const record = await api.orm.get(id);
                const genaratedForm = await inputs.generateForm(table, `/admin/${table}/${id}`, record)
                return c.html(
                    <Layout title={`Edit ${table} - ${id}`}>
                        <>
                            <h1>Edit {table} - {id}</h1>
                            <p><a href={`/admin/${table}`}>Back to {table} List</a></p>
                            <div dangerouslySetInnerHTML={{ __html: genaratedForm }}>
                            </div>

                            <form method="post" action={`/admin/${table}/delete/${id}`}>
                                <button type="submit" style="background-color: #ff4444;">Delete</button>
                            </form>
                        </>
                    </Layout>
                );
            } catch (e) {
                return c.html(
                    <Layout title="Error">
                        <>
                            <h1>Error</h1>
                            <p>{String(e)}</p>
                            <p><a href="/admin">Back to Admin Dashboard</a></p>
                        </>
                    </Layout>
                );
            }
        });

        // Handle record update
        api.app.post(`/admin/${table}/:id`, async (c) => {
            try {
                const id = c.req.param("id");
                const formData = await c.req.formData();
                const data: Record<string, any> = {};

                for (const [key, value] of formData.entries()) {
                    data[key] = value;
                }

                // Update the record
                const record = await api.orm.update({ ...data, id });
                return c.redirect(`/admin/${table}`);
            } catch (e) {
                return c.html(
                    <Layout title="Error">
                        <>
                            <h1>Error</h1>
                            <p>{String(e)}</p>
                            <p><a href="/admin">Back to Admin Dashboard</a></p>
                        </>
                    </Layout>
                );
            }
        });

        // Handle record deletion
        api.app.post(`/admin/${table}/delete/:id`, async (c) => {
            try {
                const id = c.req.param("id");
                await api.orm.delete(id);
                return c.redirect(`/admin/${table}`);
            } catch (e) {
                return c.html(
                    <Layout title="Error">
                        <>
                            <h1>Error</h1>
                            <p>{String(e)}</p>
                            <p><a href="/admin">Back to Admin Dashboard</a></p>
                        </>
                    </Layout>
                );
            }
        });
    }
}




