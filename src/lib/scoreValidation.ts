/**
 * Pickleball Score Validation
 * 
 * Official Rules:
 * - First to 11 points
 * - Must win by 2 points
 * - If tied at 10-10, play continues until someone leads by 2
 */

export interface ScoreRange {
  min: number;
  max: number;
  explanation: string;
}

/**
 * Calculate valid score range for one team based on the other team's score.
 * This enforces pickleball scoring rules proactively.
 * 
 * @param otherTeamScore - The score of the other team
 * @returns Valid range and explanation for current team
 */
export function getValidScoreRange(otherTeamScore: number): ScoreRange {
  // If other team < 10: This team can be 0-9 (still playing) or 11 (won)
  if (otherTeamScore < 10) {
    return {
      min: 0,
      max: 11,
      explanation: `Can be 0-11 (game ends at 11-${otherTeamScore})`,
    };
  }
  
  // If other team = 10: This team can be 0-9 (losing), 10 (tied), or 12 (won after 10-10 tie)
  if (otherTeamScore === 10) {
    return {
      min: 0,
      max: 12,
      explanation: 'Can be 0-9 (losing), 10 (tied), or 12 (won after tie)',
    };
  }
  
  // If other team = 11: This team can be 0-9 (lost at 11) or 11-13 (extended game)
  if (otherTeamScore === 11) {
    return {
      min: 0,
      max: 13,
      explanation: 'Can be 0-9 (lost) or 11-13 (extended game)',
    };
  }
  
  // If other team > 11: Extended game, this team must be exactly ±2
  // Winner is 2 ahead, loser is 2 behind
  return {
    min: otherTeamScore - 2,
    max: otherTeamScore + 2,
    explanation: `Must be ${otherTeamScore - 2} (lost by 2) or ${otherTeamScore + 2} (won by 2)`,
  };
}

/**
 * Validate if a final score combination is valid according to pickleball rules.
 * 
 * @param team1Score - Team 1's final score
 * @param team2Score - Team 2's final score
 * @returns Validation result with error message if invalid
 */
export function isValidPickleballScore(
  team1Score: number, 
  team2Score: number
): { valid: boolean; error?: string } {
  // Check for tie
  if (team1Score === team2Score) {
    return { valid: false, error: 'Game cannot end in a tie - the winner must win by 2' };
  }
  
  const maxScore = Math.max(team1Score, team2Score);
  const minScore = Math.min(team1Score, team2Score);
  
  // At least one team must reach 11
  if (maxScore < 11) {
    return { valid: false, error: 'Game not complete - at least one team must reach 11 points' };
  }
  
  // If winner has exactly 11, loser must be 0-9
  if (maxScore === 11) {
    if (minScore >= 10) {
      return { valid: false, error: 'Score 11-10 is invalid - game must continue to 12-10 (win by 2)' };
    }
    return { valid: true };
  }
  
  // If winner > 11, this was an extended game (tied at 10-10+)
  // Winner must be exactly 2 ahead
  if (maxScore - minScore !== 2) {
    return { 
      valid: false, 
      error: `Score ${maxScore}-${minScore} is invalid - the winner must win by 2`,
    };
  }
  
  // Both teams must be 10+ in extended games
  if (minScore < 10) {
    return { 
      valid: false, 
      error: `Score ${maxScore}-${minScore} is invalid - game would've ended at 11-${minScore}`,
    };
  }
  
  return { valid: true };
}

/**
 * Clamp a score value within the valid range.
 * Used when ranges change and current value is outside new range.
 * 
 * @param value - Current score value
 * @param range - Valid score range
 * @returns Clamped value within range
 */
export function clampScoreToRange(value: number, range: ScoreRange): number {
  if (value < range.min) return range.min;
  if (value > range.max) return range.max;
  return value;
}

/**
 * Get a reasonable default score within a range.
 * Prefers 11 for winner, middle of range otherwise.
 * 
 * @param range - Valid score range
 * @param preferWinning - Whether to prefer a winning score (11+)
 * @returns Suggested default score
 */
export function getDefaultScoreInRange(range: ScoreRange, preferWinning = false): number {
  // If 11 is in range and we prefer winning, return 11
  if (preferWinning && range.min <= 11 && range.max >= 11) {
    return 11;
  }
  
  // If range is narrow (extended game), return min (loser's score)
  if (range.max - range.min <= 2) {
    return range.min;
  }
  
  // Otherwise return middle of range
  return Math.floor((range.min + range.max) / 2);
}
