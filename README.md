# beancount

A parser and editor for Beancount accounting files with full type safety.

## Installation

```bash
npm install beancount
```

## Features

- **Full Beancount Support** - All directives supported: transactions, open/close, balance, pad, note, document, price, event, query, custom, commodity, include, option, plugin, pushtag/poptag
- **Type-Safe** - Complete TypeScript types for all entries and components
- **Rich Transaction Support** - Tags, links, metadata, costs, price annotations, and postings
- **Round-Trip Parsing** - Parse to objects and serialize back to text
- **Formatted Output** - Column-aligned output with `toFormattedString()` (WIP)

## Quick Start

```typescript
import { parse } from 'beancount'

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

// Or with formatted output (aligned columns)
// only partially implemented at this point
console.log(result.toFormattedString())
```

## Documentation

Full API documentation is available at https://Boelensman1.github.io/node-beancount/

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
