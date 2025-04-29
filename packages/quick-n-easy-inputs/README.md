# Quick-n-Easy Inputs

A UI input components package for quick-n-easy applications.

## Features

- Form generation
- Custom input renderers
- Integration with quick-n-easy-orm

## Usage

```typescript
import { AdminUI } from 'quick-n-easy-inputs';
import { SimpleORM, type DatabaseDeclaration } from 'quick-n-easy-orm/quickNEasyOrm';

// Define your database schema
const dbDeclaration: DatabaseDeclaration = {
  // Your schema here
};

// Initialize ORM and AdminUI
const orm = new SimpleORM(/* your database connection */, dbDeclaration);
const adminUI = new AdminUI(dbDeclaration, orm);

// Generate a form
const formHtml = await adminUI.generateForm('user', '/api/users');
```

## Development

```bash
# Install dependencies
bun install

# Build the package
bun run build

# Run tests
bun test
```