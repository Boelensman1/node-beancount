import { describe, expect, test } from 'vitest'
import { DateEntry } from '../../src/classes/DateEntry.mjs'

class TestEntryClass extends DateEntry {
  type = 'transaction' as const

  // Expose constructor for testing purposes
  constructor(inp: { date: string }) {
    super(inp)
  }

  static fromGenericParseResult(unparsedEntry: string[]): TestEntryClass {
    return new TestEntryClass({ date: unparsedEntry[0] })
  }

  static fromObject(inp: { date: string }): TestEntryClass {
    return new TestEntryClass(inp)
  }
}

describe('Entry class', () => {
  describe('fromObject', () => {
    test('creates entry with different valid dates', () => {
      const dates = [
        '2024-12-31',
        '2025-06-15',
        '2023-03-01',
        '2000-01-01',
        '1999-12-31',
      ]

      dates.forEach((dateStr) => {
        const entry = TestEntryClass.fromObject({ date: dateStr })
        expect(entry.date?.toJSON()).toBe(dateStr)
      })
    })

    test('throws error for malformed date string', () => {
      expect(() => {
        TestEntryClass.fromObject({ date: 'not-a-date' })
      }).toThrow()
    })

    test('throws error for invalid date format - no leading zeros', () => {
      expect(() => {
        TestEntryClass.fromObject({ date: '2025-6-15' })
      }).toThrow()
    })
  })

  describe('type property', () => {
    test('has type property defined by subclass', () => {
      const entry = TestEntryClass.fromObject({ date: '2025-01-01' })
      expect(entry.type).toBe('transaction')
    })
  })
})
