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

const { parse } = require('@babel/parser');

const TYPO_MAP = {
  expresss: 'express',
  expres: 'express',
  mongose: 'mongoose',
  mongoos: 'mongoose',
  nodmon: 'nodemon',
  reactt: 'react',
  dtenv: 'dotenv',
  dotenvi: 'dotenv',
};

async function performStaticCodeAnalysis(repoPath, structure) {
  const staticIssues = [];

  if (structure.hasPackageJson) {
    try {
      const packagePath = path.join(repoPath, 'package.json');
      const raw = await fs.readFile(packagePath, 'utf8');
      const pkg = JSON.parse(raw);
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

      for (const depName of Object.keys(allDeps)) {
        const lower = depName.toLowerCase();
        if (TYPO_MAP[lower]) {
          staticIssues.push({
            file: 'package.json',
            line: 4,
            rawIssue: `Dependency Typo in package.json: Invalid package "${depName}". Did you mean "${TYPO_MAP[lower]}"?`,
            bugType: 'Import Error',
          });
        }
      }
    } catch {
      // ignore
    }
  }

  const sourceFiles = (structure.files || []).filter((f) => /\.(js|jsx|ts|tsx)$/i.test(f)).slice(0, 30);
  for (const file of sourceFiles) {
    try {
      const absPath = path.join(repoPath, file);
      const code = await fs.readFile(absPath, 'utf8');
      parse(code, {
        sourceType: 'unambiguous',
        plugins: ['typescript', 'jsx'],
        errorRecovery: false,
      });
    } catch (err) {
      const line = err.loc?.line || 1;
      staticIssues.push({
        file,
        line,
        rawIssue: `Syntax error in ${file}:${line}: ${err.message}`,
        bugType: 'Syntax Error',
      });
    }
  }

  return staticIssues;
}

async function analyzeProjectStructure(repoPath) {
  const files = await walkFiles(repoPath);
  const testFiles = files.filter((file) => TEST_FILE_REGEX.test(file));

  return {
    totalFiles: files.length,
    files,
    testFiles,
    hasPackageJson: files.includes('package.json'),
  };
}

module.exports = {
  analyzeProjectStructure,
  performStaticCodeAnalysis,
};
