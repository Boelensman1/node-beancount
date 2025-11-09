import type { GenericParseResult } from '../../genericParse.mjs'
import { parseString, Value } from '../Value.mjs'
import { stringAwareParseLine } from '../../utils/stringAwareParseLine.mjs'
import { assertEntryConstructor, Entry } from '../Entry.mjs'

/**
 * Represents an Option entry that sets a Beancount configuration option.
 * Option directives configure various aspects of Beancount's behavior.
 */
export class Option extends Entry {
  /** @inheritdoc */
  type = 'option' as const
  /** The option name */
  name!: string
  /** The option value */
  value!: Value

  /**
   * Creates an Option instance from a generic parse result.
   * @param genericParseResult - The parsed option entry data
   * @returns A new Option instance
   */
  static fromGenericParseResult(genericParseResult: GenericParseResult) {
    const [name, value] = stringAwareParseLine(genericParseResult.header)

    return new Option({
      name: parseString(name),
      value: Value.fromString(value),
    })
  }

  /** @inheritdoc */
  toString() {
    return `${this.type} "${this.name}" ${this.value.toString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Option)
