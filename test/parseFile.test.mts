import { describe, expect, test } from 'vitest'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseFile } from '../src/parseFile.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.join(__dirname, 'fixtures/parseFile')

describe('parseFile', () => {
  describe('without recurse option', () => {
    test('parses a simple file', async () => {
      const result = await parseFile(path.join(fixturesDir, 'simple.beancount'))

      expect(result.entries.length).toBeGreaterThan(0)
      expect(result.option).toHaveLength(1)
      expect(result.open).toHaveLength(1)
      expect(result.transactions).toHaveLength(1)
    })

    test('parses a file with include directive but does not follow it', async () => {
      const result = await parseFile(path.join(fixturesDir, 'main.beancount'))

      // Should contain the include entry but not its contents
      expect(result.include).toHaveLength(1)
      const includeEntry = result.include[0]
      expect(includeEntry.filename).toBe('accounts.beancount')

      // Should only have entries from main.beancount, not accounts.beancount
      expect(result.option).toHaveLength(1)
      expect(result.open).toHaveLength(0) // open directives are in accounts.beancount
      expect(result.transactions).toHaveLength(1)
    })

    test('recurse defaults to false', async () => {
      const result = await parseFile(
        path.join(fixturesDir, 'main.beancount'),
        {},
      )

      // Should not follow includes
      expect(result.include).toHaveLength(1)
      expect(result.open).toHaveLength(0)
    })
  })

  describe('with recurse: false', () => {
    test('does not follow include directives', async () => {
      const result = await parseFile(path.join(fixturesDir, 'main.beancount'), {
        recurse: false,
      })

      expect(result.include).toHaveLength(1)
      expect(result.open).toHaveLength(0)
    })
  })

  describe('with recurse: true', () => {
    test('follows include directives and merges entries', async () => {
      const result = await parseFile(path.join(fixturesDir, 'main.beancount'), {
        recurse: true,
      })

      // Should have merged entries from both files
      expect(result.option).toHaveLength(1) // from main.beancount
      expect(result.open).toHaveLength(4) // from accounts.beancount
      expect(result.transactions).toHaveLength(1) // from main.beancount

      // Include entry itself should not be in the result (replaced by its contents)
      expect(result.include).toHaveLength(0)
    })

    test('resolves relative paths from parent file directory', async () => {
      // This is implicitly tested by the previous test - accounts.beancount
      // is specified as a relative path in main.beancount
      const result = await parseFile(path.join(fixturesDir, 'main.beancount'), {
        recurse: true,
      })

      expect(result.open).toHaveLength(4)
    })

    test('handles circular includes without infinite loop', async () => {
      // circular-a includes circular-b which includes circular-a
      const result = await parseFile(
        path.join(fixturesDir, 'circular-a.beancount'),
        { recurse: true },
      )

      // Should have entries from both files, but each file only once
      expect(result.option).toHaveLength(2) // one from each file
      expect(result.open).toHaveLength(2) // Assets:A and Assets:B
    })

    test('throws error for missing included files', async () => {
      await expect(
        parseFile(path.join(fixturesDir, 'with-missing-include.beancount'), {
          recurse: true,
        }),
      ).rejects.toThrow()
    })
  })

  describe('error handling', () => {
    test('throws error for non-existent file', async () => {
      await expect(
        parseFile(path.join(fixturesDir, 'nonexistent.beancount')),
      ).rejects.toThrow()
    })
  })
})
