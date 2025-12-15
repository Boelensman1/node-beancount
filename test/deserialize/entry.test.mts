import { describe, expect, test } from 'vitest'
import {
  deserializeEntry,
  deserializeEntryFromString,
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

describe('deserializeEntry', () => {
  describe('valid entries', () => {
    test('deserialize simple open entry', () => {
      const entryData = {
        type: 'open',
        date: '2024-01-01',
        account: 'Assets:Checking',
      }
      const entry = deserializeEntry(entryData)
      expect(entry.type).toBe('open')
      expect(entry).toBeInstanceOf(Open)
    })

    test('deserialize complex transaction entry', () => {
      const input = `2024-01-02 * "Payee" "Narration"
  Assets:Checking  -100.00 USD
  Expenses:Food     100.00 USD`
      const transaction = Transaction.fromString(input)
      const entryData = transaction.toJSON()
      const deserialized = deserializeEntry(entryData)
      expect(deserialized.type).toBe('transaction')
      expect(deserialized).toBeInstanceOf(Transaction)
      expect(deserialized).toEqual(transaction)
    })

    test('deserialize balance entry', () => {
      const input = '2024-01-03 balance Assets:Checking 100.00 USD'
      const balance = Balance.fromString(input)
      const entryData = balance.toJSON()
      const deserialized = deserializeEntry(entryData)
      expect(deserialized).toEqual(balance)
    })

    test('deserialize comment entry', () => {
      const input = '; This is a comment'
      const comment = Comment.fromString(input)
      const entryData = comment.toJSON()
      const deserialized = deserializeEntry(entryData)
      expect(deserialized).toEqual(comment)
    })

    test('deserialize blankline entry', () => {
      const blankline = Blankline.fromString('')
      const entryData = blankline.toJSON()
      const deserialized = deserializeEntry(entryData)
      expect(deserialized).toEqual(blankline)
    })

    test('roundtrip serialization for open entry', () => {
      const input = '2024-01-01 open Assets:Checking USD'
      const original = Open.fromString(input)
      const entryData = original.toJSON()
      const deserialized = deserializeEntry(entryData)
      expect(deserialized).toEqual(original)
    })

    test('roundtrip serialization for transaction entry', () => {
      const input = `2024-01-02 * "Payee" "Narration" #tag ^link
  meta: "value"
  Assets:Checking  -100.00 USD
  Expenses:Food     100.00 USD`
      const original = Transaction.fromString(input)
      const entryData = original.toJSON()
      const deserialized = deserializeEntry(entryData)
      expect(deserialized).toEqual(original)
    })

    test('deserialize all entry types', () => {
      const entries = [
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

      for (const entry of entries) {
        const entryData = entry.toJSON()
        const deserialized = deserializeEntry(entryData)
        expect(deserialized).toEqual(entry)
        expect(deserialized.type).toBe(entry.type)
      }
    })
  })

  describe('error handling', () => {
    test('throws on null input', () => {
      // @ts-expect-error testing invalid input
      expect(() => deserializeEntry(null)).toThrow(
        'Invalid entry data: expected an object but received object',
      )
    })

    test('throws on undefined input', () => {
      // @ts-expect-error testing invalid input
      expect(() => deserializeEntry(undefined)).toThrow(
        'Invalid entry data: expected an object but received undefined',
      )
    })

    test('throws on string input', () => {
      expect(() =>
        // @ts-expect-error wrong type
        deserializeEntry('not an object'),
      ).toThrow('Invalid entry data: expected an object but received string')
    })

    test('throws on number input', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeEntry(123)).toThrow(
        'Invalid entry data: expected an object but received number',
      )
    })

    test('throws on boolean input', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeEntry(true)).toThrow(
        'Invalid entry data: expected an object but received boolean',
      )
    })

    test('throws on missing type field', () => {
      const entryData = {
        date: '2024-01-01',
        account: 'Assets:Checking',
      }
      expect(() => deserializeEntry(entryData)).toThrow(
        'Invalid entry data: missing required "type" field',
      )
    })

    test('throws on non-string type field', () => {
      const entryData = {
        type: 123,
        date: '2024-01-01',
      }
      expect(() => deserializeEntry(entryData)).toThrow(
        'Invalid entry data: "type" field must be a string, but received number',
      )
    })

    test('throws on unknown entry type', () => {
      const entryData = {
        type: 'unknown_type',
        date: '2024-01-01',
      }
      expect(() => deserializeEntry(entryData)).toThrow(
        /Unknown entry type: "unknown_type"\. Valid entry types are:/,
      )
    })

    test('throws on unknown entry type with list of valid types', () => {
      const entryData = {
        type: 'invalid',
        date: '2024-01-01',
      }
      try {
        deserializeEntry(entryData)
        expect.fail('Should have thrown an error')
      } catch (error) {
        const message = (error as Error).message
        expect(message).toContain('Unknown entry type: "invalid"')
        expect(message).toContain('Valid entry types are:')
        expect(message).toContain('open')
        expect(message).toContain('transaction')
        expect(message).toContain('balance')
      }
    })
  })
})

