import { getValidScoreRange, isValidPickleballScore, clampScoreToRange } from '../scoreValidation';

describe('Pickleball Score Validation', () => {
  describe('getValidScoreRange', () => {
    it('allows 0-11 when other team has less than 10', () => {
      const range = getValidScoreRange(5);
      expect(range.min).toBe(0);
      expect(range.max).toBe(11);
    });

    it('allows 0-12 when other team has 10', () => {
      const range = getValidScoreRange(10);
      expect(range.min).toBe(0);
      expect(range.max).toBe(12);
    });

    it('allows 0-13 when other team has 11', () => {
      const range = getValidScoreRange(11);
      expect(range.min).toBe(0);
      expect(range.max).toBe(13);
    });

    it('requires ±2 for extended games (other team > 11)', () => {
      const range = getValidScoreRange(15);
      expect(range.min).toBe(13);
      expect(range.max).toBe(17);
    });
  });

  describe('isValidPickleballScore', () => {
    // Valid scores
    it('accepts 11-0 (quick win)', () => {
      expect(isValidPickleballScore(11, 0).valid).toBe(true);
    });

    it('accepts 11-9 (close win)', () => {
      expect(isValidPickleballScore(11, 9).valid).toBe(true);
    });

    it('accepts 12-10 (deuce game)', () => {
      expect(isValidPickleballScore(12, 10).valid).toBe(true);
    });

    it('accepts 15-13 (extended game)', () => {
      expect(isValidPickleballScore(15, 13).valid).toBe(true);
    });

    // Invalid scores
    it('rejects ties', () => {
      const result = isValidPickleballScore(10, 10);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('tied');
    });

    it('rejects scores where neither team reached 11', () => {
      const result = isValidPickleballScore(10, 8);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('11 points');
    });

    it('rejects 11-10 (should continue to 12-10)', () => {
      const result = isValidPickleballScore(11, 10);
      expect(result.valid).toBe(false);
    });

    it('rejects 20-8 (would have ended at 11-8)', () => {
      const result = isValidPickleballScore(20, 8);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("would've ended");
    });

    it('rejects 13-9 (loser must be 10+ in extended game)', () => {
      const result = isValidPickleballScore(13, 9);
      expect(result.valid).toBe(false);
    });

    it('rejects 13-10 (must win by exactly 2)', () => {
      const result = isValidPickleballScore(13, 10);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exactly 2');
    });
  });

  describe('clampScoreToRange', () => {
    it('returns value if within range', () => {
      const range = { min: 0, max: 11, explanation: '' };
      expect(clampScoreToRange(5, range)).toBe(5);
    });

    it('clamps to min if below', () => {
      const range = { min: 10, max: 12, explanation: '' };
      expect(clampScoreToRange(5, range)).toBe(10);
    });

    it('clamps to max if above', () => {
      const range = { min: 0, max: 11, explanation: '' };
      expect(clampScoreToRange(20, range)).toBe(11);
    });
  });
});
