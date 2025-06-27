import { execSync } from 'child_process'
import GitUrlParse from 'git-url-parse'

interface RepoInfo {
  owner: string
  repo: string
  branch: string
}

function getCurrentBranch() {
  return execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
}

function getRemoteUrl() {
  return execSync('git config --get remote.origin.url').toString().trim()
}

function getRepoInfo(): RepoInfo {
  const gitInfo = GitUrlParse(getRemoteUrl())
  return {
    owner: gitInfo.owner,
    repo: gitInfo.name,
    branch: getCurrentBranch(),
  }
}

export function replaceImagePaths(inputContent: string): string {
  const { owner, repo, branch } = getRepoInfo()
  const githubRawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`

  // Split by code blocks
  const parts = inputContent.split(/(```.*?```)/gs)

  // Only replace image paths outside of code blocks
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i].startsWith('```')) {
      parts[i] = parts[i].replace(/!\[(.*?)\]\((.*?)\s*=\d+x\d*\)/g, `![$1]($2)`);
      parts[i] = parts[i].replace(/!\[(.*?)\]\((\/.*?)\)/g, `![$1](${githubRawUrl}$2)`);
    }
  }

  // Rejoin the markdown
  return parts.join('')
}
