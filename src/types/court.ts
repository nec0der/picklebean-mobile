/**
 * Court Type - LOCKED schema for court data
 * Comprehensive interface for all court attributes
 */

import {
  CourtSurface,
  CourtCondition,
  AccessType,
  LightingQuality,
  LightingControlType,
  ParkingType,
  ShadeType,
  ConfidenceLevel,
  CourtPhotoType,
} from './courtEnums';

export interface Court {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;

  // Physical court info
  courtSurface: CourtSurface;
  courtCondition: CourtCondition;
  numberOfCourts: number;

  // Lighting
  lighting: {
    available: boolean;
    quality: LightingQuality;
    controlType: LightingControlType;
    autoOffTime: string | null; // "23:00"
    notes?: string;
  };

  // Indoor / outdoor
  isIndoor: boolean;

  // Access & cost
  access: {
    type: AccessType;
    membershipFee: number | null;
    sessionFee: number | null;
    reservationRequired: boolean;
  };

  // Operating hours (per day)
  operatingHours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };

  // Amenities
  amenities: {
    parking: {
      available: boolean;
      type: ParkingType | null;
    };
    restrooms: boolean;
    waterFountain: boolean;
    bench: boolean;
    shade: ShadeType;
    wheelchairAccessible: boolean;
  };

  // Derived / computed (NOT manually edited)
  derived: {
    activePlayersNow: number;
    plannedGamesToday: number;
    matchesLast7Days: number;
    matchesLast30Days: number;
    // Session/presence data for pin state
    hasActiveSession: boolean;      // Is there an organized session happening?
    sessionAvatars?: string[];      // Avatar URLs for session cluster (max 3)
  };

  // Skill distribution
  skillStats: {
    avgElo: number;
    minElo: number;
    maxElo: number;
  };

  // Curation & verification
  curation: {
    curatedBy: string;
    curatedDate: string; // ISO
    confidenceLevel: ConfidenceLevel;
    lastVerified: string; // ISO
    verificationNotes?: string;
  };

  // Media
  photos: Array<{
    id: string;
    url: string;
    photoType: CourtPhotoType;
  }>;

  // Metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
  };
}
