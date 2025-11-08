import type { GenericParseResult } from '../../genericParse.mjs'
import { parseString, Value } from '../Value.mjs'
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
      value: Value.fromString(value),
    })
  }

  toString() {
    return `${this.type} "${this.name}" ${this.value.toString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Option)
