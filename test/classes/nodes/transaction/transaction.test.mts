import { describe, expect, test } from 'vitest'
import { Transaction } from '../../../../src/classes/nodes/index.mjs'
import { Value } from '../../../../src/classes/Value.mjs'

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

  test('with empty metadata', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
    const transaction = Transaction.fromString(input)
    transaction.metadata = {}
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

  test('with link with special chars', () => {
    const input = `2023-04-05 * "RiverBank Properties" "Paying the rent" ^link.xxx.aaa
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

  test('with posting-level metadata', () => {
    const input = `2026-01-16 * "Health Insurance Co" "Monthly premium payment"
  note: "Health insurance"
  Assets:NL:ING:Checking -165.50 EUR
  Expenses:Insurance:Health
    amortize: "1 Year /Monthly"`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with multiple postings having metadata', () => {
    const input = `2026-01-16 * "Insurance Co" "Insurance payments"
  Assets:Checking -300.00 USD
  Expenses:Insurance:Health 165.50 EUR
    amortize: "1 Year /Monthly"
  Expenses:Insurance:Car 134.50 EUR
    amortize: "1 Year /Monthly"
    important: TRUE`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with mix of transaction and posting metadata', () => {
    const input = `2026-01-16 * "Test" "Transaction"
  note: "Transaction level"
  Assets:Checking -100.00 USD
  Expenses:Test
    key: "Posting level"`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('posting without amount can have metadata', () => {
    const input = `2026-01-16 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Test
    key: "value"`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('posting with inline comment and metadata', () => {
    const input = `2026-01-16 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Test ; inline comment
    key: "value"`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('with posting metadata and standalone comments', () => {
    const input = `2026-01-16 * "Test"
  Assets:Checking -100.00 USD
  ; standalone comment
  Expenses:Test
    key: "value"
  ; another comment`
    const transaction = Transaction.fromString(input)
    expect(transaction.toString()).toEqual(input)
  })

  test('editing posting metadata', () => {
    const input = `2026-01-16 * "Health Insurance Co" "Monthly premium payment"
  note: "Health insurance"
  Assets:NL:ING:Checking -165.50 EUR
  Expenses:Insurance:Health
    amortize: "1 Year /Monthly"`
    const transaction = Transaction.fromString(input)

    // Verify initial state
    expect(transaction.postings[1].metadata).toBeDefined()
    expect(transaction.postings[1].metadata!.amortize).toBeDefined()

    // Edit the posting metadata
    transaction.postings[1].metadata!.amortize = new Value({
      type: 'string',
      value: '2 Years /Monthly',
    })

    // Add new metadata field
    transaction.postings[1].metadata!.category = new Value({
      type: 'string',
      value: 'Medical',
    })

    const expected = `2026-01-16 * "Health Insurance Co" "Monthly premium payment"
  note: "Health insurance"
  Assets:NL:ING:Checking -165.50 EUR
  Expenses:Insurance:Health
    amortize: "2 Years /Monthly"
    category: "Medical"`

    expect(transaction.toString()).toEqual(expected)
  })

  test('removing posting metadata', () => {
    const input = `2026-01-16 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Test
    key1: "value1"
    key2: "value2"`
    const transaction = Transaction.fromString(input)

    // Remove one metadata field
    delete transaction.postings[1].metadata!.key1

    const expected = `2026-01-16 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Test
    key2: "value2"`

    expect(transaction.toString()).toEqual(expected)
  })

  test('adding metadata to posting without metadata', () => {
    const input = `2026-01-16 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Test 100.00 USD`
    const transaction = Transaction.fromString(input)

    // Add metadata to second posting
    transaction.postings[1].metadata = {
      category: new Value({ type: 'string', value: 'Food' }),
    }

    const expected = `2026-01-16 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Test 100.00 USD
    category: "Food"`

    expect(transaction.toString()).toEqual(expected)
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

  test('extra complex', () => {
    const input = `2023-10-28 * "Sell shares of ITOT"
  Assets:US:ETrade:ITOT                               -11 ITOT {125.87 USD, 2023-10-02} @ 121.11 USD
  Assets:US:ETrade:Cash                 (1323.26/2 + 100) USD
  Expenses:Financial:Commissions (1323.26/2             + 100) USD ; too long, but this is the best we can do
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

  test('with posting-level metadata', () => {
    const input = `2026-01-16 * "Health Insurance Co" "Monthly premium payment"
  note: "Health insurance"
  Assets:NL:ING:Checking -165.50 EUR
  Expenses:Insurance:Health
    amortize: "1 Year /Monthly"`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })

  test('with multiple postings having metadata', () => {
    const input = `2026-01-16 * "Insurance Co" "Insurance payments"
  Assets:Checking -300.00 USD
  Expenses:Insurance:Health 165.50 EUR
    amortize: "1 Year /Monthly"
  Expenses:Insurance:Car 134.50 EUR
    amortize: "1 Year /Monthly"
    important: TRUE`
    const transaction = Transaction.fromString(input)

    expect(Transaction.fromJSON(JSON.stringify(transaction))).toEqual(
      transaction,
    )
  })
})
