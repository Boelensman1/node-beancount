import { Value } from '../classes/Value.mjs'

/**
 * Type representing metadata as a record of key-value pairs.
 * Keys are strings, values are Value objects.
 */
export type Metadata = Record<string, Value>

/**
 * Parses metadata lines into a Metadata object.
 * Each line should be in the format "key: value".
 *
 * @param rest - Array of metadata line strings to parse
 * @returns A Metadata object with parsed key-value pairs, or undefined if no lines provided
 * @throws {Error} If any line cannot be parsed as metadata
 */
export const parseMetadata = (rest: string[]) => {
  if (rest.length === 0) {
    return undefined
  }

  return rest
    .filter((r) => r.trim().length > 0)
    .reduce<Metadata>((acc, line) => {
      const matches = /^(.*?): *(.*)$/.exec(line.trim())
      if (!matches) {
        throw new Error('Could not parse metadata')
      }
      acc[matches[1]] = Value.fromString(matches[2])
      return acc
    }, {})
}
