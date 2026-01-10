import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import { Tag } from '../../../src/classes/nodes/Transaction/Tag.mjs'
import { Value } from '../../../src/classes/Value.mjs'

test('Parse basic', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.type).toBe('transaction')
  expect(node.date.toJSON()).toBe('2023-04-05')
  expect(node.payee).toBe('RiverBank Properties')
  expect(node.narration).toBe('Paying the rent')
  expect(node.flag).toBe('*')
  //expect(node.comment).toBeUndefined()

  expect(node.postings).toHaveLength(2)
  expect(node.postings[0].account).toBe('Assets:US:BofA:Checking')
  expect(node.postings[0].amount).toBe('-2400.00')
  expect(node.postings[0].currency).toBe('USD')
  expect(node.postings[0].price).toBe('-2400.00 USD')
  expect(node.postings[0].flag).toBeUndefined()
  expect(node.postings[0].comment).toBeUndefined()

  expect(node.postings[1].account).toBe('Expenses:Home:Rent')
  expect(node.postings[1].amount).toBe('2400.00')
  expect(node.postings[1].currency).toBe('USD')
  expect(node.postings[1].price).toBe('2400.00 USD')
  expect(node.postings[1].flag).toBeUndefined()
  expect(node.postings[1].comment).toBeUndefined()
})

test('Parse without narration', () => {
  const directive = `
2023-04-04 * "RiverBank Properties"
  Assets:US:BofA:Checking                           -4.00 USD
  Expenses:Financial:Fees                            4.00 USD`

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.type).toBe('transaction')
  expect(node.date.toJSON()).toBe('2023-04-04')
  expect(node.payee).toBe('RiverBank Properties')
  expect(node.narration).toBeUndefined()
  expect(node.postings).toHaveLength(2)
  expect(node.flag).toBe('*')
})

test('Parse with different flag', () => {
  const directive = `
2023-04-05 ! "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.flag).toBe('!')
  expect(node.postings).toHaveLength(2)
  expect(node.postings[0].flag).toBeUndefined()
  expect(node.postings[1].flag).toBeUndefined()
})

test('Parse without flag', () => {
  const directive = `
2023-04-05 txn "RiverBank Properties" "Paying the rent"
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.flag).toBeUndefined()
  expect(node.postings).toHaveLength(2)
})

