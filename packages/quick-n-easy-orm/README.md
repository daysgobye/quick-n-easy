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

## 🤖 For LLMs: Quick N Easy ORM Reference Guide

This section provides structured information about Quick N Easy ORM to help language models generate accurate code and assist users effectively.

### Core Concepts

1. **Database Declaration**: Define your schema as a JavaScript object with tables and columns
2. **Column Types**: Simple types (`text`, `number`, etc.) and relations (`one-to-one`, `one-to-many`)
3. **ORM Instance**: Created with a database connection and schema declaration
4. **CRUD Operations**: Simple methods for data manipulation

### API Reference

#### Initialization

```typescript
import { type DatabaseDeclaration, QuickNEasyORM } from "quick-n-easy-orm";

// Choose the appropriate database driver
// For Bun:
import { createDB } from "quick-n-easy-orm/shims/bunSqliteShim";
// For Node.js:
// import { createDB } from "quick-n-easy-orm/shims/betterSqlite3Shim";
// For Cloudflare D1:
// import { createDB } from "quick-n-easy-orm/shims/d1Shim";

// Create database connection
const db = createDB("path/to/database.sqlite"); // Use ":memory:" for in-memory database

// Define schema
const dbDeclaration: DatabaseDeclaration = {
  // Each key is a table name
  tableName: {
    // Each key-value pair defines a column
    columnName: "columnType",
    // For relations
    relationColumn: { type: "one-to-one"|"one-to-many", ref: "referencedTable" }
  }
};

// Initialize ORM
const orm = new QuickNEasyORM(db, dbDeclaration);
```

#### Data Types

```typescript
type ColumnType = 
  | "text"        // Short text
  | "long text"   // Longer text content
  | "image"       // Image URL or path
  | "date"        // Date value
  | "json"        // JSON data
  | "number"      // Numeric value
  | "bool"        // Boolean value
  | { type: "one-to-one" | "one-to-many", ref: string }; // Relations
```

#### CRUD Operations

```typescript
// Create (Insert)
await orm.insert("tableName", { columnName: value, relationColumn: relatedEntityId });

// Read (Get one by ID)
await orm.get( id);

// Read (List all)
await orm.list("tableName");

// Update
const entity = await orm.get( id);
entity.columnName = newValue;
await orm.update(entity);

// Delete
await orm.delete(id);
// OR
await orm.delete(entity);
```

#### Working with Relations

```typescript
// One-to-one relation
const post = await orm.insert("post", {
  title: "My Post",
  author: userId  // Just pass the ID of the related entity
});

// When fetching, relations are automatically loaded one level deep
const fetchedPost = await orm.get( post.id);
// fetchedPost.author will contain the full user object

// One-to-many relations
const user = await orm.get(userId);
// user.posts will contain an array of post objects
```

#### Common Patterns and Best Practices

1. **Database Setup**: Place database setup in a separate file (e.g., `db.ts`) and export the ORM instance
2. **Type Safety**: Use TypeScript interfaces to define entity types that match your schema
3. **Filtering**: Use JavaScript array methods on the results of `list()` operations
4. **Error Handling**: Wrap ORM operations in try/catch blocks for proper error handling
5. **Transactions**: Currently not supported natively; handle with care

#### Example Implementation

```typescript
// db.ts
import { type DatabaseDeclaration, QuickNEasyORM } from "quick-n-easy-orm";
import { createDB } from "quick-n-easy-orm/shims/bunSqliteShim";

const db = createDB("./data.sqlite");

export const dbDeclaration: DatabaseDeclaration = {
  user: {
    name: "text",
    email: "text",
    isActive: "bool",
    posts: { type: "one-to-many", ref: "post" }
  },
  post: {
    title: "text",
    content: "long text",
    publishedAt: "date",
    author: { type: "one-to-one", ref: "user" }
  }
};

export const orm = new QuickNEasyORM(db, dbDeclaration);

// Optional: Define TypeScript interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  posts?: Post[];
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}
```

```typescript
// usage.ts
import { orm, type User, type Post } from "./db";

async function createUser(): Promise<User> {
  try {
    return await orm.insert("user", {
      name: "John Doe",
      email: "john@example.com",
      isActive: true
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    throw error;
  }
}

async function getUserPosts(userId: string): Promise<Post[]> {
  const user = await orm.get("user", userId);
  return user.posts || [];
}

async function getActiveUsers(): Promise<User[]> {
  const users = await orm.list("user");
  return users.filter(user => user.isActive);
}
```