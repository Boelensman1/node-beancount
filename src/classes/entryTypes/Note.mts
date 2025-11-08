import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { parseString } from '../../utils/parseVal.mjs'
import { stringAwareParseLine } from '../../utils/stringAwareParseLine.mjs'

export class Note extends DateEntry {
  type = 'note' as const
  account!: string
  description!: string

  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const [account, description] = stringAwareParseLine(
      genericParseResult.header,
    )

    return new Note({
      ...genericParseResult.props,
      account,
      description: parseString(description),
    })
  }

  toString() {
    return `${this.getDateTypePrefix()} ${this.account} "${this.description}"${this.getMetaDataString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Note)
