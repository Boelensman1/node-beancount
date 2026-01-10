/**
 * Array of all Beancount directive types that start with a date (YYYY-MM-DD format).
 * These directives follow the pattern: `YYYY-MM-DD <type> ...`
 */
export const DATED_DIRECTIVE_TYPES = [
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
 * Array of all Beancount directive types that do NOT start with a date.
 * These directives follow the pattern: `<type> ...`
 */
export const NON_DATED_DIRECTIVE_TYPES = [
  'include',
  'option',
  'plugin',
  'poptag',
  'pushtag',
] as const
