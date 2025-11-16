import type { BeancountEntryType } from './entryTypeToClass.mjs'
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
  | GenericParseResultWithDate => {
  const [firstLine, ...rest] = unparsedEntry
  const splitFirstLine = firstLine.split(' ')
  if (/\d{4}-\d{2}-\d{2}/.exec(splitFirstLine[0])) {
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
