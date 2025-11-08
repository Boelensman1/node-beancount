import type { GenericParseResult } from '../../genericParse.mjs'
import { parseString, parseVal, Value } from '../../utils/parseVal.mjs'
import { formatValue } from '../../utils/formatValue.mjs'
import { stringAwareParseLine } from '../../utils/stringAwareParseLine.mjs'
import { assertEntryConstructor, Entry } from '../Entry.mjs'

export class Option extends Entry {
  type = 'option' as const
  name!: string
  value!: Value

  static fromGenericParseResult(genericParseResult: GenericParseResult) {
    const [name, value] = stringAwareParseLine(genericParseResult.header)

    return new Option({
      name: parseString(name),
      value: parseVal(value),
    })
  }

  toString() {
    return `${this.type} "${this.name}" ${formatValue(this.value)}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Option)
