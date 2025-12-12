import { Temporal } from '@js-temporal/polyfill'
import { describe, expect, test } from 'vitest'
import { ParseResult } from '../../src/classes/ParseResult.mjs'
import { parse } from '../../src/parse.mjs'
import {
  Transaction,
  Open,
  Close,
} from '../../src/classes/entryTypes/index.mjs'

describe('ParseResult class', () => {
  describe('constructor', () => {
    test('creates ParseResult with empty array', () => {
      const result = new ParseResult([])
      expect(result.entries).toEqual([])
      expect(result.entries).toHaveLength(0)
    })
  })

  describe('toString()', () => {
    test('returns empty string for empty entries', () => {
      const result = new ParseResult([])
      expect(result.toString()).toBe('')
    })

    test('converts single entry to string', () => {
      const transactionStr = `2023-04-05 * "Test Payee" "Test Narration"
  Assets:Checking -100.00 USD
  Expenses:Groceries 100.00 USD`
      const transaction = Transaction.fromString(transactionStr)
      const result = new ParseResult([transaction])
      expect(result.toString()).toBe(transactionStr)
    })

    test('converts multiple entries to string with newline separation', () => {
      const openStr = '2023-01-01 open Assets:Checking'
      const transactionStr = `2023-04-05 * "Test" "Transaction"
  Assets:Checking 100.00 USD
  Income:Salary -100.00 USD`
      const closeStr = '2023-12-31 close Assets:Checking'

      const open = Open.fromString(openStr)
      const transaction = Transaction.fromString(transactionStr)
      const close = Close.fromString(closeStr)

      const result = new ParseResult([open, transaction, close])
      const expectedOutput = `${openStr}\n${transactionStr}\n${closeStr}`
      expect(result.toString()).toBe(expectedOutput)
    })

    test('round-trip: parse → toString → parse produces equivalent results', () => {
      const input = `2023-01-01 open Assets:Checking USD

2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:Checking -2400.00 USD
  Expenses:Rent 2400.00 USD

2023-12-31 close Assets:Checking`

      const parsed1 = parse(input)
      const stringified = parsed1.toString()
      const parsed2 = parse(stringified)

      expect(parsed2.entries).toHaveLength(parsed1.entries.length)
      expect(parsed2.toString()).toBe(parsed1.toString())
    })

    test('preserves blank lines when included in entries', () => {
      const input = `2023-01-01 open Assets:Checking



2023-04-05 * "Test"
  Assets:Checking 100.00 USD
  Income:Salary -100.00 USD`

      const parsed = parse(input)
      const output = parsed.toString()

      // Count blank line entries
      const blanklineCount = parsed.entries.filter(
        (e) => e.type === 'blankline',
      ).length
      expect(blanklineCount).toBe(3) // Three blank lines between entries

      // Verify toString preserves structure
      expect(output.split('\n').filter((line) => line === '')).toHaveLength(
        blanklineCount,
      )
    })

    test('Re-creates complex', () => {
      const input = `2023-01-01 open Assets:Checking USD

2023-04-05 * "Test"
  Assets:Checking 100.00 USD
  Income:Salary -100.00 USD


;2024-01-08 * "Commented out transaction payee" "Commented out narration with date: 010 07/01/2024 15:20 Value date: 08/01/2024"
;  Assets:Checking  -8.99 USD

2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:Checking -2400.00 USD
  Expenses:Rent 2400.00 USD

2023-12-31 close Assets:Checking`

      const parsed = parse(input)
      const output = parsed.toString()
      expect(output).toEqual(input)
    })
  })

  describe('toFormattedString()', () => {
    test('returns empty string for empty entries', () => {
      const result = new ParseResult([])
      expect(result.toFormattedString()).toBe('')
    })

    test('formats single entry with currency column alignment', () => {
      const transactionStr = `2023-04-05 * "Test"
  Assets:Checking 100.00 USD`
      const transaction = Transaction.fromString(transactionStr)
      const result = new ParseResult([transaction])

      const formatted = result.toFormattedString()
      // Should contain the transaction with proper formatting
      expect(formatted).toContain('2023-04-05 * "Test"')
      expect(formatted).toContain('100.00 USD')
    })

    test('formats multiple entries with newline separation', () => {
      const entries = [
        Open.fromString('2023-01-01 open Assets:Checking USD'),
        Transaction.fromString(
          `2023-04-05 * "Test"
  Assets:Checking 100.00 USD
  Income:Salary -100.00 USD`,
        ),
        Close.fromString('2023-12-31 close Assets:Checking'),
      ]

      const result = new ParseResult(entries)
      const formatted = result.toFormattedString()

      const lines = formatted.split('\n')
      expect(lines[0]).toContain('2023-01-01 open Assets:Checking')
      expect(lines[0]).toContain('USD')
      expect(formatted).toContain('2023-04-05 * "Test"')
      expect(formatted).toContain('2023-12-31 close Assets:Checking')
    })

    test('uses default currency column of 59', () => {
      // Create a transaction and verify formatting uses column 59
      const transactionStr = `2023-10-28 * "Sell shares of ITOT"
  Assets:US:ETrade:ITOT                               -11 ITOT {125.87 USD, 2023-10-02} @ 121.11 USD
  Assets:US:ETrade:Cash                           1323.26 USD
  Expenses:Financial:Commissions                     8.95 USD
  Income:US:ETrade:PnL                              52.36 USD`

      const transaction = Transaction.fromString(transactionStr)
      const result = new ParseResult([transaction])
      const formatted = result.toFormattedString()

      // The formatted output should have currencies aligned at column 59
      // This is the same as the input since it's already formatted at column 59
      expect(formatted).toBe(transactionStr)
    })

    test('formats complex transaction with multiple postings', () => {
      const input = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`

      const transaction = Transaction.fromString(input)
      const result = new ParseResult([transaction])
      const formatted = result.toFormattedString()

      // Should contain all parts of the transaction
      expect(formatted).toContain('RiverBank Properties')
      expect(formatted).toContain('Paying the rent')
      expect(formatted).toContain('Assets:US:BofA:Checking')
      expect(formatted).toContain('Expenses:Home:Rent')
      expect(formatted).toContain('-2400.00 USD')
      expect(formatted).toContain('2400.00 USD')
    })

    test('Keeps spacing of comments', () => {
      const input = `2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD
  ; comment`

      const parsed = parse(input)
      const formatted = parsed.toString()
      expect(formatted).toEqual(input)
    })

    test('round-trip: parse → toFormattedString maintains structure', () => {
      const input = `2023-01-01 open Assets:Checking USD

2023-04-05 * "Test" "Transaction"
  Assets:Checking 100.00 USD
  Income:Salary -100.00 USD

2023-12-31 close Assets:Checking`

      const parsed = parse(input)
      const formatted = parsed.toFormattedString()

      // Should contain all the key elements
      expect(formatted).toContain('2023-01-01 open Assets:Checking')
      expect(formatted).toContain('USD')
      expect(formatted).toContain('2023-04-05 * "Test" "Transaction"')
      expect(formatted).toContain('Assets:Checking')
      expect(formatted).toContain('100.00 USD')
      expect(formatted).toContain('2023-12-31 close Assets:Checking')
    })

    test('handles entries with comments', () => {
      const input = `2023-04-05 * "Test" "Transaction" ; inline comment
  Assets:Checking 100.00 USD ; posting comment
  Income:Salary -100.00 USD`

      const transaction = Transaction.fromString(input)
      const result = new ParseResult([transaction])
      const formatted = result.toFormattedString()

      // Comments should be preserved
      expect(formatted).toContain('; inline comment')
      expect(formatted).toContain('; posting comment')
    })
  })

  describe('integration with parse()', () => {
    test('parse() returns a ParseResult instance', () => {
      const input = `2023-01-01 open Assets:Checking`
      const result = parse(input)
      expect(result).toBeInstanceOf(ParseResult)
    })

    test('ParseResult from parse() has correct entries', () => {
      const input = `2023-01-01 open Assets:Checking USD

2023-04-05 * "Test"
  Assets:Checking 100.00 USD
  Income:Salary -100.00 USD`

      const result = parse(input)
      expect(result.open).toHaveLength(1)
      expect(result.transactions).toHaveLength(1)
    })

    test('can manipulate ParseResult entries array', () => {
      const input = `2023-01-01 open Assets:Checking`
      const result = parse(input)

      // Add an entry
      const newTransaction = Transaction.fromString(
        `2023-04-05 * "New"
  Assets:Checking 100.00 USD
  Income:Salary -100.00 USD`,
      )
      result.entries.push(newTransaction)

      expect(result.entries).toHaveLength(2)
      expect(result.toString()).toContain('2023-01-01 open Assets:Checking')
      expect(result.toString()).toContain('2023-04-05 * "New"')
    })
  })

  test('round-trip: parse → toJSON → fromJSON produces equivalent results', () => {
    const input = `2023-01-01 open Assets:Checking USD

2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:Checking -2400.00 USD
  Expenses:Rent 2400.00 USD

2023-12-31 close Assets:Checking`

    const parsed1 = parse(input)
    const parsed2 = ParseResult.fromJSON(JSON.stringify(parsed1))

    expect(parsed2.entries).toHaveLength(parsed1.entries.length)
    expect(parsed2.toString()).toBe(parsed1.toString())
  })

  describe('accounts getter', () => {
    test('returns empty set for empty entries', () => {
      const result = new ParseResult([])
      expect(result.accounts).toEqual(new Set())
    })

    test('extracts accounts from transactions', () => {
      const input = `2023-04-05 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Groceries 100.00 USD`
      const result = parse(input)
      expect(result.accounts).toEqual(
        new Set(['Assets:Checking', 'Expenses:Groceries']),
      )
    })

    test('extracts accounts from open entries', () => {
      const input = `2023-01-01 open Assets:Checking USD
2023-01-01 open Assets:Savings USD`
      const result = parse(input)
      expect(result.accounts).toEqual(
        new Set(['Assets:Checking', 'Assets:Savings']),
      )
    })

    test('extracts accounts from close entries', () => {
      const input = `2023-12-31 close Assets:Checking`
      const result = parse(input)
      expect(result.accounts).toEqual(new Set(['Assets:Checking']))
    })

    test('extracts accounts from balance entries', () => {
      const input = `2023-06-15 balance Assets:Checking 1000.00 USD`
      const result = parse(input)
      expect(result.accounts).toEqual(new Set(['Assets:Checking']))
    })

    test('extracts accounts from note entries', () => {
      const input = `2023-06-15 note Assets:Checking "Some note"`
      const result = parse(input)
      expect(result.accounts).toEqual(new Set(['Assets:Checking']))
    })

    test('extracts accounts from document entries', () => {
      const input = `2023-06-15 document Assets:Checking "/path/to/doc.pdf"`
      const result = parse(input)
      expect(result.accounts).toEqual(new Set(['Assets:Checking']))
    })

    test('extracts both accounts from pad entries', () => {
      const input = `2023-06-15 pad Assets:Checking Equity:Opening-Balances`
      const result = parse(input)
      expect(result.accounts).toEqual(
        new Set(['Assets:Checking', 'Equity:Opening-Balances']),
      )
    })

    test('returns unique accounts across multiple entry types', () => {
      const input = `2023-01-01 open Assets:Checking USD
2023-01-01 open Expenses:Groceries USD

2023-04-05 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Groceries 100.00 USD

2023-06-15 balance Assets:Checking 900.00 USD

2023-12-31 close Assets:Checking`
      const result = parse(input)
      expect(result.accounts).toEqual(
        new Set(['Assets:Checking', 'Expenses:Groceries']),
      )
    })

    test('ignores entry types without accounts', () => {
      const input = `option "title" "Test Ledger"
plugin "beancount.plugins.auto"
2023-01-01 event "location" "Home"
2023-01-01 commodity USD
2023-01-01 price USD 1.00 EUR`
      const result = parse(input)
      expect(result.accounts).toEqual(new Set())
    })
  })

  describe('activeAccounts', () => {
    test('returns empty set for empty entries', () => {
      const result = new ParseResult([])
      const date = Temporal.PlainDate.from('2023-06-15')
      expect(result.accountsActiveAt(date)).toEqual(new Set())
    })

    test('returns account opened before date', () => {
      const input = `2023-01-01 open Assets:Checking USD`
      const result = parse(input)
      const date = Temporal.PlainDate.from('2023-06-15')
      expect(result.accountsActiveAt(date)).toEqual(
        new Set(['Assets:Checking']),
      )
    })

    test('returns account opened on exact date', () => {
      const input = `2023-06-15 open Assets:Checking USD`
      const result = parse(input)
      const date = Temporal.PlainDate.from('2023-06-15')
      expect(result.accountsActiveAt(date)).toEqual(
        new Set(['Assets:Checking']),
      )
    })

    test('does not return account opened after date', () => {
      const input = `2023-12-01 open Assets:Checking USD`
      const result = parse(input)
      const date = Temporal.PlainDate.from('2023-06-15')
      expect(result.accountsActiveAt(date)).toEqual(new Set())
    })

    test('does not return account closed before date', () => {
      const input = `2023-01-01 open Assets:Checking USD
2023-03-01 close Assets:Checking`
      const result = parse(input)
      const date = Temporal.PlainDate.from('2023-06-15')
      expect(result.accountsActiveAt(date)).toEqual(new Set())
    })

    test('does not return account closed on exact date', () => {
      const input = `2023-01-01 open Assets:Checking USD
2023-06-15 close Assets:Checking`
      const result = parse(input)
      const date = Temporal.PlainDate.from('2023-06-15')
      expect(result.accountsActiveAt(date)).toEqual(new Set())
    })

    test('returns account closed after date', () => {
      const input = `2023-01-01 open Assets:Checking USD
2023-12-31 close Assets:Checking`
      const result = parse(input)
      const date = Temporal.PlainDate.from('2023-06-15')
      expect(result.accountsActiveAt(date)).toEqual(
        new Set(['Assets:Checking']),
      )
    })

    test('handles multiple accounts with various states', () => {
      const input = `2023-01-01 open Assets:Checking USD
2023-01-01 open Assets:Savings USD
2023-01-01 open Assets:OldAccount USD
2023-07-01 open Assets:NewAccount USD
2023-03-01 close Assets:OldAccount`
      const result = parse(input)
      const date = Temporal.PlainDate.from('2023-06-15')
      expect(result.accountsActiveAt(date)).toEqual(
        new Set(['Assets:Checking', 'Assets:Savings']),
      )
    })

    test('returns empty set when no open entries exist', () => {
      const input = `2023-04-05 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Groceries 100.00 USD`
      const result = parse(input)
      const date = Temporal.PlainDate.from('2023-06-15')
      expect(result.accountsActiveAt(date)).toEqual(new Set())
    })
  })
})
