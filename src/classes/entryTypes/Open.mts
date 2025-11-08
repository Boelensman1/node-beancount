import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'
import { parseString } from '../Value.mjs'

export class Open extends DateEntry {
  type = 'open' as const
  account!: string
  constraintCurrencies?: string[]
  bookingMethod?: string

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

  toString() {
    const parts = [`${this.getDateTypePrefix()} ${this.account}`]
    if (this.constraintCurrencies !== undefined) {
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
