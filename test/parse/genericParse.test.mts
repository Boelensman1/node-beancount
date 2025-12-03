import { expect, test } from 'vitest'
import { genericParse } from '../../src/genericParse.mjs'
import { stringAwareSplitLine } from '../../src/utils/stringAwareSplitLine.mjs'
import { Value } from '../../src/classes/Value.mjs'

const t = (
  input: string,
  expected: (string | string[] | undefined | Record<string, unknown>)[],
) => {
  const splitInput = stringAwareSplitLine(input.trim())
  switch (expected.length) {
    // only checking type
    case 1:
      expect(genericParse(splitInput).type).toEqual(expected[0])
      return
    // checking type and header
    case 2: {
      const result = genericParse(splitInput)
      expect(result.type).toEqual(expected[0])
      expect(result.header).toEqual(expected[1])
      return
    }
    // non transaction entries
    case 3:
      expect(genericParse(splitInput)).toEqual({
        type: expected[0],
        header: expected[1],
        props: expected[2],
      })
      return
    case 4:
      // transaction
      expect(genericParse(splitInput)).toEqual({
        type: expected[0],
        header: expected[1],
        body: expected[2],
        props: expected[3],
      })
      return
    default:
      throw new Error('Unknown # of inputs')
  }
}

test('Entry types with dates', () => {
  t('2014-05-01 close Liabilities:CreditCard:CapitalOne', [
    'close',
    'Liabilities:CreditCard:CapitalOne',
    { date: '2014-05-01' },
  ])

  t('2014-05-01 open Liabilities:CreditCard:CapitalOne USD', [
    'open',
    'Liabilities:CreditCard:CapitalOne USD',
    { date: '2014-05-01' },
  ])
})

test('Entry types without dates', () => {
  t('option "operating_currency" "USD"', [
    'option',
    '"operating_currency" "USD"',
    {},
  ])

  t('plugin "beancount.plugins.module_name"', [
    'plugin',
    '"beancount.plugins.module_name"',
    {},
  ])
})

test('Entry type without date, with comment', () => {
  t('option "operating_currency" "USD" ;test', [
    'option',
    '"operating_currency" "USD"',
    { comment: 'test', metadata: undefined },
  ])
})

test('Transaction entries', () => {
  t(
    `2014-05-05 txn "Cafe Mogador" "Lamb tagine with wine"
  BODY`,
    [
      'transaction',
      '"Cafe Mogador" "Lamb tagine with wine"',
      ['BODY'],
      {
        date: '2014-05-05',
        flag: undefined,
      },
    ],
  )

  // transactions can also use flags
  t(
    `2014-05-05 * "Cafe Mogador" "Lamb tagine with wine"
  BODY`,
    [
      'transaction',
      '"Cafe Mogador" "Lamb tagine with wine"',
      ['BODY'],
      {
        date: '2014-05-05',
        flag: '*',
      },
    ],
  )

  // transaction with a comment
  t(
    `2014-05-05 * "Cafe Mogador" "Lamb tagine with wine";comment
  BODY`,
    [
      'transaction',
      '"Cafe Mogador" "Lamb tagine with wine"',
      ['BODY'],
      {
        date: '2014-05-05',
        flag: '*',
        comment: 'comment',
      },
    ],
  )
})

test('Entry with metadata', () => {
  t(
    `
2014-12-26 balance Liabilities:US:CreditCard -3492.02 USD
  name: "Credit Card Balance"
  statement: "December 2014"
`,
    [
      'balance',
      'Liabilities:US:CreditCard -3492.02 USD',
      {
        date: '2014-12-26',
        metadata: {
          name: new Value({ type: 'string', value: 'Credit Card Balance' }),
          statement: new Value({ type: 'string', value: 'December 2014' }),
        },
      },
    ],
  )
})

