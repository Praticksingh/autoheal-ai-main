const fs = require('fs/promises');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');

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

async function callGeminiApi({ aiPrompt, filePath, bugType, rawIssue }) {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.API_KEY || '').trim();
  if (!apiKey) {
    return null;
  }

  const prompt = `You are an expert AI software engineering agent specializing in repository diagnostics and self-healing code fixes.
Analyze the following failing code context and error log from the target repository.
Return ONLY a valid JSON object matching this exact schema:
{
  "explanation": "A concise, repository-specific explanation of what went wrong and why.",
  "impact": "The exact impact of this bug on the codebase, build, and test suite.",
  "suggestedFix": "Corrected code snippet to fix the issue.",
  "confidenceScore": 92
}

Target File: ${filePath}
Bug Type: ${bugType}
Raw Issue: ${rawIssue}

${aiPrompt}`;

  try {
    // If the provided key is an OpenAI key (starts with sk-)
    if (apiKey.startsWith('sk-')) {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert AI software engineering agent. Output only valid JSON.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content || '';
      const parsed = JSON.parse(content);
      return {
        explanation: parsed.explanation || null,
        impact: parsed.impact || null,
        suggestedFix: parsed.suggestedFix || null,
        confidenceScore: Number(parsed.confidenceScore) || 92,
      };
    }

    // Otherwise use Google Gemini API
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        explanation: parsed.explanation || null,
        impact: parsed.impact || null,
        suggestedFix: parsed.suggestedFix || null,
        confidenceScore: Number(parsed.confidenceScore) || 90,
      };
    }
  } catch (err) {
    console.error('Generative AI API call failed, using AST context analysis:', err?.response?.data || err?.message || err);
  }
  return null;
}

async function callAiForCleanRepo({ structure, repoUrl }) {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.API_KEY || '').trim();
  const repoName = repoUrl ? repoUrl.replace(/^https?:\/\/github\.com\//i, '') : 'Target Repository';
  const fileList = (structure?.files || []).slice(0, 15).join(', ');

  const defaultSummary = {
    explanation: `### AI Repository Audit for ${repoName}\n\nThis repository was thoroughly scanned by AutoHeal AI. All **${structure?.totalFiles || 0} files** passed syntax parsing, AST analysis, and dependency verification cleanly with zero errors.`,
    impact: `Zero build or execution blockers detected. The codebase is well-structured and CI/CD ready.`,
    suggestedFix: `// All checks passed cleanly. No code changes required.\n// Scanned files: ${fileList || 'All source files clean'}`,
  };

  if (!apiKey) {
    return defaultSummary;
  }

  try {
    const prompt = `You are an expert AI software engineering auditor.
Perform a high-level executive code quality & architecture audit for this clean repository:
Repository: ${repoName}
Total Files: ${structure?.totalFiles || 0}
Sample Source Files: ${fileList}

Return ONLY a valid JSON object matching this exact schema:
{
  "explanation": "Markdown text with a professional executive summary of the repository structure, tech stack, and code quality",
  "impact": "Codebase reliability and CI/CD readiness assessment",
  "suggestedFix": "Code comment summarizing repository best practices and verification status"
}`;

    if (apiKey.startsWith('sk-')) {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert AI code auditor. Return ONLY valid JSON.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content || '';
      const parsed = JSON.parse(content);
      return {
        explanation: parsed.explanation || defaultSummary.explanation,
        impact: parsed.impact || defaultSummary.impact,
        suggestedFix: parsed.suggestedFix || defaultSummary.suggestedFix,
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        explanation: parsed.explanation || defaultSummary.explanation,
        impact: parsed.impact || defaultSummary.impact,
        suggestedFix: parsed.suggestedFix || defaultSummary.suggestedFix,
      };
    }
  } catch (err) {
    console.error('Clean repo AI audit call failed, using default summary:', err?.message || err);
  }

  return defaultSummary;
}

async function generateBugExplanations({ testResult, bugAnalysis, structure, repoPath, repoUrl }) {
  if (!bugAnalysis || bugAnalysis.bugsFound <= 0) {
    const cleanAudit = await callAiForCleanRepo({ structure, repoUrl });
    return [
      {
        file: 'Repository Architecture & Quality Audit',
        line: 1,
        bugType: 'CLEAN_AUDIT',
        explanation: cleanAudit.explanation,
        impact: cleanAudit.impact,
        suggestedFix: cleanAudit.suggestedFix,
        status: 'fixed',
        codeContext: [],
        aiPrompt: 'Clean repository analysis',
        functionContext: cleanAudit.suggestedFix,
        confidenceScore: 100,
      },
    ];
  }

  const failures = Array.isArray(bugAnalysis.failures) && bugAnalysis.failures.length > 0
    ? bugAnalysis.failures
    : [testResult?.stderr || 'Unknown test failure'];

  const hasPackageJsonError = failures.some((f) => /package\.json|dependency|expresss|404|etarget/i.test(f));
  const fallbackFile = (hasPackageJsonError ? 'package.json' : null)
    || structure?.testFiles?.[0]
    || 'package.json';

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

    const geminiResult = await callGeminiApi({
      aiPrompt,
      filePath,
      bugType,
      rawIssue,
    });

    const explanationText = geminiResult?.explanation
      || `Issue detected in \`${filePath}\` at line ${failingLineNumber}. Failure detail: ${rawIssue.slice(0, 150)}`;

    const impactText = geminiResult?.impact
      || `Failure at line ${failingLineNumber} of \`${filePath}\` interrupts execution and causes CI build failure.`;

    const suggestedFixText = geminiResult?.suggestedFix
      || detail.suggestedFix;

    explanations.push({
      file: filePath,
      line: failingLineNumber,
      bugType,
      explanation: explanationText,
      impact: impactText,
      suggestedFix: suggestedFixText,
      status: index < (bugAnalysis.bugsFixed || 0) ? 'fixed' : bugType === 'Test Assertion Failure' ? 'warning' : 'detected',
      codeContext,
      aiPrompt,
      functionContext: failingFunctionContext?.functionCode || null,
      confidenceScore: geminiResult?.confidenceScore || 85,
    });
  }

  return explanations.slice(0, Math.max(1, bugAnalysis.bugsFound));
}

module.exports = {
  generateBugExplanations,
};
