import { NotFoundError, UnauthorizedError } from '../../../../infra/utils/errorHandling.js';

export class UpdateUserProfileUseCase {
  constructor(userRepository, userDomainService, eventPublisher, metricsRegistry) {
    this.userRepository = userRepository;
    this.userDomainService = userDomainService;
    this.eventPublisher = eventPublisher;
    this.metricsRegistry = metricsRegistry;
  }

  async execute({ userId, requestingUserId, updates }) {
    // Check if user is updating their own profile
    if (userId !== requestingUserId) {
      throw new UnauthorizedError('You can only update your own profile');
    }

    // Validate updates
    this.userDomainService.validateProfileUpdate(updates);

    // Get user
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update profile
    user.updateProfile(updates);

    // Save updated user
    const updatedUser = await this.userRepository.update(user.id, {
      firstName: user.firstName,
      lastName: user.lastName,
      updatedAt: user.updatedAt
    });

    // Publish event
    try {
      await this.eventPublisher.publish('user.updated', {
        userId: updatedUser.id,
        updates: updates,
        updatedAt: updatedUser.updatedAt
      });
      this.metricsRegistry?.recordEventPublished('user.updated');
    } catch (error) {
      // Log but don't fail the update
      console.error('Failed to publish user.updated event', error);
    }

    // Record metrics
    this.metricsRegistry?.recordProfileUpdate();

    return updatedUser.toPublic();
  }
}
