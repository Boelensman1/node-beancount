import { describe, expect, test } from 'vitest'
import { Event } from '../../../src/classes/entryTypes/index.mjs'

describe('Event class', () => {
  test('toString', () => {
    const input = '2014-07-09 event "location" "Paris, France"'
    const event = Event.fromString(input)
    expect(event.toString()).toEqual(input)
  })
})
