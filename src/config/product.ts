/**
 * Product Configuration
 * 
 * Determines which product variant to run.
 * Set via EXPO_PUBLIC_PRODUCT environment variable.
 */

import type { Product } from '@/types/product';

/**
 * Current active product
 * Reads from environment variable, defaults to 'ELO'
 */
export const CURRENT_PRODUCT: Product = 
  (process.env.EXPO_PUBLIC_PRODUCT as Product) || 'ELO';

/**
 * Convenience flags for conditional rendering
 */
export const isElo = CURRENT_PRODUCT === 'ELO';
export const isGravity = CURRENT_PRODUCT === 'GRAVITY';

/**
 * Get display name for current product
 */
export const getProductName = (): string => {
  switch (CURRENT_PRODUCT) {
    case 'ELO':
      return 'Picklebean ELO';
    case 'GRAVITY':
      return 'Picklebean Gravity';
    default:
      return 'Picklebean';
  }
};
