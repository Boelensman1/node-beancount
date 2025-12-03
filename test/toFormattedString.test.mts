import { describe, expect, test } from 'vitest'
import { parse } from '../src/parse.mjs'

describe('toFormattedString', () => {
  test('Open & price should both format correctly', () => {
    const input = `2025-01-01 open Expenses:Taxes:Y2025:US:SDI USD
2025-01-01 open Expenses:Taxes:Y2025:US:State USD
2025-01-01 open Expenses:Taxes:Y2025:US:SocSec USD
2023-01-06 price VBMPX 189.02 USD
2023-01-06 price RGAGX 40.56 USD
2023-01-06 price ITOT 113.17 USD
2023-01-06 price VEA 127.77 USD`
    const parsed = parse(input)
    const lines = parsed.toFormattedString().split('\n')
    lines.forEach((line) => {
      expect(line).toHaveLength(lines[0].length)
    })
  })
})