test('Entry with multiline first line', () => {
  t(
    `
2014-07-09 query "france-balances" "


  SELECT account, sum(position) WHERE ‘trip-france-2014’ in tags"
`,
    [
      'query',
      `"france-balances" "


  SELECT account, sum(position) WHERE ‘trip-france-2014’ in tags"`,
      { date: '2014-07-09' },
    ],
  )
})

test('Entry with multiline first line and metadata', () => {
  t(
    `2014-07-09 query "france-balances" "


  SELECT account, sum(position) WHERE ‘trip-france-2014’ in tags"
  description: "Query to find all cash positions"
  frequency: "monthly"
`,
    [
      'query',
      `"france-balances" "


  SELECT account, sum(position) WHERE ‘trip-france-2014’ in tags"`,
      {
        date: '2014-07-09',
        metadata: {
          description: new Value({
            type: 'string',
            value: 'Query to find all cash positions',
          }),
          frequency: new Value({ type: 'string', value: 'monthly' }),
        },
      },
    ],
  )
})

test('Comment line', () => {
  t(';comment', ['comment', ';comment'])
})

test('Comment line with embedded date', () => {
  t(';;2024-04-10.import.csv', ['comment', ';;2024-04-10.import.csv'])
})

test('Comment line with space', () => {
  t(';comment with space', ['comment', ';comment with space'])
})

test('Comment line with embedded date and space', () => {
  t(';;2024-04-10.import 2.csv', ['comment', ';;2024-04-10.import 2.csv'])
})

test('Rejects invalid entry type with date', () => {
  // Invalid entry types should be treated as comments
  const result1 = genericParse(
    stringAwareSplitLine('2024-01-01 invalid_type "data"'),
  )
  expect(result1.type).toBe('comment')
  expect(result1.header).toBe('2024-01-01 invalid_type "data"')
  expect(result1.fake).toBe(true)

  const result2 = genericParse(
    stringAwareSplitLine('2024-01-01 balanc "typo in balance"'),
  )
  expect(result2.type).toBe('comment')
  expect(result2.header).toBe('2024-01-01 balanc "typo in balance"')
  expect(result2.fake).toBe(true)
})

test('Accepts all valid dated entry types', () => {
  const validDatedEntries = [
    '2024-01-01 balance Assets:Checking 100 USD',
    '2024-01-01 close Assets:Checking',
    '2024-01-01 commodity USD',
    '2024-01-01 custom "budget" "monthly" 1000 USD',
    '2024-01-01 document Assets:Checking "statement.pdf"',
    '2024-01-01 event "location" "New York"',
    '2024-01-01 note Assets:Checking "Account note"',
    '2024-01-01 open Assets:Checking',
    '2024-01-01 pad Assets:Checking Equity:Opening-Balances',
    '2024-01-01 price USD 1.00 EUR',
    '2024-01-01 query "test" "SELECT *"',
    '2024-01-01 * "Payee" "Narration"',
  ]

  for (const entry of validDatedEntries) {
    const result = genericParse(stringAwareSplitLine(entry))
    // Should not be a fake entry (comment or blankline)
    expect(result.fake).toBeUndefined()
  }
})

test('Rejects entry type as prefix of another word', () => {
  // Word boundary should prevent partial matches
  const result1 = genericParse(
    stringAwareSplitLine('2024-01-01 option-test "value"'),
  )
  expect(result1.type).toBe('comment')
  expect(result1.fake).toBe(true)

  const result2 = genericParse(
    stringAwareSplitLine('2024-01-01 balance_old Assets:Checking'),
  )
  expect(result2.type).toBe('comment')
  expect(result2.fake).toBe(true)
})

test('Accepts transaction variations', () => {
  // All transaction syntaxes should work
  const txnVariations = [
    '2024-01-01 * "payee" "narration"',
    '2024-01-01 ! "payee" "narration"',
    '2024-01-01 txn "payee" "narration"',
  ]

  for (const entry of txnVariations) {
    const result = genericParse(stringAwareSplitLine(entry))
    expect(result.type).toBe('transaction')
    expect(result.fake).toBeUndefined()
  }
})
