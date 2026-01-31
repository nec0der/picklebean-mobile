/**
 * Mock court data with comprehensive Court schema
 * ~50 courts around Chicago metro area for clustering tests
 */

import type { Court } from '@/types/court';
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
} from '@/types/courtEnums';

// =============================================================================
// HELPER: Generate minimal court with randomized activity
// =============================================================================

const generateCourt = (
  id: string,
  name: string,
  lat: number,
  lng: number,
  config: {
    activePlayersNow?: number;
    hasActiveSession?: boolean;
    avatarCount?: number;
    isIndoor?: boolean;
    numberOfCourts?: number;
  } = {}
): Court => {
  const {
    activePlayersNow = Math.floor(Math.random() * 20),
    hasActiveSession = Math.random() > 0.6,
    avatarCount = Math.min(activePlayersNow, 5),
    isIndoor = Math.random() > 0.85,
    numberOfCourts = Math.floor(Math.random() * 8) + 2,
  } = config;

  // Generate avatar URLs
  const sessionAvatars = Array.from({ length: avatarCount }, (_, i) => 
    `https://i.pravatar.cc/150?u=${id}-user${i}`
  );

  return {
    id,
    name,
    latitude: lat,
    longitude: lng,
    address: `${Math.floor(Math.random() * 9999)} Example St, Chicago, IL`,
    
    courtSurface: Math.random() > 0.5 ? CourtSurface.CONCRETE : CourtSurface.ASPHALT,
    courtCondition: Math.random() > 0.7 ? CourtCondition.EXCELLENT : 
                    Math.random() > 0.4 ? CourtCondition.GOOD : CourtCondition.FAIR,
    numberOfCourts,
    
    lighting: {
      available: Math.random() > 0.2,
      quality: Math.random() > 0.5 ? LightingQuality.GOOD : LightingQuality.EXCELLENT,
      controlType: LightingControlType.AUTO,
      autoOffTime: '22:00',
    },
    
    isIndoor,
    
    access: {
      type: Math.random() > 0.6 ? AccessType.PUBLIC : AccessType.FEE_PER_SESSION,
      membershipFee: null,
      sessionFee: Math.random() > 0.5 ? 5 : null,
      reservationRequired: Math.random() > 0.7,
    },
    
    operatingHours: {
      monday: { open: '06:00', close: '22:00' },
      tuesday: { open: '06:00', close: '22:00' },
      wednesday: { open: '06:00', close: '22:00' },
      thursday: { open: '06:00', close: '22:00' },
      friday: { open: '06:00', close: '22:00' },
      saturday: { open: '07:00', close: '21:00' },
      sunday: { open: '07:00', close: '21:00' },
    },
    
    amenities: {
      parking: { available: true, type: ParkingType.FREE },
      restrooms: Math.random() > 0.3,
      waterFountain: Math.random() > 0.2,
      bench: true,
      shade: Math.random() > 0.5 ? ShadeType.PARTIAL : ShadeType.NONE,
      wheelchairAccessible: Math.random() > 0.3,
    },
    
    derived: {
      activePlayersNow,
      plannedGamesToday: Math.floor(Math.random() * 15),
      matchesLast7Days: Math.floor(Math.random() * 100),
      matchesLast30Days: Math.floor(Math.random() * 400),
      hasActiveSession: activePlayersNow > 0 ? hasActiveSession : false,
      sessionAvatars,
    },
    
    skillStats: {
      avgElo: 1100 + Math.floor(Math.random() * 300),
      minElo: 800 + Math.floor(Math.random() * 200),
      maxElo: 1400 + Math.floor(Math.random() * 400),
    },
    
    curation: {
      curatedBy: 'system',
      curatedDate: '2024-01-15T10:00:00Z',
      confidenceLevel: ConfidenceLevel.HIGH,
      lastVerified: '2024-01-20T14:30:00Z',
    },
    
    photos: [{
      id: `${id}-photo-1`,
      url: `https://picsum.photos/seed/${id}/800/600`,
      photoType: CourtPhotoType.COURT,
    }],
    
    metadata: {
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      isDeleted: false,
    },
  };
};

// =============================================================================
// MOCK COURTS - 50+ courts around Chicago metro
// Activity distribution: ~20% Full (red), ~40% Active (green), ~40% Empty (gray)
// Full = activePlayersNow >= numberOfCourts * 4
// =============================================================================

