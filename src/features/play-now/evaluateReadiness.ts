/**
 * Engine Readiness Evaluation
 * Pure function - determines if engine can make a recommendation
 * No UI, no side effects, no async, deterministic
 */

import type { EngineReadinessInput, EngineReadinessResult, EngineReadinessBlocker } from './types';

export function evaluateReadiness(input: EngineReadinessInput): EngineReadinessResult {
  const blockers: EngineReadinessBlocker[] = [];

  // Check 1: Location
  if (input.location === null) {
    blockers.push({
      code: "NO_LOCATION",
      message: "Enable location to find nearby courts"
    });
  }

  // Check 2: Time Window
  if (input.timeWindowMinutes === null) {
    blockers.push({
      code: "NO_TIME_WINDOW",
      message: "Select how long you want to play"
    });
  }

  // Check 3: Courts Available
  if (input.availableCourtsCount === 0) {
    blockers.push({
      code: "NO_COURTS_AVAILABLE",
      message: "No courts available in your area"
    });
  }

  // Check 4: User Skill
  if (input.userSkill === null) {
    blockers.push({
      code: "NO_USER_SKILL",
      message: "We need to know your skill level"
    });
  }

  // Check 5: Data Confidence
  if (input.dataConfidence === "LOW") {
    blockers.push({
      code: "LOW_DATA_CONFIDENCE",
      message: "Not enough data to make a recommendation"
    });
  }

  // Calculate result
  const passed = blockers.length === 0;
  const confidence = passed ? input.dataConfidence : "LOW";

  return { passed, blockers, confidence };
}
