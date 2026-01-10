import { ParseResult } from './classes/ParseResult.mjs'
import { Comment, Blankline } from './classes/nodes/index.mjs'
import {
  genericParse,
  GenericParseResult,
  GenericParseResultTransaction,
} from './genericParse.mjs'
import { Tag } from './classes/nodes/Transaction/Tag.mjs'
import {
  beancountDirectiveNodeTypeToClass,
  BeancountDirectiveNodeType,
} from './nodeTypeToClass.mjs'
import { splitStringIntoSourceFragments } from './utils/splitStringIntoSourceFragments.js'

/**
 * Parses a single source fragment into its corresponding Node class instance.
 *
 * This function:
 * - Performs generic parsing to determine node type
 * - Instantiates the appropriate Node subclass
 * - Handles special cases for comments and blank lines
 *
 * @param sourceFragment - Array of string tokens that should be parsed to a single node
 * @returns A Node instance
 */
export const parseSourceFragment = (sourceFragment: string[]) => {
  const genericParseResult = genericParse(sourceFragment)
  const { type } = genericParseResult

  if (genericParseResult.synthetic) {
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

  const NodeClass =
    beancountDirectiveNodeTypeToClass[type as BeancountDirectiveNodeType]

  if (NodeClass) {
    return NodeClass.fromGenericParseResult(
      genericParseResult as GenericParseResultTransaction,
    )
  } else {
    throw Error(`Could not parse ${sourceFragment.toString()}`)
  }
}

/**
 * Parses a complete Beancount file string into a ParseResult containing Node objects.
 *
 * This is the main entry point for parsing Beancount files. It handles:
 * - Splitting the source into source fragment
 * - Parsing each source fragment into its appropriate node
 * - Managing the tag stack for pushtag/poptag nodes
 * - Applying tags from the stack to transactions
 *
 * @remarks
 * This is the primary function you'll use from this library. It takes a Beancount file
 * as a string and returns a structured ParseResult object containing the resulting parsed nodes.
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
 * // result.nodes contains parsed Node objects
 * ```
 *
 * @param source - The complete Beancount file content as a string
 * @returns A ParseResult instance containing all parsed nodes
 */
export const parse = (source: string) => {
  const sourceFragments = splitStringIntoSourceFragments(source)

  const nodes = []
  const tagStack: Tag[] = []

  for (const sourceFragment of sourceFragments) {
    const node = parseSourceFragment(sourceFragment)
    if (node) {
      if (node.type === 'pushtag') {
        tagStack.push(node.tag)
      } else if (node.type === 'poptag') {
        // Find and remove the most recent matching tag from the stack
        const tagToRemove = node.tag.content
        for (let i = tagStack.length - 1; i >= 0; i--) {
          if (tagStack[i].content === tagToRemove) {
            tagStack.splice(i, 1)
            break
          }
        }
      }

      if (node.type === 'transaction') {
        node.tags.push(...tagStack)
      }

      nodes.push(node)
    }
  }

  return new ParseResult(nodes)
}
