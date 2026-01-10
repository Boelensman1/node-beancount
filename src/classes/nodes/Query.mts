import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertNodeConstructor } from '../Node.mjs'
import { DatedNode } from '../DatedNode.mjs'
import { stringAwareParseLine } from '../../utils/stringAwareParseLine.mjs'
import { parseString } from '../Value.mjs'

/**
 * Represents a Query node that defines a named SQL query.
 * Query directives allow defining reusable queries in the Beancount file.
 */
export class Query extends DatedNode {
  /** @inheritdoc */
  type = 'query' as const
  /** The name of the query */
  name!: string
  /** The SQL query contents */
  sqlContents!: string

  /**
   * Creates a Query instance from a generic parse result.
   * @param genericParseResult - The parsed query node data
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

// Ensure class conforms to NodeConstructor pattern
assertNodeConstructor(Query)
