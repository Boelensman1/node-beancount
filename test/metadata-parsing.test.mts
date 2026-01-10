import { expect, test } from 'vitest'
import { parse } from '../src/parse.mjs'
import { DatedNode } from '../src/classes/DatedNode.mjs'
import { Value } from '../src/classes/Value.mjs'

test('DatedNodes: Parse with metadata', () => {
  const directive = `
2014-12-26 balance Liabilities:US:CreditCard -3492.02 USD
  name: "Credit Card Balance"
  statement: "December 2014"`.trim()
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const entry = nodes[0] as DatedNode
  expect(entry.metadata).toEqual({
    name: new Value({ type: 'string', value: 'Credit Card Balance' }),
    statement: new Value({ type: 'string', value: 'December 2014' }),
  })
})

test('Correcly parse metadata in multiline nodes', () => {
  const directive = `
2014-07-09 query "france-balances" "


  SELECT account, sum(position) WHERE 'trip-france-2014' in tags"
  description: "Query to find all cash positions"
  frequency: "monthly"
`.trim()
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const entry = nodes[0] as DatedNode
  expect(entry.type).toBe('query')
  expect(entry.metadata).toEqual({
    description: new Value({
      type: 'string',
      value: 'Query to find all cash positions',
    }),
    frequency: new Value({ type: 'string', value: 'monthly' }),
  })
})

test('DatedNodes: Parse without metadata should return undefined', () => {
  const directives = `
2014-12-26 balance Liabilities:US:CreditCard -3492.02 USD
2016-11-28 close Liabilities:CreditCard:CapitalOne
2012-01-01 commodity HOOL
2014-07-09 custom "budget" "..." TRUE 45.30 USD
2013-11-03 document Liabilities:CreditCard "/path/to/statement.pdf"
2014-07-09 event "location" "Paris, France"
2013-11-03 note Liabilities:CreditCard "Called about fraudulent card."
2014-05-01 open Liabilities:CreditCard:CapitalOne USD
2014-06-01 pad Assets:BofA:Checking Equity:Opening-Balances
2014-07-09 price HOOL 579.18 USD
2014-07-09 query "cash" "SELECT account, sum(position) WHERE currency = 'USD'"
2014-07-09 * "Coffee"
`.trim()
  const { nodes } = parse(directives)
  expect(nodes).toHaveLength(12)

  // All nodes should have undefined metadata when no metadata is present
  for (const entry of nodes) {
    // @ts-expect-error metadata should not exist on entry
    expect(entry.metadata).toBeUndefined()
  }
})

test('Correctly parse values with :', () => {
  const directive = `1900-01-01 commodity VMMXX
  export: "MUTF:VMMXX (MONEY:USD)"
`.trim()
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const entry = nodes[0] as DatedNode
  expect(entry.metadata).toEqual({
    export: new Value({ type: 'string', value: 'MUTF:VMMXX (MONEY:USD)' }),
  })
})
