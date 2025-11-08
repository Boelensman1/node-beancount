import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import { Transaction } from '../../../src/classes/entryTypes/index.mjs'
import { Tag } from '../../../src/classes/entryTypes/Transaction/Tag.mjs'
import { Value } from '../../../src/classes/Value.mjs'

test('Parse basic', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Transaction
  expect(entry.type).toBe('transaction')
  expect(entry.date.toJSON()).toBe('2023-04-05')
  expect(entry.payee).toBe('RiverBank Properties')
  expect(entry.narration).toBe('Paying the rent')
  expect(entry.flag).toBe('*')
  //expect(entry.comment).toBeUndefined()

  expect(entry.postings).toHaveLength(2)
  expect(entry.postings[0].account).toBe('Assets:US:BofA:Checking')
  expect(entry.postings[0].amount).toBe('-2400.00')
  expect(entry.postings[0].currency).toBe('USD')
  expect(entry.postings[0].price).toBe('-2400.00 USD')
  expect(entry.postings[0].flag).toBeUndefined()
  expect(entry.postings[0].comment).toBeUndefined()

  expect(entry.postings[1].account).toBe('Expenses:Home:Rent')
  expect(entry.postings[1].amount).toBe('2400.00')
  expect(entry.postings[1].currency).toBe('USD')
  expect(entry.postings[1].price).toBe('2400.00 USD')
  expect(entry.postings[1].flag).toBeUndefined()
  expect(entry.postings[1].comment).toBeUndefined()
})

test('Parse without narration', () => {
  const directive = `
2023-04-04 * "RiverBank Properties"
  Assets:US:BofA:Checking                           -4.00 USD
  Expenses:Financial:Fees                            4.00 USD`

  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Transaction
  expect(entry.type).toBe('transaction')
  expect(entry.date.toJSON()).toBe('2023-04-04')
  expect(entry.payee).toBe('RiverBank Properties')
  expect(entry.narration).toBeUndefined()
  expect(entry.postings).toHaveLength(2)
  expect(entry.flag).toBe('*')
})

test('Parse with different flag', () => {
  const directive = `
2023-04-05 ! "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Transaction
  expect(entry.flag).toBe('!')
  expect(entry.postings).toHaveLength(2)
  expect(entry.postings[0].flag).toBeUndefined()
  expect(entry.postings[1].flag).toBeUndefined()
})

test('Parse without flag', () => {
  const directive = `
2023-04-05 txn "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Transaction
  expect(entry.flag).toBeUndefined()
  expect(entry.postings).toHaveLength(2)
})

