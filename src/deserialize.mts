import { Entry } from './classes/Entry.mjs'
import { entryTypeToClass, type EntryType } from './entryTypeToClass.mjs'

/**
 * Deserializes a single entry from its JSON representation.
 *
 * This function takes a plain JavaScript object (typically from JSON.parse)
 * and reconstructs the appropriate Entry subclass instance. It validates
 * the input and provides helpful error messages for common issues.
 *
 * @param entryData - Plain object containing entry data with a 'type' field
 * @returns An Entry instance of the appropriate subclass
 * @throws {Error} If the entry data is invalid:
 *   - Missing or invalid 'type' field
 *   - Unknown entry type
 *   - Invalid entry structure (errors from Entry.fromJSONData)
 *
 * @example
 * Deserializing a simple entry:
 * ```typescript
 * const entryData = {
 *   type: 'open',
 *   date: '2024-01-01',
 *   account: 'Assets:Checking'
 * }
 * const entry = deserializeEntry(entryData)
 * console.log(entry.type) // 'open'
 * ```
 *
 * @example
 * Deserializing from JSON.parse:
 * ```typescript
 * const json = '{"type":"balance","date":"2024-01-02","account":"Assets:Checking","amount":"100","currency":"USD"}'
 * const entryData = JSON.parse(json)
 * const entry = deserializeEntry(entryData)
 * ```
 */
export function deserializeEntry(entryData: Record<string, unknown>): Entry {
  // Validate input is an object
  if (!entryData || typeof entryData !== 'object') {
    throw new Error(
      `Invalid entry data: expected an object but received ${typeof entryData}`,
    )
  }

  // Validate 'type' field exists
  if (!('type' in entryData)) {
    throw new Error(
      'Invalid entry data: missing required "type" field. ' +
        'Entry data must include a "type" property indicating the entry type.',
    )
  }

  // Validate 'type' is a string
  if (typeof entryData.type !== 'string') {
    throw new Error(
      `Invalid entry data: "type" field must be a string, but received ${typeof entryData.type}`,
    )
  }

  const entryType = entryData.type as EntryType

  // Validate entry type is recognized
  const EntryClass = entryTypeToClass[entryType]
  if (!EntryClass) {
    throw new Error(
      `Unknown entry type: "${entryType}". ` +
        `Valid entry types are: ${Object.keys(entryTypeToClass).join(', ')}`,
    )
  }

  // Attempt to deserialize the entry
  try {
    return (
      EntryClass as { fromJSONData: (data: Record<string, unknown>) => Entry }
    ).fromJSONData(entryData)
  } catch (error) {
    // Wrap errors from fromJSONData with additional context
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to deserialize ${entryType} entry: ${errorMessage}`)
  }
}

/**
 * Deserializes a single entry from a JSON string.
 *
 * This function parses a JSON string containing an entry object
 * and reconstructs the appropriate Entry subclass instance.
 *
 * @param jsonString - JSON string containing an entry object
 * @returns An Entry instance of the appropriate subclass
 * @throws {Error} If the JSON is invalid or entry cannot be deserialized:
 *   - Invalid JSON syntax
 *   - JSON does not contain an object
 *   - Entry validation errors (see deserializeEntry)
 *
 * @example
 * Deserializing from a JSON string:
 * ```typescript
 * const json = '{"type":"open","date":"2024-01-01","account":"Assets:Checking"}'
 * const entry = deserializeEntryFromString(json)
 * console.log(entry.type) // 'open'
 * ```
 *
 * @example
 * Roundtrip serialization:
 * ```typescript
 * const original = Open.fromString('2024-01-01 open Assets:Checking')
 * const json = JSON.stringify(original.toJSON())
 * const deserialized = deserializeEntryFromString(json)
 * // deserialized equals original
 * ```
 */
export function deserializeEntryFromString(jsonString: string): Entry {
  // Validate input
  if (typeof jsonString !== 'string') {
    throw new Error(
      `Invalid input: expected a JSON string but received ${typeof jsonString}`,
    )
  }

  // Parse JSON with error handling
  let entryData: unknown
  try {
    entryData = JSON.parse(jsonString)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to parse JSON: ${errorMessage}`)
  }

  // Validate parsed data is an object (not array or null)
  if (entryData === null || typeof entryData !== 'object') {
    throw new Error(
      `Invalid JSON structure: expected an object but received ${entryData === null ? 'null' : typeof entryData}`,
    )
  }

  if (Array.isArray(entryData)) {
    throw new Error(
      'Invalid JSON structure: expected an object but received an array',
    )
  }

  return deserializeEntry(entryData as Record<string, unknown>)
}

