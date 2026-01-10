import type { GenericParseResult } from '../../genericParse.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'
import { assertNodeConstructor, Node } from '../Node.mjs'
import { Tag } from './Transaction/Tag.mjs'

/**
 * Represents a Pushtag node that pushes a tag onto the tag stack.
 * Subsequent transactions will automatically inherit this tag until it's popped.
 */
export class Pushtag extends Node {
  /** @inheritdoc */
  type = 'pushtag' as const
  /** The tag being pushed onto the stack */
  tag!: Tag

  /**
   * Creates a Pushtag instance from a generic parse result.
   * @param genericParseResult - The parsed pushtag node data
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

// Ensure class conforms to NodeConstructor pattern
assertNodeConstructor(Pushtag)
