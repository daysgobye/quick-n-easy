import { html } from 'hono/html'
import type { QuickNEasyAPI } from '.'
import { ColumnType, TableDeclaration } from 'quick-n-easy-orm/quickNEasyOrm'
import { QuickNEasyInputs } from 'quick-n-easy-inputs/quickNEasyInputs'
import { basicAuth } from 'hono/basic-auth'

{/* <link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.css"> */}

export const Layout = (props: {
    title: string
    children?: any
}) => html`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />

<link rel="stylesheet" href="https://unpkg.com/mvp.css"> 

          <title>${props.title}</title>
        </head>
        <body>
        <main>
        ${props.children}
        </main >
        </body>
      </html>`

const genarateDataForTable = (tableSchemas: TableDeclaration) => {
    let tempData: Record<string, any> = {}
    for (const field in tableSchemas) {
        const fieldType: ColumnType = tableSchemas[field];
        if (fieldType instanceof Object) {
            if (fieldType.type === "one-to-one") {
                tempData[field] = {
                    id: `${fieldType.ref}_123`,
                    updatedAt: new Date(),
                    createdAt: new Date(),

                }
            } else {
                tempData[field] = [{
                    id: `${fieldType.ref}_123`,
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
const genarateApiExample = (table: string, data: Record<string, any>) => {
    const exampleData = { ...data }
    if (exampleData.updatedAt) delete (exampleData.updatedAt)
    if (exampleData.createdAt) delete (exampleData.createdAt)
    if (exampleData.id) delete (exampleData.id)
    if (exampleData.metadata) delete (exampleData.metadata)

    return (
        <>
            < details >
                <summary>GET /api/{table} - List all records </summary>
                < pre >
                    <code>
                        {` fetch('/api/${table}').then(response => response.json()).then(data => console.log(data));`}
                    </code>
                </pre >
            </details>
            < details >
                <summary>POST /api/{table} - Create a new record </summary>
                < pre > <code>
                    {` fetch('/api/{table}', {method: 'POST',headers: {'Content-Type': 'application/json'},body: ${JSON.stringify(exampleData, null, 2)}}).then(response => response.json()).then(data => console.log(data));`}
                </code></pre >

            </details>

        </>
    )
}
const genarateApiExampleForId = (table: string, id: string, exampleData: Record<string, any>) => {
    return (
        <>

            < details >
                <summary>GET /api/{table}/{id} - Get a single record </summary>
                <pre>
                    <code>
                        {`fetch('/api/${table}/${id}').then(response => response.json()).then(data => console.log(data)); `}
                    </code>
                </pre>

            </details>
            < details >
                <summary>PUT /api/{table}/{id} - Update a record </summary>
                <pre>
                    <code>
                        {` fetch('/api/${table}/${id}', {method: 'PUT',headers: {Content-Type': 'application/json'},body:${JSON.stringify(exampleData, null, 2)}}).then(response => response.json()).then(data => console.log(data)); `}
                    </code>
                </pre >
            </details>

            < details >
                <summary>DELETE /api/{table}/{id} - Delete a record </summary>
                <pre>
                    <code>
                        {`fetch('/api/${table}/${id}', { method: 'DELETE'}).then(response => response.json()).then(data => console.log(data)); `}
                    </code>
                </pre>
            </details>

        </>
    )
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
                            {genarateApiExample(table, genarateDataForTable(tableSchemas[table]))}
                            {genarateApiExampleForId(table, ":id", genarateDataForTable(tableSchemas[table]))}


                        </>
                    ))}
                </>

            </Layout>
        )
    });
}

export const makeAdminRoute = (api: QuickNEasyAPI) => {
    api.app.use(
        '/admin/*',
        basicAuth({
            verifyUser: (username, password, c) => {
                if (c.req.method !== "GET") return true
                if (api.password === undefined) {
                    return true
                }
                return (
                    username === api.userName && password === api.password
                )
            },
        })
    )
    // Admin route for listing all tables
    api.app.get('/admin', (c) => {
        const orm = api.getDb(c)
        const inputs = new QuickNEasyInputs(orm)
        inputs.styles = false

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
            const orm = api.getDb(c)

            try {
                const records = await orm.list(table);
                const tableSchema = api.declaration[table];

                return c.html(
                    <Layout title={`Admin - ${table}`}>
                        <>
                            <h1>{table} - Records</h1>
                            <p><a href="/admin">Back to Admin Dashboard</a></p>
                            <p><a href={`/admin/${table}/new`}>Create New {table}</a></p>
                            {genarateApiExample(table, records.length ? records[0] : genarateDataForTable(tableSchema))}

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
            const orm = api.getDb(c)
            const inputs = new QuickNEasyInputs(orm)
            inputs.styles = false
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
            const orm = api.getDb(c)

            try {
                const formData = await c.req.formData();
                const data: Record<string, any> = {};

                for (const [key, value] of formData.entries()) {
                    data[key] = value;
                }

                const record = await orm.insert(table, data);
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
            const orm = api.getDb(c)
            const inputs = new QuickNEasyInputs(orm)
            inputs.styles = false
            try {
                const id = c.req.param("id");
                const record = await orm.get(id);
                const genaratedForm = await inputs.generateForm(table, `/admin/${table}/${id}`, record)
                return c.html(
                    <Layout title={`Edit ${table} - ${id}`}>
                        <>
                            <h1>Edit {table} - {id}</h1>
                            <p><a href={`/admin/${table}`}>Back to {table} List</a></p>
                            {genarateApiExampleForId(table, id, record)}

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
            const orm = api.getDb(c)

            try {
                const id = c.req.param("id");
                const formData = await c.req.formData();
                const data: Record<string, any> = {};

                for (const [key, value] of formData.entries()) {
                    data[key] = value;
                }

                // Update the record
                const record = await orm.update({ ...data, id });
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
            const orm = api.getDb(c)

            try {
                const id = c.req.param("id");
                await orm.delete(id);
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




