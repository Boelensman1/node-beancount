import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
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
    return `${this.getDateTypePrefix()} ${this.account} ${this.price}${this.getMetaDataString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Balance)
