/**
 * Play Now UI Types
 * Feature-local UI contract for Play Now flow
 * These are temporary scaffolding types, not shared domain models
 */

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export interface OutcomeBase {
  confidence: ConfidenceLevel;
  confidenceExplanation: string;
  primaryReason: string;
}

export interface GoOutcome extends OutcomeBase {
  kind: "GO";
  courtName: string;
  travelMinutes: number;
  estimatedWaitMinutes: number;
}

export interface DeferOutcome extends OutcomeBase {
  kind: "DEFER";
  courtName: string;
  reasonForDeferral: string;
  suggestedAction: string;
}

export interface AvoidOutcome extends OutcomeBase {
  kind: "AVOID";
  courtName: string;
  reasonForAvoidance: string;
  overrideAllowed: boolean;
}

export type PlayNowResult =
  | GoOutcome
  | DeferOutcome
  | AvoidOutcome;

/**
 * Engine Readiness Types
 * Represents the gate that determines if the engine can make a recommendation
 */

export interface EngineReadinessInput {
  location: { lat: number; lng: number } | null;
  timeWindowMinutes: number | null;
  availableCourtsCount: number;
  dataConfidence: "LOW" | "MEDIUM" | "HIGH";
  userSkill: { rating: number; confidence: "LOW" | "MEDIUM" | "HIGH" } | null;
}

export type EngineReadinessBlockerCode =
  | "NO_LOCATION"
  | "NO_TIME_WINDOW"
  | "NO_COURTS_AVAILABLE"
  | "LOW_DATA_CONFIDENCE"
  | "NO_USER_SKILL"
  | "NO_PLAY_NOW_INTENT";

export interface EngineReadinessBlocker {
  code: EngineReadinessBlockerCode;
  message: string;
}

export interface EngineReadinessResult {
  passed: boolean;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  blockers: EngineReadinessBlocker[];
}

/**
 * Engine Output Types
 * The engine returns exactly one of these shapes
 */

export type PlayNowEngineOutput =
  | {
      type: "BLOCKED";
      readiness: EngineReadinessResult;
    }
  | {
      type: "DECISION";
      readiness: EngineReadinessResult;
      result: PlayNowResult;
    };
