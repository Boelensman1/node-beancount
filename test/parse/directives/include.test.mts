import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Include } from '../../../src/classes/entryTypes/index.mjs'

test('Parse simple', () => {
  // simplest include directive
  const directive = 'include "path/to/include/file.beancount"'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Include
  expect(entry.type).toBe('include')
  expect(entry.filename).toBe('path/to/include/file.beancount')
})
