import { describe, expect, test } from 'vitest'
import { DateEntry } from '../../src/main.mjs'
import { Temporal } from '@js-temporal/polyfill'

class TestEntryClass extends DateEntry {
  type = 'transaction' as const

  static fromGenericParseResult(unparsedEntry: string[]): TestEntryClass {
    return new TestEntryClass({ date: unparsedEntry[0] })
  }

  static fromObject(inp: {
    date: string | Temporal.PlainDate
  }): TestEntryClass {
    return new TestEntryClass(inp)
  }
}

// Test class that overrides fromJSONData to verify it's called
class TestEntryWithCustomParseJSON extends DateEntry {
  type = 'transaction' as const
  customField?: string

  static fromGenericParseResult(
    unparsedEntry: string[],
  ): TestEntryWithCustomParseJSON {
    return new TestEntryWithCustomParseJSON({ date: unparsedEntry[0] })
  }

  protected parseJSONData(
    json: Record<string, unknown>,
  ): Record<string, unknown> {
    // Transform the data by adding a prefix to customField
    return {
      ...json,
      customField:
        typeof json.customField === 'string'
          ? `transformed-${json.customField}`
          : undefined,
    }
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

    test('creates entry with temporal date', () => {
      const dateStr = '2024-12-31'
      const entry = TestEntryClass.fromObject({
        date: Temporal.PlainDate.from(dateStr),
      })

      expect(entry.date?.toJSON()).toBe(dateStr)
    })

    test('throws error for malformed date string', () => {
      expect(() => {
        TestEntryClass.fromObject({ date: 'not-a-date' })
      }).toThrow()
    })

    test('throws error for date of wrong type', () => {
      expect(() => {
        // @ts-expect-error Wrong type is on purpose
        TestEntryClass.fromObject({ date: new Date() })
      }).toThrow(
        'Could not parse date, should be either string of Temporal.PlainDate',
      )
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

  describe('fromJSON', () => {
    test('creates entry from JSON data', () => {
      const jsonData = { date: '2024-12-31', type: 'transaction' }
      const entry = TestEntryClass.fromJSON(JSON.stringify(jsonData))
      expect(entry.date?.toJSON()).toBe('2024-12-31')
      expect(entry.type).toBe('transaction')
    })

    test('preserves additional properties', () => {
      const jsonData = {
        date: '2025-01-15',
        type: 'transaction',
        comment: 'Test comment',
      }
      const entry = TestEntryClass.fromJSON(JSON.stringify(jsonData))
      expect(entry.date?.toJSON()).toBe('2025-01-15')
      expect(entry.comment).toBe('Test comment')
    })

    test('fromJSONData can be overridden to transform data', () => {
      const jsonData = { date: '2025-01-15', customField: 'value' }
      const entry = TestEntryWithCustomParseJSON.fromJSON(
        JSON.stringify(jsonData),
      )
      expect(entry.customField).toBe('transformed-value')
      expect(entry.date?.toJSON()).toBe('2025-01-15')
    })

    test('default fromJSONData returns input unchanged', () => {
      const jsonData = { date: '2025-01-15', comment: 'test comment' }
      const entry = TestEntryClass.fromJSON(JSON.stringify(jsonData))
      expect(entry.comment).toBe('test comment')
      expect(entry.date?.toJSON()).toBe('2025-01-15')
    })

    test('handles roundtrip serialization', () => {
      const original = TestEntryClass.fromObject({ date: '2024-06-20' })
      const restored = TestEntryClass.fromJSON(JSON.stringify(original))
      expect(restored.date?.toJSON()).toBe(original.date?.toJSON())
      expect(restored.type).toBe(original.type)
    })

    test('handles roundtrip serialization with internalMetadata', () => {
      const original = TestEntryClass.fromObject({ date: '2024-06-20' })
      original.internalMetadata.testProp = 2
      const restored = TestEntryClass.fromJSON(JSON.stringify(original))
      expect(restored.internalMetadata.testProp).toBe(
        original.internalMetadata.testProp,
      )
    })

    test('converts ISO date string to Temporal.PlainDate', () => {
      const jsonData = { date: '2023-03-01' }
      const entry = TestEntryClass.fromJSON(JSON.stringify(jsonData))
      expect(entry.date).toBeInstanceOf(Object) // Temporal.PlainDate
      expect(entry.date?.toJSON()).toBe('2023-03-01')
    })
  })
})
