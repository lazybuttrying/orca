import { describe, expect, it } from 'vitest'
import {
  isNonAsciiProseBoundary,
  trimFileLinkRangeTrailingNonAsciiLetters,
  trimFileLinkTrailingNonAsciiLetters
} from './non-ascii-terminal-text-boundary'

describe('isNonAsciiProseBoundary (#15240)', () => {
  it('treats full-width punctuation and ideographic space as prose boundaries', () => {
    expect(isNonAsciiProseBoundary('（'.charCodeAt(0))).toBe(true)
    expect(isNonAsciiProseBoundary('、'.charCodeAt(0))).toBe(true)
    expect(isNonAsciiProseBoundary('。'.charCodeAt(0))).toBe(true)
    expect(isNonAsciiProseBoundary('\u3000'.charCodeAt(0))).toBe(true)
  })

  it('does not treat CJK letters in a path as prose boundaries', () => {
    expect(isNonAsciiProseBoundary('文'.charCodeAt(0))).toBe(false)
    expect(isNonAsciiProseBoundary('档'.charCodeAt(0))).toBe(false)
    expect(isNonAsciiProseBoundary('로'.charCodeAt(0))).toBe(false)
  })
})

describe('trimFileLinkTrailingNonAsciiLetters (file-link mirror of #15240)', () => {
  it.each([
    ['README.md로', 'README.md'],
    ['AGENTS.md에', 'AGENTS.md'],
    ['file.tsです', 'file.ts'],
    ['plans/foo.md로', 'plans/foo.md'],
    ['src/foo.ts:12로', 'src/foo.ts:12'],
    ['src/foo.ts:12:3에', 'src/foo.ts:12:3'],
    ['/Users/me/docs/한글폴더/파일.md로', '/Users/me/docs/한글폴더/파일.md'],
    ['파일.md了', '파일.md']
  ])('trims non-ASCII letters after an ASCII extension: %s', (input, expected) => {
    expect(trimFileLinkTrailingNonAsciiLetters(input)).toBe(expected)
  })

  it.each([
    'README.md',
    'README.md for',
    'file.mdbackup',
    'file.mdBackup',
    'plans/foo.md',
    '/Users/me/docs/한글폴더/파일.md',
    'Makefile',
    'src/foo.ts:12:3'
  ])('leaves non-particle text unchanged: %s', (input) => {
    expect(trimFileLinkTrailingNonAsciiLetters(input)).toBe(input)
  })

  it('adjusts endIndex when trimming a range', () => {
    const range = {
      text: 'README.md로',
      startIndex: 10,
      endIndex: 10 + 'README.md로'.length
    }
    expect(trimFileLinkRangeTrailingNonAsciiLetters(range)).toEqual({
      text: 'README.md',
      startIndex: 10,
      endIndex: 19
    })
  })
})
