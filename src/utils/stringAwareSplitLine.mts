/**
 * Splits a string by newlines while respecting quoted strings.
 * Newlines inside quoted strings are preserved as part of the string content.
 * Handles escape sequences within quotes.
 *
 * @param input - The input string to split
 * @returns Array of strings split by newlines (excluding newlines within quotes)
 * @throws {Error} If there is an unclosed quote in the input
 */
export const stringAwareSplitLine = (input: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let isEscaped = false

  for (const char of input) {
    if (isEscaped) {
      current += char
      isEscaped = false
    } else if (char === '\\' && inQuotes) {
      current += char
      isEscaped = true
    } else if (char === '"') {
      inQuotes = !inQuotes
      current += char
    } else if (char === '\n' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  if (inQuotes) {
    throw new Error('Unclosed quote in input string')
  }

  result.push(current)

  return result
}
