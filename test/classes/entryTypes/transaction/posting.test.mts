import { expect, test } from 'vitest'
import { Posting } from '../../../../src/classes/entryTypes/Transaction/Posting.mjs'

test('Parse posting with positive amount', () => {
  const posting = Posting.fromString(
    'Assets:MyBank:Checking             3062.68 USD',
  )

  expect(posting.account).toBe('Assets:MyBank:Checking')
  expect(posting.amount).toBe('3062.68')
  expect(posting.currency).toBe('USD')
})

test('Parse posting with negative amount', () => {
  const posting = Posting.fromString(
    'Assets:MyBank:Checking            -400.00 USD',
  )

  expect(posting.account).toBe('Assets:MyBank:Checking')
  expect(posting.amount).toBe('-400.00')
  expect(posting.currency).toBe('USD')
})

test('Parse posting without amount (auto-balance)', () => {
  const posting = Posting.fromString('Assets:MyBank:Savings')

  expect(posting.account).toBe('Assets:MyBank:Savings')
  expect(posting.amount).toBeUndefined()
  expect(posting.currency).toBeUndefined()
})

test('Parse posting without amount (auto-balance), with comment', () => {
  const posting = Posting.fromString('Assets:MyBank:Savings ;comment')

  expect(posting.account).toBe('Assets:MyBank:Savings')
  expect(posting.amount).toBeUndefined()
  expect(posting.currency).toBeUndefined()
  expect(posting.comment).toBe('comment')
})

test('Parse posting with extra whitespace', () => {
  const posting = Posting.fromString(
    'Liabilities:CreditCard:CapitalOne         -45.00          USD',
  )

  expect(posting.account).toBe('Liabilities:CreditCard:CapitalOne')
  expect(posting.amount).toBe('-45.00')
  expect(posting.currency).toBe('USD')
})

test('Parse posting with arithmetic expression (parentheses)', () => {
  const posting = Posting.fromString(
    'Assets:AccountsReceivable:John            ((40.00/3) + 5) USD',
  )

  expect(posting.account).toBe('Assets:AccountsReceivable:John')
  expect(posting.amount).toBe('((40.00/3) + 5)')
  expect(posting.currency).toBe('USD')
})

test('Parse posting with arithmetic expression (division)', () => {
  const posting = Posting.fromString(
    'Assets:AccountsReceivable:Michael         40.00/3         USD',
  )

  expect(posting.account).toBe('Assets:AccountsReceivable:Michael')
  expect(posting.amount).toBe('40.00/3')
  expect(posting.currency).toBe('USD')
})

test('Parse posting with per-unit price', () => {
  const posting = Posting.fromString(
    'Assets:MyBank:Checking            -400.00 USD @ 1.09 CAD',
  )

  expect(posting.account).toBe('Assets:MyBank:Checking')
  expect(posting.amount).toBe('-400.00')
  expect(posting.currency).toBe('USD')
  // Price should be parsed separately
  expect(posting.price).toBeDefined()
})

test('Parse posting with cost and price', () => {
  const posting = Posting.fromString(
    'Assets:ETrade:IVV               -10 IVV {183.07 USD} @ 197.90 USD',
  )

  expect(posting.account).toBe('Assets:ETrade:IVV')
  expect(posting.amount).toBe('-10')
  expect(posting.currency).toBe('IVV')
  // Cost and price should be parsed
})

test('Parse posting with cost and label', () => {
  const posting = Posting.fromString(
    'Assets:ETrade:IVV                20 IVV {183.07 USD, "ref-001"}',
  )

  expect(posting.account).toBe('Assets:ETrade:IVV')
  expect(posting.amount).toBe('20')
  expect(posting.currency).toBe('IVV')
})

test('Parse posting with cost and date', () => {
  const posting = Posting.fromString(
    'Assets:Broker:StockA 35.5968 STOCKA {206.85 EUR, 2025-01-17}',
  )

  expect(posting.account).toBe('Assets:Broker:StockA')
  expect(posting.amount).toBe('35.5968')
  expect(posting.currency).toBe('STOCKA')
})

test('Parse posting with empty cost and price', () => {
  const posting = Posting.fromString(
    'Assets:Broker:StockB -76.3989 STOCKB {} @ 209.3200 EUR',
  )

  expect(posting.account).toBe('Assets:Broker:StockB')
  expect(posting.amount).toBe('-76.3989')
  expect(posting.currency).toBe('STOCKB')
})

test('Parse posting without currency', () => {
  const posting = Posting.fromString('Assets:AccountsReceivable:John -76.3989')

  expect(posting.account).toBe('Assets:AccountsReceivable:John')
  expect(posting.amount).toBe('-76.3989')
  expect(posting.currency).toBe(undefined)
})

test('Parse posting arithmetic expression and without currency ', () => {
  const posting = Posting.fromString('Assets:AccountsReceivable:John (60.02)/2')

  expect(posting.account).toBe('Assets:AccountsReceivable:John')
  expect(posting.amount).toBe('(60.02)/2')
  expect(posting.currency).toBe(undefined)
})

test('Correctly format postings without currency', () => {
  const posting = Posting.fromString('Expenses:General (60.02)/2')
  expect(posting.toString()).toBe('Expenses:General (60.02)/2')
})

test('Correctly place comments in postings without amount', () => {
  const posting = Posting.fromString('Expenses:General ;test')
  expect(posting.toFormattedString()).toBe('Expenses:General ; test')
})
