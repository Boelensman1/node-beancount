import type { GenericParseResult } from '../../genericParse.mjs'
import { assertEntryConstructor, Entry, EntryConstructor } from '../Entry.mjs'

export class Blankline extends Entry {
  type = 'blankline' as const

  static fromGenericParseResult(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _genericParseResult: GenericParseResult,
  ) {
    return new Blankline({})
  }

  toString() {
    return ''
  }

  static fromString<T extends Entry>(
    this: EntryConstructor<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _input: string,
  ): T {
    return this.fromGenericParseResult({} as GenericParseResult)
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Blankline)
