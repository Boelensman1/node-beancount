import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'
import { formatPrice } from '../../utils/formatPrice.mjs'

export class Price extends DateEntry {
  type = 'price' as const
  commodity!: string
  currency!: string
  amount!: string

  get price(): string | undefined {
    return formatPrice(this.amount, this.currency)
  }

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

  toString() {
    return `${this.getDateTypePrefix()} ${this.commodity} ${this.amount} ${this.currency}${this.getMetaDataString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Price)
