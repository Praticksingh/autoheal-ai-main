const { exec } = require('child_process');

function normalizeError(error, stderr) {
  const rawMessage = (stderr || error?.message || 'Command execution failed').trim();

  if (/spawn\s+EINVAL/i.test(rawMessage)) {
    const mapped = new Error('Command execution failed due to invalid process arguments (spawn EINVAL).');
    mapped.statusCode = 500;
    return mapped;
  }

  const mapped = new Error(rawMessage);
  mapped.statusCode = error?.statusCode || 500;
  return mapped;
}

function runCommand(command, options = {}) {
  const { cwd, timeout = 180000 } = options;

  return new Promise((resolve, reject) => {
    exec(command, { cwd, timeout }, (error, stdout, stderr) => {
      if (error) {
        reject(normalizeError(error, stderr));
        return;
      }

      resolve({
        stdout: stdout || '',
        stderr: stderr || '',
      });
    });
  });
}

module.exports = {
  runCommand,
};
