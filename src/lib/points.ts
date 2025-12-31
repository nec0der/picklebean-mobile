/**
 * Points Calculation Utilities
 * Pure functions for ELO-style ranking calculations
 */

import type { UserRankings } from '@/types/user';

/**
 * Determines K-factor based on player experience
 * New players have higher volatility, experienced players more stable
 * @param gamesPlayed - Total games played by the player
 * @returns K-factor for ELO calculation
 */
export const getKFactor = (gamesPlayed: number): number => {
  if (gamesPlayed < 30) return 32;  // New players - volatile, fast learning
  if (gamesPlayed < 100) return 24; // Intermediate - stabilizing
  return 16;                         // Experienced - stable, established
};

/**
 * Calculates the expected score for a player based on rating difference
 * @param ratingA - Rating of player A
 * @param ratingB - Rating of player B
 * @returns Expected score between 0 and 1
 */
export const getExpectedScore = (ratingA: number, ratingB: number): number => {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

/**
 * Calculates points change for a single match with dynamic K-factor
 * @param winnerRating - Current rating of winner
 * @param loserRating - Current rating of loser
 * @param winnerGamesPlayed - Total games played by winner
 * @param loserGamesPlayed - Total games played by loser
 * @returns Points to add to winner (and subtract from loser)
 */
export const calculatePointsChange = (
  winnerRating: number,
  loserRating: number,
  winnerGamesPlayed: number,
  loserGamesPlayed: number
): number => {

  // Use average K-factor of both players
  const kFactor = (getKFactor(winnerGamesPlayed) + getKFactor(loserGamesPlayed)) / 2;
  
  const expectedScore = getExpectedScore(winnerRating, loserRating);
  const pointsChange = Math.round(kFactor * (1 - expectedScore));

  // Ensure minimum 1 point for any win
  return Math.max(1, pointsChange);
};

/**
 * Updates user rankings after a match
 * @param currentRankings - User's current rankings
 * @param category - Game category to update
 * @param pointsChange - Points to add (positive for win, negative for loss)
 * @returns Updated rankings object
 */
export const updateRankings = (
  currentRankings: UserRankings,
  category: 'singles' | 'sameGenderDoubles',
  pointsChange: number
): UserRankings => {
  const newRankings = { ...currentRankings };
  const currentPoints = newRankings[category];
  
  // Ensure rankings don't go below a minimum (e.g., 100)
  newRankings[category] = Math.max(100, currentPoints + pointsChange);
  
  return newRankings;
};

/**
 * Calculates average team rating for doubles matches
 * @param player1Rating - First player's rating
 * @param player2Rating - Second player's rating
 * @returns Average rating of the team
 */
export const getTeamRating = (player1Rating: number, player2Rating: number): number => {
  return Math.round((player1Rating + player2Rating) / 2);
};

/**
 * Calculates points change for doubles match (team vs team) with dynamic K-factor
 * @param team1Player1Rating - Team 1, Player 1 rating
 * @param team1Player2Rating - Team 1, Player 2 rating
 * @param team1Player1Games - Team 1, Player 1 games played
 * @param team1Player2Games - Team 1, Player 2 games played
 * @param team2Player1Rating - Team 2, Player 1 rating
 * @param team2Player2Rating - Team 2, Player 2 rating
 * @param team2Player1Games - Team 2, Player 1 games played
 * @param team2Player2Games - Team 2, Player 2 games played
 * @param team1Won - Whether team 1 won
 * @returns Points change for each player
 */
export const calculateDoublesPointsChange = (
  team1Player1Rating: number,
  team1Player2Rating: number,
  team1Player1Games: number,
  team1Player2Games: number,
  team2Player1Rating: number,
  team2Player2Rating: number,
  team2Player1Games: number,
  team2Player2Games: number,
  team1Won: boolean
): number => {
  const team1Rating = getTeamRating(team1Player1Rating, team1Player2Rating);
  const team2Rating = getTeamRating(team2Player1Rating, team2Player2Rating);
  
  // Calculate average games played for each team
  const team1AvgGames = Math.round((team1Player1Games + team1Player2Games) / 2);
  const team2AvgGames = Math.round((team2Player1Games + team2Player2Games) / 2);

  if (team1Won) {
    return calculatePointsChange(team1Rating, team2Rating, team1AvgGames, team2AvgGames);
  } else {
    return calculatePointsChange(team2Rating, team1Rating, team2AvgGames, team1AvgGames);
  }
};

/**
 * Gets the initial default rankings for a new user
 * @returns Default rankings object with 1000 points each
 */
export const getDefaultRankings = (): UserRankings => {
  return {
    singles: 1000,
    sameGenderDoubles: 1000,
  };
};
