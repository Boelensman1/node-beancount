import type { GenericParseResultTransaction } from '../../../genericParse.mjs'
import { assertEntryConstructor } from '../../Entry.mjs'
import { DateEntry } from '../../DateEntry.mjs'
import { stringAwareParseLine } from '../../../utils/stringAwareParseLine.mjs'
import { parseString } from '../../../utils/parseVal.mjs'
import { parseMetadata } from '../../../utils/parseMetadata.mjs'

import { Posting } from './Posting.mjs'
import { Tag } from './Tag.mjs'

const AccountTypes = ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses']

const getStringLinksAndTags = (input: string) => {
  let links: string[] = []
  let tags: Tag[] = []

  const match = /^(".*")(.*)/.exec(input)
  if (!match) {
    throw new Error('Could not parse narration')
  }
  const [, strRemaining, linksAndTags] = match

  const linksMatch = linksAndTags.matchAll(/\^([\w-]*)/g)
  if (linksMatch) {
    links = linksMatch.map((m) => m[1]).toArray()
  }

  const tagsMatch = linksAndTags.matchAll(/#([\w-]*)/g)
  if (tagsMatch) {
    tags = tagsMatch
      .map((m) => new Tag({ content: m[1], fromStack: false }))
      .toArray()
  }

  return { links, tags, string: strRemaining }
}

export class Transaction extends DateEntry {
  type = 'transaction' as const
  payee!: string
  narration?: string
  flag?: string
  postings!: Posting[]
  links?: string[]
  tags?: Tag[]

  static fromGenericParseResult(
    genericParseResult: GenericParseResultTransaction,
  ) {
    // eslint-disable-next-line prefer-const
    let [payee, ...rest] = stringAwareParseLine(genericParseResult.header)

    let links: string[] = []
    let tags: Tag[] = []
    let narration

    if (rest.length === 0) {
      // no narration
      const payeeParsed = getStringLinksAndTags(payee)
      payee = payeeParsed.string
      links = payeeParsed.links
      tags = payeeParsed.tags
    } else {
      const payeeParsed = getStringLinksAndTags(rest.join(' '))
      narration = payeeParsed.string
      links = payeeParsed.links
      tags = payeeParsed.tags
    }

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
      links,
      tags,
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
