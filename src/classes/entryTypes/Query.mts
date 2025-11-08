import type { GenericParseResultWithDate } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { stringAwareParseLine } from '../../utils/stringAwareParseLine.mjs'
import { parseString } from '../../utils/parseVal.mjs'

export class Query extends DateEntry {
  type = 'query' as const
  name!: string
  sqlContents!: string

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

  toString() {
    return `${this.getDateTypePrefix()} "${this.name}" "${this.sqlContents}"${this.getMetaDataString()}`
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Query)
