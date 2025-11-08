import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Close } from '../../../src/classes/entryTypes/index.mjs'

test('Parse simple', () => {
  // simplest close directive
  const directive = '2014-05-01 close Liabilities:CreditCard:CapitalOne'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Close
  expect(entry.type).toBe('close')
  expect(entry.date.toJSON()).toBe('2014-05-01')
  expect(entry.account).toBe('Liabilities:CreditCard:CapitalOne')
})
