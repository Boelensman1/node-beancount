import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'

/**
 * Represents a Close entry that closes an account.
 * Close directives mark the end of an account's lifespan.
 */
export class Close extends DateEntry {
  /** @inheritdoc */
  type = 'close' as const
  /** The account name being closed */
  account!: string

  /**
   * Creates a Close instance from a generic parse result.
   * @param genericParseResult - The parsed close entry data
   * @returns A new Close instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const account = genericParseResult.header.trim()

    return new Close({
      ...genericParseResult.props,
      account,
    })
  }

  /** @inheritdoc */
  toString() {
    return `${this.getDateTypePrefix()} ${this.account}${this.getMetaDataString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Close)
