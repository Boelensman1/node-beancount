import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'

/**
 * Represents a Commodity declaration entry.
 * Commodity directives declare the existence of a commodity/currency with metadata.
 */
export class Commodity extends DateEntry {
  /** @inheritdoc */
  type = 'commodity' as const
  /** The currency/commodity code being declared */
  currency!: string

  /**
   * Creates a Commodity instance from a generic parse result.
   * @param genericParseResult - The parsed commodity entry data
   * @returns A new Commodity instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const currency = genericParseResult.header.trim()

    return new Commodity({
      ...genericParseResult.props,
      currency,
    })
  }

  /** @inheritdoc */
  toString() {
    return `${this.getDateTypePrefix()} ${this.currency}${this.getMetaDataString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Commodity)
