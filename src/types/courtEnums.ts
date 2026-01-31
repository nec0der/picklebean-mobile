/**
 * Court Enums - LOCKED definitions for court data
 * These enums define all possible values for court attributes
 */

export enum CourtSurface {
  CONCRETE = "CONCRETE",
  ASPHALT = "ASPHALT",
  CLAY = "CLAY",
  GRASS = "GRASS",
  CARPET = "CARPET",
  OTHER = "OTHER",
}

export enum CourtCondition {
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  FAIR = "FAIR",
  POOR = "POOR",
}

export enum AccessType {
  PUBLIC = "PUBLIC",
  FREE_WITH_MEMBERSHIP = "FREE_WITH_MEMBERSHIP",
  FEE_PER_SESSION = "FEE_PER_SESSION",
  FEE_WITH_MEMBERSHIP = "FEE_WITH_MEMBERSHIP",
  PRIVATE = "PRIVATE",
  SCHOOL_ONLY = "SCHOOL_ONLY",
  HOTEL_GUEST_ONLY = "HOTEL_GUEST_ONLY",
}

export enum LightingQuality {
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  POOR = "POOR",
}

export enum LightingControlType {
  AUTO = "AUTO",
  MANUAL = "MANUAL",
  UNKNOWN = "UNKNOWN",
}

export enum ParkingType {
  FREE = "FREE",
  PAID = "PAID",
  LIMITED = "LIMITED",
  STREET_ONLY = "STREET_ONLY",
}

export enum ShadeType {
  FULL = "FULL",
  PARTIAL = "PARTIAL",
  NONE = "NONE",
}

export enum ConfidenceLevel {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum CourtPhotoType {
  COURT = "COURT",
  PARKING = "PARKING",
  ENTRANCE = "ENTRANCE",
  LIGHTING = "LIGHTING",
  OTHER = "OTHER",
}

export enum CourtReportType {
  INACCURATE_FEE = "INACCURATE_FEE",
  INCORRECT_HOURS = "INCORRECT_HOURS",
  LIGHTING_ISSUE = "LIGHTING_ISSUE",
  COURT_CONDITION = "COURT_CONDITION",
  OTHER = "OTHER",
}
