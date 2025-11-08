import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'

export class Close extends DateEntry {
  type = 'close' as const
  account!: string

  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const account = genericParseResult.header.trim()

    return new Close({
      ...genericParseResult.props,
      account,
    })
  }

  toString() {
    return `${this.getDateTypePrefix()} ${this.account}${this.getMetaDataString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Close)
