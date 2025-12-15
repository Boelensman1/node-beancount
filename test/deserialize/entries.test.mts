import { describe, expect, test } from 'vitest'
import {
  deserializeEntries,
  deserializeEntriesFromString,
} from '../../src/deserialize.mjs'
import {
  Open,
  Transaction,
  Balance,
  Close,
  Comment,
  Blankline,
  Include,
  Option,
  Pad,
  Plugin,
  Poptag,
  Price,
  Pushtag,
  Query,
  Commodity,
  Custom,
  Document,
  Event,
  Note,
} from '../../src/classes/entryTypes/index.mjs'

describe('deserializeEntries', () => {
  describe('valid inputs', () => {
    test('deserialize empty array', () => {
      const entriesData: Record<string, unknown>[] = []
      const entries = deserializeEntries(entriesData)
      expect(entries).toEqual([])
    })

    test('deserialize single entry array', () => {
      const entry = Open.fromString('2024-01-01 open Assets:Checking')
      const entriesData = [entry.toJSON()]
      const entries = deserializeEntries(entriesData)
      expect(entries).toHaveLength(1)
      expect(entries[0]).toEqual(entry)
    })

    test('deserialize array of mixed entry types', () => {
      const original = [
        Open.fromString('2024-01-01 open Assets:Checking'),
        Balance.fromString('2024-01-02 balance Assets:Checking 100.00 USD'),
        Transaction.fromString(`2024-01-03 * "Payee" "Narration"
  Assets:Checking  -50.00 USD
  Expenses:Food     50.00 USD`),
        Comment.fromString('; comment'),
      ]
      const entriesData = original.map((e) => e.toJSON())
      const entries = deserializeEntries(entriesData)
      expect(entries).toHaveLength(4)
      expect(entries).toEqual(original)
    })

    test('roundtrip serialization for array of entries', () => {
      const original = [
        Open.fromString('2024-01-01 open Assets:Checking USD'),
        Close.fromString('2024-12-31 close Assets:Checking'),
        Transaction.fromString(`2024-06-15 * "Store" "Purchase" #shopping
  Assets:Checking  -25.00 USD
  Expenses:Shopping 25.00 USD`),
      ]
      const entriesData = original.map((e) => e.toJSON())
      const deserialized = deserializeEntries(entriesData)
      expect(deserialized).toEqual(original)
    })

    test('deserialize array with all entry types', () => {
      const original = [
        Balance.fromString('2024-01-01 balance Assets:Checking 100.00 USD'),
        Blankline.fromString(''),
        Close.fromString('2024-01-01 close Assets:Checking'),
        Comment.fromString('; comment'),
        Commodity.fromString('2024-01-01 commodity USD'),
        Custom.fromString('2024-01-01 custom "budget" Assets:Checking'),
        Document.fromString(
          '2024-01-01 document Assets:Checking "path/to/file.pdf"',
        ),
        Event.fromString('2024-01-01 event "location" "New York"'),
        Include.fromString('include "other.beancount"'),
        Note.fromString('2024-01-01 note Assets:Checking "Note text"'),
        Open.fromString('2024-01-01 open Assets:Checking'),
        Option.fromString('option "operating_currency" "USD"'),
        Pad.fromString('2024-01-01 pad Assets:Checking Equity:Opening'),
        Plugin.fromString('plugin "beancount.plugins.auto_accounts"'),
        Poptag.fromString('poptag #tag'),
        Price.fromString('2024-01-01 price USD 1.00 EUR'),
        Pushtag.fromString('pushtag #tag'),
        Query.fromString('2024-01-01 query "name" "SELECT *"'),
        Transaction.fromString(`2024-01-01 * "Payee" "Narration"
  Assets:Checking  -100.00 USD
  Expenses:Food     100.00 USD`),
      ]
      const entriesData = original.map((e) => e.toJSON())
      const deserialized = deserializeEntries(entriesData)
      expect(deserialized).toEqual(original)
    })
  })

  describe('error handling', () => {
    test('throws on non-array input (string)', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeEntries('not an array')).toThrow(
        'Invalid input: expected an array but received string',
      )
    })

    test('throws on non-array input (object)', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeEntries({ type: 'open' })).toThrow(
        'Invalid input: expected an array but received object',
      )
    })

    test('throws on non-array input (null)', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeEntries(null)).toThrow(
        'Invalid input: expected an array but received object',
      )
    })

    test('throws on invalid entry in array with index', () => {
      const entriesData = [
        { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
        { type: 'invalid_type', date: '2024-01-02' },
        { type: 'close', date: '2024-01-03', account: 'Assets:Checking' },
      ]
      try {
        deserializeEntries(entriesData)
        expect.fail('Should have thrown an error')
      } catch (error) {
        const message = (error as Error).message
        expect(message).toContain('Failed to deserialize entry at index 1')
        expect(message).toContain('Unknown entry type: "invalid_type"')
      }
    })

    test('throws with correct index when first entry is invalid', () => {
      const entriesData = [
        { type: 'unknown' },
        { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
      ]
      expect(() => deserializeEntries(entriesData)).toThrow(
        /Failed to deserialize entry at index 0/,
      )
    })

    test('throws with correct index when last entry is invalid', () => {
      const entriesData = [
        { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
        { type: 'close', date: '2024-01-02', account: 'Assets:Checking' },
        { missing_type: true },
      ]
      try {
        deserializeEntries(entriesData)
        expect.fail('Should have thrown an error')
      } catch (error) {
        const message = (error as Error).message
        expect(message).toContain('Failed to deserialize entry at index 2')
        expect(message).toContain('missing required "type" field')
      }
    })

    test('error propagates from deserializeEntry', () => {
      const entriesData = [
        { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
        null,
      ]
      // @ts-expect-error testing invalid input
      expect(() => deserializeEntries(entriesData)).toThrow(
        /Failed to deserialize entry at index 1/,
      )
    })
  })
})

