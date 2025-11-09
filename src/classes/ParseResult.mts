import { Entry } from './Entry.mjs'
import type { Transaction } from './entryTypes/index.mjs'

const defaultFormattingOptions = {
  width: 100,
}

export class ParseResult {
  constructor(public entries: Entry[]) {}

  toString() {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return this.entries.map((e) => e.toString()).join('\n')
  }

  toFormattedString(options = defaultFormattingOptions) {
    // TODO: calculate currencyColumn
    const currencyColumn = 59

    return this.entries
      .map((e) => e.toFormattedString({ currencyColumn }))
      .join('\n')
  }
}
