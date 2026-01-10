import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertNodeConstructor } from '../Node.mjs'
import { DatedNode } from '../DatedNode.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'

/**
 * Represents a Pad node that automatically balances accounts.
 * Pad directives insert transactions to bring an account to a specific balance.
 */
export class Pad extends DatedNode {
  /** @inheritdoc */
  type = 'pad' as const
  /** The account to be padded/balanced */
  account!: string
  /** The source account to use for padding */
  accountPad!: string

  /**
   * Creates a Pad instance from a generic parse result.
   * @param genericParseResult - The parsed pad node data
   * @returns A new Pad instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const [account, accountPad] = simpleParseLine(genericParseResult.header)

    return new Pad({
      ...genericParseResult.props,
      account,
      accountPad,
    })
  }

  /** @inheritdoc */
  toString() {
    return `${this.getDateTypePrefix()} ${this.account} ${this.accountPad}${this.getMetaDataString()}`
  }
}

// Ensure class conforms to NodeConstructor pattern
assertNodeConstructor(Pad)
