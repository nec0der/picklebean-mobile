/**
 * Play Now Fixtures
 * Static fixture data for visual UI testing
 */

import type { GoOutcome, DeferOutcome, AvoidOutcome, PlayNowEngineOutput } from './types';

export const GO_FIXTURE: GoOutcome = {
  kind: "GO",
  courtName: "Riverside Park Courts",
  travelMinutes: 8,
  estimatedWaitMinutes: 5,
  confidence: "HIGH",
  confidenceExplanation: "Based on 12 recent visits and current time patterns",
  primaryReason: "Great time to play at Riverside Park",
};

export const DEFER_FIXTURE: DeferOutcome = {
  kind: "DEFER",
  courtName: "Downtown Sports Complex",
  reasonForDeferral: "Travel time exceeds your available window",
  suggestedAction: "Try again after 3pm or choose a closer court",
  confidence: "MEDIUM",
  confidenceExplanation: "Based on travel estimates and court availability data from last 7 days",
  primaryReason: "Timing might not work for Downtown Sports Complex",
};

export const AVOID_FIXTURE: AvoidOutcome = {
  kind: "AVOID",
  courtName: "Elite Training Center",
  reasonForAvoidance: "Court typically hosts advanced players during this time",
  overrideAllowed: true,
  confidence: "LOW",
  confidenceExplanation: "Limited data - only 3 visits recorded",
  primaryReason: "Elite Training Center may not be beginner-friendly right now",
};

export const ALL_FIXTURES = [
  GO_FIXTURE,
  DEFER_FIXTURE,
  AVOID_FIXTURE,
] as const;

/**
 * Engine Output Fixtures
 * Unified fixtures matching PlayNowEngineOutput contract
 */

export const BLOCKED_FIXTURE: PlayNowEngineOutput = {
  type: "BLOCKED",
  readiness: {
    passed: false,
    confidence: "LOW",
    blockers: [
      {
        code: "NO_TIME_WINDOW",
        message: "Select how long you want to play"
      },
      {
        code: "NO_LOCATION",
        message: "Enable location to find nearby courts"
      }
    ]
  }
};

export const DECISION_GO_FIXTURE: PlayNowEngineOutput = {
  type: "DECISION",
  readiness: {
    passed: true,
    confidence: "HIGH",
    blockers: []
  },
  result: GO_FIXTURE
};

export const DECISION_DEFER_FIXTURE: PlayNowEngineOutput = {
  type: "DECISION",
  readiness: {
    passed: true,
    confidence: "MEDIUM",
    blockers: []
  },
  result: DEFER_FIXTURE
};

export const DECISION_AVOID_FIXTURE: PlayNowEngineOutput = {
  type: "DECISION",
  readiness: {
    passed: true,
    confidence: "LOW",
    blockers: []
  },
  result: AVOID_FIXTURE
};

export const ENGINE_FIXTURES = [
  BLOCKED_FIXTURE,
  DECISION_GO_FIXTURE,
  DECISION_DEFER_FIXTURE,
  DECISION_AVOID_FIXTURE,
] as const;

/**
 * Readiness Evaluation Test Fixtures
 * For testing evaluateReadiness() pure function
 */

import type { EngineReadinessInput } from './types';

export const READINESS_ALL_PASS: EngineReadinessInput = {
  location: { lat: 30.2672, lng: -97.7431 },
  timeWindowMinutes: 60,
  availableCourtsCount: 5,
  dataConfidence: "HIGH",
  userSkill: { rating: 1200, confidence: "MEDIUM" }
};

export const READINESS_NO_LOCATION: EngineReadinessInput = {
  location: null,
  timeWindowMinutes: 60,
  availableCourtsCount: 5,
  dataConfidence: "HIGH",
  userSkill: { rating: 1200, confidence: "MEDIUM" }
};

export const READINESS_MULTIPLE_BLOCKERS: EngineReadinessInput = {
  location: null,
  timeWindowMinutes: null,
  availableCourtsCount: 5,
  dataConfidence: "HIGH",
  userSkill: { rating: 1200, confidence: "MEDIUM" }
};

export const READINESS_ALL_BLOCKERS: EngineReadinessInput = {
  location: null,
  timeWindowMinutes: null,
  availableCourtsCount: 0,
  dataConfidence: "LOW",
  userSkill: null
};

export const READINESS_PASS_MEDIUM_CONFIDENCE: EngineReadinessInput = {
  location: { lat: 30.2672, lng: -97.7431 },
  timeWindowMinutes: 30,
  availableCourtsCount: 2,
  dataConfidence: "MEDIUM",
  userSkill: { rating: 1000, confidence: "LOW" }
};

export const READINESS_TEST_FIXTURES = [
  READINESS_ALL_PASS,
  READINESS_NO_LOCATION,
  READINESS_MULTIPLE_BLOCKERS,
  READINESS_ALL_BLOCKERS,
  READINESS_PASS_MEDIUM_CONFIDENCE,
] as const;
