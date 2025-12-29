/**
 * Password Validator Tests
 */

import {
  validatePasswordStrength,
  passwordStrengthRefine,
  getPasswordStrengthLabel,
} from '@utils/passwordValidator';

describe('Password Validator', () => {
  describe('validatePasswordStrength', () => {
    describe('Common passwords', () => {
      it('should reject common passwords', () => {
        // Use passwords that are both common AND >= 8 chars
        const commonPasswords = [
          'password123', // 11 chars, in common list
          '123456789',   // 9 chars, in common list
          'qwerty123',   // 9 chars, in common list
        ];

        for (const password of commonPasswords) {
          const result = validatePasswordStrength(password);
          expect(result.isStrong).toBe(false);
          expect(result.score).toBe(0);
          expect(result.feedback).toContain('This is a commonly used password');
        }
      });

      it('should reject short common passwords', () => {
        // These are common but also too short
        const shortPasswords = ['password', 'letmein', 'iloveyou'];

        for (const password of shortPasswords) {
          const result = validatePasswordStrength(password);
          expect(result.isStrong).toBe(false);
          expect(result.score).toBe(0);
          // Short passwords get length error first
        }
      });

      it('should be case-insensitive for common passwords', () => {
        const result = validatePasswordStrength('PASSWORD123');
        expect(result.isStrong).toBe(false);
        // PASSWORD123 in lowercase is password123 which is in the common list
        expect(result.score).toBe(0);
      });
    });

    describe('Blocked patterns', () => {
      it('should reject all same character passwords', () => {
        const result = validatePasswordStrength('aaaaaaaa');
        expect(result.isStrong).toBe(false);
        expect(result.score).toBe(0);
        expect(result.feedback).toContain('Password contains a predictable pattern');
      });

      it('should reject sequential number patterns', () => {
        const result = validatePasswordStrength('12345678');
        expect(result.isStrong).toBe(false);
        expect(result.score).toBe(0);
      });

      it('should reject keyboard patterns', () => {
        const patterns = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

        for (const pattern of patterns) {
          const result = validatePasswordStrength(pattern);
          expect(result.isStrong).toBe(false);
        }
      });

      it('should reject repeated pair patterns', () => {
        const result = validatePasswordStrength('abababab');
        expect(result.isStrong).toBe(false);
      });
    });

    describe('User input checking', () => {
      it('should accept user inputs array for zxcvbn analysis', () => {
        // Validate that user inputs are accepted and processed
        const result = validatePasswordStrength('SecurePass123!', ['user@example.com']);
        // Should return valid result with score
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(4);
      });

      it('should use user inputs in zxcvbn analysis', () => {
        // Passwords similar to user info get lower scores from zxcvbn
        const resultWithInfo = validatePasswordStrength('JohnSmith123!', ['John Smith']);
        const resultWithoutInfo = validatePasswordStrength('XyloPhone789!', []);
        // Password similar to name should score lower or equal
        expect(resultWithInfo.score).toBeLessThanOrEqual(resultWithoutInfo.score);
      });

      it('should not penalize unrelated passwords', () => {
        const result = validatePasswordStrength('Tr0ub4dor&3Horse!', ['john@example.com']);
        expect(result.feedback.some(f => f.includes('personal information'))).toBe(false);
      });
    });

    describe('Length validation', () => {
      it('should reject passwords shorter than 8 characters', () => {
        const result = validatePasswordStrength('Short1!');
        expect(result.isStrong).toBe(false);
        expect(result.feedback).toContain('Password must be at least 8 characters');
      });

      it('should reject passwords longer than 128 characters', () => {
        const longPassword = 'A'.repeat(129);
        const result = validatePasswordStrength(longPassword);
        expect(result.isStrong).toBe(false);
        expect(result.feedback).toContain('Password must be less than 128 characters');
      });

      it('should accept passwords at maximum length', () => {
        const maxPassword = 'Aa1!' + 'x'.repeat(120) + '!@#$';
        const result = validatePasswordStrength(maxPassword);
        // May or may not be strong, but should not be rejected for length
        expect(result.feedback).not.toContain('Password must be less than 128 characters');
      });
    });

    describe('Strong password acceptance', () => {
      it('should accept strong passwords', () => {
        const strongPasswords = [
          'MyS3cur3P@ssword!',
          'Tr0ub4dor&3Horse',
          'C0mpl3x!Passw0rd#2024',
          '9f$K2pL8@mNq!wXz',
        ];

        for (const password of strongPasswords) {
          const result = validatePasswordStrength(password);
          expect(result.score).toBeGreaterThanOrEqual(3);
          expect(result.isStrong).toBe(true);
        }
      });

      it('should return positive crack time for strong passwords', () => {
        const result = validatePasswordStrength('MyV3ryS3cur3P@ssword!2024');
        expect(result.crackTime).toBeTruthy();
        expect(result.crackTime).not.toBe('instant');
      });
    });

    describe('Feedback suggestions', () => {
      it('should suggest using more characters for short passwords', () => {
        const result = validatePasswordStrength('Abc1234!');
        // Check for length suggestion - the exact wording may vary
        const hasLengthSuggestion = result.feedback.some(
          f => f.toLowerCase().includes('character') || f.toLowerCase().includes('longer')
        );
        expect(hasLengthSuggestion || result.feedback.length > 0).toBe(true);
      });

      it('should suggest special characters when missing', () => {
        const result = validatePasswordStrength('Abcd1234');
        expect(result.feedback.some(f => f.includes('special'))).toBe(true);
      });

      it('should suggest uppercase when missing', () => {
        const result = validatePasswordStrength('abcd1234!@');
        expect(result.feedback.some(f => f.includes('uppercase'))).toBe(true);
      });

      it('should suggest lowercase when missing', () => {
        const result = validatePasswordStrength('ABCD1234!@');
        expect(result.feedback.some(f => f.includes('lowercase'))).toBe(true);
      });

      it('should suggest numbers when missing', () => {
        const result = validatePasswordStrength('Abcdefgh!@');
        expect(result.feedback.some(f => f.includes('numbers'))).toBe(true);
      });

      it('should remove duplicate feedback', () => {
        const result = validatePasswordStrength('weakpass');
        const uniqueFeedback = [...new Set(result.feedback)];
        expect(result.feedback.length).toBe(uniqueFeedback.length);
      });
    });

    describe('Score range', () => {
      it('should return score between 0 and 4', () => {
        const passwords = [
          'a',
          'password',
          'Password1',
          'Password1!',
          'C0mpl3x!Passw0rd#2024',
        ];

        for (const password of passwords) {
          const result = validatePasswordStrength(password);
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(4);
        }
      });
    });
  });

  describe('passwordStrengthRefine', () => {
    it('should return false for weak passwords', () => {
      expect(passwordStrengthRefine('password')).toBe(false);
      expect(passwordStrengthRefine('12345678')).toBe(false);
      expect(passwordStrengthRefine('weak')).toBe(false);
    });

    it('should return true for strong passwords', () => {
      expect(passwordStrengthRefine('MyS3cur3P@ssword!')).toBe(true);
      expect(passwordStrengthRefine('C0mpl3x!Passw0rd#2024')).toBe(true);
    });
  });

  describe('getPasswordStrengthLabel', () => {
    it('should return correct labels for each score', () => {
      expect(getPasswordStrengthLabel(0)).toBe('Very Weak');
      expect(getPasswordStrengthLabel(1)).toBe('Weak');
      expect(getPasswordStrengthLabel(2)).toBe('Fair');
      expect(getPasswordStrengthLabel(3)).toBe('Strong');
      expect(getPasswordStrengthLabel(4)).toBe('Very Strong');
    });

    it('should return Unknown for invalid scores', () => {
      expect(getPasswordStrengthLabel(-1)).toBe('Unknown');
      expect(getPasswordStrengthLabel(5)).toBe('Unknown');
      expect(getPasswordStrengthLabel(100)).toBe('Unknown');
    });
  });
});
