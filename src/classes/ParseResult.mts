import { Temporal } from '@js-temporal/polyfill'
import { NodeType, nodeTypeToClass } from '../nodeTypeToClass.mjs'
import { Node } from './Node.mjs'
import { Posting } from './nodes/Transaction/Posting.mjs'
import type { Transaction } from './nodes/Transaction/index.mjs'
import type { Balance } from './nodes/Balance.mjs'
import type { Close } from './nodes/Close.mjs'
import type { Commodity } from './nodes/Commodity.mjs'
import type { Custom } from './nodes/Custom.mjs'
import type { Document } from './nodes/Document.mjs'
import type { Event } from './nodes/Event.mjs'
import type { Include } from './nodes/Include.mjs'
import type { Note } from './nodes/Note.mjs'
import type { Open } from './nodes/Open.mjs'
import type { Option } from './nodes/Option.mjs'
import type { Pad } from './nodes/Pad.mjs'
import type { Plugin } from './nodes/Plugin.mjs'
import type { Poptag } from './nodes/Poptag.mjs'
import type { Price } from './nodes/Price.mjs'
import type { Pushtag } from './nodes/Pushtag.mjs'
import type { Query } from './nodes/Query.mjs'
import type { Comment } from './nodes/Comment.mjs'
import type { Blankline } from './nodes/Blankline.mjs'

export interface ParseResultObj {
  nodes: { type: NodeType }[]
}

/**
 * Options for formatting output.
 */
export interface FormatOptions {
  /** The column position where currency symbols should be aligned */
  currencyColumn: number
}

export const defaultFormatOptions = {
  currencyColumn: 59,
}

/**
 * Options for calculating the optimal currency column position.
 */
export interface CalculateCurrencyColumnOptions {
  /** Override the maximum left part length (flag + account name) */
  maxLeftPartLength?: number
  /** Override the maximum amount length */
  maxAmountLength?: number
  /** Minimum padding between account and amount (default: 3) */
  minPadding?: number
}

/**
 * Container class for the result of a parse.
 * Provides methods for converting node back to string format.
 */
export class ParseResult {
  /**
   * Creates a new ParseResult instance.
   * @param nodes - Array of parsed nodes
   */
  constructor(public nodes: Node[]) {}

  /**
   * Gets all transaction nodes from the parsed nodes.
   * @returns Array of nodes that correspond to transaction directives
   */
  get transactions(): Transaction[] {
    return this.nodes.filter(
      (node): node is Transaction => node.type === 'transaction',
    )
  }

  /**
   * Gets all balance nodes from the parsed nodes.
   * @returns Array of nodes that correspond to balance directives
   */
  get balance(): Balance[] {
    return this.nodes.filter((node): node is Balance => node.type === 'balance')
  }

  /**
   * Gets all close nodes from the parsed nodes.
   * @returns Array of nodes that correspond to close directives
   */
  get close(): Close[] {
    return this.nodes.filter((node): node is Close => node.type === 'close')
  }

  /**
   * Gets all commodity nodes from the parsed nodes.
   * @returns Array of nodes that correspond to commodity directives
   */
  get commodity(): Commodity[] {
    return this.nodes.filter(
      (node): node is Commodity => node.type === 'commodity',
    )
  }

  /**
   * Gets all custom nodes from the parsed nodes.
   * @returns Array of nodes that correspond to custom directives
   */
  get custom(): Custom[] {
    return this.nodes.filter((node): node is Custom => node.type === 'custom')
  }

  /**
   * Gets all document nodes from the parsed nodes.
   * @returns Array of nodes that correspond to document directives
   */
  get document(): Document[] {
    return this.nodes.filter(
      (node): node is Document => node.type === 'document',
    )
  }

  /**
   * Gets all event nodes from the parsed nodes.
   * @returns Array of nodes that correspond to event directives
   */
  get event(): Event[] {
    return this.nodes.filter((node): node is Event => node.type === 'event')
  }

  /**
   * Gets all include nodes from the parsed nodes.
   * @returns Array of nodes that correspond to include directives
   */
  get include(): Include[] {
    return this.nodes.filter((node): node is Include => node.type === 'include')
  }

  /**
   * Gets all note nodes from the parsed nodes.
   * @returns Array of nodes that correspond to note directives
   */
  get note(): Note[] {
    return this.nodes.filter((node): node is Note => node.type === 'note')
  }

  /**
   * Gets all open nodes from the parsed nodes.
   * @returns Array of nodes that correspond to open directives
   */
  get open(): Open[] {
    return this.nodes.filter((node): node is Open => node.type === 'open')
  }

  /**
   * Gets all option nodes from the parsed nodes.
   * @returns Array of nodes that correspond to option directives
   */
  get option(): Option[] {
    return this.nodes.filter((node): node is Option => node.type === 'option')
  }

  /**
   * Gets all pad nodes from the parsed nodes.
   * @returns Array of nodes that correspond to pad directives
   */
  get pad(): Pad[] {
    return this.nodes.filter((node): node is Pad => node.type === 'pad')
  }

