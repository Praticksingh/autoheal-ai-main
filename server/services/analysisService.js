const fs = require('fs/promises');
const path = require('path');

const TEST_FILE_REGEX = /(test|spec)\.(js|jsx|ts|tsx)$/i;

async function walkFiles(rootDir, currentDir = rootDir, collector = []) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }

    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(rootDir, fullPath, collector);
      continue;
    }

    collector.push(path.relative(rootDir, fullPath));
  }

  return collector;
}

async function analyzeProjectStructure(repoPath) {
  const files = await walkFiles(repoPath);
  const testFiles = files.filter((file) => TEST_FILE_REGEX.test(file));

  return {
    totalFiles: files.length,
    testFiles,
    hasPackageJson: files.includes('package.json'),
  };
}

module.exports = {
  analyzeProjectStructure,
};
