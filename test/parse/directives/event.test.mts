import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Event } from '../../../src/classes/entryTypes/index.mjs'
import { Value } from '../../../src/classes/Value.mjs'

test('Parse simple (string)', () => {
  // simplest event directive
  const directive = '2014-07-09 event "location" "Paris, France"'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Event
  expect(entry.type).toBe('event')
  expect(entry.date.toJSON()).toBe('2014-07-09')
  expect(entry.name).toBe('location')
  expect(entry.value).toEqual(
    new Value({ type: 'string', value: 'Paris, France' }),
  )
})

test('Parse simple (boolean)', () => {
  // simplest event directive
  const directive = '2014-07-09 event "location" TRUE'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Event
  expect(entry.type).toBe('event')
  expect(entry.date.toJSON()).toBe('2014-07-09')
  expect(entry.name).toBe('location')
  expect(entry.value).toEqual(new Value({ type: 'boolean', value: true }))
})

test('Parse simple (number)', () => {
  // simplest event directive
  const directive = '2014-07-09 event "location" 23.01'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Event
  expect(entry.date.toJSON()).toBe('2014-07-09')
  expect(entry.name).toBe('location')
  expect(entry.value).toEqual(new Value({ type: 'amount', value: '23.01' }))
})
