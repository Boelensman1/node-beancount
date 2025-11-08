import { describe, expect, test } from 'vitest'
import { Transaction } from '../../../../src/classes/entryTypes/index.mjs'

describe('Transaction class', () => {
  test('toString - basic', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('toString - without narration', () => {
    const input = `2023-04-04 * "RiverBank Properties"
  Assets:US:BofA:Checking -4.00 USD
  Expenses:Financial:Fees 4.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('toString - with different flag', () => {
    const input = `2023-04-05 ! "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('toString - without flag', () => {
    const input = `2023-04-05 txn "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('toString - with comments', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" ; comment1
  Assets:US:BofA:Checking -2400.00 USD ; comment2
  Expenses:Home:Rent 2400.00 USD ; comment3`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('toString - with posting having a flag', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  ! Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('toString - with calculations in posting', () => {
    const input = `2014-10-05 * "Costco" "Shopping for birthday"
  Liabilities:CreditCard:CapitalOne -45.00 USD
  Assets:AccountsReceivable:John ((40.00/3) + 5) USD
  Assets:AccountsReceivable:Michael 40.00/3 USD
  Expenses:Shopping`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('toString - with metadata', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  note: "test"
  booleanval: TRUE
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('toString - with link (space before link)', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" ^link-to-transaction
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('toString - with link (no space before link)', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" ^link-to-transaction
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('toString - with multiple links', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" ^transaction1 ^transaction2
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('toString - without narration but with link', () => {
    const input = `2023-04-04 * "RiverBank Properties" ^link
  Assets:US:BofA:Checking -4.00 USD
  Expenses:Financial:Fees 4.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('toString - with tag', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" #tag
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('toString - with multiple tags', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" #tag1 #tag2 #tag3
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('toString - with multiple tags and links', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" ^link1 ^link2 ^link3 #tag1 #tag2 #tag3
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })
})
