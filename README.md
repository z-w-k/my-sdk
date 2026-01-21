# My SDK

A TypeScript monorepo for frontend SDK packages.

## Tech Stack

- **Package Manager**: pnpm
- **Build System**: Turborepo
- **Build Tool**: tsup
- **Language**: TypeScript
- **Linting**: ESLint + Prettier
- **Versioning**: Changesets

## Packages

| Package | Description |
|---------|-------------|
| `@my-sdk/core` | Core utilities and shared functionality |
| `@my-sdk/client` | HTTP client for API interactions |

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0

### Installation

```bash
pnpm install
```

### Development

```bash
# Build all packages
pnpm build

# Watch mode for development
pnpm dev

# Run linting
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test
```

## Adding a New Package

1. Create a new directory under `packages/`
2. Add `package.json`, `tsconfig.json`, and `tsup.config.ts`
3. Create `src/index.ts` as the entry point
4. Run `pnpm install` to link the new package

## Versioning & Publishing

This monorepo uses [Changesets](https://github.com/changesets/changesets) for version management.

```bash
# Create a changeset
pnpm changeset

# Update package versions
pnpm version-packages

# Publish to npm
pnpm release
```

## Project Structure

```
my-sdk/
├── packages/
│   ├── core/           # @my-sdk/core
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
│   └── client/         # @my-sdk/client
│       ├── src/
│       ├── package.json
│       ├── tsconfig.json
│       └── tsup.config.ts
├── .changeset/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── turbo.json
└── eslint.config.mjs
```

## License

MIT
