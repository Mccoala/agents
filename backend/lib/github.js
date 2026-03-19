import { Octokit } from '@octokit/rest'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
const OWNER = process.env.GITHUB_OWNER || 'Mccoala'
const REPO = process.env.GITHUB_REPO || 'app-ags'

export async function getFile(path) {
  const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path })
  const content = Buffer.from(data.content, 'base64').toString('utf-8')
  return { content, sha: data.sha }
}

export async function listFiles(path = '') {
  const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path })
  return Array.isArray(data) ? data.map(f => ({ name: f.name, path: f.path, type: f.type })) : [data]
}

export async function createBranch(branchName) {
  const { data: ref } = await octokit.git.getRef({ owner: OWNER, repo: REPO, ref: 'heads/main' })
  await octokit.git.createRef({
    owner: OWNER, repo: REPO,
    ref: `refs/heads/${branchName}`,
    sha: ref.object.sha,
  })
}

export async function commitFile(path, content, message, branchName) {
  let sha
  try {
    const existing = await getFile(path)
    sha = existing.sha
  } catch { /* new file */ }

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER, repo: REPO, path,
    message,
    content: Buffer.from(content).toString('base64'),
    branch: branchName,
    ...(sha ? { sha } : {}),
  })
}

export async function createPR(title, body, branchName) {
  const { data } = await octokit.pulls.create({
    owner: OWNER, repo: REPO,
    title, body,
    head: branchName,
    base: 'main',
  })
  return data.html_url
}
