import assert from 'node:assert'
import { ParseResult } from './classes/ParseResult.mjs'
import {
  Transaction,
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
  Poptag,
  Price,
  Pushtag,
  Query,
  Blankline,
} from './classes/entryTypes/index.mjs'
import { countChar } from './utils/countChar.mjs'
import { stringAwareSplitLine } from './utils/stringAwareSplitLine.mjs'
import {
  genericParse,
  GenericParseResult,
  GenericParseResultTransaction,
} from './genericParse.mjs'
import { Tag } from './classes/entryTypes/Transaction/Tag.mjs'

// from https://beancount.github.io/docs/beancount_language_syntax.html#directives-1
const entryTypes = {
  transaction: Transaction,
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
  poptag: Poptag,
  price: Price,
  pushtag: Pushtag,
  query: Query,
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
        // empty newline, next entry starts
        inEntry = false
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

export const parseEntry = (unparsedEntry: string[], skipBlanklines = true) => {
  const genericParseResult = genericParse(unparsedEntry)
  const { type } = genericParseResult

  const EntryClass = entryTypes[type]

  if (EntryClass) {
    return EntryClass.fromGenericParseResult(
      genericParseResult as GenericParseResultTransaction,
    )
  } else {
    assert(unparsedEntry.length === 1)

    const unparsedEntryLine = unparsedEntry[0]
    if (unparsedEntryLine === '') {
      if (skipBlanklines) {
        return
      }
      return Blankline.fromGenericParseResult(
        {} as unknown as GenericParseResult,
      )
    }
    return Comment.fromGenericParseResult({
      type: 'comment',
      props: { comment: unparsedEntryLine },
    } as unknown as GenericParseResult)
  }
}

export const parse = (input: string, skipBlanklines = true) => {
  const unparsedEntries = splitStringIntoUnparsedEntries(input)

  const parsedEntries = []
  const tagStack: Tag[] = []

  for (const unparsedEntry of unparsedEntries) {
    const parsedEntry = parseEntry(unparsedEntry, skipBlanklines)
    if (parsedEntry) {
      if (parsedEntry.type === 'pushtag') {
        tagStack.push(parsedEntry.tag)
      } else if (parsedEntry.type === 'poptag') {
        // Find and remove the most recent matching tag from the stack
        const tagToRemove = parsedEntry.tag.content
        for (let i = tagStack.length - 1; i >= 0; i--) {
          if (tagStack[i].content === tagToRemove) {
            tagStack.splice(i, 1)
            break
          }
        }
      }

      if (parsedEntry.type === 'transaction') {
        parsedEntry.tags.push(...tagStack)
      }

      parsedEntries.push(parsedEntry)
    }
  }

  return new ParseResult(parsedEntries)
}
