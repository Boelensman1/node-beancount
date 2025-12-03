import type { BeancountEntryType, FakeEntryType } from './entryTypeToClass.mjs'
import { DATED_ENTRY_TYPES, NON_DATED_ENTRY_TYPES } from './entryTypes.mjs'
import { parseMetadata, type Metadata } from './utils/parseMetadata.mjs'

/**
 * The basic result structure from generic parsing of a Beancount entry.
 * Contains the entry type, header line content, and any properties like comments.
 */
export interface GenericParseResult {
  /** The type of Beancount entry (e.g., 'open', 'close', 'balance') */
  type: BeancountEntryType
  /** The main header content from the first line of the entry */
  header: string
  /** Properties extracted from the entry */
  props: {
    /** Optional comment text following a semicolon */
    comment?: string
  }
  fake?: false
}

export interface GenericParseResultFakeEntry
  extends Omit<GenericParseResult, 'fake' | 'type'> {
  type: FakeEntryType
  fake: true
}

/**
 * Generic parse result for entries that include a date field.
 * Extends the base result with date and metadata properties.
 */
export interface GenericParseResultWithDate extends GenericParseResult {
  /** Extended properties including date and optional metadata */
  props: GenericParseResult['props'] & {
    /** The date string in YYYY-MM-DD format */
    date: string
    /** Optional metadata key-value pairs */
    metadata?: Metadata
  }
}

/**
 * Generic parse result specifically for transaction entries.
 * Extends the dated result with transaction-specific fields like body lines and flags.
 */
export interface GenericParseResultTransaction
  extends Omit<GenericParseResultWithDate, 'metadata'> {
  /** The body lines of the transaction (posting lines) */
  body: string[]
  /** Optional transaction flag character (e.g., '*', '!') */
  flag?: string
  /** Extended properties including date and optional flag */
  props: GenericParseResult['props'] & {
    /** The date string in YYYY-MM-DD format */
    date: string
    /** Optional transaction flag character */
    flag?: string
  }
}

/**
 * Compiles a regex pattern that validates both date format AND entry type.
 *
 * The generated pattern matches lines starting with:
 * - Date in YYYY-MM-DD format
 * - Followed by one or more whitespace characters
 * - Followed by either:
 *   - A valid dated entry type keyword from {@link DATED_ENTRY_TYPES}
 *   - A transaction flag (* or !)
 *   - The transaction alias 'txn'
 * - Followed by a word boundary to prevent partial matches
 *
 * This ensures that only valid Beancount directives with correct entry types
 * are recognized. Invalid entry types will be treated as comments.
 *
 * Pattern: `^YYYY-MM-DD\s+(validType|[*!]|txn)\b`
 *
 * @returns A RegExp that validates dated entry lines
 */
function compileEntryRegex(): RegExp {
  // Join all non dated entry types with | for regex alternation
  const nonDatedEntryPattern = NON_DATED_ENTRY_TYPES.join('|')

  // Join all dated entry types with | for regex alternation
  const datedEntryTypePattern = [
    ...DATED_ENTRY_TYPES,
    'txn',
    '[^ ]' /* flag */,
  ].join('|')

  const datePattern = `\\d{4}-\\d{2}-\\d{2}`
  const datedEntryPattern = `${datePattern} +(?:${datedEntryTypePattern})`

  const pattern = `^(?:${nonDatedEntryPattern})|(?:^${datedEntryPattern}) `
  return new RegExp(pattern)
}

/**
 * Regex pattern to identify Beancount entries that start with a date.
 * Generated from {@link NON_DATED_ENTRY_TYPES} and {@link DATED_ENTRY_TYPES} to ensure validation of entry types.
 */
const beanCountEntryRegex = compileEntryRegex()

/**
 * Performs generic parsing on an unparsed entry to extract common fields.
 *
 * This function:
 * - Detects if the entry has a date (YYYY-MM-DD format)
 * - Identifies the entry type
 * - Extracts header content and comments
 * - Handles transaction-specific parsing (flags, body lines)
 * - Parses metadata for dated entries
 *
 * @param unparsedEntry - Array of string tokens representing a single entry
 * @returns A generic parse result object appropriate for the entry type
 */
export const genericParse = (
  unparsedEntry: string[],
):
  | GenericParseResult
  | GenericParseResultTransaction
  | GenericParseResultWithDate
  | GenericParseResultFakeEntry => {
  const [firstLine, ...rest] = unparsedEntry

  if (firstLine.trim() === '') {
    return { type: 'blankline', header: '', props: {}, fake: true }
  }
  if (!beanCountEntryRegex.test(firstLine)) {
    // not a valid beancount entry, return it as a comment
    return { type: 'comment', header: firstLine, props: {}, fake: true }
  }

  const splitFirstLine = firstLine.split(' ')
  if (/^\d{4}-\d{2}-\d{2}/.exec(splitFirstLine[0].trim())) {
    let type = splitFirstLine[1]

    let flag
    if (type.length === 1) {
      flag = type
      // flag!
      type = 'transaction'
    }

    // special case
    if (type === 'txn') {
      type = 'transaction'
    }

    if (type === 'transaction') {
      const date = splitFirstLine[0].trim()
      const [header, ...comment] = splitFirstLine.slice(2).join(' ').split(';')
      return {
        type,
        header: header.trim(),
        body: rest.map((r) => r.trim()),
        props: {
          date,
          flag,
          comment: comment.length > 0 ? comment.join(';').trim() : undefined,
        },
      } as GenericParseResultTransaction
    }

    const date = splitFirstLine[0].trim()
    const metadata = parseMetadata(rest)
    const [header, ...comment] = splitFirstLine.slice(2).join(' ').split(';')
    return {
      type,
      header: header.trim(),
      props: {
        date,
        metadata,
        comment: comment.length > 0 ? comment.join(';').trim() : undefined,
      },
    } as GenericParseResultWithDate
  }

  const [header, ...comment] = splitFirstLine.slice(1).join(' ').split(';')
  return {
    type: splitFirstLine[0].trim(),
    header: header.trim(),
    props: {
      metadata: parseMetadata(rest),

      comment: comment.length > 0 ? comment.join(';').trim() : undefined,
    },
  } as GenericParseResult
}
