import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'

export class Commodity extends DateEntry {
  type = 'commodity' as const
  currency!: string

  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const currency = genericParseResult.header.trim()

    return new Commodity({
      ...genericParseResult.props,
      currency,
    })
  }

  toString() {
    return `${this.getDateTypePrefix()} ${this.currency}${this.getMetaDataString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Commodity)