export const MOCK_COURTS: Court[] = [
  // === DOWNTOWN CHICAGO (Loop/Near North) - HIGH DENSITY ===
  // Full (red): 16 players on 4 courts = 100% capacity
  generateCourt('loop-1', 'Maggie Daley Park Courts', 41.8827, -87.6195, { activePlayersNow: 16, numberOfCourts: 4, hasActiveSession: true }),
  // Active (green): 8 players on 6 courts = 33% capacity
  generateCourt('loop-2', 'Grant Park Pickleball', 41.8758, -87.6189, { activePlayersNow: 8, numberOfCourts: 6, hasActiveSession: false }),
  // Full (red): 20 players on 5 courts = 100% capacity
  generateCourt('loop-3', 'Millennium Park Courts', 41.8826, -87.6226, { activePlayersNow: 20, numberOfCourts: 5, hasActiveSession: true }),
  // Empty (gray): 0 players
  generateCourt('loop-4', 'Lake Shore East', 41.8870, -87.6160, { activePlayersNow: 0, numberOfCourts: 3, hasActiveSession: false }),
  // Active (green): 6 players on 4 courts = 37% capacity
  generateCourt('loop-5', 'Streeterville Courts', 41.8920, -87.6180, { activePlayersNow: 6, numberOfCourts: 4, hasActiveSession: true }),
  
  // === NORTH SIDE (Lincoln Park, Lakeview, Wrigleyville) ===
  // Full (red): 12 players on 3 courts = 100%
  generateCourt('north-1', 'Lincoln Park Courts', 41.9216, -87.6366, { activePlayersNow: 12, numberOfCourts: 3, hasActiveSession: true }),
  // Active (green): 5 players on 4 courts = 31%
  generateCourt('north-2', 'Oz Park Pickleball', 41.9194, -87.6470, { activePlayersNow: 5, numberOfCourts: 4, hasActiveSession: false }),
  // Empty (gray): 0 players
  generateCourt('north-3', 'Wrigleyville Recreation', 41.9484, -87.6553, { activePlayersNow: 0, numberOfCourts: 4, hasActiveSession: false }),
  // Empty (gray): 0 players
  generateCourt('north-4', 'Montrose Harbor Courts', 41.9630, -87.6380, { activePlayersNow: 0, numberOfCourts: 6, hasActiveSession: false }),
  // Full (red): 16 players on 4 courts = 100%
  generateCourt('north-5', 'Waveland Courts', 41.9490, -87.6360, { activePlayersNow: 16, numberOfCourts: 4, hasActiveSession: true }),
  // Active (green): 3 players on 2 courts = 37%
  generateCourt('north-6', 'Belmont Harbor', 41.9410, -87.6380, { activePlayersNow: 3, numberOfCourts: 2, hasActiveSession: false }),
  // Active (green): 8 players on 6 courts = 33%
  generateCourt('north-7', 'Diversey Harbor Courts', 41.9320, -87.6350, { activePlayersNow: 8, numberOfCourts: 6, hasActiveSession: false }),
  
  // === WEST SIDE (Humboldt, Logan Square, Wicker Park) ===
  // Empty (gray): 0 players
  generateCourt('west-1', 'Humboldt Park Recreation', 41.9070, -87.7020, { activePlayersNow: 0, numberOfCourts: 4, hasActiveSession: false }),
  // Active (green): 4 players on 3 courts = 33%
  generateCourt('west-2', 'Palmer Square Courts', 41.9210, -87.7080, { activePlayersNow: 4, numberOfCourts: 3, hasActiveSession: false }),
  // Active (green): 7 players on 4 courts = 43%
  generateCourt('west-3', 'Wicker Park Courts', 41.9085, -87.6775, { activePlayersNow: 7, numberOfCourts: 4, hasActiveSession: true }),
  // Empty (gray): 0 players
  generateCourt('west-4', 'Ukrainian Village Rec', 41.9020, -87.6820, { activePlayersNow: 0, numberOfCourts: 2, hasActiveSession: false }),
  // Empty (gray): 0 players
  generateCourt('west-5', 'Garfield Park', 41.8810, -87.7180, { activePlayersNow: 0, numberOfCourts: 3, hasActiveSession: false }),
  
  // === SOUTH SIDE (Hyde Park, Bronzeville, South Loop) ===
  // Active (green): 5 players on 6 courts = 20%
  generateCourt('south-1', 'Jackson Park Courts', 41.7838, -87.5806, { activePlayersNow: 5, numberOfCourts: 6, hasActiveSession: false }),
  // Empty (gray): 0 players
  generateCourt('south-2', 'Washington Park', 41.7940, -87.6110, { activePlayersNow: 0, numberOfCourts: 4, hasActiveSession: false }),
  // Full (red): 8 players on 2 courts = 100%
  generateCourt('south-3', 'Hyde Park YMCA', 41.7920, -87.5920, { activePlayersNow: 8, numberOfCourts: 2, hasActiveSession: true, isIndoor: true }),
  // Active (green): 6 players on 4 courts = 37%
  generateCourt('south-4', 'Bronzeville Courts', 41.8180, -87.6170, { activePlayersNow: 6, numberOfCourts: 4, hasActiveSession: false }),
  // Full (red): 12 players on 3 courts = 100%
  generateCourt('south-5', 'South Loop Recreation', 41.8550, -87.6250, { activePlayersNow: 12, numberOfCourts: 3, hasActiveSession: true }),
  // Empty (gray): 0 players
  generateCourt('south-6', 'Midway Plaisance', 41.7880, -87.6000, { activePlayersNow: 0, numberOfCourts: 4, hasActiveSession: false }),
  
  // === NORTHWEST SUBURBS (Schaumburg, Arlington Heights, Hoffman) ===
  // Full (red): 24 players on 6 courts = 100%
  generateCourt('nw-1', 'Schaumburg Park District', 42.0334, -88.0834, { activePlayersNow: 24, numberOfCourts: 6, hasActiveSession: true }),
  // Active (green): 9 players on 5 courts = 45%
  generateCourt('nw-2', 'Arlington Heights Courts', 42.0884, -87.9806, { activePlayersNow: 9, numberOfCourts: 5, hasActiveSession: true }),
  // Empty (gray): 0 players
  generateCourt('nw-3', 'Hoffman Estates Rec', 42.0630, -88.1230, { activePlayersNow: 0, numberOfCourts: 4, hasActiveSession: false }),
  // Active (green): 5 players on 4 courts = 31%
  generateCourt('nw-4', 'Palatine Courts', 42.1103, -88.0343, { activePlayersNow: 5, numberOfCourts: 4, hasActiveSession: false }),
  // Active (green): 7 players on 4 courts = 43%
  generateCourt('nw-5', 'Rolling Meadows Park', 42.0742, -88.0131, { activePlayersNow: 7, numberOfCourts: 4, hasActiveSession: true }),
  // Empty (gray): 0 players
  generateCourt('nw-6', 'Elk Grove Village', 42.0040, -87.9700, { activePlayersNow: 0, numberOfCourts: 3, hasActiveSession: false }),
  // Full (red): 16 players on 4 courts = 100%
  generateCourt('nw-7', 'Mount Prospect Courts', 42.0642, -87.9373, { activePlayersNow: 16, numberOfCourts: 4, hasActiveSession: true }),
  // Active (green): 11 players on 5 courts = 55%
  generateCourt('nw-8', 'Des Plaines Recreation', 42.0334, -87.8834, { activePlayersNow: 11, numberOfCourts: 5, hasActiveSession: true }),
  
  // === NORTH SUBURBS (Evanston, Skokie, Wilmette) ===
  // Full (red): 16 players on 4 courts = 100%
  generateCourt('nsub-1', 'Evanston Lakefront', 42.0451, -87.6878, { activePlayersNow: 16, numberOfCourts: 4, hasActiveSession: true }),
  // Active (green): 7 players on 4 courts = 43%
  generateCourt('nsub-2', 'Skokie Sports Park', 42.0324, -87.7334, { activePlayersNow: 7, numberOfCourts: 4, hasActiveSession: false }),
  // Empty (gray): 0 players
  generateCourt('nsub-3', 'Wilmette Park', 42.0724, -87.7234, { activePlayersNow: 0, numberOfCourts: 3, hasActiveSession: false }),
  // Active (green): 9 players on 5 courts = 45%
  generateCourt('nsub-4', 'Glenview Courts', 42.0697, -87.7878, { activePlayersNow: 9, numberOfCourts: 5, hasActiveSession: true }),
  // Empty (gray): 0 players
  generateCourt('nsub-5', 'Northbrook Recreation', 42.1275, -87.8289, { activePlayersNow: 0, numberOfCourts: 4, hasActiveSession: false }),
  // Active (green): 8 players on 4 courts = 50%
  generateCourt('nsub-6', 'Highland Park', 42.1817, -87.8003, { activePlayersNow: 8, numberOfCourts: 4, hasActiveSession: true }),
  
  // === WEST SUBURBS (Oak Park, Naperville, Downers Grove) ===
  // Full (red): 12 players on 3 courts = 100%
  generateCourt('wsub-1', 'Oak Park Courts', 41.8850, -87.7845, { activePlayersNow: 12, numberOfCourts: 3, hasActiveSession: true }),
  // Full (red): 32 players on 8 courts = 100%
  generateCourt('wsub-2', 'Naperville Riverwalk', 41.7508, -88.1535, { activePlayersNow: 32, numberOfCourts: 8, hasActiveSession: true }),
  // Active (green): 8 players on 5 courts = 40%
  generateCourt('wsub-3', 'Downers Grove Park', 41.8089, -88.0112, { activePlayersNow: 8, numberOfCourts: 5, hasActiveSession: false }),
  // Empty (gray): 0 players
  generateCourt('wsub-4', 'Elmhurst Courts', 41.8995, -87.9403, { activePlayersNow: 0, numberOfCourts: 4, hasActiveSession: false }),
  // Active (green): 6 players on 4 courts = 37%
  generateCourt('wsub-5', 'Wheaton Recreation', 41.8661, -88.1070, { activePlayersNow: 6, numberOfCourts: 4, hasActiveSession: false }),
  // Empty (gray): 0 players
  generateCourt('wsub-6', 'Glen Ellyn Park', 41.8775, -88.0670, { activePlayersNow: 0, numberOfCourts: 3, hasActiveSession: false }),
  // Active (green): 5 players on 3 courts = 41%
  generateCourt('wsub-7', 'Lombard Courts', 41.8800, -88.0078, { activePlayersNow: 5, numberOfCourts: 3, hasActiveSession: false }),
  // Full (red): 16 players on 4 courts = 100%
  generateCourt('wsub-8', 'Hinsdale Recreation', 41.8008, -87.9370, { activePlayersNow: 16, numberOfCourts: 4, hasActiveSession: true }),
  
  // === SOUTH SUBURBS (Orland Park, Tinley Park, Mokena) ===
  // Full (red): 20 players on 5 courts = 100%
  generateCourt('ssub-1', 'Orland Park Recreation', 41.6303, -87.8539, { activePlayersNow: 20, numberOfCourts: 5, hasActiveSession: true }),
  // Active (green): 6 players on 4 courts = 37%
  generateCourt('ssub-2', 'Tinley Park Courts', 41.5731, -87.7845, { activePlayersNow: 6, numberOfCourts: 4, hasActiveSession: false }),
  // Empty (gray): 0 players
  generateCourt('ssub-3', 'Mokena Park', 41.5267, -87.8892, { activePlayersNow: 0, numberOfCourts: 3, hasActiveSession: false }),
  // Active (green): 5 players on 3 courts = 41%
  generateCourt('ssub-4', 'Frankfort Courts', 41.4958, -87.8487, { activePlayersNow: 5, numberOfCourts: 3, hasActiveSession: true }),
  
  // === FAR NORTHWEST (Huntley, Algonquin area) ===
  // Full (red): 32 players on 8 courts = 100%
  generateCourt('fnw-1', 'Del Webb Sun City Courts', 42.1825, -88.4210, { activePlayersNow: 32, numberOfCourts: 8, hasActiveSession: true }),
  // Active (green): 6 players on 4 courts = 37%
  generateCourt('fnw-2', 'Huntley Lions Park', 42.1680, -88.4220, { activePlayersNow: 6, numberOfCourts: 4, hasActiveSession: false }),
  // Empty (gray): 0 players
  generateCourt('fnw-3', 'Deicke Park Courts', 42.1610, -88.4380, { activePlayersNow: 0, numberOfCourts: 3, hasActiveSession: false }),
  // Active (green): 1 player on 2 courts = 12%
  generateCourt('fnw-4', 'Algonquin Lakes Recreation', 42.1710, -88.4870, { activePlayersNow: 1, numberOfCourts: 2, hasActiveSession: false }),
  // Full (red): 12 players on 3 courts = 100%
  generateCourt('fnw-5', 'Square Barn Recreation', 42.1830, -88.3950, { activePlayersNow: 12, numberOfCourts: 3, hasActiveSession: true, isIndoor: true }),
  // Active (green): 8 players on 4 courts = 50%
  generateCourt('fnw-6', 'Crystal Lake Courts', 42.2411, -88.3162, { activePlayersNow: 8, numberOfCourts: 4, hasActiveSession: true }),
  // Empty (gray): 0 players
  generateCourt('fnw-7', 'Lake in the Hills', 42.1817, -88.3306, { activePlayersNow: 0, numberOfCourts: 3, hasActiveSession: false }),
];

// =============================================================================
// LEGACY EXPORT (Backward compatibility)
// =============================================================================

export interface MockCourt {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  activityLevel: 'low' | 'medium' | 'high';
  address?: string;
}

export const LEGACY_MOCK_COURTS: MockCourt[] = MOCK_COURTS.map(court => ({
  id: court.id,
  name: court.name,
  latitude: court.latitude,
  longitude: court.longitude,
  address: court.address,
  activityLevel: 
    court.derived.activePlayersNow >= 12 ? 'high' :
    court.derived.activePlayersNow >= 6 ? 'medium' : 'low',
}));
