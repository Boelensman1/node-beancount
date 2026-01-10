import { describe, expect, test } from 'vitest'
import {
  deserializeNode,
  deserializeNodeFromString,
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
} from '../../src/classes/nodes/index.mjs'

describe('deserializeNode', () => {
  describe('valid nodes', () => {
    test('deserialize simple open node', () => {
      const nodeData = {
        type: 'open',
        date: '2024-01-01',
        account: 'Assets:Checking',
      }
      const node = deserializeNode(nodeData)
      expect(node.type).toBe('open')
      expect(node).toBeInstanceOf(Open)
    })

    test('deserialize complex transaction node', () => {
      const input = `2024-01-02 * "Payee" "Narration"
  Assets:Checking  -100.00 USD
  Expenses:Food     100.00 USD`
      const transaction = Transaction.fromString(input)
      const nodeData = transaction.toJSON()
      const deserialized = deserializeNode(nodeData)
      expect(deserialized.type).toBe('transaction')
      expect(deserialized).toBeInstanceOf(Transaction)
      expect(deserialized).toEqual(transaction)
    })

    test('deserialize balance node', () => {
      const input = '2024-01-03 balance Assets:Checking 100.00 USD'
      const balance = Balance.fromString(input)
      const nodeData = balance.toJSON()
      const deserialized = deserializeNode(nodeData)
      expect(deserialized).toEqual(balance)
    })

    test('deserialize comment node', () => {
      const input = '; This is a comment'
      const comment = Comment.fromString(input)
      const nodeData = comment.toJSON()
      const deserialized = deserializeNode(nodeData)
      expect(deserialized).toEqual(comment)
    })

    test('deserialize blankline node', () => {
      const blankline = Blankline.fromString('')
      const nodeData = blankline.toJSON()
      const deserialized = deserializeNode(nodeData)
      expect(deserialized).toEqual(blankline)
    })

    test('roundtrip serialization for open node', () => {
      const input = '2024-01-01 open Assets:Checking USD'
      const original = Open.fromString(input)
      const nodeData = original.toJSON()
      const deserialized = deserializeNode(nodeData)
      expect(deserialized).toEqual(original)
    })

    test('roundtrip serialization for transaction node', () => {
      const input = `2024-01-02 * "Payee" "Narration" #tag ^link
  meta: "value"
  Assets:Checking  -100.00 USD
  Expenses:Food     100.00 USD`
      const original = Transaction.fromString(input)
      const nodeData = original.toJSON()
      const deserialized = deserializeNode(nodeData)
      expect(deserialized).toEqual(original)
    })

    test('deserialize all node types', () => {
      const nodes = [
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

      for (const node of nodes) {
        const nodeData = node.toJSON()
        const deserialized = deserializeNode(nodeData)
        expect(deserialized).toEqual(node)
        expect(deserialized.type).toBe(node.type)
      }
    })
  })

  describe('error handling', () => {
    test('throws on null input', () => {
      // @ts-expect-error testing invalid input
      expect(() => deserializeNode(null)).toThrow(
        'Invalid node data: expected an object but received object',
      )
    })

    test('throws on undefined input', () => {
      // @ts-expect-error testing invalid input
      expect(() => deserializeNode(undefined)).toThrow(
        'Invalid node data: expected an object but received undefined',
      )
    })

    test('throws on string input', () => {
      expect(() =>
        // @ts-expect-error wrong type
        deserializeNode('not an object'),
      ).toThrow('Invalid node data: expected an object but received string')
    })

    test('throws on number input', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeNode(123)).toThrow(
        'Invalid node data: expected an object but received number',
      )
    })

    test('throws on boolean input', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeNode(true)).toThrow(
        'Invalid node data: expected an object but received boolean',
      )
    })

    test('throws on missing type field', () => {
      const nodeData = {
        date: '2024-01-01',
        account: 'Assets:Checking',
      }
      expect(() => deserializeNode(nodeData)).toThrow(
        'Invalid node data: missing required "type" field',
      )
    })

    test('throws on non-string type field', () => {
      const nodeData = {
        type: 123,
        date: '2024-01-01',
      }
      expect(() => deserializeNode(nodeData)).toThrow(
        'Invalid node data: "type" field must be a string, but received number',
      )
    })

    test('throws on unknown node type', () => {
      const nodeData = {
        type: 'unknown_type',
        date: '2024-01-01',
      }
      expect(() => deserializeNode(nodeData)).toThrow(
        /Unknown node type: "unknown_type"\. Valid node types are:/,
      )
    })

    test('throws on unknown node type with list of valid types', () => {
      const nodeData = {
        type: 'invalid',
        date: '2024-01-01',
      }
      try {
        deserializeNode(nodeData)
        expect.fail('Should have thrown an error')
      } catch (error) {
        const message = (error as Error).message
        expect(message).toContain('Unknown node type: "invalid"')
        expect(message).toContain('Valid node types are:')
        expect(message).toContain('open')
        expect(message).toContain('transaction')
        expect(message).toContain('balance')
      }
    })
  })
})

