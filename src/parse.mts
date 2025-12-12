import { ParseResult } from './classes/ParseResult.mjs'
import { Comment, Blankline } from './classes/entryTypes/index.mjs'
import {
  genericParse,
  GenericParseResult,
  GenericParseResultTransaction,
} from './genericParse.mjs'
import { Tag } from './classes/entryTypes/Transaction/Tag.mjs'
import {
  beancountEntryToClass,
  BeancountEntryType,
} from './entryTypeToClass.mjs'
import { splitStringIntoUnparsedEntries } from './utils/splitStringIntoUnparsedEntries.js'

/**
 * Parses a single unparsed entry into its corresponding Entry class instance.
 *
 * This function:
 * - Performs generic parsing to determine entry type
 * - Instantiates the appropriate Entry subclass
 * - Handles special cases for comments and blank lines
 *
 * @param unparsedEntry - Array of string tokens representing a single entry
 * @returns An Entry instance
 */
export const parseEntry = (unparsedEntry: string[]) => {
  const genericParseResult = genericParse(unparsedEntry)
  const { type } = genericParseResult

  if (genericParseResult.fake) {
    if (type === 'blankline') {
      return Blankline.fromGenericParseResult(
        genericParseResult as unknown as GenericParseResult,
      )
    } else {
      return Comment.fromGenericParseResult(
        genericParseResult as unknown as GenericParseResult,
      )
    }
  }

  const EntryClass = beancountEntryToClass[type as BeancountEntryType]

  if (EntryClass) {
    return EntryClass.fromGenericParseResult(
      genericParseResult as GenericParseResultTransaction,
    )
  } else {
    throw Error(`Could not parse ${unparsedEntry.toString()}`)
  }
}

/**
 * Parses a complete Beancount file string into a ParseResult containing Entry objects.
 *
 * This is the main entry point for parsing Beancount files. It handles:
 * - Splitting the input into individual entries
 * - Parsing each entry into its appropriate type
 * - Managing the tag stack for pushtag/poptag directives
 * - Applying tags from the stack to transactions
 *
 * @remarks
 * This is the primary function you'll use from this library. It takes a Beancount file
 * as a string and returns a structured ParseResult object containing all parsed entries.
 *
 * @example
 * Basic usage:
 * ```typescript
 * import { parse } from 'beancount'
 *
 * const content = `
 * 2024-01-01 open Assets:Checking
 * 2024-01-02 * "Payee" "Narration"
 *   Assets:Checking  100.00 USD
 *   Income:Salary   -100.00 USD
 * `
 *
 * const result = parse(content)
 * // result.entries contains parsed Entry objects
 * ```
 *
 * @param input - The complete Beancount file content as a string
 * @returns A ParseResult instance containing all parsed entries
 */
export const parse = (input: string) => {
  const unparsedEntries = splitStringIntoUnparsedEntries(input)

  const parsedEntries = []
  const tagStack: Tag[] = []

  for (const unparsedEntry of unparsedEntries) {
    const parsedEntry = parseEntry(unparsedEntry)
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
