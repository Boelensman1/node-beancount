export type ValueType = 'string' | 'date' | 'boolean' | 'amount' | 'numbers'

export const parseString = (val: string): string => {
  return val.replace(/^"|"$/g, '')
}

export class Value {
  type!: ValueType
  value!: unknown

  constructor(obj: { type: ValueType; value: unknown }) {
    Object.assign(this, obj)
  }

  static fromString(input: string) {
    if (input.startsWith('"') && input.endsWith('"')) {
      // string!
      return new Value({ type: 'string', value: parseString(input) })
    }
    if (input.toUpperCase() === 'TRUE') {
      return new Value({ type: 'boolean', value: true })
    }
    if (input.toUpperCase() === 'FALSE') {
      return new Value({ type: 'boolean', value: false })
    }

    // TODO: more parsing
    return new Value({ type: 'amount', value: input })
  }

  toString(): string {
    switch (this.type) {
      case 'boolean':
        return this.value ? 'TRUE' : 'FALSE'
      case 'string':
        return `"${this.value as string}"`
      default:
        return String(this.value)
    }
  }
}
