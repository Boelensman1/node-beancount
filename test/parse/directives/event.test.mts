import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Event } from '../../../src/classes/nodes/index.mjs'
import { Value } from '../../../src/classes/Value.mjs'

test('Parse simple (string)', () => {
  // simplest event directive
  const directive = '2014-07-09 event "location" "Paris, France"'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Event
  expect(node.type).toBe('event')
  expect(node.date.toJSON()).toBe('2014-07-09')
  expect(node.name).toBe('location')
  expect(node.value).toEqual(
    new Value({ type: 'string', value: 'Paris, France' }),
  )
})

test('Parse simple (boolean)', () => {
  // simplest event directive
  const directive = '2014-07-09 event "location" TRUE'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Event
  expect(node.type).toBe('event')
  expect(node.date.toJSON()).toBe('2014-07-09')
  expect(node.name).toBe('location')
  expect(node.value).toEqual(new Value({ type: 'boolean', value: true }))
})

test('Parse simple (number)', () => {
  // simplest event directive
  const directive = '2014-07-09 event "location" 23.01'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Event
  expect(node.date.toJSON()).toBe('2014-07-09')
  expect(node.name).toBe('location')
  expect(node.value).toEqual(new Value({ type: 'amount', value: '23.01' }))
})
