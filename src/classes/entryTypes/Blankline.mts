import type { GenericParseResult } from '../../genericParse.mjs'
import { assertEntryConstructor, Entry, EntryConstructor } from '../Entry.mjs'

/**
 * Represents a blank line in a Beancount file.
 * Blank lines are used to separate entries for readability.
 */
export class Blankline extends Entry {
  /** @inheritdoc */
  type = 'blankline' as const

  /**
   * Creates a Blankline instance from a generic parse result.
   * @param _genericParseResult - Unused, blank lines have no content
   * @returns A new Blankline instance
   */
  static fromGenericParseResult(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _genericParseResult: GenericParseResult,
  ) {
    return new Blankline({})
  }

  /** @inheritdoc */
  toString() {
    return ''
  }

  /**
   * Creates a Blankline instance from a string.
   * @param _input - Unused, blank lines have no content
   * @returns A new Blankline instance
   */
  static fromString<T extends Entry>(
    this: EntryConstructor<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _input: string,
  ): T {
    return this.fromGenericParseResult({} as GenericParseResult)
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Blankline)
