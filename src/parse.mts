import assert from 'node:assert'
import { ParseResult } from './classes/ParseResult.mjs'
import { Comment, Blankline } from './classes/entryTypes/index.mjs'
import { countChar } from './utils/countChar.mjs'
import { stringAwareSplitLine } from './utils/stringAwareSplitLine.mjs'
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

/**
 * Splits a Beancount file string into an array of unparsed entry arrays.
 * Each entry is represented as an array of strings (tokens).
 *
 * This function handles:
 * - Splitting on blank lines between entries
 * - Detecting new entries based on indentation
 * - Preserving multi-line strings that span lines
 *
 * @param input - The complete Beancount file content as a string
 * @returns An array where each element is an array of string tokens representing one entry
 * @internal
 */
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

/**
 * Parses a single unparsed entry into its corresponding Entry class instance.
 *
 * This function:
 * - Performs generic parsing to determine entry type
 * - Instantiates the appropriate Entry subclass
 * - Handles special cases for comments and blank lines
 *
 * @param unparsedEntry - Array of string tokens representing a single entry
 * @param skipBlanklines - If true, returns undefined for blank lines; if false, returns Blankline instances
 * @returns An Entry instance, or undefined if the entry is blank and skipBlanklines is true
 */
export const parseEntry = (unparsedEntry: string[], skipBlanklines = true) => {
  const genericParseResult = genericParse(unparsedEntry)
  const { type } = genericParseResult

  if (genericParseResult.fake) {
    if (type === 'blankline') {
      if (skipBlanklines) {
        return
      }
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
    assert(unparsedEntry.length === 1)

    const unparsedEntryLine = unparsedEntry[0]
    return Comment.fromGenericParseResult({
      type: 'comment',
      props: { comment: unparsedEntryLine },
    } as unknown as GenericParseResult)
  }
}

/**
 * Options for configuring the parse function behavior.
 */
export interface ParseOptions {
  /**
   * If true, blank lines in the input are skipped and not included in the result.
   * If false, blank lines are preserved as Blankline entries.
   * Defaults to true.
   */
  skipBlanklines?: boolean
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
 * @example
 * With options:
 * ```typescript
 * // Preserve blank lines in output
 * const result = parse(content, { skipBlanklines: false })
 * ```
 *
 * @param input - The complete Beancount file content as a string
 * @param options - Optional parsing configuration
 * @param options.skipBlanklines - If true, skips blank lines; defaults to true
 * @returns A ParseResult instance containing all parsed entries
 */
export const parse = (
  input: string,
  { skipBlanklines = true }: ParseOptions = {},
) => {
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
