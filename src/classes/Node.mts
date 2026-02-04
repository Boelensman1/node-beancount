import type { BeancountDirectiveNodeType } from '../nodeTypeToClass.mjs'
import { genericParse } from '../genericParse.mjs'
import { stringAwareSplitLine } from '../utils/stringAwareSplitLine.mjs'
import { assignWithTrimmedStrings } from '../utils/assignWithTrimmedStrings.mjs'
import { FormatOptions, defaultFormatOptions } from './ParseResult.mjs'

/**
 * Type helper for Node class constructors that enforce the static factory methods.
 * Child classes must implement static fromGenericParseResult and fromObject methods to create instances.
 * Note: The constructor is protected, so only the static factory methods are part of the public API.
 */
export interface NodeConstructor<T extends Node> {
  /**
   * Creates an Node instance from a generic parse result.
   * @param parsedStart - The result from genericParse containing parsed node data
   * @returns A new instance of the Node subclass
   */
  fromGenericParseResult(parsedStart: ReturnType<typeof genericParse>): T
}

/**
 * Abstract base class for all nodes.
 *
 * Child classes must implement static `fromGenericParseResult` method
 */
export abstract class Node {
  /** Optional comment text associated with this node */
  comment?: string

  /** Internal metadata key-value pairs associated with this node.
   * These can be anything, are not used in the output, and are meant to be used
   * to allow your pipeline to keep track of an internal property */
  internalMetadata: Record<string, unknown> = {}

  /** The type of this node (e.g., 'open', 'close', 'transaction', 'comment', 'blankline') */
  abstract type: BeancountDirectiveNodeType | 'comment' | 'blankline'

  /**
   * Creates a new Node instance.
   * @param obj - Object containing node properties
   */
  constructor(obj: Record<string, unknown>) {
    assignWithTrimmedStrings(this, obj)
  }

  /**
   * Creates an Node instance from a Beancount string.
   * Parses the input string and constructs the appropriate Node subclass.
   *
   * @param input - A single unparsed node as a string
   * @returns A new instance of the Node subclass
   */
  static fromString<T extends Node>(
    this: NodeConstructor<T>,
    input: string,
  ): T {
    const sourceFragment = stringAwareSplitLine(input)
    const genericParseResult = genericParse(sourceFragment)
    const result = this.fromGenericParseResult(genericParseResult)
    if (result.type !== genericParseResult.type) {
      console.warn(
        'Parse result type is not equal to requested object type, make sure the correct class is initiated',
      )
    }
    return result
  }

  /**
   * Creates an Node instance from JSON data.
   * Calls fromJSONData to allow subclasses to transform the data before construction.
   *
   * @param jsonString - JSON data representing an node
   * @returns A new instance of the Node subclass
   * @remarks **Warning:** No validation is performed on the JSON input. We assume the JSON is valid and well-formed.
   */
  static fromJSON<T extends Node>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this: new (obj: any) => T,
    jsonString: string,
  ): T {
    const json = JSON.parse(jsonString) as Record<string, unknown>

    // @ts-expect-error Not sure how to type this correctly
    return this.fromJSONData<T>(json) // eslint-disable-line
  }

  /**
   * Creates an Node instance from JSON data.
   * Calls fromJSONData to allow subclasses to transform the data before construction.
   *
   * @param jsonData - object representing an node
   * @returns A new instance of the Node subclass
   * @remarks **Warning:** No validation is performed on the input. We assume the input is valid and well-formed.
   */
  static fromJSONData<T extends Node>(
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
   * Converts this node to a formatted string with aligned columns.
   * Default implementation delegates to toString(). Subclasses can override for custom formatting.
   *
   * @param _formatOptions - Formatting options (unused in base implementation)
   * @returns The formatted string representation of this node
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toFormattedString(_formatOptions: FormatOptions = defaultFormatOptions) {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return this.toString()
  }

  /**
   * Transforms JSON data before creating an Node instance.
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
   * Converts an node to a JSON-serializable object.
   * @returns A JSON-serializable representation of this node
   */
  toJSON() {
    return {
      ...this,
    } as Record<string, unknown>
  }
}

/**
 * Type assertion helper to ensure a class conforms to NodeConstructor.
 * Usage: assertNodeConstructor(MyNodeClass)
 * @param _ctor - The constructor to validate (unused at runtime)
 * @internal
 */
export function assertNodeConstructor<T extends Node>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ctor: NodeConstructor<T>,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
