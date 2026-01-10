import { countChar } from './countChar.mjs'
import { stringAwareSplitLine } from './stringAwareSplitLine.mjs'

/**
 * Splits a Beancount file string into an array of source fragments.
 * Each fragment is represented as an array of strings.
 *
 * This function handles:
 * - Splitting on blank lines between fragments
 * - Detecting new fragments based on indentation
 * - Preserving multi-line fragments
 *
 * @param source - The complete Beancount file content as a string
 * @returns An array where each element is an array of strings representing one source fragment
 * @internal
 */
export const splitStringIntoSourceFragments = (source: string): string[][] => {
  const lines = source.split('\n')

  // split up the file into source fragments
  let inFragment = false
  let inString = false
  const fragments = lines.reduce<string[][]>((acc, line) => {
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
        acc.push([])
        inFragment = true
      }
    }

    acc[acc.length - 1].push(line)

    // After a blank line, ensure next line starts a new fragment
    if (!inString && line.trim() === '') {
      inFragment = false
    }

    // odd number of ", we're in an unclosed string
    if (countChar(line, '"') % 2 === 1) {
      inString = !inString
    }

    return acc
  }, [])

  return fragments.map((lines) => stringAwareSplitLine(lines.join('\n')))
}
