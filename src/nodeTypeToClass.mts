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
} from './classes/nodes/index.mjs'
import type {
  DATED_DIRECTIVE_TYPES,
  NON_DATED_DIRECTIVE_TYPES,
} from './directiveTypes.mjs'

/**
 * Union type of all node types that correspond to a Beancount directive that includes a date field.
 * Derived from {@link DATED_DIRECTIVE_TYPES}.
 */
export type DatedDirectiveNodeType = (typeof DATED_DIRECTIVE_TYPES)[number]

/**
 * Union type of all node types that correspond to a Beancount directive type that does NOT include
 * a date field.
 * Derived from {@link NON_DATED_DIRECTIVE_TYPES}.
 */
export type NonDatedDirectiveNodeType =
  (typeof NON_DATED_DIRECTIVE_TYPES)[number]

/**
 * Union type of all node type that corrospond to Beancount directives.
 * Directive types derived from https://beancount.github.io/docs/beancount_language_syntax.html#directives-1
 * Node can have additional synthetic types, see {@link SyntheticNodeType}
 *
 * Derived from {@link DATED_DIRECTIVE_TYPES} and {@link NON_DATED_DIRECTIVE_TYPES}.
 */
export type BeancountDirectiveNodeType =
  | DatedDirectiveNodeType
  | NonDatedDirectiveNodeType

/**
 * Union type of synthetic node types that are not part of the official Beancount directive syntax.
 *
 * These node types are created during parsing to preserve the complete structure of a Beancount file,
 * enabling lossless round-trip parsing
 */
export type SyntheticNodeType = 'comment' | 'blankline'

/**
 * Union type of all valid node type names, that being the beancount directive types and the additional
 * synthetic node types of comment and blankline
 */
export type NodeType = BeancountDirectiveNodeType | SyntheticNodeType

/**
 * Mapping of Beancount directive node type names to their corresponding class constructors.
 * @internal
 */
export const beancountDirectiveNodeTypeToClass = {
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

// Compile-time assertion: beancountDirectiveNodeTypeToClass must have all BeancountDirectiveNodeType keys
beancountDirectiveNodeTypeToClass satisfies Record<
  BeancountDirectiveNodeType,
  unknown
>

/**
 * Mapping of all node type names (including synthetic) to their corresponding class constructors.
 * @internal
 */
export const nodeTypeToClass = {
  ...beancountDirectiveNodeTypeToClass,
  comment: Comment,
  blankline: Blankline,
}

// Compile-time assertion: nodeTypeToClass must have all NodeType keys
nodeTypeToClass satisfies Record<NodeType, unknown>
