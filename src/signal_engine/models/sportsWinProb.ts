export function sportsWinProb(homeScore: number, awayScore: number): number {
  const diff = homeScore - awayScore;
  const raw = 0.5 + diff * 0.06;
  return Math.max(0.02, Math.min(0.98, raw));
}
