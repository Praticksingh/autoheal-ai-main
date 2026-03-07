function extractFailureLines(stderr = '') {
  return stderr
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.toLowerCase().includes('fail'))
    .slice(0, 10);
}

function analyzeBugs(testResult, detectedTestFiles) {
  if (testResult.skipped) {
    return {
      bugsFound: 0,
      bugsFixed: 0,
      failures: [],
      summary: 'No tests were executed.',
    };
  }

  if (testResult.passed) {
    return {
      bugsFound: 0,
      bugsFixed: 0,
      failures: [],
      summary: 'All tests passed.',
    };
  }

  const failures = extractFailureLines(testResult.stderr);
  const bugsFound = Math.max(failures.length, detectedTestFiles.length > 0 ? 1 : 0);
  const bugsFixed = 0;

  return {
    bugsFound,
    bugsFixed,
    failures,
    summary: `${bugsFound} potential issues found.`,
  };
}

module.exports = {
  analyzeBugs,
};
