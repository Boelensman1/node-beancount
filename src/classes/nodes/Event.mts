import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertNodeConstructor } from '../Node.mjs'
import { DatedNode } from '../DatedNode.mjs'
import { parseString, Value } from '../Value.mjs'
import { stringAwareParseLine } from '../../utils/stringAwareParseLine.mjs'

/**
 * Represents an Event node that records a named event with a value.
 * Event directives track occurrences of specific events over time.
 */
export class Event extends DatedNode {
  /** @inheritdoc */
  type = 'event' as const
  /** The name of the event */
  name!: string
  /** The value associated with the event */
  value!: Value

  /**
   * Creates an Event instance from a generic parse result.
   * @param genericParseResult - The parsed event node data
   * @returns A new Event instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const [name, value] = stringAwareParseLine(genericParseResult.header)

    return new Event({
      ...genericParseResult.props,
      name: parseString(name),
      value: Value.fromString(value),
    })
  }

  /** @inheritdoc */
  toString() {
    return `${this.getDateTypePrefix()} "${this.name}" ${this.value.toString()}${this.getMetaDataString()}`
  }
}

// Ensure class conforms to NodeConstructor pattern
assertNodeConstructor(Event)
