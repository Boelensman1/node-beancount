import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Balance } from '../../../src/classes/entryTypes/index.mjs'
import { Value } from '../../../src/classes/Value.mjs'

test('Parse simple', () => {
  // simplest balance directive
  const directive =
    '2014-12-26 balance Liabilities:US:CreditCard   -3492.02 USD'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Balance
  expect(entry.type).toBe('balance')
  expect(entry.date.toJSON()).toBe('2014-12-26')
  expect(entry.account).toBe('Liabilities:US:CreditCard')
  expect(entry.amount).toBe('-3492.02')
  expect(entry.currency).toBe('USD')
  expect(entry.price).toBe('-3492.02 USD')
})

test('Parse with metadata', () => {
  const directive = `2014-12-26 balance Liabilities:US:CreditCard -3492.02 USD
  note: "testnote"
  booleanInput: TRUE`
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Balance
  expect(entry.type).toBe('balance')
  expect(entry.date.toJSON()).toBe('2014-12-26')
  expect(entry.account).toBe('Liabilities:US:CreditCard')
  expect(entry.amount).toBe('-3492.02')
  expect(entry.currency).toBe('USD')
  expect(entry.price).toBe('-3492.02 USD')
  expect(entry.metadata).toEqual({
    note: new Value({ type: 'string', value: 'testnote' }),
    booleanInput: new Value({ type: 'boolean', value: true }),
  })
})
