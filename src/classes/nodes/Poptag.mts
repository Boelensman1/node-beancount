import type { GenericParseResult } from '../../genericParse.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'
import { assertNodeConstructor, Node } from '../Node.mjs'
import { Tag } from './Transaction/Tag.mjs'

/**
 * Represents a Poptag node that removes a tag from the tag stack.
 * Transactions after this will no longer inherit the popped tag.
 */
export class Poptag extends Node {
  /** @inheritdoc */
  type = 'poptag' as const
  /** The tag being popped from the stack */
  tag!: Tag

  /**
   * Creates a Poptag instance from a generic parse result.
   * @param genericParseResult - The parsed poptag node data
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

// Ensure class conforms to NodeConstructor pattern
assertNodeConstructor(Poptag)
