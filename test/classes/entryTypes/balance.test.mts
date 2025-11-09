import { describe, expect, test } from 'vitest'
import { Balance } from '../../../src/classes/entryTypes/index.mjs'

describe('toString', () => {
  test('simple', () => {
    const input = '2014-12-26 balance Liabilities:US:CreditCard -3492.02 USD'
    const balance = Balance.fromString(input)
    expect(balance.toString()).toEqual(input)
  })

  test('with metadata', () => {
    const input = `2014-12-26 balance Liabilities:US:CreditCard -3492.02 USD
  note: "testnote"
  numberInput: 45.00
  currencyInput: USD
  booleanInput: TRUE`
    const balance = Balance.fromString(input)
    expect(balance.toString()).toEqual(input)
  })

  test('with comment', () => {
    const input = `2014-12-26 balance Liabilities:US:CreditCard -3492.02 USD ; comment`
    const balance = Balance.fromString(input)
    expect(balance.toString()).toEqual(input)
  })
})

describe('format', () => {
  test('basic', () => {
    const input = `2024-05-18 balance Assets:US:BofA:Checking 1569.75 USD`
    const entry = Balance.fromString(input)
    const formatOptions = {
      currencyColumn: 59,
    }
    expect(entry.toFormattedString(formatOptions)).toEqual(
      '2024-05-18 balance Assets:US:BofA:Checking        1569.75 USD',
    )
  })
})
