/**
 * Hook to calculate match stakes based on player ratings and experience
 * Fetches player data and calculates points for win/loss scenarios
 */

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { getTeamRating, calculatePointsChange } from '@/lib/points';

interface StakesData {
  team1Win: number;
  team1Loss: number;
  team2Win: number;
  team2Loss: number;
  team1Avg: number;
  team2Avg: number;
  loading: boolean;
  error: Error | null;
}

interface PlayerData {
  rating: number;
  gamesPlayed: number;
}

/**
 * Calculates match stakes for both teams showing win/loss scenarios
 * @param team1PlayerIds - Array of player UIDs on team 1
 * @param team2PlayerIds - Array of player UIDs on team 2
 * @param gameMode - Game mode (singles or doubles)
 * @param gameCategory - Specific category for rating lookup
 * @returns Stakes data with points for all scenarios
 */
export const useStakesCalculation = (
  team1PlayerIds: string[],
  team2PlayerIds: string[],
  gameMode: 'singles' | 'doubles',
  gameCategory: 'singles' | 'same_gender_doubles' | 'mixed_doubles'
): StakesData => {
  const [stakesData, setStakesData] = useState<StakesData>({
    team1Win: 0,
    team1Loss: 0,
    team2Win: 0,
    team2Loss: 0,
    team1Avg: 0,
    team2Avg: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const calculateStakes = async () => {
      try {
        setStakesData(prev => ({ ...prev, loading: true, error: null }));

        // Filter out empty strings
        const validTeam1Ids = team1PlayerIds.filter(id => id && id.trim() !== '');
        const validTeam2Ids = team2PlayerIds.filter(id => id && id.trim() !== '');

        // Check if we have all players
        const requiredPlayers = gameMode === 'singles' ? 1 : 2;
        if (validTeam1Ids.length < requiredPlayers || validTeam2Ids.length < requiredPlayers) {
          setStakesData(prev => ({ ...prev, loading: false }));
          return;
        }

        // Fetch player data from Firestore by UID
        const fetchPlayerData = async (playerId: string): Promise<PlayerData> => {
          const userDoc = await getDoc(doc(firestore, 'users', playerId));
          if (!userDoc.exists()) {
            throw new Error(`Player ${playerId} not found`);
          }

          const userData = userDoc.data();
          const rankings = userData.rankings || {};
          const matchStats = userData.matchStats || {};

          // Map game category to ranking key
          const rankingKey = gameCategory === 'singles' ? 'singles' : 'sameGenderDoubles';

          return {
            rating: rankings[rankingKey] || 1000,
            gamesPlayed: matchStats.totalMatches || 0,
          };
        };

        // Fetch data for all players
        const [team1Data, team2Data] = await Promise.all([
          Promise.all(validTeam1Ids.map(fetchPlayerData)),
          Promise.all(validTeam2Ids.map(fetchPlayerData)),
        ]);

        // Calculate team averages
        const team1Ratings = team1Data.map(p => p.rating);
        const team2Ratings = team2Data.map(p => p.rating);
        const team1Games = team1Data.map(p => p.gamesPlayed);
        const team2Games = team2Data.map(p => p.gamesPlayed);

        const team1Avg = gameMode === 'singles' 
          ? team1Ratings[0]
          : getTeamRating(team1Ratings[0], team1Ratings[1]);
        
        const team2Avg = gameMode === 'singles'
          ? team2Ratings[0]
          : getTeamRating(team2Ratings[0], team2Ratings[1]);

        const team1AvgGames = gameMode === 'singles'
          ? team1Games[0]
          : Math.round((team1Games[0] + team1Games[1]) / 2);

        const team2AvgGames = gameMode === 'singles'
          ? team2Games[0]
          : Math.round((team2Games[0] + team2Games[1]) / 2);

        // Calculate points for both scenarios
        // Team 1 wins
        const team1WinPoints = calculatePointsChange(
          team1Avg,
          team2Avg,
          team1AvgGames,
          team2AvgGames,
          false
        );

        // Team 2 wins
        const team2WinPoints = calculatePointsChange(
          team2Avg,
          team1Avg,
          team2AvgGames,
          team1AvgGames,
          false
        );

        setStakesData({
          team1Win: team1WinPoints,
          team1Loss: team2WinPoints, // What team 1 loses if team 2 wins
          team2Win: team2WinPoints,
          team2Loss: team1WinPoints, // What team 2 loses if team 1 wins
          team1Avg,
          team2Avg,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error calculating stakes:', error);
        setStakesData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error : new Error('Failed to calculate stakes'),
        }));
      }
    };

    calculateStakes();
  }, [team1PlayerIds, team2PlayerIds, gameMode, gameCategory]);

  return stakesData;
};
