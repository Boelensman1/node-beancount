import { genericParse } from '../../src/genericParse.mjs'
import { stringAwareSplitLine } from '../utils/stringAwareSplitLine.mjs'
import type { EntryType } from '../parse.mjs'

/**
 * Type helper for Entry class constructors that enforce the static factory methods.
 * Child classes must implement static fromGenericParseResult and fromObject methods to create instances.
 * Note: The constructor is protected, so only the static factory methods are part of the public API.
 */
export interface EntryConstructor<T extends Entry> {
  fromGenericParseResult(parsedStart: ReturnType<typeof genericParse>): T
}

/**
 * Abstract base class for all Beancount entry types.
 *
 * Child classes must implement static `fromGenericParseResult` method
 */
export abstract class Entry {
  comment?: string

  abstract type: EntryType | 'comment' // not a real type, used for everything that doesnt match

  constructor(obj: Record<string, unknown>) {
    Object.assign(this, obj)
  }

  static fromString<T extends Entry>(
    this: EntryConstructor<T>,
    input: string,
  ): T {
    const unparsedEntry = stringAwareSplitLine(input)
    const genericParseResult = genericParse(unparsedEntry)
    const result = this.fromGenericParseResult(genericParseResult)
    if (result.type !== genericParseResult.type) {
      console.warn(
        'Parse result type is not equal to requested object type, make sure the correct class is initiated',
      )
    }
    return result
  }
}

/**
 * Type assertion helper to ensure a class conforms to EntryConstructor.
 * Usage: assertEntryConstructor(MyEntryClass)
 */
export function assertEntryConstructor<T extends Entry>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ctor: EntryConstructor<T>,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
