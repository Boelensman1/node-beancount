import { expect, test } from 'vitest'
import { splitStringIntoSourceFragments } from '../../src/utils/splitStringIntoSourceFragments.js'

test('Split simple source string', () => {
  // Simple split, with new line
  const source = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD

2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const sourceFragments = splitStringIntoSourceFragments(source)
  expect(sourceFragments).toHaveLength(3)
  expect(sourceFragments[0]).toHaveLength(3)
  expect(sourceFragments[1]).toEqual([''])
  expect(sourceFragments[2]).toHaveLength(3)
})

test('Split transactions without new line', () => {
  const source = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD
2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const sourceFragments = splitStringIntoSourceFragments(source)
  expect(sourceFragments).toHaveLength(2)
  expect(sourceFragments[0]).toHaveLength(3)
  expect(sourceFragments[1]).toHaveLength(3)
})

test('Split source string with multiple newlines in string', () => {
  const source = `2014-07-09 query "france-balances" "






  SELECT account, sum(position) WHERE ‘trip-france-2014’ in tags"`

  const sourceFragments = splitStringIntoSourceFragments(source)
  expect(sourceFragments).toHaveLength(1)
  expect(sourceFragments[0]).toHaveLength(1)
})

test('Split transactions with a comment part of transaction', () => {
  const source = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD
  ; comment`

  const sourceFragments = splitStringIntoSourceFragments(source)
  expect(sourceFragments).toHaveLength(1)
  expect(sourceFragments[0]).toHaveLength(4)
})

test('Split transactions with a comment not part of transaction', () => {
  const source = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD
; comment`

  const sourceFragments = splitStringIntoSourceFragments(source)
  expect(sourceFragments).toHaveLength(2)
  expect(sourceFragments[0]).toHaveLength(3)
  expect(sourceFragments[1]).toHaveLength(1)
})

test('Split blank line followed by indented content', () => {
  const source = `
  Assets:US:BofA:Checking                        -2400.00 USD`

  const sourceFragments = splitStringIntoSourceFragments(source)
  expect(sourceFragments).toHaveLength(2)
  expect(sourceFragments[0]).toEqual([''])
  expect(sourceFragments[1]).toHaveLength(1)
})
