/**
 * File system operations interface for platform-agnostic file reading and path handling.
 */
export interface FileSystemHelpers {
  /** Read file contents as UTF-8 string */
  readFile: (filepath: string) => Promise<string>

  /** Resolve a path to absolute form (like path.resolve(filepath)) */
  resolvePath: (filepath: string) => string

  /** Resolve a relative path against a base (like path.resolve(base, rel)) */
  resolveRelative: (base: string, relative: string) => string

  /** Extract directory from a file path (like path.dirname(filepath)) */
  dirname: (filepath: string) => string
}

/**
 * Get default file system helpers for Node.js environments.
 * Returns null if not in a Node.js environment.
 *
 * Uses dynamic imports to detect Node.js availability without
 * requiring node:fs and node:path at module load time.
 *
 * @returns FileSystemHelpers object or null if not in Node.js
 */
export async function getDefaultFileSystemHelpers(): Promise<FileSystemHelpers | null> {
  try {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')

    return {
      /**
       * Read file contents as UTF-8 string
       * @param filepath - Path to file
       * @returns File contents
       */
      readFile: async (filepath: string) => {
        return await fs.readFile(filepath, 'utf-8')
      },
      /**
       * Resolve a path to absolute form
       * @param filepath - Path to resolve
       * @returns Absolute path
       */
      resolvePath: (filepath: string) => {
        return path.resolve(filepath)
      },
      /**
       * Resolve a relative path against a base
       * @param base - Base path
       * @param relative - Relative path
       * @returns Resolved path
       */
      resolveRelative: (base: string, relative: string) => {
        return path.resolve(base, relative)
      },
      /**
       * Get directory from file path
       * @param filepath - File path
       * @returns Directory path
       */
      dirname: (filepath: string) => {
        return path.dirname(filepath)
      },
    }
  } catch {
    // Not in Node.js environment or modules not available
    return null
  }
}
