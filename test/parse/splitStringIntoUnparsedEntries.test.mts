import { expect, test } from 'vitest'
import { splitStringIntoUnparsedEntries } from '../../src/parse.mjs'

test('Split simple entries', () => {
  // Simple split, with new line
  const entries = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD

2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const unparsedEntries = splitStringIntoUnparsedEntries(entries)
  expect(unparsedEntries).toHaveLength(3)
  expect(unparsedEntries[0]).toHaveLength(3)
  expect(unparsedEntries[1]).toEqual([''])
  expect(unparsedEntries[2]).toHaveLength(3)
})

test('Split transactions without new line', () => {
  const entries = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD
2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const unparsedEntries = splitStringIntoUnparsedEntries(entries)
  expect(unparsedEntries).toHaveLength(2)
  expect(unparsedEntries[0]).toHaveLength(3)
  expect(unparsedEntries[1]).toHaveLength(3)
})

test('Split entry with multiple newlines in string', () => {
  const entries = `2014-07-09 query "france-balances" "






  SELECT account, sum(position) WHERE ‘trip-france-2014’ in tags"`

  const unparsedEntries = splitStringIntoUnparsedEntries(entries)
  expect(unparsedEntries).toHaveLength(1)
  expect(unparsedEntries[0]).toHaveLength(1)
})

test('Split transactions with a comment part of transaction', () => {
  const entries = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD
  ; comment`

  const unparsedEntries = splitStringIntoUnparsedEntries(entries)
  expect(unparsedEntries).toHaveLength(1)
  expect(unparsedEntries[0]).toHaveLength(4)
})

test('Split transactions with a comment not part of transaction', () => {
  const entries = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD
; comment`

  const unparsedEntries = splitStringIntoUnparsedEntries(entries)
  expect(unparsedEntries).toHaveLength(2)
  expect(unparsedEntries[0]).toHaveLength(3)
  expect(unparsedEntries[1]).toHaveLength(1)
})
