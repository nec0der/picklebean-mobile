import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { Lobby } from '@/types/lobby';

export interface PendingGame {
  roomCode: string;
  type: 'lobby' | 'game';
  lobby: Lobby;
}

interface UsePendingGameReturn {
  pendingGame: PendingGame | null;
  loading: boolean;
}

export const usePendingGame = (suppressBanner: boolean = false): UsePendingGameReturn => {
  const [pendingGame, setPendingGame] = useState<PendingGame | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setPendingGame(null);
      setLoading(false);
      return;
    }

    // Query for lobbies where the current user is a participant
    const lobbiesRef = collection(firestore, 'lobbies');
    
    // Get lobbies from the last 24 hours that are not completed
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const q = query(
      lobbiesRef,
      where('createdAt', '>=', Timestamp.fromDate(twentyFourHoursAgo))
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let userPendingGame: PendingGame | null = null;

        snapshot.docs.forEach((doc) => {
          const lobby = { ...doc.data(), id: doc.id } as Lobby & { id: string };
          
          // Skip completed games
          if (lobby.gameCompletedAt) {
            return;
          }

          // Check if current user is in this lobby
          const isInTeam1 = 
            lobby.team1.player1?.uid === user.id || 
            lobby.team1.player2?.uid === user.id;
          const isInTeam2 = 
            lobby.team2.player1?.uid === user.id || 
            lobby.team2.player2?.uid === user.id;

          if (isInTeam1 || isInTeam2) {
            userPendingGame = {
              roomCode: lobby.roomCode,
              type: lobby.gameStarted ? 'game' : 'lobby',
              lobby
            };
          }
        });

        // Don't set pending game if banner is suppressed (during creation/joining)
        setPendingGame(suppressBanner ? null : userPendingGame);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching pending games:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, suppressBanner]);

  return { pendingGame, loading };
};
