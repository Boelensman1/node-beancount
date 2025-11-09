import { Temporal } from '@js-temporal/polyfill'
import { Entry } from './Entry.mjs'
import { Value } from './Value.mjs'
import type { BeancountEntryType } from '../parse.mjs'

/**
 * Union type of all Beancount entry types that include a date field.
 * Excludes non-dated directives 'include', 'option', and 'plugin'.
 */
export type BeancountDateEntryType = Exclude<
  BeancountEntryType,
  'include' | 'option' | 'plugin'
>

/**
 * Abstract base class for all Beancount entry types that have a date.
 *
 * Child classes must implement static `fromGenericParseResult` method
 */
export abstract class DateEntry extends Entry {
  /** The type of this dated entry */
  abstract type: BeancountDateEntryType
  /** The date of this entry as a Temporal.PlainDate object */
  date!: Temporal.PlainDate
  /** Optional metadata key-value pairs associated with this entry */
  metadata?: Record<string, Value>

  /**
   * Creates a new DateEntry instance.
   * @param obj - Object containing entry properties
   * @param obj.date - The date string in YYYY-MM-DD format
   */
  constructor(obj: { date: string; [key: string]: unknown }) {
    const { date, ...props } = obj
    super(props)

    if (date) {
      this.date = Temporal.PlainDate.from(date, { overflow: 'reject' })
    }
  }

  /**
   * Returns the common prefix for all DateEntry toString methods.
   * Format: "YYYY-MM-DD <type>"
   * @returns The formatted date and type prefix string
   */
  protected getDateTypePrefix(): string {
    return `${this.date.toJSON()} ${this.type}`
  }

  /**
   * Converts metadata and comment to a formatted string.
   * If metadata exists, each key-value pair is formatted on separate indented lines.
   *
   * @returns The formatted metadata and comment string, or empty string if neither exists
   */
  getMetaDataString() {
    const comment = this.comment ? ` ; ${this.comment}` : ''
    if (!this.metadata) {
      return comment
    }
    return (
      `${comment}\n` +
      Object.entries(this.metadata)
        .map(([key, val]) => `  ${key}: ${val.toString()}`)
        .join('\n')
    )
  }
}
