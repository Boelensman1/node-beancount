import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertNodeConstructor } from '../Node.mjs'
import { DatedNode } from '../DatedNode.mjs'
import { parseString } from '../Value.mjs'
import { stringAwareParseLine } from '../../utils/stringAwareParseLine.mjs'

/**
 * Represents a Document node that links an external file to an account.
 * Document directives associate receipts, statements, or other files with accounts.
 */
export class Document extends DatedNode {
  /** @inheritdoc */
  type = 'document' as const
  /** The account the document is associated with */
  account!: string
  /** The file path to the document */
  pathToDocument!: string

  /**
   * Creates a Document instance from a generic parse result.
   * @param genericParseResult - The parsed document node data
   * @returns A new Document instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const [account, pathToDocument] = stringAwareParseLine(
      genericParseResult.header,
    )

    return new Document({
      ...genericParseResult.props,
      account,
      pathToDocument: parseString(pathToDocument),
    })
  }

  /** @inheritdoc */
  toString() {
    return `${this.getDateTypePrefix()} ${this.account} "${this.pathToDocument}"${this.getMetaDataString()}`
  }
}

// Ensure class conforms to NodeConstructor pattern
assertNodeConstructor(Document)
