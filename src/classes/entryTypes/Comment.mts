import type { GenericParseResult } from '../../genericParse.mjs'
import { assertEntryConstructor, Entry, EntryConstructor } from '../Entry.mjs'

export class Comment extends Entry {
  type = 'comment' as const

  static fromGenericParseResult(
    genericParseResult: GenericParseResult, // not a real genericParseResult
  ) {
    return new Comment({
      comment: genericParseResult.props.comment!,
    })
  }

  toString() {
    return this.comment
  }

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
