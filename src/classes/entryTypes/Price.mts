import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'
import { formatPrice } from '../../utils/formatPrice.mjs'

/**
 * Represents a Price entry that records the price of a commodity.
 * Price directives establish the exchange rate between a commodity and a currency.
 */
export class Price extends DateEntry {
  /** @inheritdoc */
  type = 'price' as const
  /** The commodity being priced */
  commodity!: string
  /** The currency the price is expressed in */
  currency!: string
  /** The price amount */
  amount!: string

  /**
   * Gets the formatted price string (amount + currency).
   * @returns The formatted price string
   */
  get price(): string | undefined {
    return formatPrice(this.amount, this.currency)
  }

  /**
   * Creates a Price instance from a generic parse result.
   * @param genericParseResult - The parsed price entry data
   * @returns A new Price instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const [commodity, amount, currency] = simpleParseLine(
      genericParseResult.header,
    )

    return new Price({
      ...genericParseResult.props,
      commodity,
      currency,
      amount,
    })
  }

  /** @inheritdoc */
  toString() {
    return `${this.getDateTypePrefix()} ${this.commodity} ${this.amount} ${this.currency}${this.getMetaDataString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Price)
