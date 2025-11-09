import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { RegisterUserUseCase } from '../../../../src/features/users/application/usecases/RegisterUserUseCase.js';

describe('RegisterUserUseCase', () => {
  let mockUserRepository;
  let mockUserDomainService;
  let mockEventPublisher;
  let mockMetricsRegistry;
  let registerUserUseCase;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn()
    };

    mockUserDomainService = {
      createUser: jest.fn()
    };

    mockEventPublisher = {
      publish: jest.fn()
    };

    mockMetricsRegistry = {
      recordUserRegistered: jest.fn(),
      recordEventPublished: jest.fn()
    };

    registerUserUseCase = new RegisterUserUseCase(
      mockUserRepository,
      mockUserDomainService,
      mockEventPublisher,
      mockMetricsRegistry
    );
  });

  it('should register a new user successfully', async () => {
    const mockUser = {
      id: 'user-123',
      email: { value: 'user@example.com' },
      roles: [{ value: 'user' }],
      createdAt: new Date(),
      toPublic: jest.fn().mockReturnValue({
        id: 'user-123',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe'
      })
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserDomainService.createUser.mockResolvedValue(mockUser);
    mockUserRepository.save.mockResolvedValue(mockUser);
    mockEventPublisher.publish.mockResolvedValue();

    const result = await registerUserUseCase.execute({
      email: 'user@example.com',
      password: 'SecurePass123',
      firstName: 'John',
      lastName: 'Doe',
      roles: ['user']
    });

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(mockUserDomainService.createUser).toHaveBeenCalled();
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    expect(mockEventPublisher.publish).toHaveBeenCalledWith('user.created', expect.any(Object));
    expect(mockMetricsRegistry.recordUserRegistered).toHaveBeenCalled();
    expect(result).toEqual({
      id: 'user-123',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe'
    });
  });

  it('should throw error if user already exists', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing-user' });

    await expect(registerUserUseCase.execute({
      email: 'user@example.com',
      password: 'SecurePass123',
      firstName: 'John',
      lastName: 'Doe'
    })).rejects.toThrow('User with this email already exists');
  });

  it('should not fail if event publishing fails', async () => {
    const mockUser = {
      id: 'user-123',
      email: { value: 'user@example.com' },
      roles: [{ value: 'user' }],
      createdAt: new Date(),
      toPublic: jest.fn().mockReturnValue({ id: 'user-123' })
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserDomainService.createUser.mockResolvedValue(mockUser);
    mockUserRepository.save.mockResolvedValue(mockUser);
    mockEventPublisher.publish.mockRejectedValue(new Error('NATS error'));

    const result = await registerUserUseCase.execute({
      email: 'user@example.com',
      password: 'SecurePass123',
      firstName: 'John',
      lastName: 'Doe'
    });

    expect(result).toBeDefined();
    expect(mockMetricsRegistry.recordUserRegistered).toHaveBeenCalled();
  });
});
