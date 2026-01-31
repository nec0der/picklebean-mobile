/**
 * Product Types
 * 
 * ELO - Original pickleball ranking app
 * GRAVITY - New product (TBD)
 */

export type Product = 'ELO' | 'GRAVITY';

export const PRODUCT = {
  ELO: 'ELO' as const,
  GRAVITY: 'GRAVITY' as const,
} as const;