describe('deserializeEntriesFromString', () => {
  describe('valid inputs', () => {
    test('deserialize empty array', () => {
      const json = '[]'
      const entries = deserializeEntriesFromString(json)
      expect(entries).toEqual([])
    })

    test('deserialize single entry array', () => {
      const entry = Open.fromString('2024-01-01 open Assets:Checking')
      const json = JSON.stringify([entry.toJSON()])
      const entries = deserializeEntriesFromString(json)
      expect(entries).toHaveLength(1)
      expect(entries[0]).toEqual(entry)
    })

    test('deserialize array of mixed entry types', () => {
      const original = [
        Open.fromString('2024-01-01 open Assets:Checking'),
        Balance.fromString('2024-01-02 balance Assets:Checking 100.00 USD'),
        Transaction.fromString(`2024-01-03 * "Payee" "Narration"
  Assets:Checking  -50.00 USD
  Expenses:Food     50.00 USD`),
        Comment.fromString('; comment'),
      ]
      const json = JSON.stringify(original.map((e) => e.toJSON()))
      const entries = deserializeEntriesFromString(json)
      expect(entries).toHaveLength(4)
      expect(entries).toEqual(original)
    })

    test('roundtrip serialization for array of entries', () => {
      const original = [
        Open.fromString('2024-01-01 open Assets:Checking USD'),
        Close.fromString('2024-12-31 close Assets:Checking'),
        Transaction.fromString(`2024-06-15 * "Store" "Purchase" #shopping
  Assets:Checking  -25.00 USD
  Expenses:Shopping 25.00 USD`),
      ]
      const json = JSON.stringify(original.map((e) => e.toJSON()))
      const deserialized = deserializeEntriesFromString(json)
      expect(deserialized).toEqual(original)
    })

    test('deserialize array with all entry types', () => {
      const original = [
        Balance.fromString('2024-01-01 balance Assets:Checking 100.00 USD'),
        Blankline.fromString(''),
        Close.fromString('2024-01-01 close Assets:Checking'),
        Comment.fromString('; comment'),
        Commodity.fromString('2024-01-01 commodity USD'),
        Custom.fromString('2024-01-01 custom "budget" Assets:Checking'),
        Document.fromString(
          '2024-01-01 document Assets:Checking "path/to/file.pdf"',
        ),
        Event.fromString('2024-01-01 event "location" "New York"'),
        Include.fromString('include "other.beancount"'),
        Note.fromString('2024-01-01 note Assets:Checking "Note text"'),
        Open.fromString('2024-01-01 open Assets:Checking'),
        Option.fromString('option "operating_currency" "USD"'),
        Pad.fromString('2024-01-01 pad Assets:Checking Equity:Opening'),
        Plugin.fromString('plugin "beancount.plugins.auto_accounts"'),
        Poptag.fromString('poptag #tag'),
        Price.fromString('2024-01-01 price USD 1.00 EUR'),
        Pushtag.fromString('pushtag #tag'),
        Query.fromString('2024-01-01 query "name" "SELECT *"'),
        Transaction.fromString(`2024-01-01 * "Payee" "Narration"
  Assets:Checking  -100.00 USD
  Expenses:Food     100.00 USD`),
      ]
      const json = JSON.stringify(original.map((e) => e.toJSON()))
      const deserialized = deserializeEntriesFromString(json)
      expect(deserialized).toEqual(original)
    })
  })

  describe('error handling', () => {
    test('throws on non-string input', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeEntriesFromString(123)).toThrow(
        'Invalid input: expected a JSON string but received number',
      )
    })

    test('throws on object input', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeEntriesFromString({})).toThrow(
        'Invalid input: expected a JSON string but received object',
      )
    })

    test('throws on invalid JSON syntax', () => {
      const invalidJson = '{invalid json'
      expect(() => deserializeEntriesFromString(invalidJson)).toThrow(
        /Failed to parse JSON:/,
      )
    })

    test('throws on non-array JSON', () => {
      const json = '{"type": "open", "date": "2024-01-01"}'
      expect(() => deserializeEntriesFromString(json)).toThrow(
        'Invalid JSON structure: expected an array but received object',
      )
    })

    test('throws on invalid entry in array with index', () => {
      const json = JSON.stringify([
        { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
        { type: 'invalid_type', date: '2024-01-02' },
        { type: 'close', date: '2024-01-03', account: 'Assets:Checking' },
      ])
      try {
        deserializeEntriesFromString(json)
        expect.fail('Should have thrown an error')
      } catch (error) {
        const message = (error as Error).message
        expect(message).toContain('Failed to deserialize entry at index 1')
        expect(message).toContain('Unknown entry type: "invalid_type"')
      }
    })

    test('throws with correct index when first entry is invalid', () => {
      const json = JSON.stringify([
        { type: 'unknown' },
        { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
      ])
      expect(() => deserializeEntriesFromString(json)).toThrow(
        /Failed to deserialize entry at index 0/,
      )
    })

    test('throws with correct index when last entry is invalid', () => {
      const json = JSON.stringify([
        { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
        { type: 'close', date: '2024-01-02', account: 'Assets:Checking' },
        { missing_type: true },
      ])
      try {
        deserializeEntriesFromString(json)
        expect.fail('Should have thrown an error')
      } catch (error) {
        const message = (error as Error).message
        expect(message).toContain('Failed to deserialize entry at index 2')
        expect(message).toContain('missing required "type" field')
      }
    })

    test('error propagates from deserializeEntry', () => {
      const json = JSON.stringify([
        { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
        null,
      ])
      expect(() => deserializeEntriesFromString(json)).toThrow(
        /Failed to deserialize entry at index 1/,
      )
    })
  })
})
