import { countChar } from './countChar.mjs'
import { stringAwareSplitLine } from './stringAwareSplitLine.mjs'

/**
 * Splits a Beancount file string into an array of unparsed entry arrays.
 * Each entry is represented as an array of strings (tokens).
 *
 * This function handles:
 * - Splitting on blank lines between entries
 * - Detecting new entries based on indentation
 * - Preserving multi-line strings that span lines
 *
 * @param input - The complete Beancount file content as a string
 * @returns An array where each element is an array of string tokens representing one entry
 * @internal
 */
export const splitStringIntoUnparsedEntries = (input: string): string[][] => {
  const lines = input.split('\n')

  // split up the file into entries
  let inEntry = false
  let inString = false
  const unparsedEntries = lines.reduce<string[][]>((acc, line) => {
    if (!inString) {
      if (line.trim() === '') {
        // empty newline, next entry starts
        inEntry = false
      }

      if (!line.startsWith(' ') && inEntry) {
        // no indent, new entry
        inEntry = false
      }

      if (!inEntry) {
        acc.push([])
        inEntry = true
      }
    }

    acc[acc.length - 1].push(line)

    // After a blank line, ensure next line starts a new entry
    if (!inString && line.trim() === '') {
      inEntry = false
    }

    // odd number of ", we're in an unclosed string
    if (countChar(line, '"') % 2 === 1) {
      inString = !inString
    }

    return acc
  }, [])

  return unparsedEntries.map((lines) => stringAwareSplitLine(lines.join('\n')))
}
