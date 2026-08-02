const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { runCommand } = require('./commandRunnerService');

async function cloneRepository(repoUrl, runId) {
  const basePath = path.join(os.tmpdir(), 'autoheal-runs');
  const uniqueSubdir = `${runId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const targetPath = path.join(basePath, uniqueSubdir);

  try {
    await fs.mkdir(basePath, { recursive: true });
    try {
      await fs.rm(targetPath, { recursive: true, force: true });
    } catch (rmErr) {
      console.warn('Cleanup warning for temp clone dir:', rmErr?.message);
    }

    console.log(`Cloning ${repoUrl} to ${targetPath}...`);
    await runCommand(`git clone --depth 1 "${repoUrl}" "${targetPath}"`, { timeout: 60000 });
  } catch (error) {
    console.error('Git clone error:', error);
    const rawMsg = error instanceof Error ? error.message : 'Git clone failed';
    const cloneError = new Error(`Repository could not be cloned: ${rawMsg}`);
    cloneError.statusCode = 400;
    throw cloneError;
  }

  return targetPath;
}

module.exports = {
  cloneRepository,
};
