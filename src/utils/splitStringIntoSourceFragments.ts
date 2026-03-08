import { countChar } from './countChar.mjs'
import { beanCountDirectiveRegex } from '../genericParse.mjs'
import { stringAwareSplitLine } from './stringAwareSplitLine.mjs'
import {
  BeancountParseError,
  type SourceFragmentWithLocation,
} from './SourceLocation.mjs'

/**
 * Splits a Beancount file string into an array of source fragments.
 * Each fragment is represented as an array of strings with location metadata.
 *
 * This function handles:
 * - Splitting on blank lines between fragments
 * - Detecting new fragments based on indentation
 * - Preserving multi-line fragments
 * - Tracking line numbers for each fragment
 *
 * @param source - The complete Beancount file content as a string
 * @returns An array where each element contains fragment lines and location information
 * @internal
 */
export const splitStringIntoSourceFragments = (
  source: string,
): SourceFragmentWithLocation[] => {
  const lines = source.split('\n')

  // split up the file into source fragments with line tracking
  let inFragment = false
  let inString = false
  let isDirectiveFragment = false

  interface FragmentWithLines {
    lines: string[]
    startLine: number
  }

  const fragmentsWithLines = lines.reduce<FragmentWithLines[]>(
    (acc, line, index) => {
      const lineNumber = index + 1 // 1-based line numbers

      if (!inString) {
        if (line.trim() === '') {
          // empty newline, next fragment starts
          inFragment = false
        }

        if (!line.startsWith(' ') && inFragment) {
          // no indent, new fragment
          inFragment = false
        }

        if (!inFragment) {
          acc.push({ lines: [], startLine: lineNumber })
          inFragment = true
          isDirectiveFragment = beanCountDirectiveRegex.test(line)
        }
      }

      acc[acc.length - 1].lines.push(line)

      // After a blank line, ensure next line starts a new fragment
      if (!inString && line.trim() === '') {
        inFragment = false
      }

      // odd number of ", we're in an unclosed string
      if (isDirectiveFragment && countChar(line, '"') % 2 === 1) {
        inString = !inString
      }

      return acc
    },
    [],
  )

  return fragmentsWithLines.map(({ lines, startLine }) => {
    const location = {
      startLine,
      endLine: startLine + lines.length - 1,
    }

    // Comment fragments (non-directives) may contain unbalanced quotes,
    // so skip string-aware splitting for them.
    const firstLine = lines[0] ?? ''
    if (!beanCountDirectiveRegex.test(firstLine)) {
      return {
        fragment: lines,
        location,
      }
    }

    try {
      const splitLines = stringAwareSplitLine(lines.join('\n'))
      return {
        fragment: splitLines,
        location,
      }
    } catch (error) {
      // Cap sourceContent to avoid huge error output when an unclosed quote
      // causes all remaining lines to be absorbed into a single fragment.
      const contextLines = lines.slice(0, 3)
      throw new BeancountParseError({
        message: error instanceof Error ? error.message : String(error),
        location: {
          startLine,
          endLine: startLine + contextLines.length - 1,
        },
        sourceContent: contextLines,
        cause: error instanceof Error ? error : undefined,
      })
    }
  })
}
