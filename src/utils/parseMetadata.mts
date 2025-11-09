import { Value } from '../classes/Value.mjs'

export type Metadata = Record<string, Value>

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
