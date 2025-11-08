import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Commodity } from '../../../src/classes/entryTypes/index.mjs'

test('Parse simple', () => {
  // simplest commodity directive
  const directive = '1867-07-01 commodity CAD'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Commodity
  expect(entry.type).toBe('commodity')
  expect(entry.date.toJSON()).toBe('1867-07-01')
  expect(entry.currency).toBe('CAD')
  expect(entry.metadata).toBeUndefined()
})

test('Parse with metadata', () => {
  // simplest commodity directive
  const directive = `
2012-01-01 commodity HOOL
  name: "Hooli Corporation Class C Shares"
  asset-class: "stock"`
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Commodity
  expect(entry.type).toBe('commodity')
  expect(entry.date.toJSON()).toBe('2012-01-01')
  expect(entry.currency).toBe('HOOL')
  expect(entry.metadata).toEqual({
    name: 'Hooli Corporation Class C Shares',
    'asset-class': 'stock',
  })
})
