/**
 * Play Now Engine Adapter Hook
 * Phase 0.5: Connects app state → readiness evaluation → engine output
 * Pure adapter - zero business logic
 */

import { useAuth } from '@/contexts/AuthContext';
import { MOCK_COURTS } from '@/mocks/courts';
import { evaluateReadiness } from './evaluateReadiness';
import { GO_FIXTURE } from './fixtures';
import type { PlayNowEngineOutput, EngineReadinessInput } from './types';

interface UsePlayNowEngineParams {
  location?: { lat: number; lng: number } | null;
}

export function usePlayNowEngine(params?: UsePlayNowEngineParams): PlayNowEngineOutput {
  const { userDocument } = useAuth();

  // Build readiness input from app state
  const input: EngineReadinessInput = {
    location: params?.location || null, // Phase 0.5: Accept location or fallback to null
    timeWindowMinutes: 60, // PHASE 0 STUB: Neutral default
    availableCourtsCount: MOCK_COURTS.length, // = 10 courts
    dataConfidence: "HIGH", // PHASE 0 STUB: Passes confidence check
    userSkill: userDocument?.rankings?.singles
      ? { rating: userDocument.rankings.singles, confidence: "MEDIUM" }
      : null,
  };

  // Evaluate readiness
  const readiness = evaluateReadiness(input);

  // Return engine output
  if (!readiness.passed) {
    return {
      type: "BLOCKED",
      readiness,
    };
  }

  return {
    type: "DECISION",
    readiness,
    result: GO_FIXTURE, // PHASE 0 STUB: Always GO until decision logic exists
  };
}
