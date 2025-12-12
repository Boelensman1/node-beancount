import fs from 'node:fs/promises'
import path from 'node:path'
import { parse } from './parse.mjs'
import { ParseResult } from './classes/ParseResult.mjs'
import type { Entry } from './classes/Entry.mjs'
import type { Include } from './classes/entryTypes/Include.mjs'

/**
 * Options for parsing a Beancount file.
 */
export interface ParseFileOptions {
  /** When true, recursively parse files referenced by include directives */
  recurse?: boolean
}

/**
 * Parses a Beancount file from the filesystem.
 *
 * @param filepath - Path to the Beancount file to parse
 * @param options - Parsing options
 * @returns A ParseResult containing all parsed entries
 *
 * @example
 * Basic usage:
 * ```typescript
 * import { parseFile } from 'beancount'
 *
 * const result = await parseFile('/path/to/ledger.beancount')
 * ```
 *
 * @example
 * With recursive parsing of includes:
 * ```typescript
 * const result = await parseFile('/path/to/main.beancount', { recurse: true })
 * // All entries from included files are merged into the result
 * ```
 */
export const parseFile = async (
  filepath: string,
  options: ParseFileOptions = {},
): Promise<ParseResult> => {
  const { recurse = false } = options

  if (recurse) {
    return parseFileRecursive(filepath, new Set())
  }

  const content = await fs.readFile(filepath, 'utf-8')
  return parse(content)
}

/**
 * Internal recursive parser that tracks visited files to prevent circular includes.
 * @param filepath - Path to the Beancount file to parse
 * @param visited - Set of already visited file paths (absolute)
 * @returns A ParseResult containing all parsed entries
 */
const parseFileRecursive = async (
  filepath: string,
  visited: Set<string>,
): Promise<ParseResult> => {
  const absolutePath = path.resolve(filepath)

  // Skip already visited files (circular include protection)
  if (visited.has(absolutePath)) {
    return new ParseResult([])
  }

  visited.add(absolutePath)

  const content = await fs.readFile(absolutePath, 'utf-8')
  const result = parse(content)

  const allEntries: Entry[] = []
  const baseDir = path.dirname(absolutePath)

  for (const entry of result.entries) {
    if (entry.type === 'include') {
      const includeEntry = entry as Include
      const includePath = path.resolve(baseDir, includeEntry.filename)
      const includeResult = await parseFileRecursive(includePath, visited)
      allEntries.push(...includeResult.entries)
    } else {
      allEntries.push(entry)
    }
  }

  return new ParseResult(allEntries)
}
