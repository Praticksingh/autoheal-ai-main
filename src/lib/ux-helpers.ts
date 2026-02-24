/**
 * UX Helper Functions for Human-Centered Feedback
 */

import { type AgentRun, type AgentFix } from "./mock-data";

/**
 * Generate conversational system message based on run result
 */
export function getConversationalMessage(run: AgentRun): { title: string; subtitle: string; emoji: string } {
  if (run.status === "passed") {
    return {
      title: "All Good 🎉",
      subtitle: `Your pipeline is healthy. We found and fixed ${run.totalFixes} issue${run.totalFixes !== 1 ? "s" : ""} for you.`,
      emoji: "✓",
    };
  } else if (run.status === "failed") {
    return {
      title: "Needs Attention",
      subtitle: `Let's fix it together. ${run.totalFixes} issue${run.totalFixes !== 1 ? "s" : ""} identified and ready for review.`,
      emoji: "→",
    };
  }
  return {
    title: "Analysis in Progress",
    subtitle: "Our agents are working on your code. Hang tight...",
    emoji: "◆",
  };
}

/**
 * Find most common bug type from fixes
 */
export function getMostCommonBugType(
  fixes: AgentFix[]
): { type: string; count: number; suggestion: string } | null {
  if (fixes.length === 0) {
    return null;
  }

  const bugTypeCounts: Record<string, number> = {};
  fixes.forEach((fix) => {
    bugTypeCounts[fix.bugType] = (bugTypeCounts[fix.bugType] || 0) + 1;
  });

  const mostCommon = Object.entries(bugTypeCounts).sort(([, a], [, b]) => b - a)[0];
  if (!mostCommon) return null;

  const [type, count] = mostCommon;

  const suggestions: Record<string, string> = {
    SYNTAX: "Consider using a code formatter like Prettier to catch syntax issues automatically.",
    TYPE: "Enable strict TypeScript checks in your tsconfig.json to catch type mismatches earlier.",
    IMPORT: "Use import sorting tools like isort or ESLint to manage dependencies consistently.",
    LOGIC: "Add more unit tests to catch logic errors before they reach CI/CD pipelines.",
    LINT: "Set up ESLint with stricter rules in your pre-commit hooks.",
    INDENTATION: "Configure auto-formatting tools like Prettier to enforce consistent indentation.",
  };

  return {
    type,
    count,
    suggestion: suggestions[type] || "Keep improving your code quality with automated tools.",
  };
}

/**
 * Calculate time saved based on fixes
 * Assumes 20 minutes per manual bug fix
 */
export function calculateTimeSaved(fixCount: number): { minutes: number; hours: number; formatted: string } {
  const MINUTES_PER_FIX = 20;
  const totalMinutes = fixCount * MINUTES_PER_FIX;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let formatted = "";
  if (hours > 0) {
    formatted += `${hours} hour${hours !== 1 ? "s" : ""}`;
    if (minutes > 0) formatted += ` ${minutes} minute${minutes !== 1 ? "s" : ""}`;
  } else {
    formatted = `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  return { minutes: totalMinutes, hours, formatted };
}

/**
 * Get impact metrics for the run
 */
export function getImpactMetrics(run: AgentRun) {
  const timeSaved = calculateTimeSaved(run.totalFixes);
  const iterationsAvoided = Math.max(0, run.maxIterations - run.iterations);

  return {
    totalFixesApplied: run.totalFixes,
    timeSaved: timeSaved.formatted,
    timeSavedMinutes: timeSaved.minutes,
    iterationsAvoided,
    successRate: `${Math.round((run.totalFixes / (run.totalFixes + 1)) * 100)}%`,
  };
}

/**
 * Progress steps for the stepper component
 */
export const PROGRESS_STEPS = [
  {
    id: 1,
    title: "Cloning repository",
    description: "Setting up your codebase",
    icon: "GitBranch",
  },
  {
    id: 2,
    title: "Running tests",
    description: "Testing your code",
    icon: "Play",
  },
  {
    id: 3,
    title: "Identifying issues",
    description: "Finding bugs and problems",
    icon: "AlertCircle",
  },
  {
    id: 4,
    title: "Applying fixes",
    description: "Resolving issues",
    icon: "Wrench",
  },
  {
    id: 5,
    title: "Re-running CI",
    description: "Validating everything works",
    icon: "CheckCircle2",
  },
];
