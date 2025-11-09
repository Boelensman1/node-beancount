import type { GenericParseResult } from '../../genericParse.mjs'
import { parseString } from '../Value.mjs'
import { stringAwareParseLine } from '../../utils/stringAwareParseLine.mjs'
import { assertEntryConstructor, Entry } from '../Entry.mjs'

/**
 * Represents an Include entry that includes another Beancount file.
 * Include directives allow splitting ledgers across multiple files.
 */
export class Include extends Entry {
  /** @inheritdoc */
  type = 'include' as const
  /** The filename/path of the file to include */
  filename!: string

  /**
   * Creates an Include instance from a generic parse result.
   * @param genericParseResult - The parsed include entry data
   * @returns A new Include instance
   */
  static fromGenericParseResult(genericParseResult: GenericParseResult) {
    const [filename] = stringAwareParseLine(genericParseResult.header)

    return new Include({
      filename: parseString(filename),
    })
  }

  /** @inheritdoc */
  toString() {
    return `${this.type} "${this.filename}"`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Include)
