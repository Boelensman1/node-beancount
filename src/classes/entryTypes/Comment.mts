import type { GenericParseResult } from '../../genericParse.mjs'
import { assertEntryConstructor, Entry, EntryConstructor } from '../Entry.mjs'

/**
 * Represents a Comment line in a Beancount file.
 * Comments are lines that start with a semicolon or hash and are ignored by the parser.
 */
export class Comment extends Entry {
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
      comment: genericParseResult.props.comment!,
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
  static fromString<T extends Entry>(
    this: EntryConstructor<T>,
    input: string,
  ): T {
    return this.fromGenericParseResult({
      props: { comment: input },
    } as GenericParseResult)
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Comment)
