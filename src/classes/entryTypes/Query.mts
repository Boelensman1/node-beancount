import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { stringAwareParseLine } from '../../utils/stringAwareParseLine.mjs'
import { parseString } from '../Value.mjs'

/**
 * Represents a Query entry that defines a named SQL query.
 * Query directives allow defining reusable queries in the Beancount file.
 */
export class Query extends DateEntry {
  /** @inheritdoc */
  type = 'query' as const
  /** The name of the query */
  name!: string
  /** The SQL query contents */
  sqlContents!: string

  /**
   * Creates a Query instance from a generic parse result.
   * @param genericParseResult - The parsed query entry data
   * @returns A new Query instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const [name, sqlContents] = stringAwareParseLine(genericParseResult.header)

    return new Query({
      ...genericParseResult.props,
      name: parseString(name),
      sqlContents: parseString(sqlContents).trim(),
    })
  }

  /** @inheritdoc */
  toString() {
    return `${this.getDateTypePrefix()} "${this.name}" "${this.sqlContents}"${this.getMetaDataString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Query)
