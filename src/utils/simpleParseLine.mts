/**
 * Parses a line by splitting on spaces and filtering out empty strings.
 * Does not handle quoted strings - use stringAwareParseLine for that.
 *
 * @param line - The line string to parse
 * @returns Array of non-empty tokens split by spaces
 */
export const simpleParseLine = (line: string): string[] =>
  line.split(' ').filter((e) => e !== '')
