import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertNodeConstructor } from '../Node.mjs'
import { DatedNode } from '../DatedNode.mjs'
import { parseString } from '../Value.mjs'
import { stringAwareParseLine } from '../../utils/stringAwareParseLine.mjs'

/**
 * Represents a Note node that attaches a comment to an account.
 * Note directives associate free-form text descriptions with accounts at specific dates.
 */
export class Note extends DatedNode {
  /** @inheritdoc */
  type = 'note' as const
  /** The account the note is attached to */
  account!: string
  /** The note description text */
  description!: string

  /**
   * Creates a Note instance from a generic parse result.
   * @param genericParseResult - The parsed note node data
   * @returns A new Note instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const [account, description] = stringAwareParseLine(
      genericParseResult.header,
    )

    return new Note({
      ...genericParseResult.props,
      account,
      description: parseString(description),
    })
  }

  /** @inheritdoc */
  toString() {
    return `${this.getDateTypePrefix()} ${this.account} "${this.description}"${this.getMetaDataString()}`
  }
}

// Ensure class conforms to NodeConstructor pattern
assertNodeConstructor(Note)
