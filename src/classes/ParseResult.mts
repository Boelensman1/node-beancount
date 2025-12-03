import { EntryType, entryTypeToClass } from '../entryTypeToClass.mjs'
import { Entry } from './Entry.mjs'
import { Posting } from './entryTypes/Transaction/Posting.mjs'

export interface ParseResultObj {
  entries: { type: EntryType }[]
}

/**
 * Options for formatting output.
 */
export interface FormatOptions {
  /** The column position where currency symbols should be aligned */
  currencyColumn: number
}

export const defaultFormatOptions = {
  currencyColumn: 59,
}

/**
 * Options for calculating the optimal currency column position.
 */
export interface CalculateCurrencyColumnOptions {
  /** Override the maximum left part length (flag + account name) */
  maxLeftPartLength?: number
  /** Override the maximum amount length */
  maxAmountLength?: number
  /** Minimum padding between account and amount (default: 3) */
  minPadding?: number
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
   * Gets all transaction entries from the parsed entries.
   * @returns Array of entries that are transactions
   */
  get transactions() {
    return this.entries.filter((entry) => entry.type === 'transaction')
  }

  /**
   * Gets all balance entries from the parsed entries.
   * @returns Array of entries that are balance directives
   */
  get balance() {
    return this.entries.filter((entry) => entry.type === 'balance')
  }

  /**
   * Gets all close entries from the parsed entries.
   * @returns Array of entries that are close directives
   */
  get close() {
    return this.entries.filter((entry) => entry.type === 'close')
  }

  /**
   * Gets all commodity entries from the parsed entries.
   * @returns Array of entries that are commodity directives
   */
  get commodity() {
    return this.entries.filter((entry) => entry.type === 'commodity')
  }

  /**
   * Gets all custom entries from the parsed entries.
   * @returns Array of entries that are custom directives
   */
  get custom() {
    return this.entries.filter((entry) => entry.type === 'custom')
  }

  /**
   * Gets all document entries from the parsed entries.
   * @returns Array of entries that are document directives
   */
  get document() {
    return this.entries.filter((entry) => entry.type === 'document')
  }

  /**
   * Gets all event entries from the parsed entries.
   * @returns Array of entries that are event directives
   */
  get event() {
    return this.entries.filter((entry) => entry.type === 'event')
  }

  /**
   * Gets all include entries from the parsed entries.
   * @returns Array of entries that are include directives
   */
  get include() {
    return this.entries.filter((entry) => entry.type === 'include')
  }

  /**
   * Gets all note entries from the parsed entries.
   * @returns Array of entries that are note directives
   */
  get note() {
    return this.entries.filter((entry) => entry.type === 'note')
  }

  /**
   * Gets all open entries from the parsed entries.
   * @returns Array of entries that are open directives
   */
  get open() {
    return this.entries.filter((entry) => entry.type === 'open')
  }

  /**
   * Gets all option entries from the parsed entries.
   * @returns Array of entries that are option directives
   */
  get option() {
    return this.entries.filter((entry) => entry.type === 'option')
  }

  /**
   * Gets all pad entries from the parsed entries.
   * @returns Array of entries that are pad directives
   */
  get pad() {
    return this.entries.filter((entry) => entry.type === 'pad')
  }

  /**
   * Gets all plugin entries from the parsed entries.
   * @returns Array of entries that are plugin directives
   */
  get plugin() {
    return this.entries.filter((entry) => entry.type === 'plugin')
  }

  /**
   * Gets all poptag entries from the parsed entries.
   * @returns Array of entries that are poptag directives
   */
  get poptag() {
    return this.entries.filter((entry) => entry.type === 'poptag')
  }

  /**
   * Gets all price entries from the parsed entries.
   * @returns Array of entries that are price directives
   */
  get price() {
    return this.entries.filter((entry) => entry.type === 'price')
  }

  /**
   * Gets all pushtag entries from the parsed entries.
   * @returns Array of entries that are pushtag directives
   */
  get pushtag() {
    return this.entries.filter((entry) => entry.type === 'pushtag')
  }

  /**
   * Gets all query entries from the parsed entries.
   * @returns Array of entries that are query directives
   */
  get query() {
    return this.entries.filter((entry) => entry.type === 'query')
  }

  /**
   * Gets all comment entries from the parsed entries.
   * @returns Array of entries that are comments
   */
  get comment() {
    return this.entries.filter((entry) => entry.type === 'comment')
  }

  /**
   * Gets all blankline entries from the parsed entries.
   * @returns Array of entries that are blank lines
   */
  get blankline() {
    return this.entries.filter((entry) => entry.type === 'blankline')
  }

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
   * @param formatOptions - Formatting options
   *
   * @returns The formatted Beancount file content as a string
   */
  toFormattedString(formatOptions: FormatOptions = defaultFormatOptions) {
    return this.entries
      .map((e) => e.toFormattedString(formatOptions))
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

  /**
   * Calculates the optimal currency column position for formatting.
   *
   * The currency column is determined by analyzing all postings across transactions
   * and finding the maximum widths needed for account names and amounts.
   *
   * Formula: currencyColumn = maxLeftPartLength + maxAmountLength + minPadding + 6
   *
   * Where:
   * - maxLeftPartLength = max((flag.length + 1 if flag) + account.length)
   * - maxAmountLength = max(amount.length) for all postings with amounts
   * - minPadding = desired minimum spaces between account and amount (default: 2)
   * - 6 = fixed overhead (2 for indent + 2 for spacing + 2 for buffer)
   *
   * @param options - Optional configuration for the calculation
   * @returns The calculated currency column position (1-indexed)
   *
   * @example
   * ```typescript
   * const parseResult = parse(beancountString)
   * const currencyColumn = parseResult.calculateCurrencyColumn()
   * const formatted = parseResult.toFormattedString({ currencyColumn })
   * ```
   */
  calculateCurrencyColumn(
    options: CalculateCurrencyColumnOptions = {},
  ): number {
    const {
      maxLeftPartLength: overrideMaxLeft,
      maxAmountLength: overrideMaxAmount,
      minPadding = 3,
    } = options

    // Ensure minPadding is at least 1
    const effectiveMinPadding = Math.max(1, minPadding)

    // Get all transactions
    const transactions = this.transactions

    // Edge case: No transactions
    if (transactions.length === 0) {
      return defaultFormatOptions.currencyColumn
    }

    // Extract all postings
    const allPostings: Posting[] = []
    for (const entry of transactions) {
      if ('postings' in entry && Array.isArray(entry.postings)) {
        allPostings.push(...(entry.postings as Posting[]))
      }
    }

    // Edge case: No postings
    if (allPostings.length === 0) {
      return defaultFormatOptions.currencyColumn
    }

    // Calculate maxLeftPartLength (flag + account)
    let maxLeftPartLength = overrideMaxLeft ?? 0
    if (overrideMaxLeft === undefined) {
      for (const posting of allPostings) {
        let leftPartLength = posting.account.length
        if (posting.flag !== undefined) {
          leftPartLength += posting.flag.length + 1
        }
        maxLeftPartLength = Math.max(maxLeftPartLength, leftPartLength)
      }
    }

    // Calculate maxAmountLength
    let maxAmountLength = overrideMaxAmount ?? 0
    if (overrideMaxAmount === undefined) {
      for (const posting of allPostings) {
        if (posting.amount !== undefined) {
          maxAmountLength = Math.max(maxAmountLength, posting.amount.length)
        }
      }
    }

    // Calculate and return currency column
    return maxLeftPartLength + maxAmountLength + effectiveMinPadding + 6
  }
}
