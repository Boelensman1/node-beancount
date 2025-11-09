import { Entry } from './Entry.mjs'

/**
 * Container class for parsed Beancount entries.
 * Provides methods for converting entries back to string format.
 */
export class ParseResult {
  /**
   * Creates a new ParseResult instance.
   * @param entries - Array of parsed Entry objects
   */
  constructor(public entries: Entry[]) {}

  /**
   * Converts all entries to their string representation.
   * Each entry is converted using its toString() method and joined with newlines.
   * @returns The complete Beancount file content as a string
   */
  toString() {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return this.entries.map((e) => e.toString()).join('\n')
  }

  /**
   * Converts all entries to a formatted string with aligned columns.
   * Uses each entry's toFormattedString() method for consistent formatting.
   *
   * @returns The formatted Beancount file content as a string
   */
  toFormattedString() {
    // TODO: calculate currencyColumn
    const currencyColumn = 59

    return this.entries
      .map((e) => e.toFormattedString({ currencyColumn }))
      .join('\n')
  }
}
