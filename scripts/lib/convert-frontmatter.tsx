import { existsSync, readFileSync } from 'fs'
import matter from 'gray-matter'
import yaml from 'js-yaml'

export function convertFrontmatter(outputPath?: string) {
  return function _convertFrontmatter(inputContent: string) {
    const { data, content } = matter(inputContent)
    const dataCloned = { ...data }

    // Remove unnecessary fields
    delete dataCloned.emoji
    delete dataCloned.type

    // Convert published to private (reversed)
    dataCloned.private = !dataCloned.published
    delete dataCloned.published

    // Convert topics to tags
    dataCloned.tags = dataCloned.topics
    delete dataCloned.topics

    // Add new fields
    if (outputPath && existsSync(outputPath)) {
      const existingData = matter(readFileSync(outputPath, 'utf8')).data
      if (existingData.updated_at) {
        dataCloned.updated_at = typeof existingData.updated_at === 'string' ? existingData.updated_at : existingData.updated_at.toISOString()
      } else {
        dataCloned.updated_at = new Date().toISOString()
      }
      dataCloned.id = existingData.id || null
      dataCloned.organization_url_name =
        existingData.organization_url_name || null
    } else {
      dataCloned.updated_at = new Date().toISOString()
      dataCloned.id = null
      dataCloned.organization_url_name = null
    }
    dataCloned.slide = false

    const frontmatter = yaml.dump(dataCloned)
    return `---\n${frontmatter}---\n${content}`
  }
}
