import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Custom } from '../../../src/classes/nodes/index.mjs'
import { Value } from '../../../src/classes/Value.mjs'

test('Parse simple', () => {
  // simplest custom directive
  const directive = '2014-07-09 custom "budget"'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Custom
  expect(node.type).toBe('custom')
  expect(node.date.toJSON()).toBe('2014-07-09')
  expect(node.customType).toEqual(
    new Value({ type: 'string', value: 'budget' }),
  )
  expect(node.values).toBeUndefined()
})

test('Parse with values', () => {
  // simplest custom directive
  const directive = '2014-07-09 custom "budget" "..." TRUE 45.30 USD'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Custom
  expect(node.type).toBe('custom')
  expect(node.date.toJSON()).toBe('2014-07-09')
  expect(node.customType).toEqual(
    new Value({ type: 'string', value: 'budget' }),
  )
  expect(node.values).toEqual([
    new Value({ type: 'string', value: '...' }),
    new Value({ type: 'boolean', value: true }),
    new Value({ type: 'amount', value: '45.30' }),
    new Value({ type: 'amount', value: 'USD' }),
  ])
})
