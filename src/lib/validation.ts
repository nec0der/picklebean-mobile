/**
 * Validation Utilities
 * Pure functions for validating game data and business rules
 */

import type { Lobby, Player, Team } from '@/types/lobby';
import type { UserDocument } from '@/types/user';

/**
 * Checks if a lobby can accept more players
 * @param lobby - Lobby to check
 * @returns true if lobby has space for more players
 */
export const canJoinLobby = (lobby: Lobby): boolean => {
  if (lobby.gameStarted || lobby.gameCompleted) {
    return false;
  }

  const maxPlayers = lobby.gameMode === 'singles' ? 2 : 4;
  const currentPlayerCount = getPlayerCount(lobby);

  return currentPlayerCount < maxPlayers;
};

/**
 * Gets the total number of players in a lobby
 * @param lobby - Lobby to count players in
 * @returns Total player count
 */
export const getPlayerCount = (lobby: Lobby): number => {
  let count = 0;

  if (lobby.team1.player1) count++;
  if (lobby.team1.player2) count++;
  if (lobby.team2.player1) count++;
  if (lobby.team2.player2) count++;
  if (lobby.waitingPlayers) count += lobby.waitingPlayers.length;

  return count;
};

/**
 * Checks if a user is already in a lobby
 * @param lobby - Lobby to check
 * @param userId - User ID to look for
 * @returns true if user is in the lobby
 */
export const isUserInLobby = (lobby: Lobby, userId: string): boolean => {
  const allPlayers = [
    lobby.team1.player1,
    lobby.team1.player2,
    lobby.team2.player1,
    lobby.team2.player2,
    ...(lobby.waitingPlayers || []),
  ];

  return allPlayers.some((player) => player?.uid === userId);
};

/**
 * Checks if a team is full
 * @param team - Team to check
 * @param gameMode - Current game mode
 * @returns true if team is full
 */
export const isTeamFull = (team: Team, gameMode: 'singles' | 'doubles'): boolean => {
  if (gameMode === 'singles') {
    return !!team.player1;
  }
  // Doubles
  return !!team.player1 && !!team.player2;
};

/**
 * Checks if both teams are full and game can start
 * @param lobby - Lobby to check
 * @returns true if game can start
 */
export const canStartGame = (lobby: Lobby): boolean => {
  if (lobby.gameStarted || lobby.gameCompleted) {
    return false;
  }

  return isTeamFull(lobby.team1, lobby.gameMode) && isTeamFull(lobby.team2, lobby.gameMode);
};

/**
 * Checks if all players have confirmed the match score
 * @param confirmations - Score confirmations object
 * @param playerIds - Array of player IDs who need to confirm
 * @returns true if all players confirmed
 */
export const allPlayersConfirmed = (
  confirmations: { [playerId: string]: boolean } | undefined,
  playerIds: string[]
): boolean => {
  if (!confirmations) {
    return false;
  }

  return playerIds.every((playerId) => confirmations[playerId] === true);
};

/**
 * Validates a display name
 * @param name - Display name to validate
 * @returns Error message if invalid, null if valid
 */
export const validateDisplayName = (name: string): string | null => {
  if (!name || typeof name !== 'string') {
    return 'Display name is required';
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return 'Display name must be at least 2 characters';
  }

  if (trimmed.length > 50) {
    return 'Display name must be less than 50 characters';
  }

  return null;
};

/**
 * Validates user profile data for onboarding
 * @param data - Partial user data to validate
 * @returns Object with field-specific errors
 */
export const validateProfileData = (data: {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
}): {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
} => {
  const errors: Record<string, string> = {};

  if (!data.firstName?.trim()) {
    errors.firstName = 'First name is required';
  } else if (data.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  }

  if (!data.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  } else if (data.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  }

  if (!data.gender) {
    errors.gender = 'Gender is required';
  } else if (!['male', 'female', 'other'].includes(data.gender)) {
    errors.gender = 'Invalid gender selection';
  }

  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  } else {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (isNaN(birthDate.getTime())) {
      errors.dateOfBirth = 'Invalid date';
    } else if (age < 13) {
      errors.dateOfBirth = 'You must be at least 13 years old';
    } else if (age > 120) {
      errors.dateOfBirth = 'Please enter a valid date of birth';
    }
  }

  return errors;
};

/**
 * Checks if a user profile is complete
 * @param user - User document to check
 * @returns true if profile is complete
 */
export const isProfileComplete = (user: UserDocument | null): boolean => {
  if (!user) {
    return false;
  }

  return !!(
    user.firstName &&
    user.lastName &&
    user.gender &&
    user.dateOfBirth &&
    user.displayName
  );
};

/**
 * Determines which team a new player should join
 * @param lobby - Current lobby state
 * @returns 'team1', 'team2', or 'waiting'
 */
export const getTeamAssignment = (lobby: Lobby): 'team1' | 'team2' | 'waiting' => {
  const team1Full = isTeamFull(lobby.team1, lobby.gameMode);
  const team2Full = isTeamFull(lobby.team2, lobby.gameMode);

  if (!team1Full) {
    return 'team1';
  }

  if (!team2Full) {
    return 'team2';
  }

  return 'waiting';
};
