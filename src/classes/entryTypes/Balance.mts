import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor, FormatOptions } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'
import { formatPrice } from '../../utils/formatPrice.mjs'

export class Balance extends DateEntry {
  type = 'balance' as const
  account!: string
  amount!: string
  currency!: string

  get price(): string | undefined {
    return formatPrice(this.amount, this.currency)
  }

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

  toString() {
    return this.toFormattedString({ currencyColumn: 0 })
  }

  toFormattedString(formatOptions: FormatOptions) {
    const firstPart = `${this.getDateTypePrefix()} ${this.account}`

    const paddingLength =
      formatOptions.currencyColumn - firstPart.length - this.amount.length - 2 // not sure what this is for
    const padding = ' '.repeat(Math.max(1, paddingLength))

    return [firstPart, padding, this.price, this.getMetaDataString()].join('')
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Balance)
