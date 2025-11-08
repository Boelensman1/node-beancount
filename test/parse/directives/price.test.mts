import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Price } from '../../../src/classes/entryTypes/index.mjs'

test('Parse simple', () => {
  // simplest price directive
  const directive = '2014-07-09 price HOOL  579.18 USD'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Price
  expect(entry.type).toBe('price')
  expect(entry.date.toJSON()).toBe('2014-07-09')
  expect(entry.commodity).toBe('HOOL')
  expect(entry.amount).toBe('579.18')
  expect(entry.currency).toBe('USD')
  expect(entry.price).toBe('579.18 USD')
})
