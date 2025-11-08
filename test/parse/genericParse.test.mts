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
