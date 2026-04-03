/**
 * Unit Tests for Validation Functions
 */

import {
  validateEmail,
  validatePassword,
  validateUsername,
  sanitizeString,
} from '@/app/lib/validation';

describe('Validation Functions', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const result = validateEmail('test@example.com');

      expect(result.valid).toBe(true);
      expect(result.value).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const result = validateEmail('TEST@EXAMPLE.COM');

      expect(result.valid).toBe(true);
      expect(result.value).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const result = validateEmail('  test@example.com  ');

      expect(result.valid).toBe(true);
      expect(result.value).toBe('test@example.com');
    });

    it('should reject invalid email format', () => {
      const result = validateEmail('invalid-email');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject email without @', () => {
      const result = validateEmail('testexample.com');

      expect(result.valid).toBe(false);
    });

    it('should reject email without domain', () => {
      const result = validateEmail('test@');

      expect(result.valid).toBe(false);
    });

    it('should reject empty email', () => {
      const result = validateEmail('');

      expect(result.valid).toBe(false);
    });

    it('should reject null email', () => {
      const result = validateEmail(null);

      expect(result.valid).toBe(false);
    });

    it('should reject undefined email', () => {
      const result = validateEmail(undefined);

      expect(result.valid).toBe(false);
    });

    it('should accept email with subdomain', () => {
      const result = validateEmail('test@mail.example.com');

      expect(result.valid).toBe(true);
    });

    it('should accept email with plus sign', () => {
      const result = validateEmail('test+tag@example.com');

      expect(result.valid).toBe(true);
    });

    it('should accept email with dots', () => {
      const result = validateEmail('test.user@example.com');

      expect(result.valid).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('StrongPass123!');

      expect(result.valid).toBe(true);
      expect(result.value).toBe('StrongPass123!');
    });

    it('should reject short password', () => {
      const result = validatePassword('Short1!');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('8');
    });

    it('should reject password without uppercase', () => {
      const result = validatePassword('lowercase123!');

      expect(result.valid).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const result = validatePassword('UPPERCASE123!');

      expect(result.valid).toBe(false);
    });

    it('should reject password without number', () => {
      const result = validatePassword('NoNumbers!');

      expect(result.valid).toBe(false);
    });

    it('should reject password without special character', () => {
      const result = validatePassword('NoSpecial123');

      expect(result.valid).toBe(false);
    });

    it('should reject empty password', () => {
      const result = validatePassword('');

      expect(result.valid).toBe(false);
    });

    it('should reject null password', () => {
      const result = validatePassword(null);

      expect(result.valid).toBe(false);
    });

    it('should reject undefined password', () => {
      const result = validatePassword(undefined);

      expect(result.valid).toBe(false);
    });

    it('should accept password with multiple special characters', () => {
      const result = validatePassword('Complex@Pass#123');

      expect(result.valid).toBe(true);
    });

    it('should not trim password', () => {
      const result = validatePassword('  Password123!  ');

      // Should fail because spaces count towards length but not complexity
      expect(result.value).toBe('  Password123!  ');
    });
  });

  describe('validateUsername', () => {
    it('should validate correct username', () => {
      const result = validateUsername('TestUser');

      expect(result.valid).toBe(true);
      expect(result.value).toBe('TestUser');
    });

    it('should trim whitespace', () => {
      const result = validateUsername('  TestUser  ');

      expect(result.valid).toBe(true);
      expect(result.value).toBe('TestUser');
    });

    it('should reject short username', () => {
      const result = validateUsername('ab');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('3');
    });

    it('should reject long username', () => {
      const result = validateUsername('a'.repeat(31));

      expect(result.valid).toBe(false);
      expect(result.error).toContain('30');
    });

    it('should reject username with special characters', () => {
      const result = validateUsername('Test@User');

      expect(result.valid).toBe(false);
    });

    it('should accept username with numbers', () => {
      const result = validateUsername('TestUser123');

      expect(result.valid).toBe(true);
    });

    it('should accept username with underscore', () => {
      const result = validateUsername('Test_User');

      expect(result.valid).toBe(true);
    });

    it('should reject empty username', () => {
      const result = validateUsername('');

      expect(result.valid).toBe(false);
    });

    it('should reject null username', () => {
      const result = validateUsername(null);

      expect(result.valid).toBe(false);
    });

    it('should reject undefined username', () => {
      const result = validateUsername(undefined);

      expect(result.valid).toBe(false);
    });

    it('should reject username with spaces', () => {
      const result = validateUsername('Test User');

      expect(result.valid).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      const result = sanitizeString('  test  ');

      expect(result).toBe('test');
    });

    it('should remove HTML tags', () => {
      const result = sanitizeString('<script>alert("xss")</script>');

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    it('should handle empty string', () => {
      const result = sanitizeString('');

      expect(result).toBe('');
    });

    it('should handle null', () => {
      const result = sanitizeString(null);

      expect(result).toBe('');
    });

    it('should handle undefined', () => {
      const result = sanitizeString(undefined);

      expect(result).toBe('');
    });

    it('should preserve normal text', () => {
      const result = sanitizeString('Normal text 123');

      expect(result).toBe('Normal text 123');
    });

    it('should remove multiple HTML tags', () => {
      const result = sanitizeString('<div><p>Test</p></div>');

      expect(result).not.toContain('<div>');
      expect(result).not.toContain('<p>');
    });

    it('should handle special characters', () => {
      const result = sanitizeString('Test & Special < > Characters');

      expect(result).toBeDefined();
    });
  });
});
