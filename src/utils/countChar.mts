/**
 * Counts the number of occurrences of a character in a string.
 *
 * @param line - The string to search in
 * @param charToCount - The character to count occurrences of
 * @returns The number of times the character appears in the string
 */
export const countChar = (line: string, charToCount: string) => {
  return line.split(charToCount).length - 1
}
