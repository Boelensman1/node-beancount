/**
 * Assigns properties from a source object to a target object, trimming any string values.
 * Non-string values are copied as-is.
 *
 * @param target - The target object to assign properties to
 * @param source - The source object containing properties to copy
 */
export function assignWithTrimmedStrings(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: any,
  source: Record<string, unknown>,
): void {
  for (const [key, value] of Object.entries(source)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    target[key] = typeof value === 'string' ? value.trim() : value
  }
}
