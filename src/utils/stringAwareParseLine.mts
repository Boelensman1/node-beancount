/**
 * Parses a line by splitting on spaces while respecting quoted strings.
 * Spaces inside quoted strings are preserved as part of the string content.
 *
 * @param line - The line string to parse
 * @returns Array of tokens split by spaces (excluding spaces within quotes)
 */
export const stringAwareParseLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
      current += char
    } else if (char === ' ' && !inQuotes) {
      if (current !== '') {
        result.push(current)
        current = ''
      }
    } else {
      current += char
    }
  }

  if (current !== '') {
    result.push(current)
  }

  return result
}
