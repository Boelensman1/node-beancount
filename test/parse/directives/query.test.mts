import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Query } from '../../../src/classes/entryTypes/index.mjs'

test('Parse simple', () => {
  // simplest query directive
  const directive = `
2014-07-09 query "france-balances" "SELECT account, sum(position) WHERE ‘trip-france-2014’ in tags"`
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Query
  expect(entry.type).toBe('query')
  expect(entry.date.toJSON()).toBe('2014-07-09')
  expect(entry.name).toBe('france-balances')
  expect(entry.sqlContents).toBe(
    'SELECT account, sum(position) WHERE ‘trip-france-2014’ in tags',
  )
})

test('Parse with newline', () => {
  // simplest query directive
  const directive = `
2014-07-09 query "france-balances" "


  SELECT account, sum(position) WHERE ‘trip-france-2014’ in tags"
`
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Query
  expect(entry.type).toBe('query')
  expect(entry.date.toJSON()).toBe('2014-07-09')
  expect(entry.name).toBe('france-balances')
  expect(entry.sqlContents).toBe(
    'SELECT account, sum(position) WHERE ‘trip-france-2014’ in tags',
  )
})
