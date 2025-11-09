import { Entry } from './Entry.mjs'

export class ParseResult {
  constructor(public entries: Entry[]) {}

  toString() {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return this.entries.map((e) => e.toString()).join('\n')
  }
}
