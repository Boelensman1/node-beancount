# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript project configured as an ES module library. It uses shared configurations from `@wtflegal/dev-configs` for TypeScript, ESLint, and other tooling.

## File Extension Convention

- Source files use `.mts` extension (TypeScript ES modules)
- Compiled output generates `.mjs` (JavaScript ES modules) and `.d.mts` (type definitions)
- When creating new files, use `.mts` for TypeScript source files

## Build System

The project uses Make for task orchestration and TypeScript for compilation:

- **Build output**: `build/` directory (git-ignored)
- **Two TypeScript configs**:
  - `tsconfig.json`: Main config for type-checking (includes src, test, and eslint.config.mjs)
  - `tsconfig.build.json`: Production build config (only includes src)
- Both configs extend `@wtflegal/dev-configs/tsconfigs/node/tsconfig.json`

## Development Commands

```bash
# Install dependencies
command make install

# Build the project
command make build
# Compiles src/ to build/ using tsconfig.build.json
# this should only be run when we actually need to build, not for e.g. verification (so it should almost never be run)

# Run benchmark
command make benchmark

# Run tests
command make test
# Uses vitest

# Run linting (includes prettier, tsc type-check, eslint, and typedoc check)
command make lint

# Generate docs
command make docs
# Uses typedoc

# Clean dependencies
command make clean
```

For all the make commands, it's extremely important to use the command binary before make! So e.g. run `command make lint` and not just `make lint`

### Running Individual Tests

For running a single test file with vitest:

```bash
npx vitest test/main.test.mts
```

For watch mode on a specific test:

```bash
npx vitest test/main.test.mts --watch
```

## Project Structure

- `src/` - Source code (TypeScript .mts files)
- `test/` - Test files (Vitest .mts files)
- `build/` - Compiled output (git-ignored)
- `eslint.config.mjs` - ESLint flat config, extends @wtflegal/dev-configs

## Testing

- Test framework: Vitest
- Test files should be in `test/` directory with `.test.mts` extension
- Import from source using `.mjs` extension: `import { main } from '../src/main.mjs'`

## Package Configuration

- **Node requirement**: >=22
- **Module type**: ES modules only
- **Main export**: `./build/src/main.mjs`
- **Published files**: Only `build/**` is included in npm package

## Linting & Formatting

- **Prettier**: Configuration in `.prettierrc`
- **ESLint**: Uses @wtflegal/dev-configs TypeScript preset with flat config format
- **EditorConfig**: Settings in `.editorconfig`
- All three tools run as part of `make lint`
