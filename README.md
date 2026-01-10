# beancount

[![CI](https://github.com/Boelensman1/node-beancount/actions/workflows/ci.yml/badge.svg)](https://github.com/Boelensman1/node-beancount/actions/workflows/ci.yml)

A parser and editor for Beancount accounting files with full type safety.

## Installation

```bash
npm install beancount
```

## Features

- **Full Beancount Support** - All directives supported: transactions, open/close, balance, pad, note, document, price, event, query, custom, commodity, include, option, plugin, pushtag/poptag
- **Full Transaction Support** - Tags, links, metadata, costs, price annotations, and postings
- **Type-Safe** - Complete TypeScript types for all entries and components
- **Platform Agnostic** - Works in Node.js, browsers, Deno, and other JavaScript runtimes
- **Round-Trip Parsing** - Parse to objects and serialize back to text
- **Recursive File Parsing** - Option to automatically follow and merge `include` directives with circular reference protection
- **Formatted Output** - Column-aligned output with `toFormattedString()`
- **CLI Formatter** - Command-line tool `beancount-format` for formatting files with auto-aligned columns

## Quick Start

```typescript
import { parse, ParseResult } from 'beancount'

const beancountContent = `
2024-01-01 open Assets:Checking USD

2024-01-15 * "Grocery Store" "Weekly shopping"
  Assets:Checking   -50.00 USD
  Expenses:Food      50.00 USD
`

const result = parse(beancountContent)

// Access parsed entries
console.log(result.entries.length) // 2

// Convert back to string
console.log(result.toString())

// Convert to JSON
const resultJSON = JSON.stringify(result)
console.log(resultJSON)

// Convert back to parsed entries
console.log(ParseResult.fromJSON(result))

// Or with formatted output (aligned columns)
// only partially implemented at this point
console.log(result.toFormattedString())
```

## Parsing Files

Use `parseFile` to parse a Beancount file directly from the filesystem:

```typescript
import { parseFile } from 'beancount'

// Parse a single file
const result = await parseFile('/path/to/ledger.beancount')

// Parse with recursive includes - follows all `include` directives
const result = await parseFile('/path/to/main.beancount', { recurse: true })
```

When `recurse: true`, the parser follows all `include` directives and merges the entries from included files into the result. Circular includes are handled gracefully (each file is only parsed once).

## Browser Usage

The library works in browsers and other non-Node.js environments. The core `parse()` function works everywhere. For `parseFile()`, provide custom file system helpers:

```typescript
import { parseFile, type FileSystemHelpers } from 'beancount'

const browserFS: FileSystemHelpers = {
  readFile: async (path) => {
    const response = await fetch(path)
    return response.text()
  },
  resolvePath: (path) => new URL(path, window.location.origin).pathname,
  resolveRelative: (base, rel) => {
    const baseDir = base.substring(0, base.lastIndexOf('/') + 1)
    return new URL(rel, window.location.origin + baseDir).pathname
  },
  dirname: (path) => path.substring(0, path.lastIndexOf('/')),
}

const result = await parseFile('/api/ledger.beancount', {
  recurse: true,
  fs: browserFS,
})
```

## Documentation

Full API documentation is available at https://Boelensman1.github.io/node-beancount/

## CLI Usage

The package includes a `beancount-format` command-line tool for formatting Beancount files with aligned currency columns.

### Basic Usage

```bash
# Format a file to stdout (preview changes)
beancount-format ledger.beancount

# Format a file in-place (modify the file)
beancount-format -w ledger.beancount

# Format multiple files
beancount-format -w accounts.beancount transactions.beancount
```

### Options

- `-w, --write` - Write formatted output back to the file(s) (default: print to stdout)
- `-c, --currency-column N` - Align currencies at column N (default: auto-calculate optimal alignment)
- `-h, --help` - Show help message

### Examples

```bash
# Preview formatting changes
beancount-format my-ledger.beancount

# Apply formatting to multiple files
beancount-format -w income.beancount expenses.beancount

# Use custom currency column alignment
beancount-format --currency-column 60 ledger.beancount
```

## Contributing

This project uses Make for task orchestration. Common commands:

```bash
# Install dependencies
make install

# Build the project
make build

# Run tests
make test

# Run linting (prettier, tsc, eslint, typedoc)
make lint

# Generate documentation
make docs
```

## Requirements

- Node.js >= 22

## License

ISC
