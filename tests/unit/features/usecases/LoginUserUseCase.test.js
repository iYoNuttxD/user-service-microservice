import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { LoginUserUseCase } from '../../../../src/features/users/application/usecases/LoginUserUseCase.js';

describe('LoginUserUseCase', () => {
  let mockUserRepository;
  let mockUserDomainService;
  let mockJwtIssuer;
  let mockMetricsRegistry;
  let loginUserUseCase;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      update: jest.fn()
    };

    mockUserDomainService = {
      authenticateUser: jest.fn()
    };

    mockJwtIssuer = {
      issueToken: jest.fn(),
      getExpiresIn: jest.fn()
    };

    mockMetricsRegistry = {
      recordLoginAttempt: jest.fn()
    };

    loginUserUseCase = new LoginUserUseCase(
      mockUserRepository,
      mockUserDomainService,
      mockJwtIssuer,
      mockMetricsRegistry
    );
  });

  it('should login user successfully', async () => {
    const mockUser = {
      id: 'user-123',
      email: { value: 'user@example.com' },
      lastLoginAt: new Date(),
      toPublic: jest.fn().mockReturnValue({
        id: 'user-123',
        email: 'user@example.com'
      })
    };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockUserDomainService.authenticateUser.mockResolvedValue(mockUser);
    mockUserRepository.update.mockResolvedValue(mockUser);
    mockJwtIssuer.issueToken.mockResolvedValue('jwt-token');
    mockJwtIssuer.getExpiresIn.mockReturnValue('1h');

    const result = await loginUserUseCase.execute({
      email: 'user@example.com',
      password: 'password123'
    });

    expect(result.token).toBe('jwt-token');
    expect(result.expiresIn).toBe('1h');
    expect(result.user).toBeDefined();
    expect(mockMetricsRegistry.recordLoginAttempt).toHaveBeenCalledWith(true);
  });

  it('should throw error for non-existent user', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(loginUserUseCase.execute({
      email: 'nonexistent@example.com',
      password: 'password123'
    })).rejects.toThrow('Invalid credentials');

    expect(mockMetricsRegistry.recordLoginAttempt).toHaveBeenCalledWith(false);
  });

  it('should record failed login attempt on error', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({ id: 'user-123' });
    mockUserDomainService.authenticateUser.mockRejectedValue(new Error('Invalid password'));

    await expect(loginUserUseCase.execute({
      email: 'user@example.com',
      password: 'wrong-password'
    })).rejects.toThrow();

    expect(mockMetricsRegistry.recordLoginAttempt).toHaveBeenCalledWith(false);
  });
});
