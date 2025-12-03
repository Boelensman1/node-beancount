import { describe, expect, test } from 'vitest'
import { ParseResult } from '../../src/classes/ParseResult.mjs'
import { parse } from '../../src/parse.mjs'

describe('ParseResult.calculateCurrencyColumn()', () => {
  describe('basic functionality', () => {
    test('calculates correct column for simple transaction', () => {
      const input = `2023-04-05 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Food 100.00 USD`
      const result = parse(input)
      const calculated = result.calculateCurrencyColumn()

      // maxLeftPartLength = "Assets:Checking".length = 15
      // maxAmountLength = "-100.00".length = 7
      // minPadding = 3
      // overhead = 6
      // Expected: 15 + 7 + 3 + 6 = 30
      expect(calculated).toBe(31)
    })

    test('calculates correct column for transaction with long account names', () => {
      const input = `2023-04-05 * "Test"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`
      const result = parse(input)
      const calculated = result.calculateCurrencyColumn()

      // maxLeftPartLength = "Assets:US:BofA:Checking".length = 23
      // maxAmountLength = "-2400.00".length = 8
      // Expected: 23 + 8 + 3 + 6 = 40
      expect(calculated).toBe(40)
    })

    test('calculates correct column for postings with flags', () => {
      const input = `2023-04-05 * "Test"
  ! Assets:Checking -100.00 USD
  Expenses:Food 100.00 USD`
      const result = parse(input)
      const calculated = result.calculateCurrencyColumn()

      // maxLeftPartLength = "!" + " " + "Assets:Checking".length = 1 + 1 + 15 = 17
      // maxAmountLength = "-100.00".length = 7
      // Expected: 17 + 7 + 3 + 6 = 33
      expect(calculated).toBe(33)
    })

    test('handles postings with arithmetic expressions', () => {
      const input = `2014-10-05 * "Costco"
  Liabilities:CreditCard -45.00 USD
  Assets:AccountsReceivable:John ((40.00/3) + 5) USD
  Expenses:Shopping`
      const result = parse(input)
      const calculated = result.calculateCurrencyColumn()

      // maxLeftPartLength = "Assets:AccountsReceivable:John".length = 30
      // maxAmountLength = "((40.00/3) + 5)".length = 15
      // Expected: 30 + 15 + 3 + 6 = 54
      expect(calculated).toBe(54)
    })

    test('handles complex transaction with cost and price', () => {
      const input = `2023-10-28 * "Sell shares"
  Assets:US:ETrade:ITOT -11 ITOT {125.87 USD, 2023-10-02} @ 121.11 USD
  Assets:US:ETrade:Cash 1323.26 USD
  Expenses:Financial:Commissions 8.95 USD
  Income:US:ETrade:PnL 52.36 USD`
      const result = parse(input)
      const calculated = result.calculateCurrencyColumn()

      // maxLeftPartLength = "Expenses:Financial:Commissions".length = 30
      // maxAmountLength = "1323.26".length = 7
      // Expected: 30 + 7 + 3 + 6 = 46
      expect(calculated).toBe(46)
    })
  })

  describe('edge cases', () => {
    test('returns default for empty ParseResult', () => {
      const result = new ParseResult([])
      expect(result.calculateCurrencyColumn()).toBe(59) // defaultFormatOptions.currencyColumn
    })

    test('returns default when no transactions exist', () => {
      const input = `2023-01-01 open Assets:Checking USD
2023-12-31 close Assets:Checking`
      const result = parse(input)
      expect(result.calculateCurrencyColumn()).toBe(59)
    })

    test('handles transaction with only elided amounts', () => {
      const input = `2023-04-05 * "Test"
  Assets:Checking
  Expenses:Food`
      const result = parse(input)
      const calculated = result.calculateCurrencyColumn()

      // maxLeftPartLength = "Assets:Checking".length = 15
      // maxAmountLength = 0 (no amounts)
      // Expected: 15 + 0 + 3 + 6 = 24
      expect(calculated).toBe(24)
    })

    test('handles mix of postings with and without amounts', () => {
      const input = `2023-04-05 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Food`
      const result = parse(input)
      const calculated = result.calculateCurrencyColumn()

      // maxLeftPartLength = "Assets:Checking".length = 15
      // maxAmountLength = "-100.00".length = 7
      // Expected: 15 + 7 + 3 + 6 = 31
      expect(calculated).toBe(31)
    })

    test('handles postings without currency', () => {
      const input = `2023-04-05 * "Test"
  Assets:AccountsReceivable:John -76.3989
  Expenses:Food 76.3989`
      const result = parse(input)
      const calculated = result.calculateCurrencyColumn()

      // maxLeftPartLength = "Assets:AccountsReceivable:John".length = 30
      // maxAmountLength = "-76.3989".length = 8
      // Expected: 30 + 8 + 3 + 6 = 47
      expect(calculated).toBe(47)
    })
  })

  describe('custom options', () => {
    test('respects custom minPadding', () => {
      const input = `2023-04-05 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Food 100.00 USD`
      const result = parse(input)
      const calculated = result.calculateCurrencyColumn({ minPadding: 5 })

      // Expected: 15 + 7 + 5 + 6 = 33
      expect(calculated).toBe(33)
    })

    test('enforces minimum padding of 1 when given 0', () => {
      const input = `2023-04-05 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Food 100.00 USD`
      const result = parse(input)
      const calculated = result.calculateCurrencyColumn({ minPadding: 0 })

      // Expected: 15 + 7 + 1 + 6 = 29
      expect(calculated).toBe(29)
    })

    test('enforces minimum padding of 1 when given negative', () => {
      const input = `2023-04-05 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Food 100.00 USD`
      const result = parse(input)
      const calculated = result.calculateCurrencyColumn({ minPadding: -5 })

      // Expected: 15 + 7 + 1 + 6 = 29
      expect(calculated).toBe(29)
    })

    test('respects overridden maxLeftPartLength', () => {
      const input = `2023-04-05 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Food 100.00 USD`
      const result = parse(input)
      const calculated = result.calculateCurrencyColumn({
        maxLeftPartLength: 50,
      })

      // Expected: 50 + 7 + 3 + 6 = 66
      expect(calculated).toBe(66)
    })

    test('respects overridden maxAmountLength', () => {
      const input = `2023-04-05 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Food 100.00 USD`
      const result = parse(input)
      const calculated = result.calculateCurrencyColumn({
        maxAmountLength: 15,
      })

      // Expected: 15 + 15 + 3 + 6 = 39
      expect(calculated).toBe(39)
    })

    test('respects both overrides together', () => {
      const input = `2023-04-05 * "Test"
  Assets:Checking -100.00 USD
  Expenses:Food 100.00 USD`
      const result = parse(input)
      const calculated = result.calculateCurrencyColumn({
        maxLeftPartLength: 40,
        maxAmountLength: 12,
      })

      // Expected: 40 + 12 + 3 + 6 = 61
      expect(calculated).toBe(61)
    })
  })

  describe('multiple transactions', () => {
    test('calculates across multiple transactions', () => {
      const input = `2023-01-01 * "Short"
  Assets:A -1.00 USD
  Expenses:B 1.00 USD

2023-01-02 * "Long account and amount"
  Assets:VeryLongAccountName:SubAccount:Details -123456.78 USD
  Expenses:Food 123456.78 USD`
      const result = parse(input)
      const calculated = result.calculateCurrencyColumn()

      // maxLeftPartLength = "Assets:VeryLongAccountName:SubAccount:Details".length = 45
      // maxAmountLength = "-123456.78".length = 10
      // Expected: 45 + 10 + 3 + 6 = 64
      expect(calculated).toBe(64)
    })

    test('considers all postings across all transactions', () => {
      const input = `2023-01-01 * "Transaction 1"
  Assets:ShortName -1.00 USD
  Expenses:B 1.00 USD

2023-01-02 * "Transaction 2"
  Assets:Medium:Account -12.34 USD
  Expenses:C 12.34 USD

2023-01-03 * "Transaction 3"
  Assets:Very:Long:Account:Name:Here -1234567.89 USD
  Expenses:D 1234567.89 USD`
      const result = parse(input)
      const calculated = result.calculateCurrencyColumn()

      // maxLeftPartLength = "Assets:Very:Long:Account:Name:Here".length = 34
      // maxAmountLength = "-1234567.89".length = 11
      // Expected: 34 + 11 + 3 + 6 = 54
      expect(calculated).toBe(54)
    })
  })

  describe('integration with toFormattedString', () => {
    test('calculated column produces well-aligned output', () => {
      const input = `2023-04-05 * "Test"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD`

      const result = parse(input)
      const currencyColumn = result.calculateCurrencyColumn()
      const formatted = result.toFormattedString({ currencyColumn })

      // Verify currencies align at the same column
      const lines = formatted.split('\n')
      const posting1 = lines[1]
      const posting2 = lines[2]

      // Find the position of "USD" in both lines
      const usdPos1 = posting1.indexOf('USD')
      const usdPos2 = posting2.indexOf('USD')

      // They should be at the same position
      expect(usdPos1).toBe(usdPos2)
      expect(usdPos1).toBe(currencyColumn - 1) // -1 because currencyColumn is 1-indexed
    })

    test('round-trip with auto-calculated column', () => {
      const input = `2023-01-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking -2400.00 USD
  Expenses:Home:Rent 2400.00 USD

2023-01-09 * "EDISON POWER" ""
  Assets:US:BofA:Checking -65.00 USD
  Expenses:Home:Electricity 65.00 USD`

      const result = parse(input)
      const currencyColumn = result.calculateCurrencyColumn()
      const formatted = result.toFormattedString({ currencyColumn })
      const reparsed = parse(formatted)

      // Should be able to round-trip
      expect(reparsed.toString()).toBe(result.toString())
    })
  })
})
