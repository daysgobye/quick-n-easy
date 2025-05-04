# Quick-n-Easy API: Complete CRUD API with Admin UI in Minutes

## Why Does Python Have All the Easy Tools?

Ever wondered why Python has Django, FastAPI, and other frameworks that make building APIs with admin interfaces so simple? Well, now JavaScript has its answer: Quick-n-Easy API provides the same rapid development experience for JS developers.

## 🚀 Features

- **Complete CRUD API**: Automatically generates RESTful endpoints for your data models
- **Admin UI**: Built-in admin interface to manage your data without writing a single line of code
- **Documentation**: Auto-generated API documentation to help you and your team
- **Authentication**: Simple authentication with minimal configuration
- **ORM Integration**: Seamless integration with quick-n-easy-orm for database operations
- **Framework Agnostic**: Works with any JavaScript framework (built on Hono)

## 📦 Installation

```bash
npm install quick-n-easy-api
```

## 🎮 Quick Start

Get a complete API with admin interface up and running in minutes:

```typescript
import { DatabaseDeclaration, QuickNEasyORM } from "quick-n-easy-orm/quickNEasyOrm";
import { createDB } from "quick-n-easy-orm/shims/bunSqliteShim";
import { Hono } from 'hono';
import { QuickNEasyAPI } from "quick-n-easy-api";

// Create a Hono app
const app = new Hono();

// Define your database schema
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

// Initialize the database and ORM
const db = createDB(":memory:");
const orm = new QuickNEasyORM(db, dbDeclaration);

// Create a user for testing
await orm.insert("user", { email: "test@example.com", password: "password123" });

// Initialize the API with basic authentication
const api = new QuickNEasyAPI(
    app, 
    dbDeclaration, 
    (c) => orm,
    "securePassword" // Optional: Add password protection
);

// Add your custom routes if needed
app.get('/', (c) => c.text('Welcome to my API!'));

export default app;
```

## 🔐 Authentication

Adding basic authentication is as simple as providing a password:

```typescript
const api = new QuickNEasyAPI(
    app, 
    dbDeclaration, 
    (c) => orm,
    "yourSecurePassword" // Add password protection
);
```

By default, the username is set to "admin", but you can customize it:

```typescript
const api = new QuickNEasyAPI(
    app, 
    dbDeclaration, 
    (c) => orm,
    "yourSecurePassword", // Password
    "customUsername"      // Custom username
);
```

## 🌐 Generated Endpoints

For each model in your database declaration, the following RESTful endpoints are automatically created:

- `GET /api/{model}` - List all records
- `POST /api/{model}` - Create a new record
- `GET /api/{model}/:id` - Get a single record
- `PUT /api/{model}/:id` - Update a record
- `DELETE /api/{model}/:id` - Delete a record

## 📊 Admin UI

Access your admin interface at `/admin` to manage your data with a user-friendly interface. No additional configuration required!

## 📚 API Documentation

Auto-generated API documentation is available at `/api` to help you understand and use your API endpoints.

## 🔄 Integration with Quick-n-Easy Ecosystem

This library is designed to work seamlessly with other Quick-n-Easy packages:

- **quick-n-easy-orm**: For database operations
- **quick-n-easy-inputs**: For form generation

When used together, these packages provide a complete solution for rapidly building web applications with minimal effort.

## 🤔 Why Use Quick-n-Easy API?

- **Rapid Development**: Go from idea to working API in minutes
- **Zero Configuration**: No complex setup or boilerplate code
- **Full-Featured**: Get CRUD operations, admin UI, and documentation out of the box
- **JavaScript Native**: Built for JavaScript/TypeScript developers

Stop envying Python developers - now JavaScript has its own quick and easy solution for building APIs with admin interfaces!