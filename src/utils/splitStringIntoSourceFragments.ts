import { countChar } from './countChar.mjs'
import { beanCountDirectiveRegex } from '../genericParse.mjs'
import { stringAwareSplitLine } from './stringAwareSplitLine.mjs'
import {
  BeancountParseError,
  type DirectiveInfo,
  type SourceFragmentWithLocation,
} from './SourceLocation.mjs'

interface FragmentWithLinesNonDirective {
  lines: string[]
  startLine: number
  isDirective: false
  directiveInfo: undefined
}

interface FragmentWithLinesDirective {
  lines: string[]
  startLine: number
  isDirective: true
  directiveInfo: DirectiveInfo
}

type FragmentWithLines =
  | FragmentWithLinesNonDirective
  | FragmentWithLinesDirective

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
          inFragment = true
          const fragmentInfo = beanCountDirectiveRegex.exec(line)

          if (!fragmentInfo) {
            acc.push({
              lines: [],
              startLine: lineNumber,
              isDirective: false,
              directiveInfo: undefined,
            })
          } else {
            acc.push({
              lines: [],
              startLine: lineNumber,
              isDirective: true,
              directiveInfo: {
                date: fragmentInfo.groups!.date,
                directive:
                  fragmentInfo.groups!.dated_directive ??
                  fragmentInfo.groups!.non_dated_directive,
              },
            })
          }
        }
      }

      const currentFragment = acc[acc.length - 1]
      currentFragment.lines.push(line)

      // After a blank line, ensure next line starts a new fragment
      if (!inString && line.trim() === '') {
        inFragment = false
      }

      // odd number of ", we're in an unclosed string
      if (currentFragment.isDirective && countChar(line, '"') % 2 === 1) {
        inString = !inString
      }

      return acc
    },
    [],
  )

  return fragmentsWithLines.map(
    ({ lines, startLine, isDirective, directiveInfo }) => {
      const location = {
        startLine,
        endLine: startLine + lines.length - 1,
      }

      // Comment fragments (non-directives) may contain unbalanced quotes,
      // so skip string-aware splitting for them.
      if (!isDirective) {
        return {
          fragment: lines,
          location,
          isDirective: false,
          directiveInfo: undefined,
        }
      }

      try {
        const splitLines = stringAwareSplitLine(lines.join('\n'))
        return {
          fragment: splitLines,
          location,
          isDirective: true,
          directiveInfo,
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
    },
  )
}
