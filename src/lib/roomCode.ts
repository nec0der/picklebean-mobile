/**
 * Room Code Utilities
 * Pure functions for room code generation, validation, and formatting
 */

/**
 * Generates a random 4-character alphanumeric room code
 * @returns Uppercase room code (e.g., "AB12")
 */
export const generateRoomCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
};

/**
 * Validates a room code format
 * @param code - Room code to validate
 * @returns true if code is 4 alphanumeric characters
 */
export const validateRoomCode = (code: string): boolean => {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Must be exactly 4 characters, alphanumeric only
  return /^[A-Z0-9]{4}$/.test(code);
};

/**
 * Alias for validateRoomCode for better naming
 * @param code - Room code to validate
 * @returns true if code is valid
 */
export const isValidRoomCode = validateRoomCode;

/**
 * Formats a room code to uppercase and removes whitespace
 * @param code - Raw room code input
 * @returns Formatted uppercase code without spaces
 */
export const formatRoomCode = (code: string): string => {
  if (!code || typeof code !== 'string') {
    return '';
  }
  
  return code.trim().toUpperCase().replace(/\s/g, '');
};

/**
 * Checks if a formatted room code is valid
 * @param code - Room code to check
 * @returns Error message if invalid, null if valid
 */
export const getRoomCodeError = (code: string): string | null => {
  const formatted = formatRoomCode(code);
  
  if (!formatted) {
    return 'Room code is required';
  }
  
  if (formatted.length !== 4) {
    return 'Room code must be 4 characters';
  }
  
  if (!validateRoomCode(formatted)) {
    return 'Room code must contain only letters and numbers';
  }
  
  return null;
};
