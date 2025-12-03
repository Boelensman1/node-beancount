/**
 * Array of all Beancount entry types that start with a date (YYYY-MM-DD format).
 * These entries follow the pattern: `YYYY-MM-DD <type> ...`
 */
export const DATED_ENTRY_TYPES = [
  'balance',
  'close',
  'commodity',
  'custom',
  'document',
  'event',
  'note',
  'open',
  'pad',
  'price',
  'query',
  'transaction',
] as const

/**
 * Array of all Beancount entry types that do NOT start with a date.
 * These entries follow the pattern: `<type> ...`
 */
export const NON_DATED_ENTRY_TYPES = [
  'include',
  'option',
  'plugin',
  'poptag',
  'pushtag',
] as const
