/**
 * Password Validator Utility
 * Uses zxcvbn for advanced password strength analysis
 */

import zxcvbn from 'zxcvbn';

/**
 * Password strength result interface
 */
export interface PasswordStrength {
  score: number; // 0-4 (0=weak, 4=very strong)
  feedback: string[];
  isStrong: boolean;
  crackTime: string;
}

/**
 * Common passwords to reject immediately
 */
const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  'password1',
  '123456789',
  '1234567890',
  '12345678',
  'qwerty123',
  'qwertyuiop',
  'admin123',
  'letmein',
  'welcome',
  'welcome1',
  'monkey',
  'dragon',
  'abc123',
  'abc12345',
  '111111',
  '11111111',
  'iloveyou',
  'trustno1',
  'sunshine',
  'princess',
  'football',
  'baseball',
  'master',
  'michael',
  'shadow',
  'ashley',
  'fuckme',
  'fuckyou',
  'passw0rd',
  'p@ssword',
  'p@ssw0rd',
  'changeme',
  'temp1234',
  'test1234',
  'admin1234',
  'root1234',
  'secret',
  'secret123',
]);

/**
 * Blocked patterns that indicate weak passwords
 */
const BLOCKED_PATTERNS: RegExp[] = [
  // All same character (aaaaaaaa)
  /^(.)\1+$/,
  // Simple sequences
  /^(012|123|234|345|456|567|678|789|890)+$/,
  /^(098|987|876|765|654|543|432|321|210)+$/,
  // Keyboard patterns (horizontal)
  /^(qwerty|asdf|zxcv|qwer|asdfgh|zxcvbn)+$/i,
  // Keyboard patterns (vertical)
  /^(qaz|wsx|edc|rfv|tgb|yhn|ujm)+$/i,
  // Repeated pairs (abababab)
  /^(.{1,2})\1{3,}$/,
  // Sequential letters forward
  /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+$/i,
  // Sequential letters backward
  /^(zyx|yxw|xwv|wvu|vut|uts|tsr|srq|rqp|qpo|pon|onm|nml|mlk|lkj|kji|jih|ihg|hgf|gfe|fed|edc|dcb|cba)+$/i,
];

/**
 * Check if password matches any blocked pattern
 */
function matchesBlockedPattern(password: string): boolean {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(password)) {
      return true;
    }
  }
  return false;
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @param userInputs - User-related inputs to check against (email, name, etc.)
 * @returns Password strength analysis
 */
export function validatePasswordStrength(
  password: string,
  userInputs: string[] = []
): PasswordStrength {
  const feedback: string[] = [];

  // Check for empty/too short password
  if (!password || password.length < 8) {
    return {
      score: 0,
      feedback: ['Password must be at least 8 characters'],
      isStrong: false,
      crackTime: 'instant',
    };
  }

  // Check for too long password
  if (password.length > 128) {
    return {
      score: 0,
      feedback: ['Password must be less than 128 characters'],
      isStrong: false,
      crackTime: 'instant',
    };
  }

  // Check common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return {
      score: 0,
      feedback: ['This is a commonly used password'],
      isStrong: false,
      crackTime: 'instant',
    };
  }

  // Check blocked patterns
  if (matchesBlockedPattern(password)) {
    return {
      score: 0,
      feedback: ['Password contains a predictable pattern'],
      isStrong: false,
      crackTime: 'instant',
    };
  }

  // Check if password contains user info
  const lowerPassword = password.toLowerCase();
  for (const input of userInputs) {
    if (input && input.length >= 3) {
      const lowerInput = input.toLowerCase();
      if (lowerPassword.includes(lowerInput) || lowerInput.includes(lowerPassword)) {
        feedback.push('Password should not contain your personal information');
      }
    }
  }

  // Run zxcvbn analysis
  const result = zxcvbn(password, userInputs);

  // Add zxcvbn feedback
  if (result.feedback.warning) {
    feedback.push(result.feedback.warning);
  }
  feedback.push(...result.feedback.suggestions);

  // Additional suggestions
  if (password.length < 12) {
    feedback.push('Consider using at least 12 characters');
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password)) {
    feedback.push('Consider adding special characters');
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Consider adding uppercase letters');
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Consider adding lowercase letters');
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Consider adding numbers');
  }

  // Score >= 3 is considered strong
  const isStrong = result.score >= 3;

  return {
    score: result.score,
    feedback: [...new Set(feedback)], // Remove duplicates
    isStrong,
    crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second as string,
  };
}

/**
 * Zod refine function for password strength
 * @param password - Password to validate
 * @returns true if password is strong enough
 */
export function passwordStrengthRefine(password: string): boolean {
  const result = validatePasswordStrength(password);
  return result.isStrong;
}

/**
 * Get password strength label
 * @param score - zxcvbn score (0-4)
 * @returns Human-readable strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Strong';
    case 4:
      return 'Very Strong';
    default:
      return 'Unknown';
  }
}
