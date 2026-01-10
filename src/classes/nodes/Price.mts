import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertNodeConstructor } from '../Node.mjs'
import { DatedNode } from '../DatedNode.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'
import { formatPrice } from '../../utils/formatPrice.mjs'
import { defaultFormatOptions, FormatOptions } from '../ParseResult.mjs'

/**
 * Represents a Price node that records the price of a commodity.
 * Price directives establish the exchange rate between a commodity and a currency.
 */
export class Price extends DatedNode {
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
   * @param genericParseResult - The parsed price node data
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
    return this.toFormattedString({ currencyColumn: 0 })
  }

  /** @inheritdoc */
  toFormattedString(formatOptions: FormatOptions = defaultFormatOptions) {
    const parts: string[] = [this.getDateTypePrefix(), this.commodity]

    const paddingLength =
      formatOptions.currencyColumn -
      parts.join(' ').length -
      this.amount.length -
      2 - // indent
      2 // spacing

    if (paddingLength > 0) {
      parts.push(' '.repeat(paddingLength))
    }

    parts.push(this.amount, `${this.currency}${this.getMetaDataString()}`)

    return parts.join(' ')
  }
}

// Ensure class conforms to NodeConstructor pattern
assertNodeConstructor(Price)
