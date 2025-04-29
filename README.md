# Quick-n-Easy Monorepo

This monorepo contains the following packages using Bun workspaces:

- `quick-n-easy-orm`: A simple ORM package for database operations
- `quick-n-easy-inputs`: UI input components for quick-n-easy applications
- `quick-n-easy-api`: API utilities for quick-n-easy applications (stub)

## Setup

```bash
# Install dependencies for all packages
bun install

# Build all packages
bun run build

# Run tests for all packages
bun test
```

## Package Structure

Each package has its own:
- `package.json` - Package configuration
- `tsconfig.json` - TypeScript configuration
- Source files
- Tests

## Development

You can work on individual packages by navigating to their directories:

```bash
cd packages/quick-n-easy-orm
npm run dev
```

Or run commands across all packages from the root:

```bash
npm run build --workspaces
```

## Dependencies

Packages can depend on each other. For example, `quick-n-easy-inputs` depends on `quick-n-easy-orm`.