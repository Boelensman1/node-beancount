import type { GenericParseResult } from '../../genericParse.mjs'
import { parseString } from '../Value.mjs'
import { stringAwareParseLine } from '../../utils/stringAwareParseLine.mjs'
import { assertNodeConstructor, Node } from '../Node.mjs'

/**
 * Represents a Plugin node that loads a Beancount plugin.
 * Plugin directives enable plugins to process the ledger.
 */
export class Plugin extends Node {
  /** @inheritdoc */
  type = 'plugin' as const
  /** The Python module name of the plugin */
  moduleName!: string
  /** Optional configuration string for the plugin */
  config?: string

  /**
   * Creates a Plugin instance from a generic parse result.
   * @param genericParseResult - The parsed plugin node data
   * @returns A new Plugin instance
   */
  static fromGenericParseResult(genericParseResult: GenericParseResult) {
    const [moduleName, config] = stringAwareParseLine(genericParseResult.header)

    return new Plugin({
      moduleName: parseString(moduleName),
      config: config ? parseString(config) : undefined,
    })
  }

  /** @inheritdoc */
  toString() {
    const parts = [`${this.type} "${this.moduleName}"`]
    if (this.config !== undefined) {
      parts.push(`"${this.config}"`)
    }
    return parts.join(' ')
  }
}

// Ensure class conforms to NodeConstructor pattern
assertNodeConstructor(Plugin)
