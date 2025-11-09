import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Poptag } from '../../../src/classes/entryTypes/index.mjs'
import { Tag } from '../../../src/classes/entryTypes/Transaction/Tag.mjs'

test('Parse simple', () => {
  // simplest include directive
  const directive = 'poptag #berlin-trip-2014'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Poptag
  expect(entry.type).toBe('poptag')
  expect(entry.tag).toEqual(
    new Tag({ content: 'berlin-trip-2014', fromStack: true }),
  )
})
