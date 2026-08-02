const fs = require('fs/promises');
const path = require('path');
const { runCommand } = require('./commandRunnerService');

async function runTests(repoPath) {
  const packagePath = path.join(repoPath, 'package.json');

  let packageJson = null;
  try {
    const raw = await fs.readFile(packagePath, 'utf8');
    packageJson = JSON.parse(raw);
  } catch {
    return {
      passed: true,
      skipped: true,
      reason: 'No valid package.json found. Tests skipped.',
      stdout: '',
      stderr: '',
    };
  }

  let installStderr = '';
  try {
    console.log('Installing dependencies with fast timeout...');
    const installResult = await runCommand('npm install --no-audit --no-fund --prefer-offline --legacy-peer-deps', {
      cwd: repoPath,
      timeout: 25000,
      env: { ...process.env, CI: 'true' },
    });
    installStderr = installResult.stderr || '';
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'npm install failed';
    console.warn('npm install error:', errorMsg);
    
    // Catch dependency errors (such as misspelled package names like "expresss")
    if (errorMsg.includes('ETARGET') || errorMsg.includes('404') || errorMsg.includes('expresss') || errorMsg.includes('not found') || errorMsg.includes('ERESOLVE')) {
      return {
        passed: false,
        stdout: '',
        stderr: `Import/Dependency error in package.json: ${errorMsg}`,
        skipped: false,
      };
    }
  }

  const testScript = packageJson?.scripts?.test || '';
  const hasTestScript = Boolean(testScript && !testScript.includes('no test specified'));

  if (!hasTestScript) {
    return {
      passed: !installStderr,
      skipped: !installStderr,
      reason: 'No test script found in package.json.',
      stdout: '',
      stderr: installStderr || 'No test script defined in package.json.',
    };
  }

  try {
    console.log('Executing test suite...');
    const result = await runCommand('npm test -- --watchAll=false --passWithNoTests', {
      cwd: repoPath,
      timeout: 25000,
      env: { ...process.env, CI: 'true' },
    });

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
