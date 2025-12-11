#!/usr/bin/env node

/**
 * CLI tool to format Beancount accounting files with aligned currency columns
 */

import fs from 'node:fs'
import { parseArgs } from 'node:util'
import { parse } from './parse.mjs'

/**
 * Display help message
 * @param toStderr Whether to output to stderr (for error cases) or stdout
 */
function showHelp(toStderr = false): void {
  const message = `Usage: beancount-format [options] <files...>

Format Beancount accounting files with aligned columns

Options:
  -w, --write              Write formatted output to files (default: print to stdout)
  -c, --currency-column N  Use column N for currency alignment (default: auto-calculate)
  -h, --help               Show this help message

Examples:
  beancount-format ledger.beancount
  beancount-format -w ledger.beancount accounts.beancount
  beancount-format --currency-column 60 ledger.beancount`

  if (toStderr) {
    console.error(message)
  } else {
    console.log(message)
  }
}

/**
 * Format a single beancount file
 * @param filePath Path to the file to format
 * @param write Whether to write the formatted content back to the file
 * @param currencyColumn Currency column number, or null to auto-calculate
 * @returns true if successful, false if an error occurred
 */
function formatFile(
  filePath: string,
  write: boolean,
  currencyColumn: number | null,
): boolean {
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8')

    // Parse the beancount file
    const parseResult = parse(content)

    // Determine currency column
    const column = currencyColumn ?? parseResult.calculateCurrencyColumn()

    // Format the content
    const formatted = parseResult.toFormattedString({ currencyColumn: column })

    // Output the result
    if (write) {
      fs.writeFileSync(filePath, formatted, 'utf-8')
    } else {
      console.log(formatted)
    }

    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Error processing ${filePath}: ${errorMessage}`)
    return false
  }
}

/**
 * Main CLI entry point
 */
function main(): void {
  try {
    const { values, positionals } = parseArgs({
      args: process.argv.slice(2),
      options: {
        write: { type: 'boolean', short: 'w', default: false },
        'currency-column': { type: 'string', short: 'c' },
        help: { type: 'boolean', short: 'h', default: false },
      },
      allowPositionals: true,
    })

    // Show help if requested
    if (values.help) {
      showHelp()
      process.exit(0)
    }

    // Validate that at least one file is provided
    if (positionals.length === 0) {
      console.error('Error: No files provided\n')
      showHelp(true)
      process.exit(1)
    }

    // Parse and validate currency column option
    let currencyColumn: number | null = null
    if (values['currency-column']) {
      const parsed = parseInt(values['currency-column'], 10)
      if (isNaN(parsed) || parsed < 0) {
        console.error(
          `Error: Invalid currency column value: ${values['currency-column']}`,
        )
        process.exit(1)
      }
      currencyColumn = parsed
    }

    // Process each file
    let hadErrors = false
    for (const filePath of positionals) {
      const success = formatFile(
        filePath,
        values.write ?? false,
        currencyColumn,
      )
      if (!success) {
        hadErrors = true
      }
    }

    // Exit with appropriate code
    process.exit(hadErrors ? 1 : 0)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Error: ${errorMessage}`)
    process.exit(1)
  }
}

// Run the CLI
main()
