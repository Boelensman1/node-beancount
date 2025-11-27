import { Temporal } from '@js-temporal/polyfill'

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
 * Converts a JavaScript Date object to a Temporal.PlainDate.
 * @param date - The JavaScript Date to convert
 * @returns A Temporal.PlainDate representing the same calendar date
 */
const jsDateToTemporal = (date: Date): Temporal.PlainDate =>
  Temporal.PlainDate.from(
    {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    },
    {
      overflow: 'reject',
    },
  )

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
  constructor({ type, value }: { type: ValueType; value: unknown }) {
    this.type = type

    switch (this.type) {
      case 'boolean':
        this.value = Boolean(value)
        return
      case 'string':
        this.value = String(value)
        return
      case 'date':
        if (value instanceof Temporal.PlainDate) {
          this.value = value
          return
        }
        if (value instanceof Date) {
          this.value = jsDateToTemporal(value)
        }
        if (typeof value === 'string') {
          this.value = jsDateToTemporal(new Date(value))
        }
        if (typeof value === 'number') {
          this.value = jsDateToTemporal(new Date(value))
        }
        return
      case 'amount':
      case 'numbers':
        // as string so we don't lose precision
        this.value = String(value)
        return
      default:
        throw new Error(`Unknown value type: ${type}`)
    }
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
