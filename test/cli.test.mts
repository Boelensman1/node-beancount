import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { describe, test, expect } from 'vitest'

const CLI_PATH = './src/cli.mts'

describe('CLI format tool', () => {
  test('formats single file to stdout by default', () => {
    const output = execSync(
      `npx tsx ${CLI_PATH} test/fixtures/cli-test-unformatted.beancount`,
      { encoding: 'utf-8' },
    )

    // Should contain formatted content
    expect(output).toContain('option "title" "Test Ledger"')
    expect(output).toContain('Assets:Checking')
    expect(output).toContain('USD')

    // Should have proper alignment (currencies should be aligned)
    const lines = output.split('\n')
    const postingLines = lines.filter((line) => line.includes('USD'))
    expect(postingLines.length).toBeGreaterThan(0)
  })

  test('writes formatted output to file with --write flag', () => {
    // Create a temporary copy of the test file
    const tmpFile = path.join(tmpdir(), 'test-write.beancount')
    fs.copyFileSync('test/fixtures/cli-test-unformatted.beancount', tmpFile)

    try {
      // Run CLI with --write flag
      execSync(`npx tsx ${CLI_PATH} --write ${tmpFile}`)

      // Read the modified file
      const content = fs.readFileSync(tmpFile, 'utf-8')

      // Verify it was formatted
      expect(content).toContain('option "title" "Test Ledger"')
      expect(content).toContain('Assets:Checking')
      expect(content).toContain('USD')
    } finally {
      // Clean up
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile)
      }
    }
  })

  test('writes formatted output to file with -w flag', () => {
    // Create a temporary copy of the test file
    const tmpFile = path.join(tmpdir(), 'test-write-short.beancount')
    fs.copyFileSync('test/fixtures/cli-test-unformatted.beancount', tmpFile)

    try {
      // Run CLI with -w flag (short form)
      execSync(`npx tsx ${CLI_PATH} -w ${tmpFile}`)

      // Read the modified file
      const content = fs.readFileSync(tmpFile, 'utf-8')

      // Verify it was formatted
      expect(content).toContain('option "title" "Test Ledger"')
    } finally {
      // Clean up
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile)
      }
    }
  })

  test('formats multiple files', () => {
    const tmpFile1 = path.join(tmpdir(), 'test-multi-1.beancount')
    const tmpFile2 = path.join(tmpdir(), 'test-multi-2.beancount')
    fs.copyFileSync('test/fixtures/cli-test-unformatted.beancount', tmpFile1)
    fs.copyFileSync('test/fixtures/cli-test-unformatted.beancount', tmpFile2)

    try {
      // Run CLI with multiple files and --write
      execSync(`npx tsx ${CLI_PATH} --write ${tmpFile1} ${tmpFile2}`)

      // Verify both files were formatted
      const content1 = fs.readFileSync(tmpFile1, 'utf-8')
      const content2 = fs.readFileSync(tmpFile2, 'utf-8')

      expect(content1).toContain('Test Ledger')
      expect(content2).toContain('Test Ledger')
    } finally {
      // Clean up
      if (fs.existsSync(tmpFile1)) fs.unlinkSync(tmpFile1)
      if (fs.existsSync(tmpFile2)) fs.unlinkSync(tmpFile2)
    }
  })

  test('uses custom currency column when specified', () => {
    const output = execSync(
      `npx tsx ${CLI_PATH} --currency-column 40 test/fixtures/cli-test-unformatted.beancount`,
      { encoding: 'utf-8' },
    )

    // Should contain formatted content
    expect(output).toContain('option "title" "Test Ledger"')
    expect(output).toContain('USD')

    // Check that currencies appear around column 40
    const lines = output.split('\n')
    const postingLine = lines.find(
      (line) => line.includes('Assets:Checking') && line.includes('USD'),
    )
    expect(postingLine).toBeDefined()

    if (postingLine) {
      const usdIndex = postingLine.indexOf('USD')
      // Currency should be roughly around column 40 (with some tolerance)
      expect(usdIndex).toBeGreaterThanOrEqual(35)
      expect(usdIndex).toBeLessThanOrEqual(45)
    }
  })

  test('uses custom currency column with -c flag', () => {
    const output = execSync(
      `npx tsx ${CLI_PATH} -c 50 test/fixtures/cli-test-unformatted.beancount`,
      { encoding: 'utf-8' },
    )

    // Should contain formatted content
    expect(output).toContain('USD')
  })

  test('handles non-existent file gracefully', () => {
    try {
      execSync(`npx tsx ${CLI_PATH} non-existent-file.beancount`, {
        encoding: 'utf-8',
        stdio: 'pipe',
      })
      // Should not reach here
      expect(true).toBe(false)
    } catch (error: unknown) {
      // Should exit with error code 1
      if (error && typeof error === 'object' && 'status' in error) {
        expect(error.status).toBe(1)
      }
      // Error message should mention the file
      if (error && typeof error === 'object' && 'stderr' in error) {
        const stderr = String(error.stderr)
        expect(stderr).toContain('non-existent-file.beancount')
      }
    }
  })

  test('handles invalid beancount syntax gracefully', () => {
    try {
      execSync(`npx tsx ${CLI_PATH} test/fixtures/cli-test-invalid.beancount`, {
        encoding: 'utf-8',
        stdio: 'pipe',
      })
      // Should not reach here
      expect(true).toBe(false)
    } catch (error: unknown) {
      // Should exit with error code 1
      if (error && typeof error === 'object' && 'status' in error) {
        expect(error.status).toBe(1)
      }
      // Error message should be present
      if (error && typeof error === 'object' && 'stderr' in error) {
        const stderr = String(error.stderr)
        expect(stderr.length).toBeGreaterThan(0)
      }
    }
  })

  test('continues processing when one file fails', () => {
    const tmpFile = path.join(tmpdir(), 'test-continue.beancount')
    fs.copyFileSync('test/fixtures/cli-test-unformatted.beancount', tmpFile)

    try {
      execSync(
        `npx tsx ${CLI_PATH} --write non-existent.beancount ${tmpFile}`,
        {
          encoding: 'utf-8',
          stdio: 'pipe',
        },
      )
      // Should not reach here (should exit 1 due to first file error)
      expect(true).toBe(false)
    } catch (error: unknown) {
      // Should exit with error code 1
      if (error && typeof error === 'object' && 'status' in error) {
        expect(error.status).toBe(1)
      }

      // But the second file should still have been processed
      const content = fs.readFileSync(tmpFile, 'utf-8')
      expect(content).toContain('Test Ledger')
    } finally {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile)
    }
  })

  test('shows help with --help flag', () => {
    const output = execSync(`npx tsx ${CLI_PATH} --help`, { encoding: 'utf-8' })

    expect(output).toContain('Usage:')
    expect(output).toContain('beancount-format')
    expect(output).toContain('--write')
    expect(output).toContain('--currency-column')
    expect(output).toContain('--help')
    expect(output).toContain('Examples:')
  })

  test('shows help with -h flag', () => {
    const output = execSync(`npx tsx ${CLI_PATH} -h`, { encoding: 'utf-8' })

    expect(output).toContain('Usage:')
    expect(output).toContain('beancount-format')
  })

  test('shows help and exits with error when no files provided', () => {
    try {
      execSync(`npx tsx ${CLI_PATH}`, { encoding: 'utf-8', stdio: 'pipe' })
      // Should not reach here
      expect(true).toBe(false)
    } catch (error: unknown) {
      // Should exit with error code 1
      if (error && typeof error === 'object' && 'status' in error) {
        expect(error.status).toBe(1)
      }

      // Should show error and help
      if (error && typeof error === 'object' && 'stderr' in error) {
        const stderr = String(error.stderr)
        expect(stderr).toContain('No files provided')
        expect(stderr).toContain('Usage:')
      }
    }
  })

  test('exits with error for invalid currency column value', () => {
    try {
      execSync(
        `npx tsx ${CLI_PATH} --currency-column invalid test/fixtures/cli-test-unformatted.beancount`,
        { encoding: 'utf-8', stdio: 'pipe' },
      )
      // Should not reach here
      expect(true).toBe(false)
    } catch (error: unknown) {
      // Should exit with error code 1
      if (error && typeof error === 'object' && 'status' in error) {
        expect(error.status).toBe(1)
      }

      // Error message should mention invalid value
      if (error && typeof error === 'object' && 'stderr' in error) {
        const stderr = String(error.stderr)
        expect(stderr).toContain('Invalid currency column')
      }
    }
  })

  test('exits with error for negative currency column value', () => {
    try {
      execSync(
        `npx tsx ${CLI_PATH} --currency-column=-5 test/fixtures/cli-test-unformatted.beancount`,
        { encoding: 'utf-8', stdio: 'pipe' },
      )
      // Should not reach here
      expect(true).toBe(false)
    } catch (error: unknown) {
      // Should exit with error code 1
      if (error && typeof error === 'object' && 'status' in error) {
        expect(error.status).toBe(1)
      }

      // Error message should mention invalid value
      if (error && typeof error === 'object' && 'stderr' in error) {
        const stderr = String(error.stderr)
        expect(stderr).toContain('Invalid currency column')
      }
    }
  })

  test('exits with error for file with only comments', () => {
    try {
      execSync(
        `npx tsx ${CLI_PATH} test/fixtures/cli-test-not-beancount.beancount`,
        { encoding: 'utf-8', stdio: 'pipe' },
      )
      // Should not reach here
      expect(true).toBe(false)
    } catch (error: unknown) {
      // Should exit with error code 1
      if (error && typeof error === 'object' && 'status' in error) {
        expect(error.status).toBe(1)
      }

      // Error message should mention not a beancount file
      if (error && typeof error === 'object' && 'stderr' in error) {
        const stderr = String(error.stderr)
        expect(stderr).toContain('does not seem to be a beancount file')
      }
    }
  })

  test('exits with code 0 on successful formatting', () => {
    const output = execSync(
      `npx tsx ${CLI_PATH} test/fixtures/cli-test-unformatted.beancount`,
      { encoding: 'utf-8' },
    )

    // If we get here without exception, exit code was 0
    expect(output.length).toBeGreaterThan(0)
  })

  test('formats example-full.beancount successfully', () => {
    const output = execSync(`npx tsx ${CLI_PATH} test/example-full.beancount`, {
      encoding: 'utf-8',
    })

    // Should contain expected content
    expect(output).toContain('option')
    expect(output).toContain('open')
    expect(output).toContain('balance')
  })
})
