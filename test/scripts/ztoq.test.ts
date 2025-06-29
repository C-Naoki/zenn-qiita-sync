import { readFileSync, statSync, watchFile, writeFileSync } from 'fs';
import { basename, join } from 'path';
import { zennMarkdownToQiitaMarkdown } from '../../scripts/lib';

// Mock fs
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  statSync: jest.fn(),
  watchFile: jest.fn(),
}))

// Mock zennMarkdownToQiitaMarkdown
jest.mock('../../scripts/lib', () => ({
  zennMarkdownToQiitaMarkdown: jest.fn(),
}))

describe('ztoq.tsx', () => {
  const mockInputPath = '/path/to/input.md'
  const mockOutputPath = '/path/to/output.md'
  const mockInputContent = 'Zenn markdown content'
  const mockOutputContent = 'Qiita markdown content'

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()

    // Set default mock implementations
    ;(statSync as jest.Mock).mockReturnValue({ isDirectory: () => false })

    // Mock console.log and console.error to prevent actual output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should convert and write file correctly', () => {
    jest.isolateModules(() => {
      jest.mock('yargs', () => ({
        __esModule: true,
        default: {
          command: jest.fn().mockReturnThis(),
          positional: jest.fn().mockReturnThis(),
          option: jest.fn().mockReturnThis(),
          help: jest.fn().mockReturnThis(),
          alias: jest.fn().mockReturnThis(),
          parseSync: jest.fn().mockReturnValue({
            inputPath: mockInputPath,
            outputPath: mockOutputPath,
            watch: false,
          }),
        },
      }))
      const yargs = require('yargs')

      ;(readFileSync as jest.Mock).mockReturnValue(mockInputContent)
      ;(zennMarkdownToQiitaMarkdown as jest.Mock).mockReturnValue(mockOutputContent)
      ;(writeFileSync as jest.Mock).mockReturnValue(undefined)
      require('../../scripts/ztoq') // Import the script to run its main function
    })

    expect(readFileSync).toHaveBeenCalledWith(mockInputPath, 'utf8')
    expect(zennMarkdownToQiitaMarkdown).toHaveBeenCalledWith(mockInputContent, mockOutputPath)
    expect(writeFileSync).toHaveBeenCalledWith(mockOutputPath, mockOutputContent, 'utf8')
    expect(console.log).toHaveBeenCalledWith(`Output written to ${mockOutputPath}`)
  })

  it('should handle outputPath as a directory', () => {
    const mockOutputDir = '/path/to/output/dir'

    jest.isolateModules(() => {
      jest.mock('yargs', () => ({
        __esModule: true,
        default: {
          command: jest.fn().mockReturnThis(),
          positional: jest.fn().mockReturnThis(),
          option: jest.fn().mockReturnThis(),
          help: jest.fn().mockReturnThis(),
          alias: jest.fn().mockReturnThis(),
          parseSync: jest.fn().mockReturnValue({
            inputPath: mockInputPath,
            outputPath: mockOutputDir,
            watch: false,
          }),
        },
      }))
      const yargs = require('yargs')

      ;(statSync as jest.Mock).mockReturnValue({ isDirectory: () => true })
      ;(readFileSync as jest.Mock).mockReturnValue(mockInputContent)
      ;(zennMarkdownToQiitaMarkdown as jest.Mock).mockReturnValue(mockOutputContent)
      ;(writeFileSync as jest.Mock).mockReturnValue(undefined)
      require('../../scripts/ztoq')
    })

    const expectedOutputPath = join(mockOutputDir, basename(mockInputPath))
    expect(writeFileSync).toHaveBeenCalledWith(expectedOutputPath, mockOutputContent, 'utf8')
    expect(console.log).toHaveBeenCalledWith(`Output written to ${expectedOutputPath}`)
  })

  it('should call watchFile when watch option is true', () => {
    jest.isolateModules(() => {
      jest.mock('yargs', () => ({
        __esModule: true,
        default: {
          command: jest.fn().mockReturnThis(),
          positional: jest.fn().mockReturnThis(),
          option: jest.fn().mockReturnThis(),
          help: jest.fn().mockReturnThis(),
          alias: jest.fn().mockReturnThis(),
          parseSync: jest.fn().mockReturnValue({
            inputPath: mockInputPath,
            outputPath: mockOutputPath,
            watch: true,
          }),
        },
      }))
      const yargs = require('yargs')

      ;(readFileSync as jest.Mock).mockReturnValue(mockInputContent)
      ;(zennMarkdownToQiitaMarkdown as jest.Mock).mockReturnValue(mockOutputContent)
      ;(writeFileSync as jest.Mock).mockReturnValue(undefined)
      require('../../scripts/ztoq')
    })

    expect(watchFile).toHaveBeenCalledWith(
      mockInputPath,
      { persistent: true, interval: 1000 },
      expect.any(Function),
    )
    expect(console.log).toHaveBeenCalledWith('Watching for changes...')
  })

  it('should log error when writeFileSync fails', () => {
    const mockError = new Error('File write error')

    jest.isolateModules(() => {
      jest.mock('yargs', () => ({
        __esModule: true,
        default: {
          command: jest.fn().mockReturnThis(),
          positional: jest.fn().mockReturnThis(),
          option: jest.fn().mockReturnThis(),
          help: jest.fn().mockReturnThis(),
          alias: jest.fn().mockReturnThis(),
          parseSync: jest.fn().mockReturnValue({
            inputPath: mockInputPath,
            outputPath: mockOutputPath,
            watch: false,
          }),
        },
      }))
      const yargs = require('yargs')

      ;(readFileSync as jest.Mock).mockReturnValue(mockInputContent)
      ;(zennMarkdownToQiitaMarkdown as jest.Mock).mockReturnValue(mockOutputContent)
      ;(writeFileSync as jest.Mock).mockImplementation(() => {
        throw mockError
      })
      require('../../scripts/ztoq')
    })

    expect(console.error).toHaveBeenCalledWith('Error processing:', mockError)
  })

  it('should log error when zennMarkdownToQiitaMarkdown throws an error', () => {
    const mockError = new Error('Conversion error')

    jest.isolateModules(() => {
      jest.mock('yargs', () => ({
        __esModule: true,
        default: {
          command: jest.fn().mockReturnThis(),
          positional: jest.fn().mockReturnThis(),
          option: jest.fn().mockReturnThis(),
          help: jest.fn().mockReturnThis(),
          alias: jest.fn().mockReturnThis(),
          parseSync: jest.fn().mockReturnValue({
            inputPath: mockInputPath,
            outputPath: mockOutputPath,
            watch: false,
          }),
        },
      }))
      const yargs = require('yargs')

      ;(readFileSync as jest.Mock).mockReturnValue(mockInputContent)
      ;(zennMarkdownToQiitaMarkdown as jest.Mock).mockImplementation(() => {
        throw mockError
      })
      ;(writeFileSync as jest.Mock).mockReturnValue(undefined)
      require('../../scripts/ztoq')
    })

    expect(console.error).toHaveBeenCalledWith('Error processing:', mockError)
  })
})
