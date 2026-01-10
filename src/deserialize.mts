import { Node } from './classes/Node.mjs'
import { nodeTypeToClass, type NodeType } from './nodeTypeToClass.mjs'

/**
 * Deserializes a single node from its JSON representation.
 *
 * This function takes a plain JavaScript object (typically from JSON.parse)
 * and reconstructs the appropriate Node subclass instance. It validates
 * the input and provides helpful error messages for common issues.
 *
 * @param nodeData - Plain object containing node data with a 'type' field
 * @returns An Node instance of the appropriate subclass
 * @throws {Error} If the node data is invalid:
 *   - Missing or invalid 'type' field
 *   - Unknown node type
 *   - Invalid node structure (errors from Node.fromJSONData)
 *
 * @example
 * Deserializing a simple node:
 * ```typescript
 * const nodeData = {
 *   type: 'open',
 *   date: '2024-01-01',
 *   account: 'Assets:Checking'
 * }
 * const node = deserializeNode(nodeData)
 * console.log(node.type) // 'open'
 * ```
 *
 * @example
 * Deserializing from JSON.parse:
 * ```typescript
 * const json = '{"type":"balance","date":"2024-01-02","account":"Assets:Checking","amount":"100","currency":"USD"}'
 * const nodeData = JSON.parse(json)
 * const node = deserializeNode(nodeData)
 * ```
 */
export function deserializeNode(nodeData: Record<string, unknown>): Node {
  // Validate input is an object
  if (!nodeData || typeof nodeData !== 'object') {
    throw new Error(
      `Invalid node data: expected an object but received ${typeof nodeData}`,
    )
  }

  // Validate 'type' field exists
  if (!('type' in nodeData)) {
    throw new Error(
      'Invalid node data: missing required "type" field. ' +
        'Node data must include a "type" property indicating the node type.',
    )
  }

  // Validate 'type' is a string
  if (typeof nodeData.type !== 'string') {
    throw new Error(
      `Invalid node data: "type" field must be a string, but received ${typeof nodeData.type}`,
    )
  }

  const nodeType = nodeData.type as NodeType

  // Validate node type is recognized
  const NodeClass = nodeTypeToClass[nodeType]
  if (!NodeClass) {
    throw new Error(
      `Unknown node type: "${nodeType}". ` +
        `Valid node types are: ${Object.keys(nodeTypeToClass).join(', ')}`,
    )
  }

  // Attempt to deserialize the node
  try {
    return (
      NodeClass as { fromJSONData: (data: Record<string, unknown>) => Node }
    ).fromJSONData(nodeData)
  } catch (error) {
    // Wrap errors from fromJSONData with additional context
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to deserialize ${nodeType} node: ${errorMessage}`)
  }
}

/**
 * Deserializes a single node from a JSON string.
 *
 * This function parses a JSON string containing an node object
 * and reconstructs the appropriate Node subclass instance.
 *
 * @param jsonString - JSON string containing an node object
 * @returns An Node instance of the appropriate subclass
 * @throws {Error} If the JSON is invalid or node cannot be deserialized:
 *   - Invalid JSON syntax
 *   - JSON does not contain an object
 *   - Node validation errors (see deserializeNode)
 *
 * @example
 * Deserializing from a JSON string:
 * ```typescript
 * const json = '{"type":"open","date":"2024-01-01","account":"Assets:Checking"}'
 * const node = deserializeNodeFromString(json)
 * console.log(node.type) // 'open'
 * ```
 *
 * @example
 * Roundtrip serialization:
 * ```typescript
 * const original = Open.fromString('2024-01-01 open Assets:Checking')
 * const json = JSON.stringify(original.toJSON())
 * const deserialized = deserializeNodeFromString(json)
 * // deserialized equals original
 * ```
 */
export function deserializeNodeFromString(jsonString: string): Node {
  // Validate input
  if (typeof jsonString !== 'string') {
    throw new Error(
      `Invalid input: expected a JSON string but received ${typeof jsonString}`,
    )
  }

  // Parse JSON with error handling
  let nodeData: unknown
  try {
    nodeData = JSON.parse(jsonString)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to parse JSON: ${errorMessage}`)
  }

  // Validate parsed data is an object (not array or null)
  if (nodeData === null || typeof nodeData !== 'object') {
    throw new Error(
      `Invalid JSON structure: expected an object but received ${nodeData === null ? 'null' : typeof nodeData}`,
    )
  }

  if (Array.isArray(nodeData)) {
    throw new Error(
      'Invalid JSON structure: expected an object but received an array',
    )
  }

  return deserializeNode(nodeData as Record<string, unknown>)
}

