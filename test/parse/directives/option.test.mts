import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Option } from '../../../src/classes/entryTypes/index.mjs'
import { Value } from '../../../src/classes/Value.mjs'

test('Parse simple', () => {
  // simplest option directive
  const directive = 'option "title" "Ed’s Personal Ledger"'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Option
  expect(entry.type).toBe('option')
  expect(entry.name).toBe('title')
  expect(entry.value).toEqual(
    new Value({ type: 'string', value: 'Ed’s Personal Ledger' }),
  )
})
