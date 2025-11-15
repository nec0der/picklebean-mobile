/**
 * Points Calculation Utilities
 * Pure functions for ELO-style ranking calculations
 */

import type { UserRankings } from '@/types/user';

// K-factor determines how much ratings change per game
const K_FACTOR = 25;

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
 * Calculates points change for a single match
 * @param winnerRating - Current rating of winner
 * @param loserRating - Current rating of loser
 * @param isExhibition - Whether this is an exhibition match (no points change)
 * @returns Points to add to winner (and subtract from loser)
 */
export const calculatePointsChange = (
  winnerRating: number,
  loserRating: number,
  isExhibition = false
): number => {
  if (isExhibition) {
    return 0;
  }

  const expectedScore = getExpectedScore(winnerRating, loserRating);
  const pointsChange = Math.round(K_FACTOR * (1 - expectedScore));

  return pointsChange;
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
  category: 'singles' | 'sameGenderDoubles' | 'mixedDoubles',
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
 * Calculates points change for doubles match (team vs team)
 * @param team1Player1Rating - Team 1, Player 1 rating
 * @param team1Player2Rating - Team 1, Player 2 rating
 * @param team2Player1Rating - Team 2, Player 1 rating
 * @param team2Player2Rating - Team 2, Player 2 rating
 * @param team1Won - Whether team 1 won
 * @param isExhibition - Whether this is an exhibition match
 * @returns Points change for each player
 */
export const calculateDoublesPointsChange = (
  team1Player1Rating: number,
  team1Player2Rating: number,
  team2Player1Rating: number,
  team2Player2Rating: number,
  team1Won: boolean,
  isExhibition = false
): number => {
  if (isExhibition) {
    return 0;
  }

  const team1Rating = getTeamRating(team1Player1Rating, team1Player2Rating);
  const team2Rating = getTeamRating(team2Player1Rating, team2Player2Rating);

  if (team1Won) {
    return calculatePointsChange(team1Rating, team2Rating, false);
  } else {
    return calculatePointsChange(team2Rating, team1Rating, false);
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
    mixedDoubles: 1000,
  };
};
