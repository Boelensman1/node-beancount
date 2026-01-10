import type { GenericParseResult } from '../../genericParse.mjs'
import { assertNodeConstructor, Node, NodeConstructor } from '../Node.mjs'

/**
 * Represents a Comment line in a Beancount file.
 * Comments are lines that start with a semicolon or hash and are ignored by the parser.
 */
export class Comment extends Node {
  /** @inheritdoc */
  type = 'comment' as const

  /**
   * Creates a Comment instance from a generic parse result.
   * Note: This doesn't use a real GenericParseResult structure.
   * @param genericParseResult - The parsed comment data
   * @returns A new Comment instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResult, // not a real genericParseResult
  ) {
    return new Comment({
      comment: genericParseResult.header,
    })
  }

  /** @inheritdoc */
  toString() {
    return this.comment
  }

  /**
   * Creates a Comment instance directly from a string.
   * @param input - The comment text
   * @returns A new Comment instance
   */
  static fromString<T extends Node>(
    this: NodeConstructor<T>,
    input: string,
  ): T {
    return this.fromGenericParseResult({
      type: 'comment',
      header: input,
      props: {},
      synthetic: true,
    })
  }
}

// Ensure class conforms to NodeConstructor pattern
assertNodeConstructor(Comment)
