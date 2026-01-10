import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Close } from '../../../src/classes/nodes/index.mjs'

test('Parse simple', () => {
  // simplest close directive
  const directive = '2014-05-01 close Liabilities:CreditCard:CapitalOne'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Close
  expect(node.type).toBe('close')
  expect(node.date.toJSON()).toBe('2014-05-01')
  expect(node.account).toBe('Liabilities:CreditCard:CapitalOne')
})
