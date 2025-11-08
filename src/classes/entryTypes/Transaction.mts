import type { GenericParseResultTransaction } from '../../genericParse.mjs'
import { assertEntryConstructor } from '../Entry.mjs'
import { DateEntry } from '../DateEntry.mjs'
import { Posting } from '../Posting.mjs'
import { stringAwareParseLine } from '../../utils/stringAwareParseLine.mjs'
import { parseString } from '../../utils/parseVal.mjs'
import { parseMetadata } from '../../utils/parseMetadata.mjs'

const AccountTypes = ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses']

export class Transaction extends DateEntry {
  type = 'transaction' as const
  payee!: string
  narration?: string
  flag?: string
  postings!: Posting[]

  static fromGenericParseResult(
    genericParseResult: GenericParseResultTransaction,
  ) {
    const [payee, narration] = stringAwareParseLine(genericParseResult.header)

    const unparsedPostings: string[] = []
    const unparsedMetadata: string[] = []

    genericParseResult.body.forEach((line) => {
      //                           V remove flag,       V get account type
      const accountType = line.replace(/^[^ ] /, '').split(':')[0]

      if (AccountTypes.includes(accountType)) {
        unparsedPostings.push(line)
      } else {
        unparsedMetadata.push(line)
      }
    })

    const postings = unparsedPostings.map((p) =>
      Posting.fromGenericParseResult(p),
    )
    const metadata = parseMetadata(unparsedMetadata)

    return new Transaction({
      ...genericParseResult.props,
      payee: parseString(payee),
      narration: narration ? parseString(narration) : undefined,
      postings,
      metadata,
    })
  }

  toString() {
    const firstLine = [
      this.date.toJSON(),
      this.flag ?? 'txn',
      `"${this.payee}"`,
    ]
    if (this.narration !== undefined) {
      firstLine.push(`"${this.narration}"`)
    }
    const lines = [firstLine.join(' ') + this.getMetaDataString()]
    lines.push(...this.postings.map((p) => `  ${p.toString()}`))
    return lines.join('\n')
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Transaction)
