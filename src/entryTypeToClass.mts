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

/**
 * Union type of all valid Beancount entry type names.
 * EntryTypes derived from https://beancount.github.io/docs/beancount_language_syntax.html#directives-1
 * Entries can have two additional 'fake' types: 'comment' and 'blankline', see {@link EntryType}
 */
export type BeancountEntryType =
  | 'transaction'
  | 'balance'
  | 'close'
  | 'commodity'
  | 'custom'
  | 'document'
  | 'event'
  | 'include'
  | 'note'
  | 'open'
  | 'option'
  | 'pad'
  | 'plugin'
  | 'poptag'
  | 'price'
  | 'pushtag'
  | 'query'

/**
 * Union type of all valid entry type names, including the 'fake' entry types of comment and blankline.
 */
export type EntryType = BeancountEntryType | 'comment' | 'blankline'

/**
 * Mapping of Beancount entry type names to their corresponding class constructors.
 * @internal
 */
export const beancountEntryToClass = {
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

// Compile-time assertion: beancountEntryToClass must have all BeancountEntryType keys
beancountEntryToClass satisfies Record<BeancountEntryType, unknown>

/**
 * Mapping of all entry type names (including 'comment' and 'blankline') to their corresponding class constructors.
 * @internal
 */
export const entryTypeToClass = {
  ...beancountEntryToClass,
  comment: Comment,
  blankline: Blankline,
}

// Compile-time assertion: entryTypeToClass must have all EntryType keys
beancountEntryToClass satisfies Record<BeancountEntryType, unknown>
