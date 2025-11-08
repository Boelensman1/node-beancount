export class Tag {
  content!: string
  fromStack!: boolean

  constructor(obj: { content: string; fromStack: boolean }) {
    Object.assign(this, obj)
  }

  toString() {
    if (this.fromStack) {
      return ''
    }
    return `#${this.content}`
  }
}
