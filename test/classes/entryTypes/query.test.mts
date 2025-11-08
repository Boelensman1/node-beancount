import { describe, expect, test } from 'vitest'
import { Query } from '../../../src/classes/entryTypes/index.mjs'

describe('Query class', () => {
  test('toString', () => {
    const input =
      '2014-07-09 query "france-balances" "SELECT account, sum(position) WHERE \'trip-france-2014\' in tags"'
    const query = Query.fromString(input)
    expect(query.toString()).toEqual(input)
  })
})
