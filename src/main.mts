/**
 * beancount - A parser and editor for Beancount accounting files with full type safety.
 *
 * @remarks
 * The primary function you'll use is {@link parse}, which parses a complete Beancount file
 * and returns a {@link ParseResult} containing parsed nodes.
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
 * console.log(result.nodes) // Array of parsed Node objects
 * ```
 *
 * @module
 */

// Primary parsing functionality
export { parse, parseSourceFragment } from './parse.mjs'
export {
  deserializeNode,
  deserializeNodeFromString,
  deserializeNodes,
  deserializeNodesFromString,
} from './deserialize.mjs'
export {
  parseFile,
  type ParseFileOptions,
  type FileSystemHelpers,
} from './parseFile.mjs'

// Generic parse result types
export type {
  GenericParseResult,
  GenericParseResultWithDate,
  GenericParseResultTransaction,
} from './genericParse.mjs'
export type { Metadata } from './utils/parseMetadata.mjs'

// Error handling
export {
  BeancountParseError,
  type SourceLocation,
  type SourceFragmentWithLocation,
} from './utils/SourceLocation.mjs'

// Core classes
export {
  ParseResult,
  type ParseResultObj,
  type FormatOptions,
  type CalculateCurrencyColumnOptions,
} from './classes/ParseResult.mjs'
export { Node, assertNodeConstructor } from './classes/Node.mjs'
export { DatedNode } from './classes/DatedNode.mjs'
export { Value } from './classes/Value.mjs'
export type { ValueType } from './classes/Value.mjs'

// Node classes
export { Balance } from './classes/nodes/Balance.mjs'
export { Blankline } from './classes/nodes/Blankline.mjs'
export { Close } from './classes/nodes/Close.mjs'
export { Comment } from './classes/nodes/Comment.mjs'
export { Commodity } from './classes/nodes/Commodity.mjs'
export { Custom } from './classes/nodes/Custom.mjs'
export { Document } from './classes/nodes/Document.mjs'
export { Event } from './classes/nodes/Event.mjs'
export { Include } from './classes/nodes/Include.mjs'
export { Note } from './classes/nodes/Note.mjs'
export { Open } from './classes/nodes/Open.mjs'
export { Option } from './classes/nodes/Option.mjs'
export { Pad } from './classes/nodes/Pad.mjs'
export { Plugin } from './classes/nodes/Plugin.mjs'
export { Poptag } from './classes/nodes/Poptag.mjs'
export { Price } from './classes/nodes/Price.mjs'
export { Pushtag } from './classes/nodes/Pushtag.mjs'
export { Query } from './classes/nodes/Query.mjs'
export {
  Transaction,
  type PostingComment,
} from './classes/nodes/Transaction/index.mjs'

// Transaction sub-components
export { Posting } from './classes/nodes/Transaction/Posting.mjs'
export { Tag } from './classes/nodes/Transaction/Tag.mjs'

// Node type mappings
export type {
  BeancountDirectiveNodeType,
  NodeType,
  SyntheticNodeType,
  DatedDirectiveNodeType,
  NonDatedDirectiveNodeType,
} from './nodeTypeToClass.mjs'
export {
  beancountDirectiveNodeTypeToClass,
  nodeTypeToClass,
} from './nodeTypeToClass.mjs'
export {
  DATED_DIRECTIVE_TYPES,
  NON_DATED_DIRECTIVE_TYPES,
} from './directiveTypes.mjs'
