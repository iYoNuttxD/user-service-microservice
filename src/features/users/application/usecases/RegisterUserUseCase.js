import { ConflictError } from '../../../../infra/utils/errorHandling.js';

export class RegisterUserUseCase {
  constructor(userRepository, userDomainService, eventPublisher, metricsRegistry) {
    this.userRepository = userRepository;
    this.userDomainService = userDomainService;
    this.eventPublisher = eventPublisher;
    this.metricsRegistry = metricsRegistry;
  }

  async execute({ email, password, firstName, lastName, roles }) {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user using domain service
    const user = await this.userDomainService.createUser({
      email,
      password,
      firstName,
      lastName,
      roles
    });

    // Save user
    const savedUser = await this.userRepository.save(user);

    // Publish event
    try {
      await this.eventPublisher.publish('user.created', {
        userId: savedUser.id,
        email: savedUser.email.value,
        roles: savedUser.roles.map(r => r.value),
        createdAt: savedUser.createdAt
      });
      this.metricsRegistry?.recordEventPublished('user.created');
    } catch (error) {
      // Log but don't fail the registration
      console.error('Failed to publish user.created event', error);
    }

    // Record metrics
    this.metricsRegistry?.recordUserRegistered();

    return savedUser.toPublic();
  }
}
