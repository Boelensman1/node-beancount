import type { GenericParseResult } from '../../genericParse.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'
import { assertEntryConstructor, Entry } from '../Entry.mjs'
import { Tag } from './Transaction/Tag.mjs'

export class Pushtag extends Entry {
  type = 'pushtag' as const
  tag!: Tag

  static fromGenericParseResult(genericParseResult: GenericParseResult) {
    const [tagContent] = simpleParseLine(genericParseResult.header)

    return new Pushtag({
      tag: new Tag({
        content: tagContent.trim().replace(/^#/, ''),
        fromStack: true,
      }),
    })
  }

  toString() {
    return `${this.type} #${this.tag.content}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Pushtag)
