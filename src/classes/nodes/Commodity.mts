import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertNodeConstructor } from '../Node.mjs'
import { DatedNode } from '../DatedNode.mjs'

/**
 * Represents a Commodity declaration node.
 * Commodity directives declare the existence of a commodity/currency with metadata.
 */
export class Commodity extends DatedNode {
  /** @inheritdoc */
  type = 'commodity' as const
  /** The currency/commodity code being declared */
  currency!: string

  /**
   * Creates a Commodity instance from a generic parse result.
   * @param genericParseResult - The parsed commodity node data
   * @returns A new Commodity instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const currency = genericParseResult.header.trim()

    return new Commodity({
      ...genericParseResult.props,
      currency,
    })
  }

  /** @inheritdoc */
  toString() {
    return `${this.getDateTypePrefix()} ${this.currency}${this.getMetaDataString()}`
  }
}

// Ensure class conforms to NodeConstructor pattern
assertNodeConstructor(Commodity)
