import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'

/**
 * Represents a Pad entry that automatically balances accounts.
 * Pad directives insert transactions to bring an account to a specific balance.
 */
export class Pad extends DateEntry {
  /** @inheritdoc */
  type = 'pad' as const
  /** The account to be padded/balanced */
  account!: string
  /** The source account to use for padding */
  accountPad!: string

  /**
   * Creates a Pad instance from a generic parse result.
   * @param genericParseResult - The parsed pad entry data
   * @returns A new Pad instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const [account, accountPad] = simpleParseLine(genericParseResult.header)

    return new Pad({
      ...genericParseResult.props,
      account,
      accountPad,
    })
  }

  /** @inheritdoc */
  toString() {
    return `${this.getDateTypePrefix()} ${this.account} ${this.accountPad}${this.getMetaDataString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Pad)
