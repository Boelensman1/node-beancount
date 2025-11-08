import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'
import { parseVal, Value } from '../../utils/parseVal.mjs'
import { formatValue } from '../../utils/formatValue.mjs'

export class Custom extends DateEntry {
  type = 'custom' as const
  customType!: string
  values?: Value[]

  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const [customType, ...others] = simpleParseLine(genericParseResult.header)

    return new Custom({
      ...genericParseResult.props,
      customType: parseVal(customType),
      values: others.length > 0 ? others.map((o) => parseVal(o)) : undefined,
    })
  }

  toString() {
    const parts = [
      `${this.getDateTypePrefix()} ${formatValue(this.customType)}`,
    ]
    if (this.values !== undefined) {
      parts.push(...this.values.map(formatValue))
    }
    return parts.join(' ') + this.getMetaDataString()
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Custom)
