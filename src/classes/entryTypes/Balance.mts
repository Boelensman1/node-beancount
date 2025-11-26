import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'
import { formatPrice } from '../../utils/formatPrice.mjs'
import { defaultFormatOptions, FormatOptions } from '../ParseResult.mjs'

/**
 * Represents a Balance assertion entry.
 * Balance directives assert that an account has a specific balance at a given date.
 */
export class Balance extends DateEntry {
  /** @inheritdoc */
  type = 'balance' as const
  /** The account name for the balance assertion */
  account!: string
  /** The expected amount */
  amount!: string
  /** The currency of the amount */
  currency!: string

  /**
   * Gets the formatted price string (amount + currency).
   * @returns The formatted price string
   */
  get price(): string | undefined {
    return formatPrice(this.amount, this.currency)
  }

  /**
   * Creates a Balance instance from a generic parse result.
   * @param genericParseResult - The parsed balance entry data
   * @returns A new Balance instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const [account, amount, currency] = simpleParseLine(
      genericParseResult.header,
    )

    return new Balance({
      ...genericParseResult.props,
      account,
      amount,
      currency,
    })
  }

  /** @inheritdoc */
  toString() {
    return this.toFormattedString({ currencyColumn: 0 })
  }

  /** @inheritdoc */
  toFormattedString(formatOptions: FormatOptions = defaultFormatOptions) {
    const firstPart = `${this.getDateTypePrefix()} ${this.account}`

    const paddingLength =
      formatOptions.currencyColumn - firstPart.length - this.amount.length - 2 // not sure what this is for
    const padding = ' '.repeat(Math.max(1, paddingLength))

    return [firstPart, padding, this.price, this.getMetaDataString()].join('')
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Balance)
