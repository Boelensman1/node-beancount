/**
 * beancount - A parser and editor for Beancount accounting files with full type safety.
 *
 * @remarks
 * The primary function you'll use is {@link parse}, which parses a complete Beancount file
 * and returns a {@link ParseResult} containing all parsed entries.
 *
 * @example
 * ```typescript
 * import { parse } from 'beancount'
 *
 * const beancountContent = `
 * 2024-01-01 open Assets:Checking
 * 2024-01-02 * "Grocery Store" "Weekly shopping"
 *   Assets:Checking  -50.00 USD
 *   Expenses:Food     50.00 USD
 * `
 *
 * const result = parse(beancountContent)
 * console.log(result.entries) // Array of parsed Entry objects
 * ```
 *
 * @module
 */

// Primary parsing functionality
export { parse, parseEntry, splitStringIntoUnparsedEntries } from './parse.mjs'
export type { ParseOptions } from './parse.mjs'

// Generic parse result types
export type {
  GenericParseResult,
  GenericParseResultWithDate,
  GenericParseResultTransaction,
} from './genericParse.mjs'
export type { Metadata } from './utils/parseMetadata.mjs'

// Core classes
export {
  ParseResult,
  type ParseResultObj,
  type FormatOptions,
} from './classes/ParseResult.mjs'
export { Entry, assertEntryConstructor } from './classes/Entry.mjs'
export { DateEntry } from './classes/DateEntry.mjs'
export type { BeancountDateEntryType } from './classes/DateEntry.mjs'
export { Value } from './classes/Value.mjs'
export type { ValueType } from './classes/Value.mjs'

// Entry type classes
export { Balance } from './classes/entryTypes/Balance.mjs'
export { Blankline } from './classes/entryTypes/Blankline.mjs'
export { Close } from './classes/entryTypes/Close.mjs'
export { Comment } from './classes/entryTypes/Comment.mjs'
export { Commodity } from './classes/entryTypes/Commodity.mjs'
export { Custom } from './classes/entryTypes/Custom.mjs'
export { Document } from './classes/entryTypes/Document.mjs'
export { Event } from './classes/entryTypes/Event.mjs'
export { Include } from './classes/entryTypes/Include.mjs'
export { Note } from './classes/entryTypes/Note.mjs'
export { Open } from './classes/entryTypes/Open.mjs'
export { Option } from './classes/entryTypes/Option.mjs'
export { Pad } from './classes/entryTypes/Pad.mjs'
export { Plugin } from './classes/entryTypes/Plugin.mjs'
export { Poptag } from './classes/entryTypes/Poptag.mjs'
export { Price } from './classes/entryTypes/Price.mjs'
export { Pushtag } from './classes/entryTypes/Pushtag.mjs'
export { Query } from './classes/entryTypes/Query.mjs'
export { Transaction } from './classes/entryTypes/Transaction/index.mjs'

// Transaction sub-components
export { Posting } from './classes/entryTypes/Transaction/Posting.mjs'
export { Tag } from './classes/entryTypes/Transaction/Tag.mjs'

// Entry type mappings
export type {
  BeancountEntryType,
  EntryType,
  FakeEntryType,
  BeancountDatedEntryType,
  BeancountNonDatedEntryType,
} from './entryTypeToClass.mjs'
export { beancountEntryToClass, entryTypeToClass } from './entryTypeToClass.mjs'
export { DATED_ENTRY_TYPES, NON_DATED_ENTRY_TYPES } from './entryTypes.mjs'
