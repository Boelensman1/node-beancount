import { describe, expect, test } from 'vitest'
import { Balance } from '../../../src/classes/entryTypes/index.mjs'

describe('Balance class', () => {
  test('toString', () => {
    const input = '2014-12-26 balance Liabilities:US:CreditCard -3492.02 USD'
    const balance = Balance.fromString(input)
    expect(balance.toString()).toEqual(input)
  })
})
