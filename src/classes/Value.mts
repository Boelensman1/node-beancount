/**
 * Union type of all possible value types in Beancount metadata and expressions.
 */
export type ValueType = 'string' | 'date' | 'boolean' | 'amount' | 'numbers'

/**
 * Removes surrounding double quotes from a string value.
 * @param val - The string to parse (potentially with quotes)
 * @returns The string without leading or trailing quotes
 */
export const parseString = (val: string): string => {
  return val.replace(/^"|"$/g, '')
}

/**
 * Represents a typed value in Beancount (used in metadata, expressions, etc.).
 * Handles string, boolean, date, amount, and number values.
 */
export class Value {
  /** The type of this value */
  type!: ValueType
  /** The actual value data */
  value!: unknown

  /**
   * Creates a new Value instance.
   * @param obj - Object containing type and value properties
   * @param obj.type - The value type
   * @param obj.value - The value data
   */
  constructor(obj: { type: ValueType; value: unknown }) {
    Object.assign(this, obj)
  }

  /**
   * Parses a string into a Value object with appropriate type detection.
   * Detects and handles:
   * - Quoted strings
   * - Boolean values (TRUE/FALSE, case-insensitive)
   * - Amounts (fallback for other values)
   *
   * @param input - The string to parse
   * @returns A new Value instance with detected type
   */
  static fromString(input: string) {
    if (input.startsWith('"') && input.endsWith('"')) {
      // string!
      return new Value({ type: 'string', value: parseString(input) })
    }
    if (input.toUpperCase() === 'TRUE') {
      return new Value({ type: 'boolean', value: true })
    }
    if (input.toUpperCase() === 'FALSE') {
      return new Value({ type: 'boolean', value: false })
    }

    // TODO: more parsing
    return new Value({ type: 'amount', value: input })
  }

  /**
   * Converts this value to its string representation.
   * Formats based on type:
   * - Booleans as TRUE/FALSE
   * - Strings with surrounding quotes
   * - Other types as their string representation
   *
   * @returns The formatted string representation
   */
  toString(): string {
    switch (this.type) {
      case 'boolean':
        return this.value ? 'TRUE' : 'FALSE'
      case 'string':
        return `"${this.value as string}"`
      default:
        return String(this.value)
    }
  }
}
