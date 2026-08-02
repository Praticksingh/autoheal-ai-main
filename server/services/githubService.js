const axios = require('axios');
const REPO_URL_PREFIX = 'https://github.com/';

function parseGitHubRepo(repoUrl) {
  const match = repoUrl.match(/github\.com\/(.+?)\/(.+?)(?:\.git)?$/i);
  if (!match) {
    return null;
  }

  return {
    owner: match[1],
    repo: match[2],
  };
}

const { runCommand } = require('./commandRunnerService');

async function validateRepository(repoUrl) {
  if (!repoUrl || typeof repoUrl !== 'string' || !repoUrl.startsWith(REPO_URL_PREFIX)) {
    const error = new Error('Repository URL must start with https://github.com/');
    error.statusCode = 400;
    throw error;
  }

  const cleanUrl = repoUrl.trim().replace(/\/+$/, '');
  const parsed = parseGitHubRepo(cleanUrl);

  if (!parsed) {
    const error = new Error('Invalid GitHub repository URL');
    error.statusCode = 400;
    throw error;
  }

  try {
    const response = await axios.get(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      timeout: 8000,
      headers: {
        Accept: 'application/vnd.github+json',
      },
    });

    if (response?.data?.private) {
      const error = new Error('Repository is private. Please provide a public repository.');
      error.statusCode = 400;
      throw error;
    }
  } catch (err) {
    if (err?.statusCode) {
      throw err;
    }

    const status = err?.response?.status;

    if (status === 404) {
      const error = new Error('GitHub repository not found');
      error.statusCode = 404;
      throw error;
    }

    // GitHub REST API may rate-limit unauthenticated requests (HTTP 403/429).
    // Fall back to probing the repository directly via git ls-remote.
    try {
      console.log(`GitHub API probe fallback for ${cleanUrl}...`);
      await runCommand(`git ls-remote --heads "${cleanUrl}"`, { timeout: 10000 });
    } catch {
      const error = new Error('Repository not accessible or does not exist');
      error.statusCode = 400;
      throw error;
    }
  }

  return parsed;
}

module.exports = {
  validateRepository,
};
