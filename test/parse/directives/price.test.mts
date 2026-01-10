import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Price } from '../../../src/classes/nodes/index.mjs'

test('Parse simple', () => {
  // simplest price directive
  const directive = '2014-07-09 price HOOL  579.18 USD'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Price
  expect(node.type).toBe('price')
  expect(node.date.toJSON()).toBe('2014-07-09')
  expect(node.commodity).toBe('HOOL')
  expect(node.amount).toBe('579.18')
  expect(node.currency).toBe('USD')
  expect(node.price).toBe('579.18 USD')
})
