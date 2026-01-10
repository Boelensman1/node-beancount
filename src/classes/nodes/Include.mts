import type { GenericParseResult } from '../../genericParse.mjs'
import { parseString } from '../Value.mjs'
import { stringAwareParseLine } from '../../utils/stringAwareParseLine.mjs'
import { assertNodeConstructor, Node } from '../Node.mjs'

/**
 * Represents an Include node that includes another Beancount file.
 * Include directives allow splitting ledgers across multiple files.
 */
export class Include extends Node {
  /** @inheritdoc */
  type = 'include' as const
  /** The filename/path of the file to include */
  filename!: string

  /**
   * Creates an Include instance from a generic parse result.
   * @param genericParseResult - The parsed include node data
   * @returns A new Include instance
   */
  static fromGenericParseResult(genericParseResult: GenericParseResult) {
    const [filename] = stringAwareParseLine(genericParseResult.header)

    return new Include({
      filename: parseString(filename),
    })
  }

  /** @inheritdoc */
  toString() {
    return `${this.type} "${this.filename}"`
  }
}

// Ensure class conforms to NodeConstructor pattern
assertNodeConstructor(Include)
