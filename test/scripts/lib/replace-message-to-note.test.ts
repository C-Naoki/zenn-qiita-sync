import { replaceMessageToNote } from '../../../scripts/lib/replace-message-to-note'

describe('replaceMessageToNote', () => {
  it('should replace :::message with :::note', () => {
    const input = 'This is a test :::message content :::.'
    const expected = 'This is a test :::note content :::.'
    expect(replaceMessageToNote(input)).toBe(expected)
  })

  it('should replace multiple :::message occurrences', () => {
    const input = ':::message one ::: :::message two :::'
    const expected = ':::note one ::: :::note two :::'
    expect(replaceMessageToNote(input)).toBe(expected)
  })

  it('should not change content if no :::message is present', () => {
    const input = 'This is a test with no message.'
    expect(replaceMessageToNote(input)).toBe(input)
  })

  it('should handle empty string', () => {
    const input = ''
    expect(replaceMessageToNote(input)).toBe('')
  })

  it('should handle partial matches (e.g., :::messag)', () => {
    const input = 'This is a :::messag test.'
    expect(replaceMessageToNote(input)).toBe(input)
  })
})
