import type { GenericParseResult } from '../../genericParse.mjs'
import { assertNodeConstructor, Node, NodeConstructor } from '../Node.mjs'

/**
 * Represents a blank line in a Beancount file.
 */
export class Blankline extends Node {
  /** @inheritdoc */
  type = 'blankline' as const

  /**
   * Creates a Blankline instance from a generic parse result.
   * @param _genericParseResult - Unused, blank lines have no content
   * @returns A new Blankline instance
   */
  static fromGenericParseResult(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _genericParseResult: GenericParseResult,
  ) {
    return new Blankline({})
  }

  /** @inheritdoc */
  toString() {
    return ''
  }

  /**
   * Creates a Blankline instance from a string.
   * @param _input - Unused, blank lines have no content
   * @returns A new Blankline instance
   */
  static fromString<T extends Node>(
    this: NodeConstructor<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _input: string,
  ): T {
    return this.fromGenericParseResult({} as GenericParseResult)
  }
}

// Ensure class conforms to NodeConstructor pattern
assertNodeConstructor(Blankline)
