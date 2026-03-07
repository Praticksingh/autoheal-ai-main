const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { runCommand } = require('./commandRunnerService');

async function cloneRepository(repoUrl, runId) {
  const basePath = path.join(os.tmpdir(), 'autoheal-runs');
  const targetPath = path.join(basePath, runId);

  try {
    await fs.mkdir(basePath, { recursive: true });
    await fs.rm(targetPath, { recursive: true, force: true });

    await runCommand(`git clone --depth 1 "${repoUrl}" "${targetPath}"`);
  } catch (error) {
    console.error('Git clone error:', error);
    const cloneError = new Error('Repository could not be cloned. Please verify the repository URL.');
    cloneError.statusCode = 400;
    throw cloneError;
  }

  return targetPath;
}

module.exports = {
  cloneRepository,
};
