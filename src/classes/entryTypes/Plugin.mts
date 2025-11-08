import type { GenericParseResult } from '../../genericParse.mjs'
import { parseString } from '../../utils/parseVal.mjs'
import { stringAwareParseLine } from '../../utils/stringAwareParseLine.mjs'
import { assertEntryConstructor, Entry } from '../Entry.mjs'

export class Plugin extends Entry {
  type = 'plugin' as const
  moduleName!: string
  config?: string

  static fromGenericParseResult(genericParseResult: GenericParseResult) {
    const [moduleName, config] = stringAwareParseLine(genericParseResult.header)

    return new Plugin({
      moduleName: parseString(moduleName),
      config: config ? parseString(config) : undefined,
    })
  }

  toString() {
    const parts = [`${this.type} "${this.moduleName}"`]
    if (this.config !== undefined) {
      parts.push(`"${this.config}"`)
    }
    return parts.join(' ')
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Plugin)
