import { describe, expect, test } from 'vitest'
import { Transaction } from '../../../../src/classes/entryTypes/index.mjs'

describe('toString', () => {
  test('basic', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('without narration', () => {
    const input = `2023-04-04 * "RiverBank Properties"
  Assets:US:BofA:Checking -4.00 USD
  Expenses:Financial:Fees 4.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with different flag', () => {
    const input = `2023-04-05 ! "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('without flag', () => {
    const input = `2023-04-05 txn "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with comments', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" ; comment1
  Assets:US:BofA:Checking -2400.00 USD ; comment2
  Expenses:Home:Rent 2400.00 USD ; comment3`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with standalone comment at beginning', () => {
    const input = `2023-04-05 * "Test"
  ; comment0
  Assets:Checking -100 USD
  Expenses:Food 100 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with standalone comments between postings', () => {
    const input = `2023-04-05 * "Test"
  Assets:Checking -100 USD
  ; comment1
  ; comment2
  Expenses:Food 100 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with standalone comments at various positions', () => {
    const input = `2023-04-05 * "Test"
  ; comment0
  Assets:Checking -100 USD
  ; comment2
  Expenses:Food 50 USD
  ; comment4
  Expenses:Shopping 50 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with standalone comment at end', () => {
    const input = `2023-04-05 * "Test"
  Assets:Checking -100 USD
  Expenses:Food 100 USD
  ; comment at end`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with posting having a flag', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  ! Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with calculations in posting', () => {
    const input = `2014-10-05 * "Costco" "Shopping for birthday"
  Liabilities:CreditCard:CapitalOne -45.00 USD
  Assets:AccountsReceivable:John ((40.00/3) + 5) USD
  Assets:AccountsReceivable:Michael 40.00/3 USD
  Expenses:Shopping`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with metadata', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  note: "test"
  booleanval: TRUE
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with link (space before link)', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" ^link-to-transaction
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with link (no space before link)', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" ^link-to-transaction
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with multiple links', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" ^transaction1 ^transaction2
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('without narration but with link', () => {
    const input = `2023-04-04 * "RiverBank Properties" ^link
  Assets:US:BofA:Checking -4.00 USD
  Expenses:Financial:Fees 4.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with tag', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" #tag
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with multiple tags', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" #tag1 #tag2 #tag3
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with multiple tags and links', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" ^link1 ^link2 ^link3 #tag1 #tag2 #tag3
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with price info', () => {
    const input = `2024-04-15 * "Investing 60% of cash in RGAGX"
  Assets:US:Vanguard:RGAGX 6.805 RGAGX {52.90 USD, 2024-04-15}
  Assets:US:Vanguard:Cash -359.98 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with price info (2)', () => {
    const input = `2023-10-28 * "Sell shares of ITOT"
  Assets:US:ETrade:ITOT -11 ITOT {125.87 USD, 2023-10-02} @ 121.11 USD
  Assets:US:ETrade:Cash 1323.26 USD
  Expenses:Financial:Commissions 8.95 USD
  Income:US:ETrade:PnL 52.36 USD`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })
})

describe('format', () => {
  test('basic', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking -2400.00 USD`
    const transaction = Transaction.fromString(input)
    const formatOptions = {
      currencyColumn: 98,
    }
    expect(transaction.toFormattedString(formatOptions))
      .toEqual(`2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                                                               -2400.00 USD`)
  })

  test('basic with 2 postings', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    const formatOptions = {
      currencyColumn: 98,
    }
    expect(transaction.toFormattedString(formatOptions))
      .toEqual(`2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                                                               -2400.00 USD
  Expenses:Home:Rent                                                                     2400.00 USD`)
  })

  test('complex', () => {
    const input = `2023-10-28 * "Sell shares of ITOT"
  Assets:US:ETrade:ITOT                               -11 ITOT {125.87 USD, 2023-10-02} @ 121.11 USD
  Assets:US:ETrade:Cash                           1323.26 USD
  Expenses:Financial:Commissions                     8.95 USD
  Income:US:ETrade:PnL                              52.36 USD`
    const transaction = Transaction.fromString(input)
    const formatOptions = {
      currencyColumn: 59,
    }
    // All currencies should align at the same column (right-aligned to width 100)
    expect(transaction.toFormattedString(formatOptions)).toEqual(input)
  })
})

describe('toJSON & fromJSON roundtrip', () => {
  test('basic', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('without narration', () => {
    const input = `2023-04-04 * "RiverBank Properties"
  Assets:US:BofA:Checking -4.00 USD
  Expenses:Financial:Fees 4.00 USD`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('with different flag', () => {
    const input = `2023-04-05 ! "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('without flag', () => {
    const input = `2023-04-05 txn "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('with comments', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" ; comment1
  Assets:US:BofA:Checking -2400.00 USD ; comment2
  Expenses:Home:Rent 2400.00 USD ; comment3`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('with posting having a flag', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  ! Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('with calculations in posting', () => {
    const input = `2014-10-05 * "Costco" "Shopping for birthday"
  Liabilities:CreditCard:CapitalOne -45.00 USD
  Assets:AccountsReceivable:John ((40.00/3) + 5) USD
  Assets:AccountsReceivable:Michael 40.00/3 USD
  Expenses:Shopping`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('with metadata', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  note: "test"
  booleanval: TRUE
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('with link (space before link)', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" ^link-to-transaction
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('with link (no space before link)', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" ^link-to-transaction
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('with multiple links', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" ^transaction1 ^transaction2
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('without narration but with link', () => {
    const input = `2023-04-04 * "RiverBank Properties" ^link
  Assets:US:BofA:Checking -4.00 USD
  Expenses:Financial:Fees 4.00 USD`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('with tag', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" #tag
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('with multiple tags', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" #tag1 #tag2 #tag3
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('with multiple tags and links', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" ^link1 ^link2 ^link3 #tag1 #tag2 #tag3
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('with price info', () => {
    const input = `2024-04-15 * "Investing 60% of cash in RGAGX"
  Assets:US:Vanguard:RGAGX 6.805 RGAGX {52.90 USD, 2024-04-15}
  Assets:US:Vanguard:Cash -359.98 USD`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('with price info (2)', () => {
    const input = `2023-10-28 * "Sell shares of ITOT"
  Assets:US:ETrade:ITOT -11 ITOT {125.87 USD, 2023-10-02} @ 121.11 USD
  Assets:US:ETrade:Cash 1323.26 USD
  Expenses:Financial:Commissions 8.95 USD
  Income:US:ETrade:PnL 52.36 USD`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })
})
