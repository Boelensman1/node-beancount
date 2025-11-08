import { describe, expect, test } from 'vitest'
import { Balance } from '../../../src/classes/entryTypes/index.mjs'

describe('Balance class', () => {
  test('toString - simple', () => {
    const input = '2014-12-26 balance Liabilities:US:CreditCard -3492.02 USD'
    const balance = Balance.fromString(input)
    expect(balance.toString()).toEqual(input)
  })

  test('toString - with metadata', () => {
    const input = `2014-12-26 balance Liabilities:US:CreditCard -3492.02 USD
  note: "testnote"
  numberInput: 45.00
  currencyInput: USD
  booleanInput: TRUE`
    const balance = Balance.fromString(input)
    expect(balance.toString()).toEqual(input)
  })

  test('toString - with comment', () => {
    const input = `2014-12-26 balance Liabilities:US:CreditCard -3492.02 USD ; comment`
    const balance = Balance.fromString(input)
    expect(balance.toString()).toEqual(input)
  })
})
