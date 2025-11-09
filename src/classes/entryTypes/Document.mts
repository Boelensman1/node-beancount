import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { parseString } from '../Value.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'

/**
 * Represents a Document entry that links an external file to an account.
 * Document directives associate receipts, statements, or other files with accounts.
 */
export class Document extends DateEntry {
  /** @inheritdoc */
  type = 'document' as const
  /** The account the document is associated with */
  account!: string
  /** The file path to the document */
  pathToDocument!: string

  /**
   * Creates a Document instance from a generic parse result.
   * @param genericParseResult - The parsed document entry data
   * @returns A new Document instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResultWithDate,
  ) {
    const [account, pathToDocument] = simpleParseLine(genericParseResult.header)

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

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Document)
