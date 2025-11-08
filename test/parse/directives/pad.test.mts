import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Pad } from '../../../src/classes/entryTypes/index.mjs'

test('Parse simple', () => {
  // simplest pad directive
  const directive =
    '2014-06-01 pad Assets:BofA:Checking Equity:Opening-Balances'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Pad
  expect(entry.type).toBe('pad')
  expect(entry.date.toJSON()).toBe('2014-06-01')
  expect(entry.account).toBe('Assets:BofA:Checking')
  expect(entry.accountPad).toBe('Equity:Opening-Balances')
})
