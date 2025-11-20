import { EntryType, entryTypeToClass } from '../entryTypeToClass.mjs'
import { Entry } from './Entry.mjs'

export interface ParseResultObj {
  entries: { type: EntryType }[]
}

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

  /**
   * Creates an ParseResult instance from JSON data.
   * Calls fromJSONData to allow subclasses to transform the data before construction.
   *
   * @param jsonString - JSON data representing an ParseResult
   * @remarks **Warning:** No validation is performed on the JSON input. We assume the JSON is valid and well-formed.
   * @returns A new instance of ParseResult loaded with the data in the JSON
   */
  static fromJSON(jsonString: string) {
    return ParseResult.fromJSONData(JSON.parse(jsonString) as ParseResultObj)
  }

  /**
   * Creates a ParseResult instance from a plain JavaScript object.
   * Deserializes each entry by mapping it to the appropriate Entry class based on its type.
   *
   * @param obj - Plain object representation of a ParseResult
   * @returns A new ParseResult instance with deserialized entries
   * @throws {Error} If an entry has an unknown type with no corresponding entry class
   * @remarks **Warning:** No validation is performed on the input object. We assume the object is valid and well-formed.
   */
  static fromJSONData(obj: ParseResultObj) {
    const objEntries = obj.entries
    const entries = objEntries.map((objEntry) => {
      const { type } = objEntry
      const EntryClass = entryTypeToClass[type]
      if (!EntryClass) {
        throw new Error(`No entryclass found for type ${type}`)
      }
      // Type assertion needed because TypeScript can't verify that all entry classes
      // in the union type have compatible constructor signatures
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return (EntryClass as any).fromJSONData(objEntry) as Entry
    })

    return new ParseResult(entries)
  }
}
