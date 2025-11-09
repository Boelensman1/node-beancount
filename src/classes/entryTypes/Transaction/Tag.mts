/**
 * Represents a tag associated with a transaction.
 * Tags can be specified inline in the transaction or inherited from a tag stack (pushtag/poptag).
 */
export class Tag {
  /** The tag name/content (without the '#' prefix) */
  content!: string
  /** Whether this tag comes from the tag stack (pushtag) or is inline */
  fromStack!: boolean

  /**
   * Creates a new Tag instance.
   * @param obj - Object containing tag content and source information
   * @param obj.content - The tag name/content
   * @param obj.fromStack - Whether this tag is from the tag stack
   */
  constructor(obj: { content: string; fromStack: boolean }) {
    Object.assign(this, obj)
  }

  /**
   * Converts this tag to its string representation.
   * Tags from the stack return an empty string (they're implicit),
   * while inline tags return '#tagname' format.
   *
   * @returns The tag string with '#' prefix, or empty string if from stack
   */
  toString() {
    if (this.fromStack) {
      return ''
    }
    return `#${this.content}`
  }
}