describe('deserializeEntryFromString', () => {
  describe('valid inputs', () => {
    test('deserialize simple entry from JSON string', () => {
      const json =
        '{"type":"open","date":"2024-01-01","account":"Assets:Checking"}'
      const entry = deserializeEntryFromString(json)
      expect(entry.type).toBe('open')
      expect(entry).toBeInstanceOf(Open)
    })

    test('roundtrip: entry to JSON string and back', () => {
      const original = Open.fromString('2024-01-01 open Assets:Checking USD')
      const json = JSON.stringify(original.toJSON())
      const deserialized = deserializeEntryFromString(json)
      expect(deserialized).toEqual(original)
    })

    test('roundtrip for transaction entry', () => {
      const original = Transaction.fromString(`2024-01-02 * "Store" "Purchase"
  Assets:Checking  -50.00 USD
  Expenses:Shopping 50.00 USD`)
      const json = JSON.stringify(original.toJSON())
      const deserialized = deserializeEntryFromString(json)
      expect(deserialized).toEqual(original)
    })

    test('roundtrip for all entry types', () => {
      const entries = [
        Balance.fromString('2024-01-01 balance Assets:Checking 100.00 USD'),
        Blankline.fromString(''),
        Close.fromString('2024-01-01 close Assets:Checking'),
        Comment.fromString('; comment'),
        Open.fromString('2024-01-01 open Assets:Checking'),
        Transaction.fromString(`2024-01-01 * "Payee" "Narration"
  Assets:Checking  -100.00 USD
  Expenses:Food     100.00 USD`),
      ]

      for (const entry of entries) {
        const json = JSON.stringify(entry.toJSON())
        const deserialized = deserializeEntryFromString(json)
        expect(deserialized).toEqual(entry)
      }
    })
  })

  describe('error handling', () => {
    test('throws on non-string input (number)', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeEntryFromString(123)).toThrow(
        'Invalid input: expected a JSON string but received number',
      )
    })

    test('throws on non-string input (object)', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeEntryFromString({})).toThrow(
        'Invalid input: expected a JSON string but received object',
      )
    })

    test('throws on non-string input (null)', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeEntryFromString(null)).toThrow(
        'Invalid input: expected a JSON string but received object',
      )
    })

    test('throws on invalid JSON syntax', () => {
      const invalidJson = '{invalid json'
      expect(() => deserializeEntryFromString(invalidJson)).toThrow(
        /Failed to parse JSON:/,
      )
    })

    test('throws when JSON parses to array', () => {
      const json = '[{"type":"open"}]'
      expect(() => deserializeEntryFromString(json)).toThrow(
        'Invalid JSON structure: expected an object but received an array',
      )
    })

    test('throws when JSON parses to null', () => {
      const json = 'null'
      expect(() => deserializeEntryFromString(json)).toThrow(
        'Invalid JSON structure: expected an object but received null',
      )
    })

    test('throws when JSON parses to string', () => {
      const json = '"just a string"'
      expect(() => deserializeEntryFromString(json)).toThrow(
        'Invalid JSON structure: expected an object but received string',
      )
    })

    test('throws when JSON parses to number', () => {
      const json = '42'
      expect(() => deserializeEntryFromString(json)).toThrow(
        'Invalid JSON structure: expected an object but received number',
      )
    })

    test('throws on missing type field', () => {
      const json = '{"date":"2024-01-01","account":"Assets:Checking"}'
      expect(() => deserializeEntryFromString(json)).toThrow(
        'Invalid entry data: missing required "type" field',
      )
    })

    test('throws on unknown entry type', () => {
      const json = '{"type":"invalid","date":"2024-01-01"}'
      expect(() => deserializeEntryFromString(json)).toThrow(
        /Unknown entry type: "invalid"/,
      )
    })
  })
})