  /**
   * Gets all plugin nodes from the parsed nodes.
   * @returns Array of nodes that correspond to plugin directives
   */
  get plugin(): Plugin[] {
    return this.nodes.filter((node): node is Plugin => node.type === 'plugin')
  }

  /**
   * Gets all poptag nodes from the parsed nodes.
   * @returns Array of nodes that correspond to poptag directives
   */
  get poptag(): Poptag[] {
    return this.nodes.filter((node): node is Poptag => node.type === 'poptag')
  }

  /**
   * Gets all price nodes from the parsed nodes.
   * @returns Array of nodes that correspond to price directives
   */
  get price(): Price[] {
    return this.nodes.filter((node): node is Price => node.type === 'price')
  }

  /**
   * Gets all pushtag nodes from the parsed nodes.
   * @returns Array of nodes that correspond to pushtag directives
   */
  get pushtag(): Pushtag[] {
    return this.nodes.filter((node): node is Pushtag => node.type === 'pushtag')
  }

  /**
   * Gets all query nodes from the parsed nodes.
   * @returns Array of nodes that correspond to query directives
   */
  get query(): Query[] {
    return this.nodes.filter((node): node is Query => node.type === 'query')
  }

  /**
   * Gets all comment nodes from the parsed nodes.
   * @returns Array of nodes that correspond to a comments
   */
  get comment(): Comment[] {
    return this.nodes.filter((node): node is Comment => node.type === 'comment')
  }

  /**
   * Gets all blankline nodes from the parsed nodes.
   * @returns Array of nodes that correspond to a blank line
   */
  get blankline(): Blankline[] {
    return this.nodes.filter(
      (node): node is Blankline => node.type === 'blankline',
    )
  }

  /**
   * Gets all unique account names used across all directives.
   * Extracts accounts from transactions (via postings), open, close,
   * balance, pad, note, and document nodes.
   * @returns Set of unique account names
   */
  get accounts(): Set<string> {
    const accountSet = new Set<string>()

    for (const node of this.nodes) {
      switch (node.type) {
        case 'transaction':
          for (const posting of (node as Transaction).postings) {
            accountSet.add(posting.account)
          }
          break
        case 'open':
        case 'close':
        case 'balance':
        case 'note':
        case 'document':
          accountSet.add(
            (node as Open | Close | Balance | Note | Document).account,
          )
          break
        case 'pad': {
          const pad = node as Pad
          accountSet.add(pad.account)
          accountSet.add(pad.accountPad)
          break
        }
      }
    }

    return accountSet
  }

  /**
   * Gets all unique flags used across all transactions and postings.
   * Extracts flags from transaction directives and their individual postings.
   * @returns Set of unique flag strings
   */
  get flags(): Set<string> {
    const flagSet = new Set<string>()

    for (const node of this.nodes) {
      if (node.type === 'transaction') {
        const transaction = node as Transaction
        // Add transaction-level flag
        if (transaction.flag !== undefined) {
          flagSet.add(transaction.flag)
        }
        // Add posting-level flags
        for (const posting of transaction.postings) {
          if (posting.flag !== undefined) {
            flagSet.add(posting.flag)
          }
        }
      }
    }

    return flagSet
  }

  /**
   * Gets all unique tag names used across all directives.
   * Extracts tags from transactions, pushtag, and poptag nodes.
   * @returns Set of unique tag names (without the '#' prefix)
   */
  get tags(): Set<string> {
    const tagSet = new Set<string>()

    for (const node of this.nodes) {
      switch (node.type) {
        case 'transaction':
          for (const tag of (node as Transaction).tags) {
            tagSet.add(tag.content)
          }
          break
        case 'pushtag':
          tagSet.add((node as Pushtag).tag.content)
          break
        case 'poptag':
          tagSet.add((node as Poptag).tag.content)
          break
      }
    }

    return tagSet
  }

  /**
   * Gets all accounts that are active (open and not yet closed) at a given date.
   * An account is considered active if:
   * - It has an open directive with date <= the given date
   * - It either has no close directive, or the close directive date > the given date
   *
   * @param date - The date to check account status for
   * @returns Set of account names that are active on the given date
   */
  accountsActiveAt(date: Temporal.PlainDate): Set<string> {
    const openedAccounts = new Map<string, Temporal.PlainDate>()
    const closedAccounts = new Map<string, Temporal.PlainDate>()

    for (const node of this.nodes) {
      if (node.type === 'open') {
        const open = node as Open
        openedAccounts.set(open.account, open.date)
      } else if (node.type === 'close') {
        const close = node as Close
        closedAccounts.set(close.account, close.date)
      }
    }

    const activeSet = new Set<string>()

    for (const [account, openDate] of openedAccounts) {
      if (Temporal.PlainDate.compare(openDate, date) <= 0) {
        const closeDate = closedAccounts.get(account)
        if (!closeDate || Temporal.PlainDate.compare(closeDate, date) > 0) {
          activeSet.add(account)
        }
      }
    }

    return activeSet
  }

