import { Temporal } from '@js-temporal/polyfill'
import { Node } from './Node.mjs'
import { Value, type ValueType } from './Value.mjs'
import type { DatedDirectiveNodeType } from '../nodeTypeToClass.mjs'

/**
 * Abstract base class for all nodes that correspond to dated Beancount directives
 * like transaction and open.
 *
 * Child classes must implement static `fromGenericParseResult` method
 */
export abstract class DatedNode extends Node {
  /** The type of this dated node */
  abstract type: DatedDirectiveNodeType
  /** The date of this node as a Temporal.PlainDate object */
  date!: Temporal.PlainDate
  /** Optional metadata key-value pairs associated with this node */
  metadata?: Record<string, Value>

  /**
   * Creates a new DatedNode instance.
   * @param obj - Object containing node properties
   * @param obj.date - The date string in YYYY-MM-DD format
   */
  constructor(obj: {
    date: string | Temporal.PlainDate
    [key: string]: unknown
  }) {
    const { date, metadata, ...props } = obj
    super(props)

    if (date) {
      if (date instanceof Temporal.PlainDate) {
        this.date = date
      } else if (typeof date === 'string') {
        this.date = Temporal.PlainDate.from(date, { overflow: 'reject' })
      } else {
        throw new Error(
          'Could not parse date, should be either string of Temporal.PlainDate',
        )
      }
    }

    if (metadata) {
      this.metadata = Object.fromEntries(
        Object.entries(metadata as Record<string, unknown>).map(
          ([key, val]) => [
            key,
            new Value(val as { type: ValueType; value: unknown }),
          ],
        ),
      )
    }
  }

  /**
   * Returns the common prefix for all DatedNode toString methods.
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

    const metadataEntries = this.metadata ? Object.entries(this.metadata) : []
    if (metadataEntries.length === 0) {
      return comment
    }
    return (
      `${comment}\n` +
      metadataEntries
        .map(([key, val]) => `  ${key}: ${val.toString()}`)
        .join('\n')
    )
  }
}
