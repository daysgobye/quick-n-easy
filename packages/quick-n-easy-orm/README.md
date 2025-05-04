# Quick N Easy ORM: The Simple SQLite ORM for Fast Development

## Build Your App, Not Your ORM

Quick N Easy ORM is designed for developers who want to focus on building their application, not configuring complex database setups. This lightweight ORM helps you get from zero to a working database in minutes, not hours.

## 🎯 Why Quick N Easy ORM?

When you're building a side project or prototype, you don't need enterprise-level complexity. You need something that works reliably so you can focus on solving the real problems your app addresses.

### 🚀 Features

- **SQLite-Powered**: SQLite is incredibly fast and more than sufficient for 99.99% of applications
- **Simple Schema Definition**: Define your database structure with plain JavaScript objects
- **Automatic Migrations**: The ORM detects schema changes and handles migrations for you
- **Fully Managed Relations**: One-to-one and one-to-many relationships work out of the box
- **Repository Pattern Built-in**: Use simple `list()`, `get()`, `insert()`, `update()`, and `delete()` methods
- **JavaScript-First Filtering**: Filter data using JavaScript instead of learning a custom query language
## 📦 Installation

```bash
npm install quick-n-easy-orm
```

### Compare to Traditional ORMs

Many ORMs require extensive setup with multiple files and configurations:

```
.
├── .dbpackage
└── src/
    ├── models/
    │   ├── user.ts
    │   └── post.ts
    ├── entity/
    │   ├── user.ts
    │   └── post.ts
    ├── lib/
    │   └── db.ts
    └── index.ts
```

## 🎮 Quick Start

With Quick N Easy ORM, you can get started with just a few lines of code:

```js
import { type DatabaseDeclaration, QuickNEasyORM } from "quick-n-easy-orm";
// bun
import { createDB } from "quick-n-easy-orm/shims/bunSqliteShim";
// node
// import { createDB } from "quick-n-easy-orm/shims/betterSqlite3Shim";
// D1
// import { createDB } from "quick-n-easy-orm/shims/d1Shim";


const db = createDB(":memory:");

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

// --- INIT ORM ---
export const orm = new QuickNEasyORM(db, dbDeclaration);
```

### Using the ORM

Once set up, you can immediately start working with your data:

```js
import { orm } from "./db";

// Create a user
const user = await orm.insert("user", { 
  email: "test@example.com", 
  password: "password123" 
});

// List all users
const users = await orm.list("user");

// Create a post with a relation
const post = await orm.insert("post", {
  title: "My First Post",
  body: "This is the body of the first post.",
  author: user.id,
  image: "https://placekitten.com/400/400"
});

// Get a specific user
const fetchedUser = await orm.get(users[0].id);

// Update a user
fetchedUser.email = "updated@example.com";
const updatedUser = await orm.update(fetchedUser);

// Delete a user
await orm.delete(users[0].id);
```

## Filtering and Queries

Instead of learning a complex query language, simply use JavaScript to filter your data:

```js
// Get all users
const allUsers = await orm.list("user");

// Filter in JavaScript
const activeUsers = allUsers.filter(user => user.isActive);
```

## Column Types

The schema system is intentionally simple with the types you'll actually need:

```ts
export type ColumnType = "text" | "long text" | "image" | "date" | "json" | "number" | "bool" | { type: "one-to-one" | "one-to-many", ref: string };
```

## Features

- Define database schema using JavaScript/TypeScript objects
- Automatic table creation based on schema and migrations
- Support for relationships (one-to-one, one-to-many)
- Automatic handling of metadata, creation and update timestamps
- Simple CRUD API (get, list, insert, update, delete)
- Automatically fetch 1 relation deep in get or list operation

## Philosophy

Quick N Easy ORM is built on a simple philosophy: **your time is better spent building your application than configuring your database**. 

This ORM is perfect for:
- Side projects
- MVPs and prototypes
- Learning projects
- Small to medium applications

If your project grows to the point where you need more advanced features, that's a good problem to have! You can always migrate to a more feature-rich ORM when you have real users and real scaling needs.

## The Bottom Line

Stop wasting time configuring complex database setups and start building the features that matter. Quick N Easy ORM gives you everything you need to get your database up and running quickly so you can focus on solving real problems.


## 🌐 The Quick-n-Easy Ecosystem

Quick N Easy ORM is part of a growing ecosystem of tools designed to make development faster and easier:

### 🔄 Quick-n-Easy API

Pair Quick N Easy ORM with [Quick-n-Easy API](https://github.com/daysgobye/quick-n-easy/tree/main/packages/quick-n-easy-api) to create a complete backend solution:

- **Automatic CRUD Endpoints**: Generate RESTful API endpoints for all your ORM models
- **Built-in Admin UI**: Manage your data through a beautiful admin interface without writing any code
- **Seamless Integration**: Works directly with your ORM models and database schema
- **Authentication Ready**: Simple authentication with minimal configuration

```typescript
// After setting up your ORM
import { QuickNEasyAPI } from "quick-n-easy-api";
import { Hono } from 'hono';

// Create a Hono app
const app = new Hono();

// Initialize the API with your ORM
const api = new QuickNEasyAPI(
    app, 
    dbDeclaration, 
    (c) => orm,
    "securePassword" // Optional: Add password protection
);

export default app;
```

### 🎨 Quick-n-Easy Inputs

Create beautiful form inputs that work seamlessly with your ORM models:

- **Form Generation**: Automatically generate forms based on your database schema
- **Validation**: Built-in validation that matches your database constraints
- **Custom inputs**: Swap out default inputs with your own custom ones so you can make forms in react, svelte, etc.

### 🔮 Future Expansion

The Quick-n-Easy ecosystem is designed to work together seamlessly, providing a complete solution for rapid application development. Mix and match the packages you need for your specific project requirements.


## 📝 License

MIT - because sharing is caring! ❤️