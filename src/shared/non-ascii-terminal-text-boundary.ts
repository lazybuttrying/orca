/**
 * Non-ASCII boundary rules for terminal autolink spans (#15240).
 *
 * URL extraction ends at non-ASCII punctuation/symbols/separators (`\p{P}\p{S}\p{Z}`)
 * but keeps CJK letters inside the path. File-link extraction is the mirror: letters
 * inside a path stay, but a non-ASCII letter run glued after an ASCII extension
 * (`README.md로`) is trailing prose.
 */

// Why not all non-ascii: a url path may legitimately carry unencoded CJK (see the
// wrapped-url tests in terminal-http-url-extraction.test.ts).
export const NON_ASCII_PROSE_BOUNDARY = /[\p{P}\p{S}\p{Z}]/u

export function isNonAsciiProseBoundary(code: number): boolean {
  return code > 0x7e && NON_ASCII_PROSE_BOUNDARY.test(String.fromCharCode(code))
}

const ASCII_EXT_THEN_NON_ASCII_LETTERS =
  /^(?<path>.*\.[A-Za-z0-9_+-]+(?::\d+)?(?::\d+)?)(?<prose>(?:(?![A-Za-z])\p{L})+)$/u

export function trimFileLinkTrailingNonAsciiLetters(text: string): string {
  const match = ASCII_EXT_THEN_NON_ASCII_LETTERS.exec(text)
  return match?.groups?.path ?? text
}

export function trimFileLinkRangeTrailingNonAsciiLetters<
  T extends { text: string; startIndex: number; endIndex: number }
>(range: T): T {
  const trimmed = trimFileLinkTrailingNonAsciiLetters(range.text)
  if (trimmed === range.text) {
    return range
  }
  return {
    ...range,
    text: trimmed,
    endIndex: range.startIndex + trimmed.length
  }
}
