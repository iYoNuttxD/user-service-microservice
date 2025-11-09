import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { UserDomainService } from '../../../../src/domain/services/UserDomainService.js';

describe('UserDomainService', () => {
  let mockPasswordHasher;
  let userDomainService;

  beforeEach(() => {
    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn()
    };
    userDomainService = new UserDomainService(mockPasswordHasher);
  });

  describe('createUser', () => {
    it('should create a valid user', async () => {
      // Mock a realistic bcrypt hash (60 characters)
      mockPasswordHasher.hash.mockResolvedValue('$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

      const user = await userDomainService.createUser({
        email: 'user@example.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['user']
      });

      expect(user.email.value).toBe('user@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('SecurePass123');
    });

    it('should throw error for invalid password', async () => {
      await expect(userDomainService.createUser({
        email: 'user@example.com',
        password: 'short',
        firstName: 'John',
        lastName: 'Doe'
      })).rejects.toThrow('Password must be at least 8 characters');
    });

    it('should throw error for password without number', async () => {
      await expect(userDomainService.createUser({
        email: 'user@example.com',
        password: 'NoNumberHere',
        firstName: 'John',
        lastName: 'Doe'
      })).rejects.toThrow('Password must contain at least one number');
    });

    it('should throw error for password without letter', async () => {
      await expect(userDomainService.createUser({
        email: 'user@example.com',
        password: '12345678',
        firstName: 'John',
        lastName: 'Doe'
      })).rejects.toThrow('Password must contain at least one letter');
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        isActive: true,
        passwordHash: { value: 'hashed-password' },
        recordLogin: jest.fn()
      };

      mockPasswordHasher.compare.mockResolvedValue(true);

      const result = await userDomainService.authenticateUser(mockUser, 'correct-password');

      expect(result).toBe(mockUser);
      expect(mockUser.recordLogin).toHaveBeenCalled();
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith('correct-password', 'hashed-password');
    });

    it('should throw error for inactive user', async () => {
      const mockUser = {
        isActive: false,
        passwordHash: { value: 'hashed-password' }
      };

      await expect(userDomainService.authenticateUser(mockUser, 'password'))
        .rejects.toThrow('User account is not active');
    });

    it('should throw error for invalid password', async () => {
      const mockUser = {
        isActive: true,
        passwordHash: { value: 'hashed-password' }
      };

      mockPasswordHasher.compare.mockResolvedValue(false);

      await expect(userDomainService.authenticateUser(mockUser, 'wrong-password'))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('changeUserPassword', () => {
    it('should change password successfully', async () => {
      const mockUser = {
        passwordHash: { value: 'old-hashed-password' },
        changePassword: jest.fn()
      };

      mockPasswordHasher.compare
        .mockResolvedValueOnce(true)  // current password valid
        .mockResolvedValueOnce(false); // new password different

      mockPasswordHasher.hash.mockResolvedValue('new-hashed-password');

      await userDomainService.changeUserPassword(mockUser, 'oldPass123', 'newPass456');

      expect(mockUser.changePassword).toHaveBeenCalled();
    });

    it('should throw error if current password is incorrect', async () => {
      const mockUser = {
        passwordHash: { value: 'hashed-password' }
      };

      mockPasswordHasher.compare.mockResolvedValue(false);

      await expect(userDomainService.changeUserPassword(mockUser, 'wrong', 'newPass123'))
        .rejects.toThrow('Current password is incorrect');
    });

    it('should throw error if new password is same as current', async () => {
      const mockUser = {
        passwordHash: { value: 'hashed-password' }
      };

      mockPasswordHasher.compare
        .mockResolvedValueOnce(true)  // current password valid
        .mockResolvedValueOnce(true); // new password same as old

      await expect(userDomainService.changeUserPassword(mockUser, 'SecurePass123', 'SecurePass123'))
        .rejects.toThrow('New password must be different from current password');
    });
  });
});
