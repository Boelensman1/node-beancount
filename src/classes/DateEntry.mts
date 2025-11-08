import { Temporal } from '@js-temporal/polyfill'
import { Entry } from './Entry.mjs'
import { Value } from './Value.mjs'
import type { EntryType } from '../parse.mjs'

export type DateEntryType = Exclude<EntryType, 'include' | 'option' | 'plugin'>

/**
 * Abstract base class for all Beancount entry types that have a date.
 *
 * Child classes must implement static `fromGenericParseResult` method
 */
export abstract class DateEntry extends Entry {
  abstract type: DateEntryType
  date!: Temporal.PlainDate
  metadata?: Record<string, Value>

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
   */
  protected getDateTypePrefix(): string {
    return `${this.date.toJSON()} ${this.type}`
  }

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