  /**
   * Converts all nodes to their string representation.
   * Each node is converted using its toString() method and joined with newlines.
   * @returns The complete Beancount file content as a string
   */
  toString() {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return this.nodes.map((e) => e.toString()).join('\n')
  }

  /**
   * Converts all nodes to a formatted string with aligned columns.
   * Uses each node's toFormattedString() method for consistent formatting.
   * @param formatOptions - Formatting options
   *
   * @returns The formatted Beancount file content as a string
   */
  toFormattedString(formatOptions: FormatOptions = defaultFormatOptions) {
    return this.nodes.map((e) => e.toFormattedString(formatOptions)).join('\n')
  }

  /**
   * Creates an ParseResult instance from JSON data.
   * Calls fromJSONData to allow subclasses to transform the data before construction.
   *
   * @param jsonString - JSON data representing an ParseResult
   * @remarks **Warning:** No validation is performed on the JSON input. We assume the JSON is valid and well-formed.
   * @returns A new instance of ParseResult loaded with the data in the JSON
   */
  static fromJSON(jsonString: string) {
    return ParseResult.fromJSONData(JSON.parse(jsonString) as ParseResultObj)
  }

  /**
   * Creates a ParseResult instance from a plain JavaScript object.
   * Deserializes each node by mapping it to the appropriate Node class based on its type.
   *
   * @param obj - Plain object representation of a ParseResult
   * @returns A new ParseResult instance with deserialized nodes
   * @throws {Error} If an node has an unknown type with no corresponding node class
   * @remarks **Warning:** No validation is performed on the input object. We assume the object is valid and well-formed.
   */
  static fromJSONData(obj: ParseResultObj) {
    const nodeObjects = obj.nodes
    const nodes = nodeObjects.map((nodeObj) => {
      const { type } = nodeObj
      const NodeClass = nodeTypeToClass[type]
      if (!NodeClass) {
        throw new Error(`No class found for type ${type} while creating nodes`)
      }
      // Type assertion needed because TypeScript can't verify that all node classes
      // in the union type have compatible constructor signatures
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return (NodeClass as any).fromJSONData(nodeObj) as Node
    })

    return new ParseResult(nodes)
  }

  /**
   * Calculates the optimal currency column position for formatting.
   *
   * The currency column is determined by analyzing all postings across transactions
   * and finding the maximum widths needed for account names and amounts.
   *
   * Formula: currencyColumn = maxLeftPartLength + maxAmountLength + minPadding + 6
   *
   * Where:
   * - maxLeftPartLength = max((flag.length + 1 if flag) + account.length)
   * - maxAmountLength = max(amount.length) for all postings with amounts
   * - minPadding = desired minimum spaces between account and amount (default: 2)
   * - 6 = fixed overhead (2 for indent + 2 for spacing + 2 for buffer)
   *
   * @param options - Optional configuration for the calculation
   * @returns The calculated currency column position (1-indexed)
   *
   * @example
   * ```typescript
   * const parseResult = parse(beancountString)
   * const currencyColumn = parseResult.calculateCurrencyColumn()
   * const formatted = parseResult.toFormattedString({ currencyColumn })
   * ```
   */
  calculateCurrencyColumn(
    options: CalculateCurrencyColumnOptions = {},
  ): number {
    const {
      maxLeftPartLength: overrideMaxLeft,
      maxAmountLength: overrideMaxAmount,
      minPadding = 3,
    } = options

    // Ensure minPadding is at least 1
    const effectiveMinPadding = Math.max(1, minPadding)

    // Get all transactions
    const transactions = this.transactions

    // Edge case: No transactions
    if (transactions.length === 0) {
      return defaultFormatOptions.currencyColumn
    }

    // Extract all postings from the transactions
    const allPostings: Posting[] = []
    for (const transaction of transactions) {
      allPostings.push(...transaction.postings)
    }

    // Edge case: No postings
    if (allPostings.length === 0) {
      return defaultFormatOptions.currencyColumn
    }

    // Calculate maxLeftPartLength (flag + account)
    let maxLeftPartLength = overrideMaxLeft ?? 0
    if (overrideMaxLeft === undefined) {
      for (const posting of allPostings) {
        let leftPartLength = posting.account.length
        if (posting.flag !== undefined) {
          leftPartLength += posting.flag.length + 1
        }
        maxLeftPartLength = Math.max(maxLeftPartLength, leftPartLength)
      }
    }

    // Calculate maxAmountLength
    let maxAmountLength = overrideMaxAmount ?? 0
    if (overrideMaxAmount === undefined) {
      for (const posting of allPostings) {
        if (posting.amount !== undefined) {
          maxAmountLength = Math.max(maxAmountLength, posting.amount.length)
        }
      }
    }

    // Calculate and return currency column
    return maxLeftPartLength + maxAmountLength + effectiveMinPadding + 6
  }
}
