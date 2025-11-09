import { describe, expect, test } from 'vitest'
import { Event } from '../../../src/classes/entryTypes/index.mjs'

describe('toString', () => {
  test('string value', () => {
    const input = '2014-07-09 event "location" "Paris, France"'
    const event = Event.fromString(input)
    expect(event.toString()).toEqual(input)
  })

  test('boolean value', () => {
    const input = '2014-07-09 event "location" TRUE'
    const event = Event.fromString(input)
    expect(event.toString()).toEqual(input)
  })

  test('number value', () => {
    const input = '2014-07-09 event "location" 23.01'
    const event = Event.fromString(input)
    expect(event.toString()).toEqual(input)
  })
})
