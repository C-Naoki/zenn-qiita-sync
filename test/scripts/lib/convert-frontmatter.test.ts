import { existsSync, readFileSync } from 'fs'
import { convertFrontmatter } from '../../../scripts/lib/convert-frontmatter'
import yaml from 'js-yaml'

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}))

describe('convertFrontmatter', () => {
  const mockDate = '2023-01-01T00:00:00.000Z'
  const realDate = Date

  beforeAll(() => {
    // Mock Date to control new Date() output
    global.Date = jest.fn(() => new realDate(mockDate)) as any
  })

  afterAll(() => {
    global.Date = realDate
  })

  beforeEach(() => {
    jest.clearAllMocks()
    ;(existsSync as jest.Mock).mockReturnValue(false)
    ;(readFileSync as jest.Mock).mockReturnValue('')
  })

  it('should convert frontmatter correctly for a new file', () => {
    const input = `---\nemoji: "🚀"\ntitle: "Test Title"\ntype: "tech"\npublished: true\ntopics:\n  - "javascript"\n  - "typescript"\n---\n# Hello\n`
    const converted = convertFrontmatter()(input)
    const [frontmatter, content] = converted.split('---\n').filter(Boolean)
    const data = yaml.load(frontmatter) as any

    expect(data.emoji).toBeUndefined()
    expect(data.type).toBeUndefined()
    expect(data.published).toBeUndefined()
    expect(data.topics).toBeUndefined()

    expect(data.private).toBe(false) // published: true は private: false に変換される
    expect(data.tags).toEqual(['javascript', 'typescript'])
    expect(data.updated_at).toBe(mockDate)
    expect(data.id).toBeNull()
    expect(data.organization_url_name).toBeNull()
    expect(data.slide).toBe(false)
    expect(data.title).toBe('Test Title')
    expect(content.trim()).toBe('# Hello')
  })

  it('should preserve existing updated_at, id, and organization_url_name if outputPath exists', () => {
    const input = `---\nemoji: "🚀"\ntitle: "Test Title"\npublished: true\ntopics:\n  - "javascript"\n---\n# Hello\n`
    const existingContent = `---\nupdated_at: "2022-01-01T00:00:00.000Z"\nid: 123\norganization_url_name: "test-org"\n---\nExisting content\n`
    const outputPath = '/path/to/existing.md'

    ;(existsSync as jest.Mock).mockReturnValue(true)
    ;(readFileSync as jest.Mock).mockReturnValue(existingContent)

    const converted = convertFrontmatter(outputPath)(input)
    const [frontmatter] = converted.split('---\n').filter(Boolean)
    const data = yaml.load(frontmatter) as any

    // updated_at は文字列として比較
    expect(new realDate(data.updated_at).toISOString()).toBe('2022-01-01T00:00:00.000Z')
    expect(data.id).toBe(123)
    expect(data.organization_url_name).toBe('test-org')
  })

  it('should set new updated_at, null id, and null organization_url_name if outputPath does not exist', () => {
    const input = `---\ntitle: "Test Title"\ntopics: []\n---\n# Hello\n`
    const outputPath = '/path/to/new.md'

    ;(existsSync as jest.Mock).mockReturnValue(false)

    const converted = convertFrontmatter(outputPath)(input)
    const [frontmatter] = converted.split('---\n').filter(Boolean)
    const data = yaml.load(frontmatter) as any

    expect(data.updated_at).toBe(mockDate)
    expect(data.id).toBeNull()
    expect(data.organization_url_name).toBeNull()
  })

  it('should handle different data types in frontmatter', () => {
    const input = `---\ntitle: "Another Title"\nnumber_field: 123\nboolean_field: true\narray_field:\n  - item1\n  - item2\ntopics: []\n---\nContent\n`
    const converted = convertFrontmatter()(input)
    const [frontmatter] = converted.split('---\n').filter(Boolean)
    const data = yaml.load(frontmatter) as any

    expect(data.title).toBe('Another Title')
    expect(data.number_field).toBe(123)
    expect(data.boolean_field).toBe(true)
    expect(data.array_field).toEqual(['item1', 'item2'])
  })

  it('should handle empty frontmatter', () => {
    const input = `---\ntopics: []\n---\nContent\n`
    const converted = convertFrontmatter()(input)
    const [frontmatter, content] = converted.split('---\n').filter(Boolean)
    const data = yaml.load(frontmatter) as any

    // updated_at, id, organization_url_name, slide, private, tags の6つが期待される
    expect(Object.keys(data).length).toBe(6)
    expect(data.updated_at).toBe(mockDate)
    expect(data.id).toBeNull()
    expect(data.organization_url_name).toBeNull()
    expect(data.slide).toBe(false)
    expect(data.private).toBe(true) // published がないので private は true
    expect(data.tags).toEqual([]) // topics が空配列なので tags も空配列
    expect(content.trim()).toBe('Content')
  })
})
