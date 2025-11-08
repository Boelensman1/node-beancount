import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'
import { Value } from '../Value.mjs'

export class Custom extends DateEntry {
  type = 'custom' as const
  customType!: Value
  values?: Value[]

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
