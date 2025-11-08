import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { parseString, parseVal, Value } from '../../utils/parseVal.mjs'
import { formatValue } from '../../utils/formatValue.mjs'
import { stringAwareParseLine } from '../../utils/stringAwareParseLine.mjs'

export class Event extends DateEntry {
  type = 'event' as const
  name!: string
  value!: Value

  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const [name, value] = stringAwareParseLine(genericParseResult.header)

    return new Event({
      ...genericParseResult.props,
      name: parseString(name),
      value: parseVal(value),
    })
  }

  toString() {
    return `${this.getDateTypePrefix()} "${this.name}" ${formatValue(this.value)}${this.getMetaDataString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Event)
