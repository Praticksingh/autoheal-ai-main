function calculateScore({ bugsFound, bugsFixed, analysisTime }) {
  const baseScore = 100;
  const unresolved = Math.max(bugsFound - bugsFixed, 0);
  const unresolvedPenalty = unresolved * 12;
  const timePenalty = Math.min(Math.floor(analysisTime / 1000 / 5), 15);

  return Math.max(baseScore - unresolvedPenalty - timePenalty, 0);
}

module.exports = {
  calculateScore,
};
