import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Commodity } from '../../../src/classes/nodes/index.mjs'
import { Value } from '../../../src/classes/Value.mjs'

test('Parse simple', () => {
  // simplest commodity directive
  const directive = '1867-07-01 commodity CAD'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Commodity
  expect(node.type).toBe('commodity')
  expect(node.date.toJSON()).toBe('1867-07-01')
  expect(node.currency).toBe('CAD')
  expect(node.metadata).toBeUndefined()
})

test('Parse with metadata', () => {
  // simplest commodity directive
  const directive = `
2012-01-01 commodity HOOL
  name: "Hooli Corporation Class C Shares"
  asset-class: "stock"`
  const output = parse(directive)
  expect(output.commodity).toHaveLength(1)

  const node = output.commodity[0]
  expect(node.type).toBe('commodity')
  expect(node.date.toJSON()).toBe('2012-01-01')
  expect(node.currency).toBe('HOOL')
  expect(node.metadata).toEqual({
    name: new Value({
      type: 'string',
      value: 'Hooli Corporation Class C Shares',
    }),
    'asset-class': new Value({ type: 'string', value: 'stock' }),
  })
})
