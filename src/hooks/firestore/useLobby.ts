/**
 * useLobby Hook
 * Real-time lobby data listener
 */

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import type { Lobby } from '@/types/lobby';

interface UseLobbyReturn {
  lobby: Lobby | null;
  loading: boolean;
  error: Error | null;
  exists: boolean;
}

/**
 * Hook to listen to a lobby in real-time
 * @param roomCode - Room code to listen to
 * @returns Lobby data, loading state, error, and existence flag
 */
export const useLobby = (roomCode: string): UseLobbyReturn => {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    if (!roomCode) {
      setLoading(false);
      setExists(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      doc(firestore, 'lobbies', roomCode),
      (snapshot) => {
        setExists(snapshot.exists());

        if (snapshot.exists()) {
          setLobby({ ...snapshot.data() } as Lobby);
        } else {
          setLobby(null);
        }

        setLoading(false);
      },
      (err) => {
        console.error('Error listening to lobby:', err);
        setError(err as Error);
        setLoading(false);
        setExists(false);
      }
    );

    return () => unsubscribe();
  }, [roomCode]);

  return { lobby, loading, error, exists };
};
