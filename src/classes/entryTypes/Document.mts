import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { parseString } from '../../utils/parseVal.mjs'
import { simpleParseLine } from '../../utils/simpleParseLine.mjs'

export class Document extends DateEntry {
  type = 'document' as const
  account!: string
  pathToDocument!: string

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

  toString() {
    return `${this.getDateTypePrefix()} ${this.account} "${this.pathToDocument}"${this.getMetaDataString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Document)
