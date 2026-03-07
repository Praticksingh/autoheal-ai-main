const fs = require('fs/promises');
const path = require('path');
const { runCommand } = require('./commandRunnerService');

async function runTests(repoPath) {
  const packagePath = path.join(repoPath, 'package.json');

  try {
    await fs.access(packagePath);
  } catch {
    return {
      passed: true,
      skipped: true,
      reason: 'No package.json found. Tests skipped.',
      stdout: '',
      stderr: '',
    };
  }

  try {
    console.log('Installing dependencies...');
    await runCommand('npm install --no-audit --no-fund', { cwd: repoPath, timeout: 180000 });
    console.log('Executing test suite...');
    const result = await runCommand('npm test -- --watch=false', { cwd: repoPath, timeout: 180000 });

    return {
      passed: true,
      stdout: result.stdout,
      stderr: result.stderr,
      skipped: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Tests could not be executed';
    return {
      passed: false,
      stdout: '',
      stderr: errorMessage,
      skipped: false,
    };
  }
}

module.exports = {
  runTests,
};