test('Parse with comments', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent" ; comment1
  Assets:US:BofA:Checking                        -2400.00 USD;comment2
  Expenses:Home:Rent                              2400.00 USD ;comment3`

  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Transaction
  expect(entry.type).toBe('transaction')
  expect(entry.date.toJSON()).toBe('2023-04-05')
  expect(entry.payee).toBe('RiverBank Properties')
  expect(entry.narration).toBe('Paying the rent')
  // expect(entry.comment).toBe('comment')
  expect(entry.flag).toBe('*')

  expect(entry.postings).toHaveLength(2)
  expect(entry.postings[0].account).toBe('Assets:US:BofA:Checking')
  expect(entry.postings[0].amount).toBe('-2400.00')
  expect(entry.postings[0].currency).toBe('USD')
  expect(entry.postings[0].price).toBe('-2400.00 USD')
  expect(entry.postings[0].flag).toBeUndefined()
  expect(entry.postings[0].comment).toBe('comment2')

  expect(entry.postings[1].account).toBe('Expenses:Home:Rent')
  expect(entry.postings[1].amount).toBe('2400.00')
  expect(entry.postings[1].currency).toBe('USD')
  expect(entry.postings[1].price).toBe('2400.00 USD')
  expect(entry.postings[1].flag).toBeUndefined()
  expect(entry.postings[1].comment).toBe('comment3')
})

test('Parse with posting having a flag', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent"
  ! Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Transaction
  expect(entry.type).toBe('transaction')
  expect(entry.date.toJSON()).toBe('2023-04-05')
  expect(entry.payee).toBe('RiverBank Properties')
  expect(entry.narration).toBe('Paying the rent')
  expect(entry.flag).toBe('*')

  expect(entry.postings).toHaveLength(2)
  expect(entry.postings[0].account).toBe('Assets:US:BofA:Checking')
  expect(entry.postings[0].amount).toBe('-2400.00')
  expect(entry.postings[0].currency).toBe('USD')
  expect(entry.postings[0].price).toBe('-2400.00 USD')
  expect(entry.postings[0].flag).toBe('!')

  expect(entry.postings[1].account).toBe('Expenses:Home:Rent')
  expect(entry.postings[1].amount).toBe('2400.00')
  expect(entry.postings[1].currency).toBe('USD')
  expect(entry.postings[1].price).toBe('2400.00 USD')
  expect(entry.postings[1].flag).toBeUndefined()
})

test('Parse with calculations in posting', () => {
  const directive = `
2014-10-05 * "Costco" "Shopping for birthday"
  Liabilities:CreditCard:CapitalOne         -45.00          USD
  Assets:AccountsReceivable:John            ((40.00/3) + 5) USD
  Assets:AccountsReceivable:Michael         40.00/3         USD
  Expenses:Shopping`

  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Transaction
  expect(entry.type).toBe('transaction')
  expect(entry.date.toJSON()).toBe('2014-10-05')
  expect(entry.payee).toBe('Costco')
  expect(entry.narration).toBe('Shopping for birthday')
  expect(entry.flag).toBe('*')

  expect(entry.postings).toHaveLength(4)
  expect(entry.postings[0].account).toBe('Liabilities:CreditCard:CapitalOne')
  expect(entry.postings[0].amount).toBe('-45.00')
  expect(entry.postings[0].currency).toBe('USD')
  expect(entry.postings[0].price).toBe('-45.00 USD')
  expect(entry.postings[0].flag).toBeUndefined()

  expect(entry.postings[1].account).toBe('Assets:AccountsReceivable:John')
  expect(entry.postings[1].amount).toBe('((40.00/3) + 5)')
  expect(entry.postings[1].currency).toBe('USD')
  expect(entry.postings[1].price).toBe('((40.00/3) + 5) USD')
  expect(entry.postings[1].flag).toBeUndefined()

  expect(entry.postings[2].account).toBe('Assets:AccountsReceivable:Michael')
  expect(entry.postings[2].amount).toBe('40.00/3')
  expect(entry.postings[2].currency).toBe('USD')
  expect(entry.postings[2].price).toBe('40.00/3 USD')
  expect(entry.postings[2].flag).toBeUndefined()

  expect(entry.postings[3].account).toBe('Expenses:Shopping')
  expect(entry.postings[3].amount).toBeUndefined()
  expect(entry.postings[3].currency).toBeUndefined()
  expect(entry.postings[3].price).toBeUndefined()
  expect(entry.postings[3].flag).toBeUndefined()
})

test('Parse with metadata', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent"
  note: "test"
  booleanval: TRUE
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Transaction
  expect(entry.postings).toHaveLength(2)
  expect(entry).toHaveProperty('metadata')
  expect(entry.metadata!.note).toEqual(
    new Value({ type: 'string', value: 'test' }),
  )
  expect(entry.metadata!.booleanval).toEqual(
    new Value({ type: 'boolean', value: true }),
  )
})

test('Parse with link (space before link)', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent" ^link-to-transaction
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Transaction
  expect(entry.postings).toHaveLength(2)
  expect(entry.links).toEqual(['link-to-transaction'])
  expect(entry.tags).toEqual([])
})

test('Parse with link (no space before link)', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent"^link-to-transaction
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Transaction
  expect(entry.postings).toHaveLength(2)
  expect(entry.links).toEqual(['link-to-transaction'])
})

test('Parse with multiple links', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent" ^transaction1 ^transaction2
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Transaction
  expect(entry.postings).toHaveLength(2)
  expect(entry.links).toEqual(['transaction1', 'transaction2'])
})

test('Parse without narration but with link (without space)', () => {
  const directive = `
2023-04-04 * "RiverBank Properties"^link
  Assets:US:BofA:Checking                           -4.00 USD
  Expenses:Financial:Fees                            4.00 USD`

  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Transaction
  expect(entry.type).toBe('transaction')
  expect(entry.date.toJSON()).toBe('2023-04-04')
  expect(entry.payee).toBe('RiverBank Properties')
  expect(entry.narration).toBeUndefined()
  expect(entry.postings).toHaveLength(2)
  expect(entry.flag).toBe('*')
  expect(entry.links).toEqual(['link'])
})

test('Parse without narration but with link (with space)', () => {
  const directive = `
2023-04-04 * "RiverBank Properties" ^link
  Assets:US:BofA:Checking                           -4.00 USD
  Expenses:Financial:Fees                            4.00 USD`

  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Transaction
  expect(entry.links).toEqual(['link'])
})

test('Parse with tag', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent" #tag
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Transaction
  expect(entry.postings).toHaveLength(2)
  expect(entry.links).toEqual([])
  expect(entry.tags).toHaveLength(1)
  expect(entry.tags).toEqual([
    new Tag({
      content: 'tag',
      fromStack: false,
    }),
  ])
})

test('Parse with multiple tags', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent" #tag1#tag2 #tag3
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Transaction
  expect(entry.postings).toHaveLength(2)
  expect(entry.tags).toHaveLength(3)
  expect(entry.tags).toEqual([
    new Tag({
      content: 'tag1',
      fromStack: false,
    }),
    new Tag({
      content: 'tag2',
      fromStack: false,
    }),
    new Tag({
      content: 'tag3',
      fromStack: false,
    }),
  ])
})

test('Parse with multiple tags and links', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent"^link1 #tag1^link2#tag2 #tag3 ^link3
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Transaction
  expect(entry.postings).toHaveLength(2)
  expect(entry.links).toHaveLength(3)
  expect(entry.links).toEqual(['link1', 'link2', 'link3'])
  expect(entry.tags).toHaveLength(3)
  expect(entry.tags).toEqual([
    new Tag({
      content: 'tag1',
      fromStack: false,
    }),
    new Tag({
      content: 'tag2',
      fromStack: false,
    }),
    new Tag({
      content: 'tag3',
      fromStack: false,
    }),
  ])
})
