import type { GenericParseResult } from '../../genericParse.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'
import { assertEntryConstructor, Entry } from '../Entry.mjs'
import { Tag } from './Transaction/Tag.mjs'

/**
 * Represents a Poptag entry that removes a tag from the tag stack.
 * Transactions after this will no longer inherit the popped tag.
 */
export class Poptag extends Entry {
  /** @inheritdoc */
  type = 'poptag' as const
  /** The tag being popped from the stack */
  tag!: Tag

  /**
   * Creates a Poptag instance from a generic parse result.
   * @param genericParseResult - The parsed poptag entry data
   * @returns A new Poptag instance
   */
  static fromGenericParseResult(genericParseResult: GenericParseResult) {
    const [tagContent] = simpleParseLine(genericParseResult.header)

    return new Poptag({
      tag: new Tag({
        content: tagContent.trim().replace(/^#/, ''),
        fromStack: true,
      }),
    })
  }

  /** @inheritdoc */
  toString() {
    return `poptag #${this.tag.content}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Poptag)
