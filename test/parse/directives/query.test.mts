import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'

test('Parse simple', () => {
  // simplest query directive
  const directive = `
2014-07-09 query "france-balances" "SELECT account, sum(position) WHERE ‘trip-france-2014’ in tags"`
  const output = parse(directive)
  expect(output.query).toHaveLength(1)

  const entry = output.query[0]
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
  const output = parse(directive)
  expect(output.query).toHaveLength(1)

  const entry = output.query[0]
  expect(entry.type).toBe('query')
  expect(entry.date.toJSON()).toBe('2014-07-09')
  expect(entry.name).toBe('france-balances')
  expect(entry.sqlContents).toBe(
    'SELECT account, sum(position) WHERE ‘trip-france-2014’ in tags',
  )
})
