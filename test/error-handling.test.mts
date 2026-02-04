import { expect, test, describe } from 'vitest'
import { parse } from '../src/parse.mjs'
import { BeancountParseError } from '../src/utils/SourceLocation.mjs'

describe('Error handling with location context', () => {
  test('Parse error includes line numbers and context', () => {
    const source = `2024-01-15 * "Purchase" "Office supplies"
  Assets:Checking  -100.00 USD
  Expenses:Office   100.00 USD

pushtag

2024-01-20 * "Groceries" "Weekly shopping"
  Assets:Checking  -50.00 USD
  Expenses:Food     50.00 USD`

    expect(() => parse(source)).toThrow(BeancountParseError)

    try {
      parse(source)
    } catch (error) {
      expect(error).toBeInstanceOf(BeancountParseError)
      if (error instanceof BeancountParseError) {
        // Check location info
        expect(error.location.startLine).toBe(5)
        expect(error.location.endLine).toBe(5)

        // Check source content
        expect(error.sourceContent).toEqual(['pushtag'])

        // Check node type
        expect(error.nodeType).toBe('pushtag')

        // Check formatted output includes line numbers
        const formatted = error.formatWithContext()
        expect(formatted).toContain('Line')
        expect(formatted).toContain('pushtag')
        expect(formatted).toContain('While parsing: pushtag directive')
      }
    }
  })

  test('Parse error with file path', () => {
    const source = `pushtag`

    expect(() => parse(source, '/path/to/test.beancount')).toThrow(
      BeancountParseError,
    )

    try {
      parse(source, '/path/to/test.beancount')
    } catch (error) {
      if (error instanceof BeancountParseError) {
        expect(error.location.filePath).toBe('/path/to/test.beancount')

        const formatted = error.formatWithContext()
        expect(formatted).toContain('/path/to/test.beancount')
      }
    }
  })

  test('formatWithContext shows correct line indicators', () => {
    const source = `pushtag`

    try {
      parse(source)
    } catch (error) {
      if (error instanceof BeancountParseError) {
        const formatted = error.formatWithContext(1, 1)

        // Should include the error line with indicator
        expect(formatted).toContain('pushtag')
        expect(formatted).toContain('>')

        // Should include error indicator
        expect(formatted).toContain('Error occurred here')

        // Should show line number
        expect(formatted).toMatch(/\d+/)
      }
    }
  })

  test('BeancountParseError preserves original error', () => {
    const source = `pushtag`

    try {
      parse(source)
    } catch (error) {
      if (error instanceof BeancountParseError) {
        expect(error.originalError).toBeInstanceOf(Error)
        expect(error.message).toBeTruthy()
      }
    }
  })

  test('Parse error with empty poptag', () => {
    const source = `poptag`

    expect(() => parse(source)).toThrow(BeancountParseError)

    try {
      parse(source)
    } catch (error) {
      if (error instanceof BeancountParseError) {
        expect(error.nodeType).toBe('poptag')
        expect(error.location.startLine).toBe(1)
      }
    }
  })
})
