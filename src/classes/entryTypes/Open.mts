import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'
import { parseString } from '../Value.mjs'
import { defaultFormatOptions, FormatOptions } from '../ParseResult.mjs'

/**
 * Represents an Open entry that declares a new account.
 * Open directives define the beginning of an account's lifespan.
 */
export class Open extends DateEntry {
  /** @inheritdoc */
  type = 'open' as const
  /** The account name being opened */
  account!: string
  /** Optional list of allowed currencies for this account */
  constraintCurrencies?: string[]
  /** Optional booking method specification */
  bookingMethod?: string

  /**
   * Creates an Open instance from a generic parse result.
   * @param genericParseResult - The parsed open entry data
   * @returns A new Open instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const [account, ...other] = simpleParseLine(genericParseResult.header)

    let constraintCurrencies, bookingMethod
    if (other.length === 2) {
      constraintCurrencies = other[0]
      bookingMethod = parseString(other[1])
    } else if (other.length === 1) {
      if (other[0].startsWith('"') && other[0].endsWith('"')) {
        bookingMethod = parseString(other[0])
      } else {
        constraintCurrencies = other[0]
      }
    }

    return new Open({
      ...genericParseResult.props,
      account,
      constraintCurrencies: constraintCurrencies?.split(','),
      bookingMethod,
    })
  }

  /** @inheritdoc */
  toString() {
    return this.toFormattedString({ currencyColumn: 0 })
  }

  /** @inheritdoc */
  toFormattedString(formatOptions: FormatOptions = defaultFormatOptions) {
    const parts = [`${this.getDateTypePrefix()} ${this.account}`]

    if (this.constraintCurrencies !== undefined) {
      const paddingLength =
        formatOptions.currencyColumn -
        parts.join(' ').length -
        this.constraintCurrencies.join(',').length

      if (paddingLength > 0) {
        parts.push(' '.repeat(paddingLength))
      }

      parts.push(this.constraintCurrencies.join(','))
    }
    if (this.bookingMethod !== undefined) {
      parts.push(`"${this.bookingMethod}"`)
    }
    return parts.join(' ') + this.getMetaDataString()
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Open)
