import { formatPrice } from '../../../utils/formatPrice.mjs'
import { defaultFormatOptions, FormatOptions } from '../../ParseResult.mjs'

/**
 * Represents a single posting (account movement) within a transaction.
 * Each posting records an amount moving to/from an account.
 */
export class Posting {
  /** Optional posting flag (e.g., '*' for cleared) */
  flag?: string
  /** The account name for this posting */
  account!: string
  /** The amount as a string (may be omitted for auto-calculated postings) */
  amount?: string
  /** The currency code for the amount */
  currency?: string
  /** Optional cost specification (e.g., for currency conversions) */
  cost?: string
  /** Currency for the price annotation */
  priceCurrency?: string
  /** Amount for the price annotation */
  priceAmount?: string
  /** Optional comment for this posting */
  comment?: string

  /**
   * Creates a new Posting instance.
   * @param obj - Object containing posting properties
   */
  constructor(obj: Record<string, unknown>) {
    Object.assign(this, obj)
  }

  /**
   * Parses a posting line string into a Posting instance.
   * Expected format: [Flag] Account [Amount Currency] [{Cost}] [@ PriceAmount PriceCurrency] [; Comment]
   *
   * @param unparsedline - The posting line string to parse
   * @returns A new Posting instance
   * @throws {Error} If the posting line cannot be parsed
   */
  static fromString(unparsedline: string) {
    // [Flag] Account Amount [Currency] [{Cost}] [@ Price]
    const flagPattern = `([^ ]) +`
    const accountPattern = `([^ ]*)`

    const amountPattern = `([^A-Z;]*)`
    const currencyPattern = `(\\w+)`
    const costPattern = `{(.*)}`
    const pricePattern = `+@ +(?:(\\d+\\.?\\d*) (\\w+))`
    const amountCurrenyCostPattern = `${amountPattern}(?: +${currencyPattern})?(?: +${costPattern})?(?: ${pricePattern})?`
    const commentPattern = `( *;.*)?`

    const pattern = `^(?:${flagPattern})?${accountPattern}(?: +${amountCurrenyCostPattern})?${commentPattern}$`

    const matches = RegExp(pattern).exec(unparsedline)

    if (!matches) {
      throw new Error('Could not parse posting')
    }
    const [
      ,
      flag,
      account,
      amount,
      currency,
      cost,
      priceAmount,
      priceCurrency,
      comment,
    ] = matches

    return new Posting({
      flag: flag,
      account: account?.trim(),
      amount: amount?.trim().length > 0 ? amount.trim() : undefined,
      currency: currency?.trim(),
      cost: cost?.trim(),
      priceAmount: priceAmount?.trim(),
      priceCurrency: priceCurrency?.trim(),
      comment: comment?.replace(/^ *;/, '').trim(),
    })
  }

  /**
   * Gets the formatted price string combining amount, currency, cost, and price annotation.
   * @returns The formatted price string, or undefined if no price components exist
   */
  get price(): string | undefined {
    return formatPrice(
      this.amount,
      this.currency,
      this.cost,
      this.priceAmount,
      this.priceCurrency,
    )
  }

  /**
   * Converts this posting to a string representation.
   * Delegates to toFormattedString with zero currency column alignment.
   *
   * @returns The string representation of this posting
   */
  toString() {
    return this.toFormattedString({ currencyColumn: 0 })
  }

  /**
   * Converts this posting to a formatted string with aligned currency column.
   * Adds padding before the price to align at the specified column.
   *
   * @param formatOptions - Formatting options including currency column position
   * @returns The formatted string representation of this posting
   */
  toFormattedString(formatOptions: FormatOptions = defaultFormatOptions) {
    const parts: string[] = []
    if (this.flag !== undefined) {
      parts.push(this.flag)
    }
    parts.push(this.account)

    if (this.price !== undefined) {
      const paddingLength =
        formatOptions.currencyColumn -
        parts.join(' ').length -
        this.amount!.length -
        2 - // indent
        2 - // spacing
        2 // not sure what this is for

      if (paddingLength > 0) {
        parts.push(' '.repeat(paddingLength))
      }

      parts.push(this.price)
    }
    if (this.comment !== undefined) {
      parts.push(';', this.comment)
    }
    return parts.join(' ')
  }
}
