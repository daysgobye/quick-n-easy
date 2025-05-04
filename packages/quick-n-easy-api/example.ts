import { DatabaseDeclaration, QuickNEasyORM } from "quick-n-easy-orm/quickNEasyOrm";
import { createDB } from "quick-n-easy-orm/shims/bunSqliteShim";
import { Hono } from 'hono'
import { QuickNEasyAPI } from ".";

const app = new Hono()
// const db = new Database(":memory:");
// const db = new Database("example.db");



// --- DECLARATION ---
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
const db = createDB(":memory:")
const orm = new QuickNEasyORM(db, dbDeclaration);
const user = await orm.insert("user", { email: "test@example.com", password: "password123" });

const api = new QuickNEasyAPI(app, dbDeclaration, (c) => {
    return orm
},

);

app.get('/', (c) => c.text('Hono!'))

export default app
