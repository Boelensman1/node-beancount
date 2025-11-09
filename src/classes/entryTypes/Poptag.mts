import type { GenericParseResult } from '../../genericParse.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'
import { assertEntryConstructor, Entry } from '../Entry.mjs'
import { Tag } from './Transaction/Tag.mjs'

export class Poptag extends Entry {
  type = 'poptag' as const
  tag!: Tag

  static fromGenericParseResult(genericParseResult: GenericParseResult) {
    const [tagContent] = simpleParseLine(genericParseResult.header)

    return new Poptag({
      tag: new Tag({
        content: tagContent.trim().replace(/^#/, ''),
        fromStack: true,
      }),
    })
  }

  toString() {
    return `poptag #${this.tag.content}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Poptag)
