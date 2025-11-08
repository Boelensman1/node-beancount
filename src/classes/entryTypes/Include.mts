import type { GenericParseResult } from '../../genericParse.mjs'
import { parseString } from '../../utils/parseVal.mjs'
import { stringAwareParseLine } from '../../utils/stringAwareParseLine.mjs'
import { assertEntryConstructor, Entry } from '../Entry.mjs'

export class Include extends Entry {
  type = 'include' as const
  filename!: string

  static fromGenericParseResult(genericParseResult: GenericParseResult) {
    const [filename] = stringAwareParseLine(genericParseResult.header)

    return new Include({
      filename: parseString(filename),
    })
  }

  toString() {
    return `${this.type} "${this.filename}"`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Include)
