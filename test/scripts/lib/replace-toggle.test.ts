import { replaceToggle } from '../../../scripts/lib/replace-toggle'

describe('replaceToggle', () => {
  it('should replace :::details with <details><summary> tags', () => {
    const input = ':::details Title\nContent\n:::'
    const expected = `<details><summary>Title</summary>

Content
</details>`
    expect(replaceToggle(input)).toBe(expected)
  })

  it('should replace multiple :::details occurrences', () => {
    const input = ':::details Title1\nContent1\n:::\n:::details Title2\nContent2\n:::'
    const expected = `<details><summary>Title1</summary>

Content1
</details>
<details><summary>Title2</summary>

Content2
</details>`
    expect(replaceToggle(input)).toBe(expected)
  })

  it('should not change content if no :::details is present', () => {
    const input = 'This is a test with no toggle.'
    expect(replaceToggle(input)).toBe(input)
  })

  it('should handle empty content within toggle', () => {
    const input = ':::details Title\n:::'
    const expected = `<details><summary>Title</summary>

</details>`
    expect(replaceToggle(input)).toBe(expected)
  })

  it('should handle special characters in title and content', () => {
    const input = ':::details Title with !@#$%^&*()\nContent with <>&\n:::'
    const expected = `<details><summary>Title with !@#$%^&*()</summary>

Content with <>&
</details>`
    expect(replaceToggle(input)).toBe(expected)
  })

  it('should handle empty string', () => {
    const input = ''
    expect(replaceToggle(input)).toBe('')
  })

  it('should handle toggle with multiple lines of content', () => {
    const input = ':::details Multi-line Title\nLine 1\nLine 2\nLine 3\n:::'
    const expected = `<details><summary>Multi-line Title</summary>

Line 1
Line 2
Line 3
</details>`
    expect(replaceToggle(input)).toBe(expected)
  })
})