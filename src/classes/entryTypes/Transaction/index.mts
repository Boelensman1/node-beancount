import type { GenericParseResultTransaction } from '../../../genericParse.mjs'
import { assertEntryConstructor } from '../../Entry.mjs'
import { DateEntry } from '../../DateEntry.mjs'
import { stringAwareParseLine } from '../../../utils/stringAwareParseLine.mjs'
import { parseString, Value, type ValueType } from '../../Value.mjs'
import { parseMetadata } from '../../../utils/parseMetadata.mjs'

import { Posting } from './Posting.mjs'
import { Tag } from './Tag.mjs'
import { defaultFormatOptions, FormatOptions } from '../../ParseResult.mjs'

/**
 * Valid Beancount account type prefixes.
 * @internal
 */
const AccountTypes = ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses']

/**
 * Parses a string to extract narration/payee, links, and tags.
 * Links are prefixed with '^' and tags with '#'.
 *
 * @param input - The string to parse (may contain narration in quotes, links, and tags)
 * @returns An object containing extracted links, tags, and the remaining string (narration/payee)
 * @internal
 */
const getStringLinksAndTags = (input: string) => {
  let links = new Set<string>()
  let tags: Tag[] = []

  // default if no narration
  let strRemaining = ''
  let linksAndTags = input

  // check for narration
  const match = /^(".*")(.*)/.exec(input)
  if (match) {
    // strRemaining = narration
    strRemaining = match[1]
    linksAndTags = match[2]
  }

  const linksMatch = linksAndTags.matchAll(/\^([\w-]*)/g)
  if (linksMatch) {
    links = new Set(linksMatch.map((m) => m[1]))
  }

  const tagsMatch = linksAndTags.matchAll(/#([\w-]*)/g)
  if (tagsMatch) {
    tags = tagsMatch
      .map((m) => new Tag({ content: m[1], fromStack: false }))
      .toArray()
  }

  return { links, tags, string: strRemaining }
}

/**
 * Represents a Beancount transaction entry.
 * Transactions record financial movements between accounts with postings.
 */
export class Transaction extends DateEntry {
  /** @inheritdoc */
  type = 'transaction' as const
  /** The payee of the transaction */
  payee!: string
  /** Optional narration/description of the transaction */
  narration?: string
  /** Optional transaction flag (e.g., '*' for cleared, '!' for pending) */
  flag?: string
  /** Array of postings (account movements) in this transaction */
  postings!: Posting[]
  /** Set of link identifiers associated with this transaction */
  links!: Set<string>
  /** Array of tags associated with this transaction (from inline tags and tag stack) */
  tags!: Tag[]

  /**
   * Creates a Transaction instance from a generic parse result.
   * Parses payee, narration, links, tags, postings, and metadata.
   *
   * @param genericParseResult - The parsed transaction data
   * @returns A new Transaction instance
   */
  static fromGenericParseResult(
    genericParseResult: GenericParseResultTransaction,
  ) {
    // eslint-disable-next-line prefer-const
    let [payee, ...rest] = stringAwareParseLine(genericParseResult.header)

    let links: Set<string> = new Set<string>()
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

  /** @inheritdoc */
  toString() {
    return this.toFormattedString({ currencyColumn: 0 })
  }

  /** @inheritdoc */
  toFormattedString(formatOptions: FormatOptions = defaultFormatOptions) {
    const firstLine = [
      this.date.toJSON(),
      this.flag ?? 'txn',
      `"${this.payee}"`,
    ]
    if (this.narration !== undefined) {
      firstLine.push(`"${this.narration}"`)
    }

    firstLine.push(...this.links.values().map((l) => `^${l}`))
    firstLine.push(...this.tags.map((t) => t.toString()))

    const lines = [firstLine.join(' ') + this.getMetaDataString()]
    lines.push(
      ...this.postings.map((p) => `  ${p.toFormattedString(formatOptions)}`),
    )
    return lines.join('\n')
  }

  /**
   * Converts this transaction to a JSON-serializable object.
   * Ensures the links Set is properly serialized as an array.
   *
   * @returns A JSON-serializable representation of this transaction
   */
  toJSON() {
    return {
      ...this,
      links: Array.from(this.links),
    }
  }

  /**
   * Transforms JSON data before creating a Transaction instance.
   * Deserializes transaction-specific properties including postings, tags, links, and metadata.
   *
   * @param json - The JSON data to transform
   * @returns The transformed data with:
   *   - postings converted to Posting instances
   *   - tags converted to Tag instances
   *   - links converted from array to Set<string>
   *   - metadata values converted to Value instances
   */
  protected parseJSONData(
    json: Record<string, unknown>,
  ): Record<string, unknown> {
    const { postings, tags, links, metadata, ...rest } = json

    return {
      ...rest,
      postings: (postings as Record<string, unknown>[])?.map(
        (p) => new Posting(p),
      ),
      tags: (tags as { content: string; fromStack: boolean }[])?.map(
        (t) => new Tag(t),
      ),
      links: links ? new Set(links as string[]) : new Set(),
      metadata: metadata
        ? Object.fromEntries(
            Object.entries(metadata as Record<string, unknown>).map(
              ([key, val]) => [
                key,
                new Value(val as { type: ValueType; value: unknown }),
              ],
            ),
          )
        : undefined,
    }
  }
}

// Ensure class conforms to EntryConstructor pattern
assertEntryConstructor(Transaction)
