import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'

export class Pad extends DateEntry {
  type = 'pad' as const
  account!: string
  accountPad!: string

  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const [account, accountPad] = simpleParseLine(genericParseResult.header)

    return new Pad({
      ...genericParseResult.props,
      account,
      accountPad,
    })
  }

  toString() {
    return `${this.getDateTypePrefix()} ${this.account} ${this.accountPad}${this.getMetaDataString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Pad)
