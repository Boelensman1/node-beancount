/**
 * Location information for a fragment of source code
 */
export interface SourceLocation {
  /** Starting line number (1-based) */
  startLine: number
  /** Ending line number (1-based) */
  endLine: number
  /** Optional file path */
  filePath?: string
}

/**
 * A source fragment with associated location metadata
 */
export interface SourceFragmentWithLocation {
  /** The lines of source code */
  fragment: string[]
  /** Location information */
  location: SourceLocation
}

/**
 * Custom error class for beancount parsing errors with location context
 */
export class BeancountParseError extends Error {
  public readonly location: SourceLocation
  public readonly sourceContent: string[]
  public readonly nodeType?: string
  public readonly originalError: Error

  /**
   * Creates a new BeancountParseError with location context
   * @param options - Error options
   * @param options.message - Error message
   * @param options.location - Source location where error occurred
   * @param options.sourceContent - Lines of source code where error occurred
   * @param options.nodeType - Type of node being parsed when error occurred
   * @param options.cause - Original error that caused this error
   */
  constructor(options: {
    message: string
    location: SourceLocation
    sourceContent: string[]
    nodeType?: string
    cause?: Error
  }) {
    super(options.message)
    this.name = 'BeancountParseError'
    this.location = options.location
    this.sourceContent = options.sourceContent
    this.nodeType = options.nodeType
    this.originalError = options.cause ?? new Error(options.message)

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BeancountParseError)
    }
  }

  /**
   * Format the error with context lines and indicators
   * @param contextLinesBefore - Number of lines to show before error (default: 2)
   * @param contextLinesAfter - Number of lines to show after error (default: 2)
   * @returns Formatted error message with context
   */
  public formatWithContext(
    contextLinesBefore = 2,
    contextLinesAfter = 2,
  ): string {
    const lines: string[] = []

    // Header with file and line info
    const locationStr = this.location.filePath
      ? `${this.location.filePath}:${this.location.startLine}-${this.location.endLine}`
      : `Lines ${this.location.startLine}-${this.location.endLine}`
    lines.push(`Error in ${locationStr}:`)
    lines.push('')

    // Calculate line number width for alignment
    const maxLineNum = this.location.endLine + contextLinesAfter
    const lineNumWidth = maxLineNum.toString().length

    // Add context lines before
    const startContextLine = Math.max(
      1,
      this.location.startLine - contextLinesBefore,
    )
    for (let i = startContextLine; i < this.location.startLine; i++) {
      const lineContent = this.getLineContent(i)
      if (lineContent !== null) {
        lines.push(this.formatLine(i, lineContent, lineNumWidth, false))
      }
    }

    // Add the actual error lines
    for (let i = this.location.startLine; i <= this.location.endLine; i++) {
      const lineContent = this.getLineContent(i)
      if (lineContent !== null) {
        lines.push(this.formatLine(i, lineContent, lineNumWidth, true))
      }
    }

    // Add indicator line pointing to the error
    const indicatorLine =
      ' '.repeat(lineNumWidth) +
      ' | ' +
      '^'.repeat(Math.min(40, this.sourceContent[0]?.length || 1))
    lines.push(indicatorLine + ' Error occurred here')

    // Add context lines after
    for (
      let i = this.location.endLine + 1;
      i <= this.location.endLine + contextLinesAfter;
      i++
    ) {
      const lineContent = this.getLineContent(i)
      if (lineContent !== null) {
        lines.push(this.formatLine(i, lineContent, lineNumWidth, false))
      }
    }

    lines.push('')

    // Add directive type if available
    if (this.nodeType) {
      lines.push(`While parsing: ${this.nodeType} directive`)
    }

    // Add original error message
    lines.push(`Original error: ${this.originalError.message}`)

    return lines.join('\n')
  }

  /**
   * Get the content for a specific line number
   * @param lineNum - The line number to retrieve
   * @returns The line content or null if not available
   */
  private getLineContent(lineNum: number): string | null {
    const offset = lineNum - this.location.startLine
    if (offset >= 0 && offset < this.sourceContent.length) {
      return this.sourceContent[offset]
    }
    return null
  }

  /**
   * Format a single line with line number and optional highlight
   * @param lineNum - The line number
   * @param content - The line content
   * @param lineNumWidth - Width for line number padding
   * @param isErrorLine - Whether this is an error line (highlighted)
   * @returns Formatted line string
   */
  private formatLine(
    lineNum: number,
    content: string,
    lineNumWidth: number,
    isErrorLine: boolean,
  ): string {
    const lineNumStr = lineNum.toString().padStart(lineNumWidth, ' ')
    const prefix = isErrorLine ? '>' : ' '
    return `${prefix} ${lineNumStr} | ${content}`
  }

  /**
   * Override toString to provide formatted output
   * @returns Formatted error message with context
   */
  public toString(): string {
    return this.formatWithContext()
  }
}
