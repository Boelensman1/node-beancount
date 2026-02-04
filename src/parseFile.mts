import { parse } from './parse.mjs'
import { ParseResult } from './classes/ParseResult.mjs'
import type { Node } from './classes/Node.mjs'
import type { Include } from './classes/nodes/Include.mjs'
import {
  getDefaultFileSystemHelpers,
  type FileSystemHelpers,
} from './fileSystemHelpers.mjs'

/**
 * Options for parsing a Beancount file.
 */
export interface ParseFileOptions {
  /** When true, recursively parse files referenced by include directives */
  recurse?: boolean

  /**
   * File system helpers for reading files and handling paths.
   * Auto-detected in Node.js environments. Required for browser/edge runtimes.
   */
  fs?: FileSystemHelpers
}

export type { FileSystemHelpers }

/**
 * Parses a Beancount file from the filesystem.
 *
 * @param filepath - Path to the Beancount file to parse
 * @param options - Parsing options
 * @returns A ParseResult containing all parsed nodes
 *
 * @example
 * Basic usage (Node.js):
 * ```typescript
 * import { parseFile } from 'beancount'
 *
 * const result = await parseFile('/path/to/ledger.beancount')
 * ```
 *
 * @example
 * With recursive parsing of includes (Node.js):
 * ```typescript
 * const result = await parseFile('/path/to/main.beancount', { recurse: true })
 * // All nodes from included files are merged into the result
 * ```
 *
 * @example
 * Browser usage with fetch:
 * ```typescript
 * import { parseFile, type FileSystemHelpers } from 'beancount'
 *
 * const browserFS: FileSystemHelpers = {
 *   readFile: async (path) => {
 *     const response = await fetch(path)
 *     return response.text()
 *   },
 *   resolvePath: (path) => new URL(path, window.location.origin).pathname,
 *   resolveRelative: (base, rel) => {
 *     const baseDir = base.substring(0, base.lastIndexOf('/') + 1)
 *     return new URL(rel, window.location.origin + baseDir).pathname
 *   },
 *   dirname: (path) => path.substring(0, path.lastIndexOf('/')),
 * }
 *
 * const result = await parseFile('/api/ledger.beancount', {
 *   recurse: true,
 *   fs: browserFS,
 * })
 * ```
 *
 * @example
 * Deno usage:
 * ```typescript
 * import { parseFile, type FileSystemHelpers } from 'npm:beancount'
 *
 * const denoFS: FileSystemHelpers = {
 *   readFile: async (path) => await Deno.readTextFile(path),
 *   resolvePath: (path) => new URL(path, import.meta.url).pathname,
 *   resolveRelative: (base, rel) => {
 *     const baseDir = base.substring(0, base.lastIndexOf('/') + 1)
 *     return baseDir + rel
 *   },
 *   dirname: (path) => path.substring(0, path.lastIndexOf('/')),
 * }
 *
 * const result = await parseFile('./ledger.beancount', {
 *   recurse: true,
 *   fs: denoFS,
 * })
 * ```
 */
export const parseFile = async (
  filepath: string,
  options: ParseFileOptions = {},
): Promise<ParseResult> => {
  const { recurse = false, fs: customFS } = options

  // Get file system helpers (custom or default)
  const fsHelpers = customFS ?? (await getDefaultFileSystemHelpers())
  if (!fsHelpers) {
    throw new Error(
      'File system helpers are required. In non-Node.js environments, provide the "fs" option with readFile, resolvePath, resolveRelative, and dirname functions.',
    )
  }

  if (recurse) {
    return parseFileRecursive(filepath, new Set(), fsHelpers)
  }

  const content = await fsHelpers.readFile(filepath)
  return parse(content, filepath)
}

/**
 * Internal recursive parser that tracks visited files to prevent circular includes.
 * @param filepath - Path to the Beancount file to parse
 * @param visited - Set of already visited file paths (absolute)
 * @param fsHelpers - File system helpers for reading files and handling paths
 * @returns A ParseResult containing all parsed nodes
 */
const parseFileRecursive = async (
  filepath: string,
  visited: Set<string>,
  fsHelpers: FileSystemHelpers,
): Promise<ParseResult> => {
  const absolutePath = fsHelpers.resolvePath(filepath)

  // Skip already visited files (circular include protection)
  if (visited.has(absolutePath)) {
    return new ParseResult([])
  }

  visited.add(absolutePath)

  const content = await fsHelpers.readFile(absolutePath)
  const result = parse(content, absolutePath)

  const allNodes: Node[] = []
  const baseDir = fsHelpers.dirname(absolutePath)

  for (const node of result.nodes) {
    if (node.type === 'include') {
      const includeNode = node as Include
      const includePath = fsHelpers.resolveRelative(
        baseDir,
        includeNode.filename,
      )
      const includeResult = await parseFileRecursive(
        includePath,
        visited,
        fsHelpers,
      )
      allNodes.push(...includeResult.nodes)
    } else {
      allNodes.push(node)
    }
  }

  return new ParseResult(allNodes)
}
