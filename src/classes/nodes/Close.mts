import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertNodeConstructor } from '../Node.mjs'
import { DatedNode } from '../DatedNode.mjs'

/**
 * Represents a Close node that closes an account.
 * Close directives mark the end of an account's lifespan.
 */
export class Close extends DatedNode {
  /** @inheritdoc */
  type = 'close' as const
  /** The account name being closed */
  account!: string

  /**
   * Creates a Close instance from a generic parse result.
   * @param genericParseResult - The parsed close node data
   * @returns A new Close instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const account = genericParseResult.header.trim()

    return new Close({
      ...genericParseResult.props,
      account,
    })
  }

  /** @inheritdoc */
  toString() {
    return `${this.getDateTypePrefix()} ${this.account}${this.getMetaDataString()}`
  }
}

// Ensure class conforms to NodeConstructor pattern
assertNodeConstructor(Close)