describe('deserializeNodeFromString', () => {
  describe('valid inputs', () => {
    test('deserialize simple node from JSON string', () => {
      const json =
        '{"type":"open","date":"2024-01-01","account":"Assets:Checking"}'
      const node = deserializeNodeFromString(json)
      expect(node.type).toBe('open')
      expect(node).toBeInstanceOf(Open)
    })

    test('roundtrip: node to JSON string and back', () => {
      const original = Open.fromString('2024-01-01 open Assets:Checking USD')
      const json = JSON.stringify(original.toJSON())
      const deserialized = deserializeNodeFromString(json)
      expect(deserialized).toEqual(original)
    })

    test('roundtrip for transaction node', () => {
      const original = Transaction.fromString(`2024-01-02 * "Store" "Purchase"
  Assets:Checking  -50.00 USD
  Expenses:Shopping 50.00 USD`)
      const json = JSON.stringify(original.toJSON())
      const deserialized = deserializeNodeFromString(json)
      expect(deserialized).toEqual(original)
    })

    test('roundtrip for all node types', () => {
      const nodes = [
        Balance.fromString('2024-01-01 balance Assets:Checking 100.00 USD'),
        Blankline.fromString(''),
        Close.fromString('2024-01-01 close Assets:Checking'),
        Comment.fromString('; comment'),
        Open.fromString('2024-01-01 open Assets:Checking'),
        Transaction.fromString(`2024-01-01 * "Payee" "Narration"
  Assets:Checking  -100.00 USD
  Expenses:Food     100.00 USD`),
      ]

      for (const node of nodes) {
        const json = JSON.stringify(node.toJSON())
        const deserialized = deserializeNodeFromString(json)
        expect(deserialized).toEqual(node)
      }
    })
  })

  describe('error handling', () => {
    test('throws on non-string input (number)', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeNodeFromString(123)).toThrow(
        'Invalid input: expected a JSON string but received number',
      )
    })

    test('throws on non-string input (object)', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeNodeFromString({})).toThrow(
        'Invalid input: expected a JSON string but received object',
      )
    })

    test('throws on non-string input (null)', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeNodeFromString(null)).toThrow(
        'Invalid input: expected a JSON string but received object',
      )
    })

    test('throws on invalid JSON syntax', () => {
      const invalidJson = '{invalid json'
      expect(() => deserializeNodeFromString(invalidJson)).toThrow(
        /Failed to parse JSON:/,
      )
    })

    test('throws when JSON parses to array', () => {
      const json = '[{"type":"open"}]'
      expect(() => deserializeNodeFromString(json)).toThrow(
        'Invalid JSON structure: expected an object but received an array',
      )
    })

    test('throws when JSON parses to null', () => {
      const json = 'null'
      expect(() => deserializeNodeFromString(json)).toThrow(
        'Invalid JSON structure: expected an object but received null',
      )
    })

    test('throws when JSON parses to string', () => {
      const json = '"just a string"'
      expect(() => deserializeNodeFromString(json)).toThrow(
        'Invalid JSON structure: expected an object but received string',
      )
    })

    test('throws when JSON parses to number', () => {
      const json = '42'
      expect(() => deserializeNodeFromString(json)).toThrow(
        'Invalid JSON structure: expected an object but received number',
      )
    })

    test('throws on missing type field', () => {
      const json = '{"date":"2024-01-01","account":"Assets:Checking"}'
      expect(() => deserializeNodeFromString(json)).toThrow(
        'Invalid node data: missing required "type" field',
      )
    })

    test('throws on unknown node type', () => {
      const json = '{"type":"invalid","date":"2024-01-01"}'
      expect(() => deserializeNodeFromString(json)).toThrow(
        /Unknown node type: "invalid"/,
      )
    })
  })
})
