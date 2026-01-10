import { describe, expect, test } from 'vitest'
import { Balance } from '../../../src/classes/nodes/index.mjs'
import { Value } from '../../../src/classes/Value.mjs'
import { Temporal } from '@js-temporal/polyfill'

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
    const node = Balance.fromString(input)
    const formatOptions = {
      currencyColumn: 59,
    }
    expect(node.toFormattedString(formatOptions)).toEqual(
      '2024-05-18 balance Assets:US:BofA:Checking        1569.75 USD',
    )
  })
})

describe('toJSON & fromJSON roundtrip', () => {
  test('simple', () => {
    const input = '2014-12-26 balance Liabilities:US:CreditCard -3492.02 USD'
    const balance = Balance.fromString(input)

    expect(Balance.fromJSON(JSON.stringify(balance))).toEqual(balance)
  })

  test('with metadata', () => {
    const input = `2014-12-26 balance Liabilities:US:CreditCard -3492.02 USD
  note: "testnote"
  numberInput: 45.00
  currencyInput: USD
  booleanInput: TRUE`

    const balance = Balance.fromString(input)
    const restored = Balance.fromJSON(JSON.stringify(balance))

    // Check that date is Temporal.PlainDate
    expect(restored.date).toBeInstanceOf(Temporal.PlainDate)

    // Check that metadata values are Value instances
    if (restored.metadata) {
      for (const [, value] of Object.entries(restored.metadata)) {
        expect(value).toBeInstanceOf(Value)
      }
    }

    expect(restored).toEqual(balance)
  })

  test('with comment', () => {
    const input = `2014-12-26 balance Liabilities:US:CreditCard -3492.02 USD ; comment`
    const balance = Balance.fromString(input)
    expect(Balance.fromJSON(JSON.stringify(balance))).toEqual(balance)
  })
})
