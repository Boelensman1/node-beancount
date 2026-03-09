import type {
  BeancountDirectiveNodeType,
  SyntheticNodeType,
} from './nodeTypeToClass.mjs'
import {
  DATED_DIRECTIVE_TYPES,
  NON_DATED_DIRECTIVE_TYPES,
} from './directiveTypes.mjs'
import { parseMetadata, type Metadata } from './utils/parseMetadata.mjs'
import { type SourceFragmentWithLocation } from './utils/SourceLocation.mjs'

/**
 * The basic result structure from generic parsing of a Beancount directive.
 * Contains the directive type, header line content, and any properties like comments.
 */
export interface GenericParseResult {
  /** The type of Beancount directive (e.g., 'open', 'close', 'balance') */
  type: BeancountDirectiveNodeType
  /** The main header content from the first line of the directive */
  header: string
  /** Properties extracted from the directive */
  props: {
    /** Optional comment text following a semicolon */
    comment?: string
  }
  synthetic?: false
}

/**
 * Generic parse result for synthetic (non-directive) nodes.
 * These represent content that doesn't correspond to actual Beancount directives,
 * such as comments and blank lines, which are preserved to maintain file structure.
 */
export interface GenericParseResultSyntheticNode extends Omit<
  GenericParseResult,
  'synthetic' | 'type'
> {
  /** The synthetic node type (e.g., 'comment', 'blankline') */
  type: SyntheticNodeType
  /** Always true to distinguish synthetic nodes from real Beancount directives */
  synthetic: true
}

/**
 * Generic parse result for directives that include a date field.
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
 * Generic parse result specifically for transaction directives.
 * Extends the dated result with transaction-specific fields like body lines and flags.
 */
export interface GenericParseResultTransaction extends Omit<
  GenericParseResultWithDate,
  'metadata'
> {
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
 * Compiles a regex pattern that validates both date format AND directive type.
 *
 * The generated pattern matches lines starting with:
 * - Date in YYYY-MM-DD format
 * - Followed by one or more whitespace characters
 * - Followed by either:
 *   - A valid dated node type keyword from {@link DATED_DIRECTIVE_TYPES}
 *   - A transaction flag (* or !)
 *   - The transaction alias 'txn'
 * - Followed by a word boundary to prevent partial matches
 *
 * This ensures that only valid Beancount directives with correct node types
 * are recognized. Invalid directive types will be treated as comments.
 *
 * Pattern: `^YYYY-MM-DD\s+(validType|[*!]|txn)\b`
 *
 * @returns A RegExp that validates dated node lines
 */
function compileDirectivePattern(): RegExp {
  // Join all non dated directive types with | for regex alternation
  const nonDatedDirectivesPattern = NON_DATED_DIRECTIVE_TYPES.join('|')

  // Join all dated directive types with | for regex alternation
  const datedDirectivesTypePattern = [
    ...DATED_DIRECTIVE_TYPES,
    'txn',
    '[^ ]' /* flag */,
  ].join('|')

  const datePattern = `(?<date>\\d{4}-\\d{2}-\\d{2})`
  const datedDirectivesPattern = `${datePattern} +(?<dated_directive>${datedDirectivesTypePattern})`

  const pattern = `^(?<non_dated_directive>${nonDatedDirectivesPattern})|(?:^${datedDirectivesPattern}) `
  return new RegExp(pattern)
}

/**
 * Regex pattern to identify Beancount directives
 * Generated from {@link NON_DATED_DIRECTIVE_TYPES} and {@link DATED_DIRECTIVE_TYPES} to ensure validation of directive types.
 */
export const beanCountDirectiveRegex = compileDirectivePattern()

/**
 * Performs generic parsing on a source fragment to extract common fields.
 *
 * This function:
 * - Detects if the directive has a date (YYYY-MM-DD format)
 * - Identifies the directive type
 * - Extracts header content and comments
 * - Handles transaction-specific parsing (flags, body lines)
 * - Parses metadata for dated directives
 *
 * @param sourceFragment - A single source fragment
 * @returns A generic parse result object appropriate for the node type
 */
export const genericParse = (
  sourceFragment: SourceFragmentWithLocation,
):
  | GenericParseResult
  | GenericParseResultTransaction
  | GenericParseResultWithDate
  | GenericParseResultSyntheticNode => {
  const { fragment, directiveInfo } = sourceFragment
  const [firstLine, ...rest] = fragment

  if (!directiveInfo) {
    // not a valid beancount directive, return it as a comment or a newline

    if (firstLine.trim() === '') {
      return { type: 'blankline', header: '', props: {}, synthetic: true }
    }

    return {
      type: 'comment',
      header: fragment.join('\n'),
      props: {},
      synthetic: true,
    }
  }

  const splitFirstLine = firstLine.split(' ')
  if (directiveInfo.date) {
    let type = directiveInfo.directive

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
      const [header, ...comment] = splitFirstLine.slice(2).join(' ').split(';')
      return {
        type,
        header: header.trim(),
        body: rest.map((r) => r.trim()),
        props: {
          date: directiveInfo.date,
          flag,
          comment: comment.length > 0 ? comment.join(';').trim() : undefined,
        },
      } as GenericParseResultTransaction
    }

    const metadata = parseMetadata(rest)
    const [header, ...comment] = splitFirstLine.slice(2).join(' ').split(';')
    return {
      type,
      header: header.trim(),
      props: {
        date: directiveInfo.date,
        metadata,
        comment: comment.length > 0 ? comment.join(';').trim() : undefined,
      },
    } as GenericParseResultWithDate
  }

  const [header, ...comment] = splitFirstLine.slice(1).join(' ').split(';')
  return {
    type: directiveInfo.directive,
    header: header.trim(),
    props: {
      metadata: parseMetadata(rest),
      comment: comment.length > 0 ? comment.join(';').trim() : undefined,
    },
  } as GenericParseResult
}