/**
 * Deserializes an array of entries from their JSON representations.
 *
 * This function takes an array of plain JavaScript objects (typically from JSON.parse)
 * and reconstructs each as the appropriate Entry subclass instance. It validates
 * the input and provides helpful error messages, including the index of any entry
 * that fails to deserialize.
 *
 * @param entriesData - Array of plain objects containing entry data
 * @returns Array of Entry instances
 * @throws {Error} If the input is invalid or entries cannot be deserialized:
 *   - Input is not an array
 *   - Any entry fails validation (see deserializeEntry)
 *
 * @example
 * Deserializing an array of entries:
 * ```typescript
 * const entriesData = [
 *   { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
 *   { type: 'balance', date: '2024-01-02', account: 'Assets:Checking', amount: '100', currency: 'USD' }
 * ]
 * const entries = deserializeEntries(entriesData)
 * console.log(entries.length) // 2
 * ```
 *
 * @example
 * Roundtrip with JSON.parse:
 * ```typescript
 * const original = [Open.fromString('2024-01-01 open Assets:Checking')]
 * const json = JSON.stringify(original.map(e => e.toJSON()))
 * const parsed = JSON.parse(json)
 * const deserialized = deserializeEntries(parsed)
 * // deserialized equals original
 * ```
 */
export function deserializeEntries(
  entriesData: Record<string, unknown>[],
): Entry[] {
  // Validate input is an array
  if (!Array.isArray(entriesData)) {
    throw new Error(
      `Invalid input: expected an array but received ${typeof entriesData}`,
    )
  }

  // Deserialize each entry with error context
  const entries: Entry[] = []
  for (let i = 0; i < entriesData.length; i++) {
    try {
      entries.push(deserializeEntry(entriesData[i]))
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new Error(
        `Failed to deserialize entry at index ${i}: ${errorMessage}`,
      )
    }
  }

  return entries
}

/**
 * Deserializes an array of entries from a JSON string.
 *
 * This function parses a JSON string containing an array of entry objects
 * and reconstructs each entry as the appropriate Entry subclass instance.
 * It validates the input and provides helpful error messages, including
 * the index of any entry that fails to deserialize.
 *
 * @param jsonString - JSON string containing an array of entry objects
 * @returns Array of Entry instances
 * @throws {Error} If the JSON is invalid or entries cannot be deserialized:
 *   - Invalid JSON syntax
 *   - JSON does not contain an array
 *   - Any entry fails validation (see deserializeEntry)
 *
 * @example
 * Deserializing multiple entries:
 * ```typescript
 * const json = '[
 *   {"type": "open", "date": "2024-01-01", "account": "Assets:Checking"},
 *   {"type": "balance", "date": "2024-01-02", "account": "Assets:Checking", "amount": "100", "currency": "USD"}
 * ]'
 * const entries = deserializeEntries(json)
 * console.log(entries.length) // 2
 * ```
 *
 * @example
 * Roundtrip serialization:
 * ```typescript
 * import { parse } from 'beancount'
 *
 * const original = parse('2024-01-01 open Assets:Checking')
 * const json = JSON.stringify(original.entries.map(e => e.toJSON()))
 * const deserialized = deserializeEntries(json)
 * // deserialized equals original.entries
 * ```
 */
export function deserializeEntriesFromString(jsonString: string): Entry[] {
  // Validate input
  if (typeof jsonString !== 'string') {
    throw new Error(
      `Invalid input: expected a JSON string but received ${typeof jsonString}`,
    )
  }

  // Parse JSON with error handling
  let entriesData: unknown
  try {
    entriesData = JSON.parse(jsonString)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to parse JSON: ${errorMessage}`)
  }

  // Validate parsed data is an array
  if (!Array.isArray(entriesData)) {
    throw new Error(
      `Invalid JSON structure: expected an array but received ${typeof entriesData}`,
    )
  }

  return deserializeEntries(entriesData as Record<string, unknown>[])
}
