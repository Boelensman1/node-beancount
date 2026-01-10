import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Note } from '../../../src/classes/nodes/index.mjs'

test('Parse simple', () => {
  // simplest note directive
  const directive =
    '2013-11-03 note Liabilities:CreditCard "Called about fraudulent card."'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Note
  expect(node.type).toBe('note')
  expect(node.date.toJSON()).toBe('2013-11-03')
  expect(node.account).toBe('Liabilities:CreditCard')
  expect(node.account).toBe('Liabilities:CreditCard')
  expect(node.description).toBe('Called about fraudulent card.')
})
