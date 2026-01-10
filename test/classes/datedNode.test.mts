import { describe, expect, test } from 'vitest'
import { DatedNode } from '../../src/main.mjs'
import { Temporal } from '@js-temporal/polyfill'

class TestNodeClass extends DatedNode {
  type = 'transaction' as const

  static fromGenericParseResult(sourceFragment: string[]): TestNodeClass {
    return new TestNodeClass({ date: sourceFragment[0] })
  }

  static fromObject(inp: { date: string | Temporal.PlainDate }): TestNodeClass {
    return new TestNodeClass(inp)
  }
}

// Test class that overrides fromJSONData to verify it's called
class TestNodeWithCustomParseJSON extends DatedNode {
  type = 'transaction' as const
  customField?: string

  static fromGenericParseResult(
    sourceFragment: string[],
  ): TestNodeWithCustomParseJSON {
    return new TestNodeWithCustomParseJSON({ date: sourceFragment[0] })
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

describe('DatedNode class', () => {
  describe('fromObject', () => {
    test('creates node with different valid dates', () => {
      const dates = [
        '2024-12-31',
        '2025-06-15',
        '2023-03-01',
        '2000-01-01',
        '1999-12-31',
      ]

      dates.forEach((dateStr) => {
        const node = TestNodeClass.fromObject({ date: dateStr })
        expect(node.date?.toJSON()).toBe(dateStr)
      })
    })

    test('creates node with temporal date', () => {
      const dateStr = '2024-12-31'
      const node = TestNodeClass.fromObject({
        date: Temporal.PlainDate.from(dateStr),
      })

      expect(node.date?.toJSON()).toBe(dateStr)
    })

    test('throws error for malformed date string', () => {
      expect(() => {
        TestNodeClass.fromObject({ date: 'not-a-date' })
      }).toThrow()
    })

    test('throws error for date of wrong type', () => {
      expect(() => {
        // @ts-expect-error Wrong type is on purpose
        TestNodeClass.fromObject({ date: new Date() })
      }).toThrow(
        'Could not parse date, should be either string of Temporal.PlainDate',
      )
    })

    test('throws error for invalid date format - no leading zeros', () => {
      expect(() => {
        TestNodeClass.fromObject({ date: '2025-6-15' })
      }).toThrow()
    })
  })

  describe('type property', () => {
    test('has type property defined by subclass', () => {
      const node = TestNodeClass.fromObject({ date: '2025-01-01' })
      expect(node.type).toBe('transaction')
    })
  })

  describe('fromJSON', () => {
    test('creates node from JSON data', () => {
      const jsonData = { date: '2024-12-31', type: 'transaction' }
      const node = TestNodeClass.fromJSON(JSON.stringify(jsonData))
      expect(node.date?.toJSON()).toBe('2024-12-31')
      expect(node.type).toBe('transaction')
    })

    test('preserves additional properties', () => {
      const jsonData = {
        date: '2025-01-15',
        type: 'transaction',
        comment: 'Test comment',
      }
      const node = TestNodeClass.fromJSON(JSON.stringify(jsonData))
      expect(node.date?.toJSON()).toBe('2025-01-15')
      expect(node.comment).toBe('Test comment')
    })

    test('fromJSONData can be overridden to transform data', () => {
      const jsonData = { date: '2025-01-15', customField: 'value' }
      const node = TestNodeWithCustomParseJSON.fromJSON(
        JSON.stringify(jsonData),
      )
      expect(node.customField).toBe('transformed-value')
      expect(node.date?.toJSON()).toBe('2025-01-15')
    })

    test('default fromJSONData returns input unchanged', () => {
      const jsonData = { date: '2025-01-15', comment: 'test comment' }
      const node = TestNodeClass.fromJSON(JSON.stringify(jsonData))
      expect(node.comment).toBe('test comment')
      expect(node.date?.toJSON()).toBe('2025-01-15')
    })

    test('handles roundtrip serialization', () => {
      const original = TestNodeClass.fromObject({ date: '2024-06-20' })
      const restored = TestNodeClass.fromJSON(JSON.stringify(original))
      expect(restored.date?.toJSON()).toBe(original.date?.toJSON())
      expect(restored.type).toBe(original.type)
    })

    test('handles roundtrip serialization with internalMetadata', () => {
      const original = TestNodeClass.fromObject({ date: '2024-06-20' })
      original.internalMetadata.testProp = 2
      const restored = TestNodeClass.fromJSON(JSON.stringify(original))
      expect(restored.internalMetadata.testProp).toBe(
        original.internalMetadata.testProp,
      )
    })

    test('converts ISO date string to Temporal.PlainDate', () => {
      const jsonData = { date: '2023-03-01' }
      const node = TestNodeClass.fromJSON(JSON.stringify(jsonData))
      expect(node.date).toBeInstanceOf(Object) // Temporal.PlainDate
      expect(node.date?.toJSON()).toBe('2023-03-01')
    })
  })
})
