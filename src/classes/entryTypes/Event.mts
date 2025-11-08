import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { parseString, Value } from '../Value.mjs'
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
      value: Value.fromString(value),
    })
  }

  toString() {
    return `${this.getDateTypePrefix()} "${this.name}" ${this.value.toString()}${this.getMetaDataString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Event)
