import type { GenericParseResult } from '../../genericParse.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'
import { assertEntryConstructor, Entry } from '../Entry.mjs'
import { Tag } from './Transaction/Tag.mjs'

/**
 * Represents a Pushtag entry that pushes a tag onto the tag stack.
 * Subsequent transactions will automatically inherit this tag until it's popped.
 */
export class Pushtag extends Entry {
  /** @inheritdoc */
  type = 'pushtag' as const
  /** The tag being pushed onto the stack */
  tag!: Tag

  /**
   * Creates a Pushtag instance from a generic parse result.
   * @param genericParseResult - The parsed pushtag entry data
   * @returns A new Pushtag instance
   */
  static fromGenericParseResult(genericParseResult: GenericParseResult) {
    const [tagContent] = simpleParseLine(genericParseResult.header)

    return new Pushtag({
      tag: new Tag({
        content: tagContent.trim().replace(/^#/, ''),
        fromStack: true,
      }),
    })
  }

  /** @inheritdoc */
  toString() {
    return `${this.type} #${this.tag.content}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Pushtag)
