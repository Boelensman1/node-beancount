import { expect, describe, test } from 'vitest'
import { Value, parseString } from '../../src/classes/Value.mjs'
import { Temporal } from '@js-temporal/polyfill'

describe('Value', () => {
  describe('constructor', () => {
    describe('boolean type', () => {
      test('creates true value', () => {
        const value = new Value({ type: 'boolean', value: true })
        expect(value.type).toBe('boolean')
        expect(value.value).toBe(true)
      })

      test('creates false value', () => {
        const value = new Value({ type: 'boolean', value: false })
        expect(value.type).toBe('boolean')
        expect(value.value).toBe(false)
      })

      test('coerces truthy number to true', () => {
        const value = new Value({ type: 'boolean', value: 1 })
        expect(value.value).toBe(true)
      })

      test('coerces falsy number to false', () => {
        const value = new Value({ type: 'boolean', value: 0 })
        expect(value.value).toBe(false)
      })

      test('coerces non-empty string to true', () => {
        const value = new Value({ type: 'boolean', value: 'false' })
        expect(value.value).toBe(true)
      })

      test('coerces empty string to false', () => {
        const value = new Value({ type: 'boolean', value: '' })
        expect(value.value).toBe(false)
      })

      test('coerces null to false', () => {
        const value = new Value({ type: 'boolean', value: null })
        expect(value.value).toBe(false)
      })

      test('coerces undefined to false', () => {
        const value = new Value({ type: 'boolean', value: undefined })
        expect(value.value).toBe(false)
      })
    })

    describe('string type', () => {
      test('creates basic string value', () => {
        const value = new Value({ type: 'string', value: 'hello' })
        expect(value.type).toBe('string')
        expect(value.value).toBe('hello')
      })

      test('creates string with special characters', () => {
        const value = new Value({ type: 'string', value: 'hello "world"' })
        expect(value.value).toBe('hello "world"')
      })

      test('creates empty string', () => {
        const value = new Value({ type: 'string', value: '' })
        expect(value.value).toBe('')
      })

      test('creates string with newlines', () => {
        const value = new Value({ type: 'string', value: 'line1\nline2' })
        expect(value.value).toBe('line1\nline2')
      })

      test('coerces number to string', () => {
        const value = new Value({ type: 'string', value: 42 })
        expect(value.value).toBe('42')
      })

      test('coerces boolean to string', () => {
        const value = new Value({ type: 'string', value: true })
        expect(value.value).toBe('true')
      })

      test('coerces null to string', () => {
        const value = new Value({ type: 'string', value: null })
        expect(value.value).toBe('null')
      })

      test('preserves whitespace', () => {
        const value = new Value({ type: 'string', value: '  hello\t\tworld  ' })
        expect(value.value).toBe('  hello\t\tworld  ')
      })
    })

    describe('date type', () => {
      test('accepts Temporal.PlainDate instance', () => {
        const date = Temporal.PlainDate.from('2024-11-27')
        const value = new Value({ type: 'date', value: date })
        expect(value.type).toBe('date')
        expect(value.value).toBeInstanceOf(Temporal.PlainDate)
        expect((value.value as Temporal.PlainDate).toJSON()).toBe('2024-11-27')
      })

      test('converts ISO date string', () => {
        const value = new Value({ type: 'date', value: '2024-11-27' })
        expect(value.value).toBeInstanceOf(Temporal.PlainDate)
        expect((value.value as Temporal.PlainDate).toJSON()).toBe('2024-11-27')
      })

      test('converts full ISO datetime string', () => {
        const value = new Value({ type: 'date', value: '2024-11-27T10:30:00Z' })
        expect(value.value).toBeInstanceOf(Temporal.PlainDate)
        expect((value.value as Temporal.PlainDate).toJSON()).toBe('2024-11-27')
      })

      test('converts Date object', () => {
        const value = new Value({ type: 'date', value: new Date('2024-11-27') })
        expect(value.value).toBeInstanceOf(Temporal.PlainDate)
        expect((value.value as Temporal.PlainDate).toJSON()).toBe('2024-11-27')
      })

      test('converts epoch timestamp', () => {
        const value = new Value({ type: 'date', value: 1732665600000 })
        expect(value.value).toBeInstanceOf(Temporal.PlainDate)
        expect((value.value as Temporal.PlainDate).toJSON()).toBe('2024-11-27')
      })

      test('converts zero timestamp to epoch', () => {
        const value = new Value({ type: 'date', value: 0 })
        expect(value.value).toBeInstanceOf(Temporal.PlainDate)
        expect((value.value as Temporal.PlainDate).toJSON()).toBe('1970-01-01')
      })

      test('handles leap year date', () => {
        const value = new Value({ type: 'date', value: '2024-02-29' })
        expect(value.value).toBeInstanceOf(Temporal.PlainDate)
        expect((value.value as Temporal.PlainDate).toJSON()).toBe('2024-02-29')
      })

      test('handles year boundary', () => {
        const value = new Value({ type: 'date', value: '2024-12-31' })
        expect(value.value).toBeInstanceOf(Temporal.PlainDate)
        expect((value.value as Temporal.PlainDate).toJSON()).toBe('2024-12-31')
      })
    })

    describe('amount type', () => {
      test('stores basic numeric string', () => {
        const value = new Value({ type: 'amount', value: '123.45' })
        expect(value.type).toBe('amount')
        expect(value.value).toBe('123.45')
      })

      test('preserves large decimal precision', () => {
        const value = new Value({
          type: 'amount',
          value: '123.456789012345678901234567890',
        })
        expect(value.value).toBe('123.456789012345678901234567890')
      })

      test('stores negative amount', () => {
        const value = new Value({ type: 'amount', value: '-456.78' })
        expect(value.value).toBe('-456.78')
      })

      test('coerces number to string', () => {
        const value = new Value({ type: 'amount', value: 123.45 })
        expect(value.value).toBe('123.45')
      })

      test('coerces boolean to string', () => {
        const value = new Value({ type: 'amount', value: true })
        expect(value.value).toBe('true')
      })

      test('handles scientific notation', () => {
        const value = new Value({ type: 'amount', value: 1.23e10 })
        expect(value.value).toBe('12300000000')
      })

      test('stores zero', () => {
        const value = new Value({ type: 'amount', value: '0' })
        expect(value.value).toBe('0')
      })

      test('preserves leading zeros', () => {
        const value = new Value({ type: 'amount', value: '0001.5000' })
        expect(value.value).toBe('0001.5000')
      })
    })

    describe('numbers type', () => {
      test('stores basic numeric string', () => {
        const value = new Value({ type: 'numbers', value: '456' })
        expect(value.type).toBe('numbers')
        expect(value.value).toBe('456')
      })

      test('preserves complex decimal', () => {
        const value = new Value({ type: 'numbers', value: '999.999999999' })
        expect(value.value).toBe('999.999999999')
      })

      test('coerces number to string', () => {
        const value = new Value({ type: 'numbers', value: 789 })
        expect(value.value).toBe('789')
      })
    })

    describe('error handling', () => {
      test('throws error for unknown type', () => {
        expect(() => {
          new Value({ type: 'unknown' as never, value: 'test' })
        }).toThrow('Unknown value type: unknown')
      })
    })
  })

  describe('fromString', () => {
    describe('boolean parsing', () => {
      test('parses uppercase TRUE', () => {
        const value = Value.fromString('TRUE')
        expect(value.type).toBe('boolean')
        expect(value.value).toBe(true)
      })

      test('parses lowercase true', () => {
        const value = Value.fromString('true')
        expect(value.type).toBe('boolean')
        expect(value.value).toBe(true)
      })

      test('parses mixed case TrUe', () => {
        const value = Value.fromString('TrUe')
        expect(value.type).toBe('boolean')
        expect(value.value).toBe(true)
      })

      test('parses uppercase FALSE', () => {
        const value = Value.fromString('FALSE')
        expect(value.type).toBe('boolean')
        expect(value.value).toBe(false)
      })

      test('parses lowercase false', () => {
        const value = Value.fromString('false')
        expect(value.type).toBe('boolean')
        expect(value.value).toBe(false)
      })

      test('parses mixed case FaLsE', () => {
        const value = Value.fromString('FaLsE')
        expect(value.type).toBe('boolean')
        expect(value.value).toBe(false)
      })
    })

    describe('string parsing', () => {
      test('parses simple quoted string', () => {
        const value = Value.fromString('"hello"')
        expect(value.type).toBe('string')
        expect(value.value).toBe('hello')
      })

      test('parses quoted string with spaces', () => {
        const value = Value.fromString('"hello world"')
        expect(value.type).toBe('string')
        expect(value.value).toBe('hello world')
      })

      test('parses quoted string with special characters', () => {
        const value = Value.fromString('"hello, world! @#$%"')
        expect(value.type).toBe('string')
        expect(value.value).toBe('hello, world! @#$%')
      })

      test('parses quoted empty string', () => {
        const value = Value.fromString('""')
        expect(value.type).toBe('string')
        expect(value.value).toBe('')
      })

      test('parses quoted string with colon', () => {
        const value = Value.fromString('"MUTF:VMMXX (MONEY:USD)"')
        expect(value.type).toBe('string')
        expect(value.value).toBe('MUTF:VMMXX (MONEY:USD)')
      })

      test('parses quoted string with currency symbol', () => {
        const value = Value.fromString('"US$100"')
        expect(value.type).toBe('string')
        expect(value.value).toBe('US$100')
      })

      test('only opening quote falls through to amount', () => {
        const value = Value.fromString('"hello')
        expect(value.type).toBe('amount')
        expect(value.value).toBe('"hello')
      })

      test('only closing quote falls through to amount', () => {
        const value = Value.fromString('hello"')
        expect(value.type).toBe('amount')
        expect(value.value).toBe('hello"')
      })
    })

    describe('amount parsing', () => {
      test('parses simple number', () => {
        const value = Value.fromString('123.45')
        expect(value.type).toBe('amount')
        expect(value.value).toBe('123.45')
      })

      test('parses negative number', () => {
        const value = Value.fromString('-456.78')
        expect(value.type).toBe('amount')
        expect(value.value).toBe('-456.78')
      })

      test('parses integer', () => {
        const value = Value.fromString('999')
        expect(value.type).toBe('amount')
        expect(value.value).toBe('999')
      })

      test('parses zero', () => {
        const value = Value.fromString('0')
        expect(value.type).toBe('amount')
        expect(value.value).toBe('0')
      })

      test('parses decimal with many digits', () => {
        const value = Value.fromString('3.141592653589793')
        expect(value.type).toBe('amount')
        expect(value.value).toBe('3.141592653589793')
      })

      test('parses currency code', () => {
        const value = Value.fromString('USD')
        expect(value.type).toBe('amount')
        expect(value.value).toBe('USD')
      })

      test('parses alphanumeric', () => {
        const value = Value.fromString('HOOL')
        expect(value.type).toBe('amount')
        expect(value.value).toBe('HOOL')
      })
    })
  })

  describe('toString', () => {
    describe('boolean conversion', () => {
      test('converts true to TRUE', () => {
        const value = new Value({ type: 'boolean', value: true })
        expect(value.toString()).toBe('TRUE')
      })

      test('converts false to FALSE', () => {
        const value = new Value({ type: 'boolean', value: false })
        expect(value.toString()).toBe('FALSE')
      })
    })

    describe('string conversion', () => {
      test('wraps simple string in quotes', () => {
        const value = new Value({ type: 'string', value: 'hello' })
        expect(value.toString()).toBe('"hello"')
      })

      test('wraps string with spaces in quotes', () => {
        const value = new Value({ type: 'string', value: 'hello world' })
        expect(value.toString()).toBe('"hello world"')
      })

      test('converts empty string to empty quotes', () => {
        const value = new Value({ type: 'string', value: '' })
        expect(value.toString()).toBe('""')
      })

      test('preserves special characters', () => {
        const value = new Value({ type: 'string', value: 'hello, world!' })
        expect(value.toString()).toBe('"hello, world!"')
      })

      test('preserves internal quotes', () => {
        const value = new Value({ type: 'string', value: 'say "hello"' })
        expect(value.toString()).toBe('"say "hello""')
      })
    })

    describe('date conversion', () => {
      test('converts Temporal.PlainDate to string', () => {
        const date = Temporal.PlainDate.from('2024-11-27')
        const value = new Value({ type: 'date', value: date })
        expect(value.toString()).toBe('2024-11-27')
      })
    })

    describe('amount conversion', () => {
      test('returns amount as-is', () => {
        const value = new Value({ type: 'amount', value: '123.45' })
        expect(value.toString()).toBe('123.45')
      })

      test('returns negative amount', () => {
        const value = new Value({ type: 'amount', value: '-456.78' })
        expect(value.toString()).toBe('-456.78')
      })

      test('preserves trailing zeros', () => {
        const value = new Value({ type: 'amount', value: '100.5000' })
        expect(value.toString()).toBe('100.5000')
      })
    })

    describe('numbers conversion', () => {
      test('returns numbers as-is', () => {
        const value = new Value({ type: 'numbers', value: '789' })
        expect(value.toString()).toBe('789')
      })
    })
  })

  describe('roundtrip tests', () => {
    describe('string roundtrips', () => {
      test('simple string roundtrip', () => {
        const input = '"hello"'
        const value = Value.fromString(input)
        expect(value.toString()).toBe(input)
      })

      test('string with spaces roundtrip', () => {
        const input = '"hello world"'
        const value = Value.fromString(input)
        expect(value.toString()).toBe(input)
      })

      test('string with special characters roundtrip', () => {
        const input = '"@#$%^&*()"'
        const value = Value.fromString(input)
        expect(value.toString()).toBe(input)
      })

      test('empty string roundtrip', () => {
        const input = '""'
        const value = Value.fromString(input)
        expect(value.toString()).toBe(input)
      })
    })

    describe('boolean roundtrips', () => {
      test('TRUE roundtrip', () => {
        const input = 'TRUE'
        const value = Value.fromString(input)
        expect(value.toString()).toBe(input)
      })

      test('FALSE roundtrip', () => {
        const input = 'FALSE'
        const value = Value.fromString(input)
        expect(value.toString()).toBe(input)
      })

      test('lowercase true normalizes to uppercase', () => {
        const value = Value.fromString('true')
        expect(value.toString()).toBe('TRUE')
      })

      test('lowercase false normalizes to uppercase', () => {
        const value = Value.fromString('false')
        expect(value.toString()).toBe('FALSE')
      })
    })

    describe('amount roundtrips', () => {
      test('simple amount roundtrip', () => {
        const input = '123.45'
        const value = Value.fromString(input)
        expect(value.toString()).toBe(input)
      })

      test('negative amount roundtrip', () => {
        const input = '-456.78'
        const value = Value.fromString(input)
        expect(value.toString()).toBe(input)
      })

      test('integer roundtrip', () => {
        const input = '999'
        const value = Value.fromString(input)
        expect(value.toString()).toBe(input)
      })

      test('high precision roundtrip', () => {
        const input = '3.141592653589793'
        const value = Value.fromString(input)
        expect(value.toString()).toBe(input)
      })
    })
  })

  describe('edge cases', () => {
    describe('whitespace handling', () => {
      test('preserves leading whitespace in constructor', () => {
        const value = new Value({ type: 'string', value: '  hello' })
        expect(value.value).toBe('  hello')
      })

      test('preserves trailing whitespace in constructor', () => {
        const value = new Value({ type: 'string', value: 'hello  ' })
        expect(value.value).toBe('hello  ')
      })

      test('preserves internal whitespace in quoted string', () => {
        const value = Value.fromString('"hello   world"')
        expect(value.value).toBe('hello   world')
      })

      test('unquoted value with spaces becomes amount', () => {
        const value = Value.fromString('hello world')
        expect(value.type).toBe('amount')
        expect(value.value).toBe('hello world')
      })
    })

    describe('unicode and special characters', () => {
      test('handles unicode in string value', () => {
        const value = new Value({ type: 'string', value: '你好世界' })
        expect(value.value).toBe('你好世界')
      })

      test('handles emoji in string value', () => {
        const value = new Value({ type: 'string', value: '🎉 celebration' })
        expect(value.value).toBe('🎉 celebration')
      })

      test('parses quoted unicode string', () => {
        const value = Value.fromString('"你好"')
        expect(value.type).toBe('string')
        expect(value.value).toBe('你好')
      })

      test('preserves control characters', () => {
        const value = new Value({ type: 'string', value: 'hello\t\n\rworld' })
        expect(value.value).toBe('hello\t\n\rworld')
      })
    })

    describe('type coercion edge cases', () => {
      test('handles NaN in amount', () => {
        const value = new Value({ type: 'amount', value: NaN })
        expect(value.value).toBe('NaN')
      })

      test('handles Infinity in amount', () => {
        const value = new Value({ type: 'amount', value: Infinity })
        expect(value.value).toBe('Infinity')
      })

      test('handles negative Infinity in amount', () => {
        const value = new Value({ type: 'amount', value: -Infinity })
        expect(value.value).toBe('-Infinity')
      })

      test('coerces object with toString in string', () => {
        const value = new Value({
          type: 'string',
          value: { toString: () => 'object' },
        })
        expect(value.value).toBe('object')
      })

      test('coerces array in string', () => {
        const value = new Value({ type: 'string', value: [1, 2, 3] })
        expect(value.value).toBe('1,2,3')
      })
    })

    describe('date edge cases', () => {
      test('handles last day of January', () => {
        const value = new Value({ type: 'date', value: '2024-01-31' })
        expect(value.value).toBeInstanceOf(Temporal.PlainDate)
        expect((value.value as Temporal.PlainDate).toJSON()).toBe('2024-01-31')
      })

      test('handles leap year February 29', () => {
        const value = new Value({ type: 'date', value: '2024-02-29' })
        expect(value.value).toBeInstanceOf(Temporal.PlainDate)
        expect((value.value as Temporal.PlainDate).toJSON()).toBe('2024-02-29')
      })
    })

    describe('precision tests', () => {
      test('preserves very large precision', () => {
        const value = new Value({
          type: 'amount',
          value: '123456789012345678.123456789012345678',
        })
        expect(value.value).toBe('123456789012345678.123456789012345678')
      })

      test('preserves very small decimal', () => {
        const value = new Value({ type: 'amount', value: '0.000000000000001' })
        expect(value.value).toBe('0.000000000000001')
      })

      test('roundtrip preserves precision', () => {
        const input = '1234567890.1234567890'
        const value = Value.fromString(input)
        expect(value.toString()).toBe(input)
      })
    })
  })
})

describe('parseString', () => {
  test('removes surrounding quotes', () => {
    expect(parseString('"hello"')).toBe('hello')
  })

  test('handles multiple words', () => {
    expect(parseString('"hello world test"')).toBe('hello world test')
  })

  test('handles empty string', () => {
    expect(parseString('""')).toBe('')
  })

  test('only removes outer quotes', () => {
    expect(parseString('"hello "world""')).toBe('hello "world"')
  })
})
