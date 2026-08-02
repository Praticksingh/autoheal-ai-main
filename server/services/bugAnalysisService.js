function extractFailureLines(stderr = '') {
  const lines = stderr
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => Boolean(line));

  const failureLines = lines.filter((line) => {
    const l = line.toLowerCase();
    return l.includes('fail') || l.includes('error') || l.includes('404') || l.includes('etarget') || l.includes('cannot find') || l.includes('import');
  });

  if (failureLines.length > 0) {
    return failureLines.slice(0, 10);
  }

  return lines.length > 0 ? [lines.slice(0, 3).join(' ')] : ['Unknown analysis failure'];
}

function analyzeBugs(testResult, detectedTestFiles, staticIssues = []) {
  if (Array.isArray(staticIssues) && staticIssues.length > 0) {
    const failures = staticIssues.map((issue) => issue.rawIssue);
    return {
      bugsFound: failures.length,
      bugsFixed: 0,
      failures,
      summary: `${failures.length} issue(s) detected during repository analysis.`,
      staticIssues,
    };
  }

  if (testResult.passed) {
    return {
      bugsFound: 0,
      bugsFixed: 0,
      failures: [],
      summary: testResult.skipped ? (testResult.reason || 'No test suite executed.') : 'All tests passed cleanly.',
    };
  }

  const rawError = testResult.stderr || testResult.reason || '';
  const failures = extractFailureLines(rawError);
  const bugsFound = Math.max(failures.length, 1);
  const bugsFixed = 0;

  return {
    bugsFound,
    bugsFixed,
    failures,
    summary: `${bugsFound} issue(s) detected during analysis.`,
  };
}

module.exports = {
  analyzeBugs,
};
