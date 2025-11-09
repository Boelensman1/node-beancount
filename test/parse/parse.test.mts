import { describe, expect, test } from 'vitest'
import { parse } from '../../src/parse.mjs'
import type { Transaction } from '../../src/classes/entryTypes/index.mjs'
import { Tag } from '../../src/classes/entryTypes/Transaction/Tag.mjs'

describe('The Tag Stack works', () => {
  test('Single entry, single stack', () => {
    const input = `
pushtag #berlin-trip-2014

2014-04-23 * "Flight to Berlin"
  Expenses:Flights              -1230.27 USD
  Liabilities:CreditCard

poptag #berlin-trip-2014`

    const output = parse(input)
    expect(output.entries).toHaveLength(3)
    expect(output.entries[1].type).toBe('transaction')
    const transaction = output.entries[1] as Transaction

    expect(transaction.tags).toEqual([
      new Tag({ content: 'berlin-trip-2014', fromStack: true }),
    ])
  })

  test('Multiple entries with same tag', () => {
    const input = `
pushtag #vacation

2014-04-23 * "Flight to Berlin"
  Expenses:Flights              -1230.27 USD
  Liabilities:CreditCard

2014-04-24 * "Hotel"
  Expenses:Accommodation         150.00 EUR
  Liabilities:CreditCard

2014-04-25 * "Dinner"
  Expenses:Food                   45.00 EUR
  Assets:Cash

poptag #vacation`

    const output = parse(input)
    expect(output.entries).toHaveLength(5)

    const transaction1 = output.entries[1] as Transaction
    const transaction2 = output.entries[2] as Transaction
    const transaction3 = output.entries[3] as Transaction

    expect(transaction1.tags).toEqual([
      new Tag({ content: 'vacation', fromStack: true }),
    ])
    expect(transaction2.tags).toEqual([
      new Tag({ content: 'vacation', fromStack: true }),
    ])
    expect(transaction3.tags).toEqual([
      new Tag({ content: 'vacation', fromStack: true }),
    ])
  })

  test('Multiple tags in stack', () => {
    const input = `
pushtag #vacation
pushtag #europe

2014-04-23 * "Flight to Berlin"
  Expenses:Flights              -1230.27 USD
  Liabilities:CreditCard

poptag #europe
poptag #vacation`

    const output = parse(input)
    expect(output.entries).toHaveLength(5)

    const transaction = output.entries[2] as Transaction
    expect(transaction.tags).toEqual([
      new Tag({ content: 'vacation', fromStack: true }),
      new Tag({ content: 'europe', fromStack: true }),
    ])
  })

  test('Nested tag stacks', () => {
    const input = `
pushtag #vacation

2014-04-23 * "Flight to Berlin"
  Expenses:Flights              -1230.27 USD
  Liabilities:CreditCard

pushtag #business-expenses

2014-04-24 * "Client dinner"
  Expenses:Food                  100.00 EUR
  Assets:Cash

poptag #business-expenses

2014-04-25 * "Tourist activity"
  Expenses:Entertainment          50.00 EUR
  Assets:Cash

poptag #vacation`

    const output = parse(input)
    expect(output.entries).toHaveLength(7)

    const transaction1 = output.entries[1] as Transaction
    const transaction2 = output.entries[3] as Transaction
    const transaction3 = output.entries[5] as Transaction

    expect(transaction1.tags).toEqual([
      new Tag({ content: 'vacation', fromStack: true }),
    ])
    expect(transaction2.tags).toEqual([
      new Tag({ content: 'vacation', fromStack: true }),
      new Tag({ content: 'business-expenses', fromStack: true }),
    ])
    expect(transaction3.tags).toEqual([
      new Tag({ content: 'vacation', fromStack: true }),
    ])
  })

  test('Mixed stack and inline tags', () => {
    const input = `
pushtag #vacation

2014-04-23 * "Flight to Berlin" #reimbursable
  Expenses:Flights              -1230.27 USD
  Liabilities:CreditCard

poptag #vacation`

    const output = parse(input)
    expect(output.entries).toHaveLength(3)

    const transaction = output.entries[1] as Transaction
    expect(transaction.tags).toEqual([
      new Tag({ content: 'reimbursable', fromStack: false }),
      new Tag({ content: 'vacation', fromStack: true }),
    ])
  })

  test('Empty stack between push and pop', () => {
    const input = `
pushtag #trip
poptag #trip

2014-04-23 * "After stack cleared"
  Expenses:Flights              -1230.27 USD
  Liabilities:CreditCard`

    const output = parse(input)
    expect(output.entries).toHaveLength(3)

    const transaction = output.entries[2] as Transaction
    expect(transaction.tags).toEqual([])
  })

  test('Multiple sequential tag stacks', () => {
    const input = `
pushtag #q1-2014

2014-01-15 * "Q1 Expense"
  Expenses:Office               100.00 USD
  Assets:Checking

poptag #q1-2014

pushtag #q2-2014

2014-04-15 * "Q2 Expense"
  Expenses:Office               150.00 USD
  Assets:Checking

poptag #q2-2014`

    const output = parse(input)
    expect(output.entries).toHaveLength(6)

    const transaction1 = output.entries[1] as Transaction
    const transaction2 = output.entries[4] as Transaction

    expect(transaction1.tags).toEqual([
      new Tag({ content: 'q1-2014', fromStack: true }),
    ])
    expect(transaction2.tags).toEqual([
      new Tag({ content: 'q2-2014', fromStack: true }),
    ])
  })
})

test('Newlines', () => {
  const input = `
2014-01-15 * "Q1 Expense"
  Expenses:Office               100.00 USD
  Assets:Checking




2014-04-15 * "Q2 Expense"
  Expenses:Office               150.00 USD
  Assets:Checking

`

  const output = parse(input, { skipBlanklines: false })
  expect(output.entries).toHaveLength(9)
  expect(output.entries.map((e) => e.type)).toEqual([
    'blankline',
    'transaction',
    'blankline',
    'blankline',
    'blankline',
    'blankline',
    'transaction',
    'blankline',
    'blankline',
  ])
})
