import { describe, it, expect } from '@jest/globals';
import { Email } from '../../../../src/domain/value-objects/Email.js';

describe('Email Value Object', () => {
  describe('constructor', () => {
    it('should create a valid email', () => {
      const email = new Email('user@example.com');
      expect(email.value).toBe('user@example.com');
    });

    it('should convert email to lowercase', () => {
      const email = new Email('User@Example.COM');
      expect(email.value).toBe('user@example.com');
    });

    it('should throw error for invalid email format', () => {
      expect(() => new Email('invalid-email')).toThrow('Invalid email format');
    });

    it('should throw error for empty email', () => {
      expect(() => new Email('')).toThrow('Email must be a non-empty string');
    });

    it('should throw error for email exceeding 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      expect(() => new Email(longEmail)).toThrow('Email must not exceed 255 characters');
    });
  });

  describe('equals', () => {
    it('should return true for equal emails', () => {
      const email1 = new Email('user@example.com');
      const email2 = new Email('user@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = new Email('user1@example.com');
      const email2 = new Email('user2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });
});
