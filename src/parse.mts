import assert from 'node:assert'
import { ParseResult } from './classes/ParseResult.mjs'
import {
  Balance,
  Close,
  Comment,
  Commodity,
  Custom,
  Document,
  Event,
  Include,
  Note,
  Open,
  Option,
  Pad,
  Plugin,
  Price,
  Query,
  Transaction,
} from './classes/entryTypes/index.mjs'
import { countChar } from './utils/countChar.mjs'
import { stringAwareSplitLine } from './utils/stringAwareSplitLine.mjs'
import {
  genericParse,
  GenericParseResult,
  GenericParseResultTransaction,
} from './genericParse.mjs'

// from https://beancount.github.io/docs/beancount_language_syntax.html#directives-1
const entryTypes = {
  balance: Balance,
  close: Close,
  commodity: Commodity,
  custom: Custom,
  document: Document,
  event: Event,
  include: Include,
  note: Note,
  open: Open,
  option: Option,
  pad: Pad,
  plugin: Plugin,
  price: Price,
  query: Query,
  transaction: Transaction,
}

export type EntryType = keyof typeof entryTypes

export const splitStringIntoUnparsedEntries = (input: string): string[][] => {
  const lines = input.split('\n')

  // split up the file into entries
  let inEntry = false
  let inString = false
  const unparsedEntries = lines.reduce<string[][]>((acc, line) => {
    if (!inString) {
      if (line.trim() === '') {
        // empty newline, skip to next entry
        inEntry = false
        return acc
      }

      if (!line.startsWith(' ') && inEntry) {
        // no indent, new entry
        inEntry = false
      }

      if (!inEntry) {
        acc.push([])
        inEntry = true
      }
    }

    acc[acc.length - 1].push(line)

    // odd number of ", we're in an unclosed string
    if (countChar(line, '"') % 2 === 1) {
      inString = !inString
    }

    return acc
  }, [])

  return unparsedEntries.map((lines) => stringAwareSplitLine(lines.join('\n')))
}

export const parseEntry = (unparsedEntry: string[]) => {
  const genericParseResult = genericParse(unparsedEntry)
  const { type } = genericParseResult

  const EntryClass = entryTypes[type]

  if (EntryClass) {
    return EntryClass.fromGenericParseResult(
      genericParseResult as GenericParseResultTransaction,
    )
  } else {
    assert(unparsedEntry.length === 1)
    return Comment.fromGenericParseResult({
      type: 'comment',
      props: { comment: unparsedEntry[0] },
    } as unknown as GenericParseResult)
  }
}

export const parse = (input: string) => {
  const unparsedEntries = splitStringIntoUnparsedEntries(input)

  return new ParseResult(
    unparsedEntries
      .map((unparsedEntry) => parseEntry(unparsedEntry))
      .filter((e) => e !== undefined),
  )
}
