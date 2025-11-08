import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Custom } from '../../../src/classes/entryTypes/index.mjs'

test('Parse simple', () => {
  // simplest custom directive
  const directive = '2014-07-09 custom "budget"'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Custom
  expect(entry.type).toBe('custom')
  expect(entry.date.toJSON()).toBe('2014-07-09')
  expect(entry.customType).toBe('budget')
  expect(entry.values).toBeUndefined()
})

test('Parse with values', () => {
  // simplest custom directive
  const directive = '2014-07-09 custom "budget" "..." TRUE 45.30 USD'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Custom
  expect(entry.type).toBe('custom')
  expect(entry.date.toJSON()).toBe('2014-07-09')
  expect(entry.customType).toBe('budget')
  expect(entry.values).toEqual(['...', true, '45.30', 'USD'])
})
