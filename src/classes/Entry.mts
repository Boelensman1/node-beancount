import type { BeancountEntryType } from '../entryTypeToClass.mjs'
import { genericParse } from '../../src/genericParse.mjs'
import { stringAwareSplitLine } from '../utils/stringAwareSplitLine.mjs'
import { FormatOptions, defaultFormatOptions } from './ParseResult.mjs'

/**
 * Type helper for Entry class constructors that enforce the static factory methods.
 * Child classes must implement static fromGenericParseResult and fromObject methods to create instances.
 * Note: The constructor is protected, so only the static factory methods are part of the public API.
 */
export interface EntryConstructor<T extends Entry> {
  /**
   * Creates an Entry instance from a generic parse result.
   * @param parsedStart - The result from genericParse containing parsed entry data
   * @returns A new instance of the Entry subclass
   */
  fromGenericParseResult(parsedStart: ReturnType<typeof genericParse>): T
}

/**
 * Abstract base class for all Beancount entry types.
 *
 * Child classes must implement static `fromGenericParseResult` method
 */
export abstract class Entry {
  /** Optional comment text associated with this entry */
  comment?: string

  /** Internal metadata key-value pairs associated with this entry.
   * These can be anything, are not used in the output, and are meant to be used
   * to allow your pipeline to keep track of an internal property */
  internalMetadata: Record<string, unknown> = {}

  /** The type of this entry (e.g., 'open', 'close', 'transaction', 'comment', 'blankline') */
  abstract type: BeancountEntryType | 'comment' | 'blankline'

  /**
   * Creates a new Entry instance.
   * @param obj - Object containing entry properties
   */
  constructor(obj: Record<string, unknown>) {
    Object.assign(this, obj)
  }

  /**
   * Creates an Entry instance from a Beancount string.
   * Parses the input string and constructs the appropriate Entry subclass.
   *
   * @param input - A single Beancount entry as a string
   * @returns A new instance of the Entry subclass
   */
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

  /**
   * Creates an Entry instance from JSON data.
   * Calls fromJSONData to allow subclasses to transform the data before construction.
   *
   * @param jsonString - JSON data representing an entry
   * @returns A new instance of the Entry subclass
   * @remarks **Warning:** No validation is performed on the JSON input. We assume the JSON is valid and well-formed.
   */
  static fromJSON<T extends Entry>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this: new (obj: any) => T,
    jsonString: string,
  ): T {
    const json = JSON.parse(jsonString) as Record<string, unknown>

    // @ts-expect-error Not sure how to type this correctly
    return this.fromJSONData<T>(json) // eslint-disable-line
  }

  /**
   * Creates an Entry instance from JSON data.
   * Calls fromJSONData to allow subclasses to transform the data before construction.
   *
   * @param jsonData - object representing an entry
   * @returns A new instance of the Entry subclass
   * @remarks **Warning:** No validation is performed on the input. We assume the input is valid and well-formed.
   */
  static fromJSONData<T extends Entry>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this: new (obj: any) => T,
    jsonData: Record<string, unknown>,
  ): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new this({} as any)
    const transformedData = instance.parseJSONData(jsonData)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new this(transformedData as any)
  }

  /**
   * Converts this entry to a formatted string with aligned columns.
   * Default implementation delegates to toString(). Subclasses can override for custom formatting.
   *
   * @param _formatOptions - Formatting options (unused in base implementation)
   * @returns The formatted string representation of this entry
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toFormattedString(_formatOptions: FormatOptions = defaultFormatOptions) {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return this.toString()
  }

  /**
   * Transforms JSON data before creating an Entry instance.
   * Default implementation returns the input unchanged.
   * Subclasses can override this to handle custom deserialization logic
   * (e.g., converting nested objects, handling dates, etc.).
   *
   * @param json - The JSON data to transform
   * @returns The transformed data ready for the constructor
   */
  protected parseJSONData(
    json: Record<string, unknown>,
  ): Record<string, unknown> {
    return json
  }

  /**
   * Converts an entry to a JSON-serializable object.
   * @returns A JSON-serializable representation of this entry
   */
  toJSON() {
    return {
      ...this,
    }
  }
}

/**
 * Type assertion helper to ensure a class conforms to EntryConstructor.
 * Usage: assertEntryConstructor(MyEntryClass)
 * @param _ctor - The constructor to validate (unused at runtime)
 * @internal
 */
export function assertEntryConstructor<T extends Entry>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ctor: EntryConstructor<T>,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