test('Parse with comments', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent" ; comment1
  Assets:US:BofA:Checking                        -2400.00 USD;comment2
  Expenses:Home:Rent                              2400.00 USD ;comment3`

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.type).toBe('transaction')
  expect(node.date.toJSON()).toBe('2023-04-05')
  expect(node.payee).toBe('RiverBank Properties')
  expect(node.narration).toBe('Paying the rent')
  // expect(node.comment).toBe('comment')
  expect(node.flag).toBe('*')

  expect(node.postings).toHaveLength(2)
  expect(node.postings[0].account).toBe('Assets:US:BofA:Checking')
  expect(node.postings[0].amount).toBe('-2400.00')
  expect(node.postings[0].currency).toBe('USD')
  expect(node.postings[0].price).toBe('-2400.00 USD')
  expect(node.postings[0].flag).toBeUndefined()
  expect(node.postings[0].comment).toBe('comment2')

  expect(node.postings[1].account).toBe('Expenses:Home:Rent')
  expect(node.postings[1].amount).toBe('2400.00')
  expect(node.postings[1].currency).toBe('USD')
  expect(node.postings[1].price).toBe('2400.00 USD')
  expect(node.postings[1].flag).toBeUndefined()
  expect(node.postings[1].comment).toBe('comment3')
})

test('Parse with posting having a flag', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent"
  ! Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.type).toBe('transaction')
  expect(node.date.toJSON()).toBe('2023-04-05')
  expect(node.payee).toBe('RiverBank Properties')
  expect(node.narration).toBe('Paying the rent')
  expect(node.flag).toBe('*')

  expect(node.postings).toHaveLength(2)
  expect(node.postings[0].account).toBe('Assets:US:BofA:Checking')
  expect(node.postings[0].amount).toBe('-2400.00')
  expect(node.postings[0].currency).toBe('USD')
  expect(node.postings[0].price).toBe('-2400.00 USD')
  expect(node.postings[0].flag).toBe('!')

  expect(node.postings[1].account).toBe('Expenses:Home:Rent')
  expect(node.postings[1].amount).toBe('2400.00')
  expect(node.postings[1].currency).toBe('USD')
  expect(node.postings[1].price).toBe('2400.00 USD')
  expect(node.postings[1].flag).toBeUndefined()
})

test('Parse with calculations in posting', () => {
  const directive = `
2014-10-05 * "Costco" "Shopping for birthday"
  Liabilities:CreditCard:CapitalOne         -45.00          USD
  Assets:AccountsReceivable:John            ((40.00/3) + 5) USD
  Assets:AccountsReceivable:Michael         40.00/3         USD
  Expenses:Shopping`

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.type).toBe('transaction')
  expect(node.date.toJSON()).toBe('2014-10-05')
  expect(node.payee).toBe('Costco')
  expect(node.narration).toBe('Shopping for birthday')
  expect(node.flag).toBe('*')

  expect(node.postings).toHaveLength(4)
  expect(node.postings[0].account).toBe('Liabilities:CreditCard:CapitalOne')
  expect(node.postings[0].amount).toBe('-45.00')
  expect(node.postings[0].currency).toBe('USD')
  expect(node.postings[0].price).toBe('-45.00 USD')
  expect(node.postings[0].flag).toBeUndefined()

  expect(node.postings[1].account).toBe('Assets:AccountsReceivable:John')
  expect(node.postings[1].amount).toBe('((40.00/3) + 5)')
  expect(node.postings[1].currency).toBe('USD')
  expect(node.postings[1].price).toBe('((40.00/3) + 5) USD')
  expect(node.postings[1].flag).toBeUndefined()

  expect(node.postings[2].account).toBe('Assets:AccountsReceivable:Michael')
  expect(node.postings[2].amount).toBe('40.00/3')
  expect(node.postings[2].currency).toBe('USD')
  expect(node.postings[2].price).toBe('40.00/3 USD')
  expect(node.postings[2].flag).toBeUndefined()

  expect(node.postings[3].account).toBe('Expenses:Shopping')
  expect(node.postings[3].amount).toBeUndefined()
  expect(node.postings[3].currency).toBeUndefined()
  expect(node.postings[3].price).toBeUndefined()
  expect(node.postings[3].flag).toBeUndefined()
})

test('Parse with metadata', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent"
  note: "test"
  booleanval: TRUE
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.postings).toHaveLength(2)
  expect(node).toHaveProperty('metadata')
  expect(node.metadata!.note).toEqual(
    new Value({ type: 'string', value: 'test' }),
  )
  expect(node.metadata!.booleanval).toEqual(
    new Value({ type: 'boolean', value: true }),
  )
})

test('Parse with link (space before link)', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent" ^link-to-transaction
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.postings).toHaveLength(2)
  expect(node.links).toEqual(new Set(['link-to-transaction']))
  expect(node.tags).toEqual([])
})

test('Parse with link (no space before link)', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent"^link-to-transaction
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.postings).toHaveLength(2)
  expect(node.links).toEqual(new Set(['link-to-transaction']))
})

test('Parse with multiple links', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent" ^transaction1 ^transaction2
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.postings).toHaveLength(2)
  expect(node.links).toEqual(new Set(['transaction1', 'transaction2']))
})

test('Parse without narration but with link (without space)', () => {
  const directive = `
2023-04-04 * "RiverBank Properties"^link
  Assets:US:BofA:Checking                           -4.00 USD
  Expenses:Financial:Fees                            4.00 USD`

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.type).toBe('transaction')
  expect(node.date.toJSON()).toBe('2023-04-04')
  expect(node.payee).toBe('RiverBank Properties')
  expect(node.narration).toBeUndefined()
  expect(node.postings).toHaveLength(2)
  expect(node.flag).toBe('*')
  expect(node.links).toEqual(new Set(['link']))
})

test('Parse without narration but with link (with space)', () => {
  const directive = `
2023-04-04 * "RiverBank Properties" ^link
  Assets:US:BofA:Checking                           -4.00 USD
  Expenses:Financial:Fees                            4.00 USD`

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.links).toEqual(new Set(['link']))
})

test('Parse with tag', () => {
  const directive = `
2023-04-05 * "RiverBank Properties" "Paying the rent" #tag
  Assets:US:BofA:Checking                        -2400.00 USD
  Expenses:Home:Rent                              2400.00 USD`

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.postings).toHaveLength(2)
  expect(node.links.size).toEqual(0)
  expect(node.tags).toHaveLength(1)
  expect(node.tags).toEqual([
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

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.postings).toHaveLength(2)
  expect(node.tags).toHaveLength(3)
  expect(node.tags).toEqual([
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

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.postings).toHaveLength(2)

  expect(node.links.size).toBe(3)
  expect(node.links).toEqual(new Set(['link1', 'link2', 'link3']))
  expect(node.tags).toHaveLength(3)
  expect(node.tags).toEqual([
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

test('Parse with cost', () => {
  const directive = `
2024-04-15 * "Investing 60% of cash in RGAGX"
  Assets:US:Vanguard:RGAGX 6.805 RGAGX {52.90 USD, 2024-04-15}
  Assets:US:Vanguard:Cash -359.98 USD`

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.postings).toHaveLength(2)
  expect(node.postings[0].account).toBe('Assets:US:Vanguard:RGAGX')
  expect(node.postings[0].amount).toBe('6.805')
  expect(node.postings[0].currency).toBe('RGAGX')
  expect(node.postings[0].cost).toBe('52.90 USD, 2024-04-15')
  expect(node.postings[0].price).toBe('6.805 RGAGX {52.90 USD, 2024-04-15}')
})

test('Parse with cost and posting price', () => {
  const directive = `2023-10-28 * "Sell shares of ITOT"
  Assets:US:ETrade:ITOT -11 ITOT {125.87 USD, 2023-10-02} @ 121.11 USD
  Assets:US:ETrade:Cash 1323.26 USD
  Expenses:Financial:Commissions 8.95 USD
  Income:US:ETrade:PnL 52.36 USD
`

  const output = parse(directive)
  expect(output.transactions).toHaveLength(1)

  const node = output.transactions[0]
  expect(node.postings).toHaveLength(4)
  expect(node.postings[0].account).toBe('Assets:US:ETrade:ITOT')
  expect(node.postings[0].amount).toBe('-11')
  expect(node.postings[0].currency).toBe('ITOT')
  expect(node.postings[0].cost).toBe('125.87 USD, 2023-10-02')
  expect(node.postings[0].priceAmount).toBe('121.11')
  expect(node.postings[0].priceCurrency).toBe('USD')
  expect(node.postings[0].price).toBe(
    '-11 ITOT {125.87 USD, 2023-10-02} @ 121.11 USD',
  )
})
