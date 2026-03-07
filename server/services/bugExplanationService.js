const fs = require('fs/promises');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const FILE_LINE_REGEXES = [
  /([A-Za-z0-9_./\\-]+\.(?:js|jsx|ts|tsx|py|java|go|rb|php|c|cpp|cs)):(\d+)(?::\d+)?/,
  /\(([^()]+\.(?:js|jsx|ts|tsx|py|java|go|rb|php|c|cpp|cs)):(\d+)(?::\d+)?\)/,
  /at\s+([A-Za-z0-9_./\\-]+\.(?:js|jsx|ts|tsx|py|java|go|rb|php|c|cpp|cs))[:(](\d+)/i,
];

function detectBugType(input = '') {
  const line = input.toLowerCase();

  if (line.includes('syntaxerror') || line.includes('parsing error') || line.includes('unexpected token')) {
    return 'Syntax Error';
  }

  if (line.includes('cannot find module') || line.includes('module not found') || line.includes('import')) {
    return 'Import Error';
  }

  if (line.includes('typeerror') || line.includes('typescript') || line.includes('type mismatch')) {
    return 'Type Error';
  }

  if (line.includes('assert') || line.includes('expected') || line.includes('received')) {
    return 'Test Assertion Failure';
  }

  return 'Runtime Error';
}

function createExplanationByType(bugType, rawIssue) {
  if (bugType === 'Syntax Error') {
    return {
      explanation: `A syntax issue was detected in this file. ${rawIssue}`,
      impact: 'This prevents the JavaScript/TypeScript file from compiling and causes CI pipeline failure.',
      suggestedFix: 'Correct the syntax near the reported line (missing bracket/parenthesis/comma/semicolon) and rerun tests.',
    };
  }

  if (bugType === 'Import Error') {
    return {
      explanation: `A module import resolution issue was detected. ${rawIssue}`,
      impact: 'Build/test execution stops because required modules cannot be resolved in CI.',
      suggestedFix: 'Fix the import path, ensure the module exists, and verify dependency installation in package.json.',
    };
  }

  if (bugType === 'Type Error') {
    return {
      explanation: `A type compatibility issue was detected. ${rawIssue}`,
      impact: 'Type checks fail during CI and block build or test completion.',
      suggestedFix: 'Align argument/return/interface types at this location and rerun the test suite.',
    };
  }

  if (bugType === 'Test Assertion Failure') {
    return {
      explanation: `A test assertion is failing for this location. ${rawIssue}`,
      impact: 'CI test stage fails because expected runtime behavior does not match actual behavior.',
      suggestedFix: 'Review the implementation and expected output, then update code or test assertions accordingly.',
    };
  }

  return {
    explanation: `An execution error was detected around this location. ${rawIssue}`,
    impact: 'The failure interrupts test/build stages and causes CI pipeline failure.',
    suggestedFix: 'Inspect the surrounding logic, handle edge cases, and verify tests pass after applying changes.',
  };
}

function normalizeRelativePath(filePath) {
  return filePath.replace(/\\/g, '/').replace(/^\.?\//, '');
}

function parseIssueLocation(issueLine = '', fallbackFile = 'unknown', fallbackLine = 1) {
  for (const regex of FILE_LINE_REGEXES) {
    const match = issueLine.match(regex);
    if (match) {
      return {
        file: normalizeRelativePath(match[1]),
        line: Number(match[2]) || fallbackLine,
      };
    }
  }

  return {
    file: fallbackFile,
    line: fallbackLine,
  };
}

function isJavaScriptOrTypeScriptFile(filePath = '') {
  return /\.(js|jsx|ts|tsx)$/i.test(filePath);
}

function extractFunctionNodeByLine(fileContent, failingLineNumber) {
  const ast = parse(fileContent, {
    sourceType: 'unambiguous',
    plugins: [
      'typescript',
      'jsx',
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      'decorators-legacy',
      'objectRestSpread',
      'dynamicImport',
    ],
    errorRecovery: true,
  });

  let bestMatch = null;

  traverse(ast, {
    FunctionDeclaration(pathRef) {
      const node = pathRef.node;
      if (!node.loc) {
        return;
      }

      const { start, end } = node.loc;
      if (failingLineNumber < start.line || failingLineNumber > end.line) {
        return;
      }

      const currentSpan = end.line - start.line;
      const bestSpan = bestMatch ? bestMatch.loc.end.line - bestMatch.loc.start.line : Number.POSITIVE_INFINITY;
      if (currentSpan <= bestSpan) {
        bestMatch = node;
      }
    },
    FunctionExpression(pathRef) {
      const node = pathRef.node;
      if (!node.loc) {
        return;
      }

      const { start, end } = node.loc;
      if (failingLineNumber < start.line || failingLineNumber > end.line) {
        return;
      }

      const currentSpan = end.line - start.line;
      const bestSpan = bestMatch ? bestMatch.loc.end.line - bestMatch.loc.start.line : Number.POSITIVE_INFINITY;
      if (currentSpan <= bestSpan) {
        bestMatch = node;
      }
    },
    ArrowFunctionExpression(pathRef) {
      const node = pathRef.node;
      if (!node.loc) {
        return;
      }

      const { start, end } = node.loc;
      if (failingLineNumber < start.line || failingLineNumber > end.line) {
        return;
      }

      const currentSpan = end.line - start.line;
      const bestSpan = bestMatch ? bestMatch.loc.end.line - bestMatch.loc.start.line : Number.POSITIVE_INFINITY;
      if (currentSpan <= bestSpan) {
        bestMatch = node;
      }
    },
    ClassMethod(pathRef) {
      const node = pathRef.node;
      if (!node.loc) {
        return;
      }

      const { start, end } = node.loc;
      if (failingLineNumber < start.line || failingLineNumber > end.line) {
        return;
      }

      const currentSpan = end.line - start.line;
      const bestSpan = bestMatch ? bestMatch.loc.end.line - bestMatch.loc.start.line : Number.POSITIVE_INFINITY;
      if (currentSpan <= bestSpan) {
        bestMatch = node;
      }
    },
    ClassPrivateMethod(pathRef) {
      const node = pathRef.node;
      if (!node.loc) {
        return;
      }

      const { start, end } = node.loc;
      if (failingLineNumber < start.line || failingLineNumber > end.line) {
        return;
      }

      const currentSpan = end.line - start.line;
      const bestSpan = bestMatch ? bestMatch.loc.end.line - bestMatch.loc.start.line : Number.POSITIVE_INFINITY;
      if (currentSpan <= bestSpan) {
        bestMatch = node;
      }
    },
    ObjectMethod(pathRef) {
      const node = pathRef.node;
      if (!node.loc) {
        return;
      }

      const { start, end } = node.loc;
      if (failingLineNumber < start.line || failingLineNumber > end.line) {
        return;
      }

      const currentSpan = end.line - start.line;
      const bestSpan = bestMatch ? bestMatch.loc.end.line - bestMatch.loc.start.line : Number.POSITIVE_INFINITY;
      if (currentSpan <= bestSpan) {
        bestMatch = node;
      }
    },
  });

  return bestMatch;
}

function buildAiPromptFromFunction({ filePath, failingLineNumber, functionCode }) {
  return [
    `Analyze only this function from ${filePath}.`,
    `Failure occurred at line ${failingLineNumber}.`,
    'Function context:',
    '```ts',
    functionCode,
    '```',
  ].join('\n');
}

async function extractFailingFunctionContext(repoPath, filePath, failingLineNumber) {
  if (!repoPath || !filePath || !isJavaScriptOrTypeScriptFile(filePath)) {
    return null;
  }

  const safeRelativePath = normalizeRelativePath(filePath);
  const absolutePath = path.resolve(repoPath, safeRelativePath);
  const absoluteRepoPath = path.resolve(repoPath);

  if (!absolutePath.startsWith(absoluteRepoPath)) {
    return null;
  }

  try {
    const fileContent = await fs.readFile(absolutePath, 'utf8');
    const functionNode = extractFunctionNodeByLine(fileContent, failingLineNumber);

    if (!functionNode || !functionNode.loc) {
      return null;
    }

    const lines = fileContent.split(/\r?\n/);
    const startLine = functionNode.loc.start.line;
    const endLine = functionNode.loc.end.line;
    const functionCode = lines.slice(startLine - 1, endLine).join('\n');

    return {
      startLine,
      endLine,
      functionCode,
      aiPrompt: buildAiPromptFromFunction({
        filePath,
        failingLineNumber,
        functionCode,
      }),
    };
  } catch {
    return null;
  }
}

async function readCodeContext(repoPath, relativeFilePath, lineNumber, radius = 2) {
  if (!repoPath || !relativeFilePath || relativeFilePath === 'unknown') {
    return [];
  }

  const safeRelativePath = normalizeRelativePath(relativeFilePath);
  const absolutePath = path.resolve(repoPath, safeRelativePath);
  const absoluteRepoPath = path.resolve(repoPath);

  if (!absolutePath.startsWith(absoluteRepoPath)) {
    return [];
  }

  try {
    const content = await fs.readFile(absolutePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const start = Math.max(1, lineNumber - radius);
    const end = Math.min(lines.length, lineNumber + radius);
    const snippet = [];

    for (let current = start; current <= end; current += 1) {
      snippet.push({
        lineNumber: current,
        content: lines[current - 1] ?? '',
        isProblemLine: current === lineNumber,
      });
    }

    return snippet;
  } catch {
    return [];
  }
}

async function generateBugExplanations({ testResult, bugAnalysis, structure, repoPath }) {
  if (!bugAnalysis || bugAnalysis.bugsFound <= 0) {
    return [];
  }

  const fallbackFile = structure?.testFiles?.[0] || 'unknown';
  const failures = Array.isArray(bugAnalysis.failures) && bugAnalysis.failures.length > 0
    ? bugAnalysis.failures
    : [testResult?.stderr || 'Unknown test failure'];

  const explanations = [];
  for (let index = 0; index < failures.length; index += 1) {
    const rawIssue = failures[index] || 'Unknown failure';
    const location = parseIssueLocation(rawIssue, fallbackFile, index + 1);
    const filePath = location.file;
    const failingLineNumber = location.line;
    const bugType = detectBugType(rawIssue);
    const detail = createExplanationByType(bugType, rawIssue);
    const codeContext = await readCodeContext(repoPath, filePath, failingLineNumber);
    const failingFunctionContext = await extractFailingFunctionContext(repoPath, filePath, failingLineNumber);
    const fallbackPrompt = [
      `Analyze failure in ${filePath}.`,
      `Failure occurred at line ${failingLineNumber}.`,
      'Nearby code context:',
      codeContext
        .map((line) => `Line ${line.lineNumber}: ${line.content}`)
        .join('\n'),
    ].join('\n');
    const aiPrompt = failingFunctionContext?.aiPrompt || fallbackPrompt;

    explanations.push({
      file: filePath,
      line: failingLineNumber,
      bugType,
      explanation: detail.explanation,
      impact: detail.impact,
      suggestedFix: detail.suggestedFix,
      status: index < (bugAnalysis.bugsFixed || 0) ? 'fixed' : bugType === 'Test Assertion Failure' ? 'warning' : 'detected',
      codeContext,
      aiPrompt,
      functionContext: failingFunctionContext?.functionCode || null,
    });
  }

  return explanations.slice(0, Math.max(1, bugAnalysis.bugsFound));
}

module.exports = {
  generateBugExplanations,
};
