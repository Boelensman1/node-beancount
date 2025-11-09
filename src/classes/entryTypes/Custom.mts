import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'
import { Value } from '../Value.mjs'

/**
 * Represents a Custom entry for user-defined directives.
 * Custom directives allow for extensibility with arbitrary types and values.
 */
export class Custom extends DateEntry {
  /** @inheritdoc */
  type = 'custom' as const
  /** The custom directive type */
  customType!: Value
  /** Optional array of values associated with the custom directive */
  values?: Value[]

  /**
   * Creates a Custom instance from a generic parse result.
   * @param genericParseResult - The parsed custom entry data
   * @returns A new Custom instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const [customType, ...others] = simpleParseLine(genericParseResult.header)

    return new Custom({
      ...genericParseResult.props,
      customType: Value.fromString(customType),
      values:
        others.length > 0 ? others.map((o) => Value.fromString(o)) : undefined,
    })
  }

  /** @inheritdoc */
  toString() {
    const parts = [`${this.getDateTypePrefix()} ${this.customType.toString()}`]
    if (this.values !== undefined) {
      parts.push(...this.values.map((v) => v.toString()))
    }
    return parts.join(' ') + this.getMetaDataString()
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Custom)