/**
 * Deserializes an array of nodes from their JSON representations.
 *
 * This function takes an array of plain JavaScript objects (typically from JSON.parse)
 * and reconstructs each as the appropriate Node subclass instance. It validates
 * the input and provides helpful error messages, including the index of any node
 * that fails to deserialize.
 *
 * @param nodesData - Array of plain objects containing node data
 * @returns Array of Node instances
 * @throws {Error} If the input is invalid or nodes cannot be deserialized:
 *   - Input is not an array
 *   - Any node fails validation (see deserializeNode)
 *
 * @example
 * Deserializing an array of nodes:
 * ```typescript
 * const nodesData = [
 *   { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
 *   { type: 'balance', date: '2024-01-02', account: 'Assets:Checking', amount: '100', currency: 'USD' }
 * ]
 * const nodes = deserializeNodes(nodesData)
 * console.log(nodes.length) // 2
 * ```
 *
 * @example
 * Roundtrip with JSON.parse:
 * ```typescript
 * const original = [Open.fromString('2024-01-01 open Assets:Checking')]
 * const json = JSON.stringify(original.map(e => e.toJSON()))
 * const parsed = JSON.parse(json)
 * const deserialized = deserializeNodes(parsed)
 * // deserialized equals original
 * ```
 */
export function deserializeNodes(nodesData: Record<string, unknown>[]): Node[] {
  // Validate input is an array
  if (!Array.isArray(nodesData)) {
    throw new Error(
      `Invalid input: expected an array but received ${typeof nodesData}`,
    )
  }

  // Deserialize each node with error context
  const nodes: Node[] = []
  for (let i = 0; i < nodesData.length; i++) {
    try {
      nodes.push(deserializeNode(nodesData[i]))
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new Error(
        `Failed to deserialize node at index ${i}: ${errorMessage}`,
      )
    }
  }

  return nodes
}

/**
 * Deserializes an array of nodes from a JSON string.
 *
 * This function parses a JSON string containing an array of node objects
 * and reconstructs each node as the appropriate Node subclass instance.
 * It validates the input and provides helpful error messages, including
 * the index of any node that fails to deserialize.
 *
 * @param jsonString - JSON string containing an array of node objects
 * @returns Array of Node instances
 * @throws {Error} If the JSON is invalid or nodes cannot be deserialized:
 *   - Invalid JSON syntax
 *   - JSON does not contain an array
 *   - Any node fails validation (see deserializeNode)
 *
 * @example
 * Deserializing multiple nodes:
 * ```typescript
 * const json = '[
 *   {"type": "open", "date": "2024-01-01", "account": "Assets:Checking"},
 *   {"type": "balance", "date": "2024-01-02", "account": "Assets:Checking", "amount": "100", "currency": "USD"}
 * ]'
 * const nodes = deserializeNodes(json)
 * console.log(nodes.length) // 2
 * ```
 *
 * @example
 * Roundtrip serialization:
 * ```typescript
 * import { parse } from 'beancount'
 *
 * const original = parse('2024-01-01 open Assets:Checking')
 * const json = JSON.stringify(original.nodes.map(e => e.toJSON()))
 * const deserialized = deserializeNodes(json)
 * // deserialized equals original.nodes
 * ```
 */
export function deserializeNodesFromString(jsonString: string): Node[] {
  // Validate input
  if (typeof jsonString !== 'string') {
    throw new Error(
      `Invalid input: expected a JSON string but received ${typeof jsonString}`,
    )
  }

  // Parse JSON with error handling
  let nodesData: unknown
  try {
    nodesData = JSON.parse(jsonString)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to parse JSON: ${errorMessage}`)
  }

  // Validate parsed data is an array
  if (!Array.isArray(nodesData)) {
    throw new Error(
      `Invalid JSON structure: expected an array but received ${typeof nodesData}`,
    )
  }

  return deserializeNodes(nodesData as Record<string, unknown>[])
}
