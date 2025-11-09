import { genericParse } from '../../src/genericParse.mjs'
import { stringAwareSplitLine } from '../utils/stringAwareSplitLine.mjs'
import type { BeancountEntryType } from '../parse.mjs'

/**
 * Type helper for Entry class constructors that enforce the static factory methods.
 * Child classes must implement static fromGenericParseResult and fromObject methods to create instances.
 * Note: The constructor is protected, so only the static factory methods are part of the public API.
 */
export interface EntryConstructor<T extends Entry> {
  /**
   * Creates an Entry instance from a generic parse result.
   * @param parsedStart - The result from genericParse containing parsed entry data
   * @returns A new instance of the Entry subclass
   */
  fromGenericParseResult(parsedStart: ReturnType<typeof genericParse>): T
}

/**
 * Options for formatting Entry output.
 */
export interface FormatOptions {
  /** The column position where currency symbols should be aligned */
  currencyColumn: number
}

/**
 * Abstract base class for all Beancount entry types.
 *
 * Child classes must implement static `fromGenericParseResult` method
 */
export abstract class Entry {
  /** Optional comment text associated with this entry */
  comment?: string

  /** The type of this entry (e.g., 'open', 'close', 'transaction', 'comment', 'blankline') */
  abstract type: BeancountEntryType | 'comment' | 'blankline'

  /**
   * Creates a new Entry instance.
   * @param obj - Object containing entry properties
   */
  constructor(obj: Record<string, unknown>) {
    Object.assign(this, obj)
  }

  /**
   * Creates an Entry instance from a Beancount string.
   * Parses the input string and constructs the appropriate Entry subclass.
   *
   * @param input - A single Beancount entry as a string
   * @returns A new instance of the Entry subclass
   */
  static fromString<T extends Entry>(
    this: EntryConstructor<T>,
    input: string,
  ): T {
    const unparsedEntry = stringAwareSplitLine(input)
    const genericParseResult = genericParse(unparsedEntry)
    const result = this.fromGenericParseResult(genericParseResult)
    if (result.type !== genericParseResult.type) {
      console.warn(
        'Parse result type is not equal to requested object type, make sure the correct class is initiated',
      )
    }
    return result
  }

  /**
   * Converts this entry to a formatted string with aligned columns.
   * Default implementation delegates to toString(). Subclasses can override for custom formatting.
   *
   * @param _formatOptions - Formatting options (unused in base implementation)
   * @returns The formatted string representation of this entry
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toFormattedString(_formatOptions: FormatOptions) {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return this.toString()
  }
}

/**
 * Type assertion helper to ensure a class conforms to EntryConstructor.
 * Usage: assertEntryConstructor(MyEntryClass)
 * @param _ctor - The constructor to validate (unused at runtime)
 * @internal
 */
export function assertEntryConstructor<T extends Entry>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ctor: EntryConstructor<T>,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
