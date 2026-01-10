import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Pad } from '../../../src/classes/nodes/index.mjs'

test('Parse simple', () => {
  // simplest pad directive
  const directive =
    '2014-06-01 pad Assets:BofA:Checking Equity:Opening-Balances'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Pad
  expect(node.type).toBe('pad')
  expect(node.date.toJSON()).toBe('2014-06-01')
  expect(node.account).toBe('Assets:BofA:Checking')
  expect(node.accountPad).toBe('Equity:Opening-Balances')
})
