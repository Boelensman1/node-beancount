import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Balance } from '../../../src/classes/nodes/index.mjs'
import { Value } from '../../../src/classes/Value.mjs'

test('Parse simple', () => {
  // simplest balance directive
  const directive =
    '2014-12-26 balance Liabilities:US:CreditCard   -3492.02 USD'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Balance
  expect(node.type).toBe('balance')
  expect(node.date.toJSON()).toBe('2014-12-26')
  expect(node.account).toBe('Liabilities:US:CreditCard')
  expect(node.amount).toBe('-3492.02')
  expect(node.currency).toBe('USD')
  expect(node.price).toBe('-3492.02 USD')
})

test('Parse with metadata', () => {
  const directive = `2014-12-26 balance Liabilities:US:CreditCard -3492.02 USD
  note: "testnote"
  booleanInput: TRUE`
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Balance
  expect(node.type).toBe('balance')
  expect(node.date.toJSON()).toBe('2014-12-26')
  expect(node.account).toBe('Liabilities:US:CreditCard')
  expect(node.amount).toBe('-3492.02')
  expect(node.currency).toBe('USD')
  expect(node.price).toBe('-3492.02 USD')
  expect(node.metadata).toEqual({
    note: new Value({ type: 'string', value: 'testnote' }),
    booleanInput: new Value({ type: 'boolean', value: true }),
  })
})
