import { describe, expect, test } from 'vitest'
import { Transaction } from '../../../src/classes/entryTypes/index.mjs'

describe('Transaction class', () => {
  test('toString', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })
})
